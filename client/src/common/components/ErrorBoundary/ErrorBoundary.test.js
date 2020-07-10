import React from 'react'
import { mount } from 'enzyme'
import { act } from 'react-dom/test-utils'
import { ConnectedRouter as ConnectedRouterProvider } from 'connected-react-router'
import { configureStore, history } from 'store'
import { Provider as StoreProvider } from 'react-redux'
import { ErrorBoundary } from './ErrorBoundary'

const store = configureStore()

describe('on error', () => {
  it('redirects to /error pathname on error', () => {
    const errorPathname = '/error'

    const ErrorComponent = () => {
      return <div>any content</div>
    }

    const wrapper = mount(
      <StoreProvider store={store}>
        <ConnectedRouterProvider history={history}>
          <ErrorBoundary>
            <div>
              <ErrorComponent />
            </div>
          </ErrorBoundary>
        </ConnectedRouterProvider>
      </StoreProvider>
    )

    const error = new Error('test')

    act(() => {
      wrapper.find(ErrorComponent).simulateError(error)
    })

    expect(wrapper.find('Router').prop('history').location.state.error).toBe(
      error
    )

    wrapper.unmount()
  })

  it('saves error and exception in location.state', () => {
    const ErrorComponent = () => {
      return <div>any content</div>
    }

    const wrapper = mount(
      <StoreProvider store={store}>
        <ConnectedRouterProvider history={history}>
          <ErrorBoundary>
            <div>
              <ErrorComponent />
            </div>
          </ErrorBoundary>
        </ConnectedRouterProvider>
      </StoreProvider>
    )

    const error = new Error('test')

    act(() => {
      wrapper.find(ErrorComponent).simulateError(error)
    })

    expect(wrapper.find('Router').prop('history').location.state.error).toBe(
      error
    )
    expect(
      wrapper.find('Router').prop('history').location.state
    ).toHaveProperty('exception')

    wrapper.unmount()
  })
})
