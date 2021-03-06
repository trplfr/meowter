import React from 'react'
import { mount } from 'enzyme'
import { ThemeProvider } from 'styled-components'
import { ConnectedRouter as ConnectedRouterProvider } from 'connected-react-router'
import { HelmetProvider, Helmet as HelmetComponent } from 'react-helmet-async'
import { configureStore, history } from 'store'
import { Provider as StoreProvider } from 'react-redux'
import { Route } from 'react-router-dom'
import { theme } from 'core/styles/theme'
import { Footer, Header } from 'common/components'
import { LayoutRoute } from './LayoutRoute'

const store = configureStore()

const helmetTitle = 'helmet title'
const helmetDescription = 'helmet description'

const helmetProp = {
  title: helmetTitle,
  description: helmetDescription
}
const path = '/'

const restRouteProps = {
  path,
  testPropForRoute: 'test'
}

const headerProps = {
  isBack: true
}

const footerBody = <div>body</div>

const footerProps = {
  body: footerBody
}

const TestComponent = () => <div>test component</div>

describe('pass props', () => {
  it('passes helmet title and description', () => {
    const wrapper = mount(
      <StoreProvider store={store}>
        <ConnectedRouterProvider history={history}>
          <HelmetProvider>
            <ThemeProvider theme={theme}>
              <LayoutRoute
                path={path}
                component={TestComponent}
                helmet={helmetProp}
                header={headerProps}
                footer={footerProps}
              />
            </ThemeProvider>
          </HelmetProvider>
        </ConnectedRouterProvider>
      </StoreProvider>
    )

    expect(
      wrapper
        .find(HelmetComponent)
        .props()
        .children.find(c => c.type === 'title').props.children
    ).toBe(helmetTitle)
    expect(
      wrapper
        .find(HelmetComponent)
        .props()
        .children.find(c => c.type === 'meta' && c.props.name === 'description')
        .props.content
    ).toBe(helmetDescription)

    wrapper.unmount()
  })

  it('passes Header rest props', () => {
    const wrapper = mount(
      <StoreProvider store={store}>
        <ConnectedRouterProvider history={history}>
          <HelmetProvider>
            <ThemeProvider theme={theme}>
              <LayoutRoute
                path={path}
                component={TestComponent}
                helmet={helmetProp}
                header={headerProps}
                footer={footerProps}
              />
            </ThemeProvider>
          </HelmetProvider>
        </ConnectedRouterProvider>
      </StoreProvider>
    )

    expect(wrapper.find(Header).props()).toEqual(headerProps)

    wrapper.unmount()
  })

  it('passes Footer rest props', () => {
    const wrapper = mount(
      <StoreProvider store={store}>
        <ConnectedRouterProvider history={history}>
          <HelmetProvider>
            <ThemeProvider theme={theme}>
              <LayoutRoute
                path={path}
                component={TestComponent}
                helmet={helmetProp}
                header={headerProps}
                footer={footerProps}
              />
            </ThemeProvider>
          </HelmetProvider>
        </ConnectedRouterProvider>
      </StoreProvider>
    )

    expect(wrapper.find(Footer).props()).toEqual(footerProps)

    wrapper.unmount()
  })

  it('passes Route props', () => {
    const wrapper = mount(
      <StoreProvider store={store}>
        <ConnectedRouterProvider history={history}>
          <HelmetProvider>
            <ThemeProvider theme={theme}>
              <LayoutRoute
                {...restRouteProps}
                component={TestComponent}
                helmet={helmetProp}
                header={headerProps}
                footer={footerProps}
              />
            </ThemeProvider>
          </HelmetProvider>
        </ConnectedRouterProvider>
      </StoreProvider>
    )

    const routeProps = wrapper.find(Route).props()
    expect(routeProps).toEqual(expect.objectContaining(restRouteProps))

    wrapper.unmount()
  })
})

describe('render', () => {
  it('renders component for / Route', () => {
    const wrapper = mount(
      <StoreProvider store={store}>
        <ConnectedRouterProvider history={history}>
          <HelmetProvider>
            <ThemeProvider theme={theme}>
              <LayoutRoute
                {...restRouteProps}
                component={TestComponent}
                helmet={helmetProp}
                header={headerProps}
                footer={footerProps}
              />
            </ThemeProvider>
          </HelmetProvider>
        </ConnectedRouterProvider>
      </StoreProvider>
    )

    expect(wrapper.find(TestComponent).length).toBe(1)
    expect(wrapper.find(TestComponent)).toHaveLength(1)

    wrapper.unmount()
  })

  it('not renders component for not / Route', () => {
    const wrapper = mount(
      <StoreProvider store={store}>
        <ConnectedRouterProvider history={history}>
          <HelmetProvider>
            <ThemeProvider theme={theme}>
              <LayoutRoute
                {...restRouteProps}
                path='/not-root'
                component={TestComponent}
                helmet={helmetProp}
                header={headerProps}
                footer={footerProps}
              />
            </ThemeProvider>
          </HelmetProvider>
        </ConnectedRouterProvider>
      </StoreProvider>
    )

    expect(wrapper.find(TestComponent).length).toBe(0)

    wrapper.unmount()
  })
})
