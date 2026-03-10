import './logic'

import { createRoot, hydrateRoot } from 'react-dom/client'
import { fork, allSettled } from 'effector'
import { Provider } from 'effector-react'
import { createBrowserHistory } from 'history'

import { router } from '@core/router'
import { activateLocale } from '@core/i18n'
import { appStarted } from '@logic/session'
import { errorOccurred } from '@logic/notifications'
import { setApiErrorHandler } from '@lib/api'

import { App } from './App'

import '@ui/theme/global.scss'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found')
}

setApiErrorHandler(error => errorOccurred(error))

// локаль из SSR (атрибут lang на <html>) или по домену
const locale =
  document.documentElement.lang ||
  (location.hostname.includes('ru') ? 'ru' : 'en')

activateLocale(locale)

const serverState = (globalThis as any).__SSR_STATE__
const scope = fork(serverState ? { values: serverState } : undefined)

// запускаем клиентский роутинг и рендерим после инициализации
const history = createBrowserHistory()

const init = async () => {
  await allSettled(appStarted, { scope })
  await allSettled(router.setHistory, { scope, params: history })

  const app = (
    <Provider value={scope}>
      <App />
    </Provider>
  )

  if (serverState) {
    hydrateRoot(root, app)
  } else {
    createRoot(root).render(app)
  }
}

init()
