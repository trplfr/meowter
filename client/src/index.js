import React from 'react'
import ReactDOM from 'react-dom'
import { Provider as StoreProvider } from 'react-redux'
import { ConnectedRouter as ConnectedRouterProvider } from 'connected-react-router'
import { HelmetProvider } from 'react-helmet-async'

import { configureStore, history } from 'store'

import { Theme as ThemeProvider } from 'core/styles/theme'
import { GlobalStyle } from 'core/styles/global'

import { ErrorBoundary } from 'components'

import { App } from 'core/App'

const store = configureStore()

const renderApp = () => {
  ReactDOM.render(
    <StoreProvider store={store}>
      <ConnectedRouterProvider history={history}>
        <HelmetProvider>
          <ThemeProvider>
            <GlobalStyle />
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </ThemeProvider>
        </HelmetProvider>
      </ConnectedRouterProvider>
    </StoreProvider>,
    document.getElementById('root')
  )
}

if (module.hot) {
  module.hot.accept('core/App', renderApp)
}

renderApp()
