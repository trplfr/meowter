import React from 'react'
import { mount } from 'enzyme'
import { ThemeProvider } from 'styled-components'
import { act } from 'react-dom/test-utils'
import { theme } from 'core/styles/theme'
import Eye from 'assets/icons/togglepassword.svg'
import { Container, Input as Entity, Error } from './Input.style'
import { Input } from './Input'

describe('effects', () => {
  it('calls register with right arguments and passes as ref', () => {
    const params = {
      required: {
        value: true,
        message: 'it is required'
      },
      maxLength: {
        value: 15,
        message: '15 is maxLength'
      },
      minLength: {
        value: 5,
        message: '5 is minLength'
      },
      max: {
        value: 15,
        message: '15 is max'
      },
      min: {
        value: 5,
        message: '5 is min'
      },
      pattern: {
        value: [new RegExp('@')],
        message: 'it should contain @'
      },
      validate: {
        value: () => true,
        message: 'It is validated'
      }
    }

    const ref = React.createRef()

    const props = {
      register: jest.fn(params => ref),
      label: 'label text',
      ...params
    }

    const wrapper = mount(
      <ThemeProvider theme={theme}>
        <Input {...props} />
      </ThemeProvider>
    )

    expect(props.register.mock.calls.length).toBe(1)
    expect(props.register).toBeCalledWith(expect.objectContaining(params))

    expect(wrapper.find(Entity).getElement().ref).toBe(ref)

    wrapper.unmount()
  })
})

describe('render', () => {
  it('shows error if errors with [label] key passed', () => {
    const label = 'input_label'
    const message = 'error message'

    const props = {
      register: jest.fn(),
      label,
      errors: { [label]: { message } }
    }

    const wrapper = mount(
      <ThemeProvider theme={theme}>
        <Input {...props} />
      </ThemeProvider>
    )

    expect(wrapper.text()).toEqual(expect.stringContaining(message))
    wrapper.unmount()
  })
})

describe('events', () => {
  it('shows eye with toggle isPasswordView on click', () => {
    const label = 'input_label'

    const props = { register: jest.fn(), label, isPasswordField: true }

    const wrapper = mount(
      <ThemeProvider theme={theme}>
        <Input {...props} />
      </ThemeProvider>
    )

    expect(wrapper.find(Container).props().isEyeActive).toBe(false)
    expect(wrapper.find(Entity).props().type).toBe('password')

    act(() => {
      wrapper.find(Eye).simulate('click')
    })

    wrapper.update()

    expect(wrapper.find(Container).props().isEyeActive).toBe(true)
    expect(wrapper.find(Entity).props().type).toBe('text')

    wrapper.unmount()
  })
})

describe('pass props', () => {
  it('passes label, hasError and rest props to entity', () => {
    const label = 'input_label'

    const rest = {
      onFocus: jest.fn(),
      onClick: jest.fn(),
      otherProp: true
    }

    const props = {
      register: jest.fn(),
      label,
      isPasswordField: true,
      errors: { [label]: { message: 'some error message' } },
      ...rest
    }

    const wrapper = mount(
      <ThemeProvider theme={theme}>
        <Input {...props} />
      </ThemeProvider>
    )

    expect(wrapper.find(Entity).props().hasError).toBe(true)
    expect(wrapper.find(Entity).props().name).toBe(label)

    wrapper.unmount()
  })
})
