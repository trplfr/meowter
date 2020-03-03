import React from 'react'
import ReactDOM from 'react-dom'
import { Provider as StoreProvider } from 'react-redux'
import { BrowserRouter as RouterProvider } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

import { configureStore } from 'store'

import { Theme as ThemeProvider } from 'core/styles/theme'

import { App } from './App'

import { GlobalStyle } from './style'

const store = configureStore()

const renderApp = () => {
  ReactDOM.render(
    <StoreProvider store={store}>
      <RouterProvider>
        <HelmetProvider>
          <ThemeProvider>
            <GlobalStyle />
            <App />
          </ThemeProvider>
        </HelmetProvider>
      </RouterProvider>
    </StoreProvider>,
    document.getElementById('root')
  )
}

if (module.hot) {
  module.hot.accept('./App', renderApp)
}

renderApp()
