import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter as RouterProvider } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

import { configureStore } from 'modules/store'

import { Theme as ThemeProvider } from 'common/styles/theme'
import { App } from './App'

import { GlobalStyle } from './style'

const store = configureStore()

const renderApp = () => {
  ReactDOM.render(
    <Provider store={store}>
      <RouterProvider>
        <HelmetProvider>
          <ThemeProvider>
            <GlobalStyle />
            <App />
          </ThemeProvider>
        </HelmetProvider>
      </RouterProvider>
    </Provider>,
    document.getElementById('root')
  )
}

if (module.hot) {
  module.hot.accept('./App', renderApp)
}

renderApp()
