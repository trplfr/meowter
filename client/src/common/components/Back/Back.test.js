import React from 'react'
import { Router } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { mount } from 'enzyme'
import { act } from 'react-dom/test-utils'
import Arrow from 'assets/icons/arrow.svg'
import { theme } from 'core/styles/theme'
import { Back } from './Back'


describe('conditional render', () => {
  it('renders as arrow without children', () => {
    const historyMock = {
      push: jest.fn(),
      location: {},
      listen: jest.fn(),
      goBack: jest.fn()
    }

    const wrapper = mount(
      <Router history={historyMock}>
        <Back />
      </Router>
    )

    expect(wrapper.find(Back).contains(<Arrow />)).toBe(true)

    wrapper.unmount()
  })

  it('renders children content', () => {
    const historyMock = {
      push: jest.fn(),
      location: {},
      listen: jest.fn(),
      goBack: jest.fn()
    }

    const childrenText = 'some random string'

    let wrapper = mount(
      <Router history={historyMock}>
        <ThemeProvider theme={theme}>
          <Back>{childrenText}</Back>
        </ThemeProvider>
      </Router>
    )

    expect(
      wrapper
        .find(Back)
        .childAt(0)
        .text()
    ).toBe(childrenText)

    wrapper.unmount()

    const childrenElement = <div>SomeElement</div>

    wrapper = mount(
      <Router history={historyMock}>
        <ThemeProvider theme={theme}>
          <Back>{childrenElement}</Back>
        </ThemeProvider>
      </Router>
    )

    expect(
      wrapper
        .find(Back)
        .childAt(0)
        .contains(childrenElement)
    ).toBe(true)

    wrapper.unmount()
  })
})

describe('conditional goBack calls', () => {
  it('calls goBack with children', () => {
    const historyMock = {
      push: jest.fn(),
      location: {},
      listen: jest.fn(),
      goBack: jest.fn()
    }

    const childrenText = 'some random string'

    let wrapper = mount(
      <Router history={historyMock}>
        <ThemeProvider theme={theme}>
          <Back children={childrenText} />
        </ThemeProvider>
      </Router>
    )

    act(() => {
      wrapper.find(Back).simulate('click')
    })

    act(() => {
      wrapper.find(Back).simulate('click')
    })

    expect(historyMock.goBack.mock.calls.length).toBe(2)

    wrapper.unmount()
  })

  it('calls goBack without children', () => {
    const historyMock = {
      push: jest.fn(),
      location: {},
      listen: jest.fn(),
      goBack: jest.fn()
    }

    let wrapper = mount(
      <Router history={historyMock}>
        <ThemeProvider theme={theme}>
          <Back />
        </ThemeProvider>
      </Router>
    )

    act(() => {
      wrapper.find(Back).simulate('click')
    })

    act(() => {
      wrapper.find(Back).simulate('click')
    })

    expect(historyMock.goBack.mock.calls.length).toBe(2)

    wrapper.unmount()
  })
})
