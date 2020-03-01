import React from 'react'
import PropTypes from 'prop-types'

import { Button as Entity } from './Button.style'

export const Button = ({ children, onClick }) => {
  return <Entity onClick={onClick}>{children}</Entity>
}

Button.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func
}
