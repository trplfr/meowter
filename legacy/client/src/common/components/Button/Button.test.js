import React from 'react'
import { mount } from 'enzyme'
import { ThemeProvider } from 'styled-components'
import { act } from 'react-dom/test-utils'
import { theme } from 'core/styles/theme'
import Uploader from 'assets/icons/upload.svg'
import { Loader } from 'common/components'
import { Button } from './Button'
import { Button as Entity } from './Button.style'

describe('render', () => {
  it('renders uploader', () => {
    const wrapper = mount(
      <ThemeProvider theme={theme}>
        <Button isUploader>Upload!</Button>
      </ThemeProvider>
    )

    expect(wrapper.find(Button).contains(<Uploader />)).toBe(true)
    wrapper.unmount()
  })

  it('renders loader', () => {
    const wrapper = mount(
      <ThemeProvider theme={theme}>
        <Button isLoading>Wait for loading</Button>
      </ThemeProvider>
    )

    expect(wrapper.find(Button).contains(<Loader />)).toBe(true)
    expect(wrapper.find(Entity).props().disabled).toBe(true)
    wrapper.unmount()
  })

  it('renders children test', () => {
    const children = 'Some children text'

    const wrapper = mount(
      <ThemeProvider theme={theme}>
        <Button>{children}</Button>
      </ThemeProvider>
    )

    expect(
      wrapper
        .find(Button)
        .children()
        .text()
    ).toBe(children)
    wrapper.unmount()
  })
})

describe('pass props', () => {
  it('passes rest props to entity', () => {
    const restProps = { onClick: jest.fn(), foo: 'bar', bool: true }

    const wrapper = mount(
      <ThemeProvider theme={theme}>
        <Button {...restProps}>Click me!</Button>
      </ThemeProvider>
    )

    expect(wrapper.find(Entity).props().onClick).toBe(restProps.onClick)
    expect(wrapper.find(Entity).props().foo).toBe(restProps.foo)
    expect(wrapper.find(Entity).props().bool).toBe(restProps.bool)
    act(() => {
      wrapper.find(Button).simulate('click')
    })
    act(() => {
      wrapper.find(Button).simulate('click')
    })
    act(() => {
      wrapper.find(Button).simulate('click')
    })
    expect(restProps.onClick.mock.calls.length).toBe(3)

    wrapper.unmount()
  })
})
