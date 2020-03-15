import React from 'react'
import PropTypes from 'prop-types'

import { Footer, Header } from 'screens/Layout/components'

import { Container, Wrapper } from 'screens/Layout/Layout.style'

export const Layout = ({ children }) => {
  return (
    <Container>
      <Header />
      <Wrapper>{children}</Wrapper>
      <Footer />
    </Container>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired
}
