import { renderToString } from 'react-dom/server'
import { allSettled, fork, serialize } from 'effector'
import { Provider } from 'effector-react'
import { createMemoryHistory } from 'history'
import ky from 'ky'

import { router } from '@core/router'
import { $session, appStarted, fetchSessionFx } from '@logic/session'

import { App } from './App'

// определяем локаль по домену
const getLocale = (host: string) => {
  if (host.includes('meowter.ru')) {
    return 'ru'
  }

  return 'en'
}

const GUEST_PATHS = ['/', '/login', '/register', '/recovery']
const AUTH_PATHS = ['/feed', '/search', '/notifications', '/settings', '/meow']

export const render = async (url: string, host = 'localhost', cookie = '') => {
  const locale = getLocale(host)

  // проверяем сессию до роутинга чтобы редиректить на уровне HTTP
  let session: any = null

  try {
    session = await ky.get('auth/me', {
      prefixUrl: 'http://localhost:4000/api',
      headers: { cookie },
      retry: 0
    }).json()
  } catch {}

  // редиректы до рендера
  if (session && GUEST_PATHS.includes(url)) {
    return { redirect: '/feed', locale }
  }

  if (!session && AUTH_PATHS.includes(url)) {
    return { redirect: '/unauthorized', locale }
  }

  // fork с кешированной сессией (без повторного запроса)
  const scope = fork({
    values: session
      ? [[$session, session]]
      : [],
    handlers: [
      [fetchSessionFx, async () => {
        if (!session) {
          throw new Error('Not authenticated')
        }

        return session
      }]
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

  return { html, scopeData, locale }
}
