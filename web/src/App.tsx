import { useEffect, useState } from 'react'
import { I18nProvider } from '@lingui/react'
import { createRoutesView, RouterProvider } from 'atomic-router-react'
import { Toaster } from 'sonner'

import { toastOptions } from '@core/constants'
import { ErrorBoundary } from '@core/ErrorBoundary'
import { i18n } from '@core/i18n'
import { router } from '@core/router'

import { pages } from './pages'
import { NotFound } from './pages/NotFound/NotFound'

const RoutesView = createRoutesView({
  routes: pages,
  otherwise: NotFound
})

export const App = () => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <I18nProvider i18n={i18n}>
      <ErrorBoundary>
        <RouterProvider router={router}>
          <RoutesView />
          {mounted && <Toaster {...toastOptions} />}
        </RouterProvider>
      </ErrorBoundary>
    </I18nProvider>
  )
}
