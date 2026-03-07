import { createRoutesView, RouterProvider } from 'atomic-router-react'

import { router } from '@core/router'

import { pages } from './pages'

const RoutesView = createRoutesView({
  routes: pages,
  otherwise: () => <div><h1>404</h1></div>
})

export const App = () => {
  return (
    <RouterProvider router={router}>
      <RoutesView />
    </RouterProvider>
  )
}
