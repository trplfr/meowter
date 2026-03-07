import { I18nProvider } from '@lingui/react'
import { createRoutesView, RouterProvider } from 'atomic-router-react'

import { i18n } from '@core/i18n'
import { router } from '@core/router'

import { pages } from './pages'

const RoutesView = createRoutesView({
  routes: pages,
  otherwise: () => <div><h1>404</h1></div>
})

export const App = () => {
  return (
    <I18nProvider i18n={i18n}>
      <RouterProvider router={router}>
        <RoutesView />
      </RouterProvider>
    </I18nProvider>
  )
}
