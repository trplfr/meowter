import React from 'react'
import { render } from '@testing-library/react'
import { Provider as StoreProvider } from 'react-redux'
import { ConnectedRouter as ConnectedRouterProvider } from 'connected-react-router'
import { HelmetProvider } from 'react-helmet-async'

import { configureStore, history } from 'store'

import { Theme as ThemeProvider } from 'core/styles/theme'
import { GlobalStyle } from 'core/styles/global'

import { ErrorBoundary } from 'common/components'

const store = configureStore()

const AllTheProviders = ({ children }) => {
  return (
    <StoreProvider store={store}>
      <ConnectedRouterProvider history={history}>
        <HelmetProvider>
          <ThemeProvider>
            <GlobalStyle />
            <ErrorBoundary>{children}</ErrorBoundary>
          </ThemeProvider>
        </HelmetProvider>
      </ConnectedRouterProvider>
    </StoreProvider>
  )
}

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options })

// re-export everything
export * from '@testing-library/react'

// override render method
export { customRender as render }
