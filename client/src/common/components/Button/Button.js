import React from 'react'
import PropTypes from 'prop-types'

import { Button as Entity } from './Button.style'

export const Button = ({ children }) => {
  return <Entity>{children}</Entity>
}

Button.propTypes = {
  children: PropTypes.node.isRequired
}
