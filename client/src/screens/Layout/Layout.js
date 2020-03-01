import React from 'react'
import PropTypes from 'prop-types'

import { Container } from 'screens/Layout/Layout.style'

export const Layout = ({ children }) => {
  return <Container>{children}</Container>
}

Layout.propTypes = {
  children: PropTypes.node.isRequired
}
