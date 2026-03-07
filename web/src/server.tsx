import { renderToString } from 'react-dom/server'
import { allSettled, fork, serialize } from 'effector'
import { Provider } from 'effector-react'
import { createMemoryHistory } from 'history'

import { router } from '@core/router'

import { App } from './App'

// определяем локаль по домену
const getLocale = (host: string) => {
  if (host.includes('meowter.ru')) {
    return 'ru'
  }

  return 'en'
}

export const render = async (url: string, host = 'localhost') => {
  const scope = fork()
  const locale = getLocale(host)

  // серверная навигация через memory history
  const history = createMemoryHistory({ initialEntries: [url] })
  await allSettled(router.setHistory, { scope, params: history })

  const html = renderToString(
    <Provider value={scope}>
      <App />
    </Provider>
  )

  const scopeData = serialize(scope)

  return { html, scopeData, locale }
}
