import React from 'react'
import PropTypes from 'prop-types'

import { Input as Entity } from './Input.style'

export const Input = ({ placeholder, onChange }) => {
  return <Entity placeholder={placeholder} onChange={onChange} />
}

Input.propTypes = {
  placeholder: PropTypes.string,
  onChange: PropTypes.func
}
