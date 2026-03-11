import './logic'

import { AsyncLocalStorage } from 'node:async_hooks'
import { renderToString } from 'react-dom/server'
import { allSettled, fork, serialize } from 'effector'
import { Provider } from 'effector-react'
import { createMemoryHistory } from 'history'
import ky from 'ky'

import { routes, router } from '@core/router'
import { activateLocale } from '@core/i18n'
import { $session, $origin, appStarted, fetchSessionFx } from '@logic/session'
import { setSsrCookieProvider } from '@lib/api'
import { $meow } from '@pages/MeowThread/models'
import { $profile } from '@pages/CatProfile/models'

import { App } from './App'

// request-scoped контекст для проброса кук в API-клиент
const ssrContext = new AsyncLocalStorage<{ cookie: string }>()

setSsrCookieProvider(() => ssrContext.getStore()?.cookie || '')

// определяем локаль по домену
const getLocale = (host: string) => {
  if (host.endsWith('.app')) {
    return 'en'
  }

  return 'ru'
}

// экранирует HTML-спецсимволы для атрибутов
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

const buildHeadTags = (scope: any, origin: string): string => {
  const tags: string[] = []

  // страница мяута
  const meow = scope.getState($meow)
  if (meow) {
    const title = `${meow.author.displayName} в Мяутере`
    const desc = meow.content.slice(0, 160)
    const url = `${origin}/meow/${meow.id}`
    const image = meow.imageUrl
      ? `${origin}${meow.imageUrl}`
      : meow.author.avatarUrl
        ? `${origin}${meow.author.avatarUrl}`
        : null

    tags.push(`<title>${esc(title)}</title>`)
    tags.push(`<meta name="description" content="${esc(desc)}" />`)
    tags.push(`<meta property="og:title" content="${esc(title)}" />`)
    tags.push(`<meta property="og:description" content="${esc(desc)}" />`)
    tags.push(`<meta property="og:type" content="article" />`)
    tags.push(`<meta property="og:url" content="${esc(url)}" />`)
    if (image) {
      tags.push(`<meta property="og:image" content="${esc(image)}" />`)
    }
    tags.push(`<meta name="twitter:card" content="${meow.imageUrl ? 'summary_large_image' : 'summary'}" />`)

    return tags.join('\n')
  }

  // страница профиля
  const profile = scope.getState($profile)
  if (profile) {
    const title = `${profile.displayName} (@${profile.username})`
    const desc = profile.bio || `Профиль @${profile.username} в Мяутере`
    const url = `${origin}/cat/${profile.username}`
    const image = profile.avatarUrl ? `${origin}${profile.avatarUrl}` : null

    tags.push(`<title>${esc(title)}</title>`)
    tags.push(`<meta name="description" content="${esc(desc)}" />`)
    tags.push(`<meta property="og:title" content="${esc(title)}" />`)
    tags.push(`<meta property="og:description" content="${esc(desc)}" />`)
    tags.push(`<meta property="og:type" content="profile" />`)
    tags.push(`<meta property="og:url" content="${esc(url)}" />`)
    if (image) {
      tags.push(`<meta property="og:image" content="${esc(image)}" />`)
    }
    tags.push(`<meta name="twitter:card" content="summary" />`)

    return tags.join('\n')
  }

  return ''
}

const GUEST_PATHS = ['/', '/login', '/register', '/recovery']
const AUTH_PATHS = ['/feed', '/search', '/notifications', '/settings', '/meow']

export const render = async (url: string, host = 'localhost', cookie = '') => {
  const locale = getLocale(host)

  // проверяем сессию до роутинга чтобы редиректить на уровне HTTP
  let session: any = null

  try {
    const ssrApiUrl = process.env.SSR_API_URL || 'http://localhost:4000/api'
    session = await ky
      .get('auth/me', {
        prefixUrl: ssrApiUrl,
        headers: { cookie },
        retry: 0
      })
      .json()
  } catch {}

  // редиректы до рендера
  if (session && GUEST_PATHS.includes(url)) {
    return { redirect: '/feed', locale }
  }

  if (!session && AUTH_PATHS.includes(url)) {
    return { redirect: '/unauthorized', locale }
  }

  // активируем локаль до рендера
  activateLocale(locale)

  // оборачиваем рендер в контекст с куками, чтобы API-клиент их подхватил
  return ssrContext.run({ cookie }, async () => {
    // origin из Host заголовка
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const origin = `${protocol}://${host.split(':')[0]}`

    // fork с кешированной сессией (без повторного запроса)
    const values: [any, any][] = [[$origin, origin]]
    if (session) {
      values.push([$session, session])
    }

    const scope = fork({
      values,
      handlers: [
        [
          fetchSessionFx,
          async () => {
            if (!session) {
              throw new Error('Not authenticated')
            }

            return session
          }
        ]
      ]
    })

    // серверная навигация через memory history
    const history = createMemoryHistory({ initialEntries: [url] })
    await allSettled(appStarted, { scope })
    await allSettled(router.setHistory, { scope, params: history })

    const html = renderToString(
      <Provider value={scope}>
        <App />
      </Provider>
    )

    // React 19 renderToString не рендерит <meta>/<title> в body,
    // поэтому генерируем OG-теги вручную из scope
    const headTags = buildHeadTags(scope, origin)

    const scopeData = serialize(scope)

    // HTTP статусы по роуту
    let status = 200

    if (scope.getState(routes.notFound.$isOpened)) {
      status = 404
    }

    if (scope.getState(routes.unauthorized.$isOpened)) {
      status = 403
    }

    return { html, headTags, scopeData, locale, status }
  })
}
