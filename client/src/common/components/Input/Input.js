import React from 'react'
import PropTypes from 'prop-types'

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
  ...rest
}) => {
  const hasError = errors?.hasOwnProperty(label)

  return (
    <Container className={className}>
      {errors && <Error>{errors[label]?.message}</Error>}
      <Entity
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
  className: PropTypes.any
}

/* <Error>{errors?.label?.message}</Error> */
