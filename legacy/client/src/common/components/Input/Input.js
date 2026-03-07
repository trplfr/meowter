import React, { useState } from 'react'
import PropTypes from 'prop-types'

import Eye from 'assets/icons/togglepassword.svg'

import { Container, Input as Entity, Error } from './Input.style'

export const Input = ({
  label,
  register,
  required,
  maxLength,
  minLength,
  max,
  min,
  pattern,
  validate,
  errors,
  className,
  isPasswordField,
  ...rest
}) => {
  const [isPasswordView, togglePasswordView] = useState(isPasswordField)

  const toggleView = () => togglePasswordView(!isPasswordView)

  const hasError = errors?.hasOwnProperty(label)

  return (
    <Container isEyeActive={!isPasswordView} className={className}>
      {errors && <Error>{errors[label]?.message}</Error>}
      <Entity
        type={isPasswordView ? 'password' : 'text'}
        name={label}
        hasError={hasError}
        ref={register({
          required,
          maxLength,
          minLength,
          max,
          min,
          pattern,
          validate
        })}
        {...rest}
      />
      {isPasswordField && <Eye onClick={toggleView} />}
    </Container>
  )
}

Input.propTypes = {
  label: PropTypes.string.isRequired,
  register: PropTypes.func.isRequired,
  required: PropTypes.exact({
    value: PropTypes.bool.isRequired,
    message: PropTypes.string
  }),
  maxLength: PropTypes.exact({
    value: PropTypes.number.isRequired,
    message: PropTypes.string
  }),
  minLength: PropTypes.exact({
    value: PropTypes.number.isRequired,
    message: PropTypes.string
  }),
  max: PropTypes.exact({
    value: PropTypes.number.isRequired,
    message: PropTypes.string
  }),
  min: PropTypes.exact({
    value: PropTypes.number.isRequired,
    message: PropTypes.string
  }),
  pattern: PropTypes.exact({
    value: PropTypes.arrayOf(PropTypes.instanceOf(RegExp)).isRequired,
    message: PropTypes.string
  }),
  validate: PropTypes.exact({
    value: PropTypes.func.isRequired,
    message: PropTypes.string
  }),
  errors: PropTypes.object,
  className: PropTypes.any,
  isPasswordField: PropTypes.bool
}

/* <Error>{errors?.label?.message}</Error> */
