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
    const scope = fork({
      values: [
        [$origin, origin],
        ...(session ? [[$session, session] as const] : [])
      ],
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

    const scopeData = serialize(scope)

    // HTTP статусы по роуту
    let status = 200

    if (scope.getState(routes.notFound.$isOpened)) {
      status = 404
    }

    if (scope.getState(routes.unauthorized.$isOpened)) {
      status = 403
    }

    return { html, scopeData, locale, status }
  })
}
