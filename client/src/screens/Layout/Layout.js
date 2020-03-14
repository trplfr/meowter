import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import { theme } from 'core/styles/theme'

import {
  Footer,
  FooterMobile,
  Header,
  HeaderMobile
} from 'screens/Layout/components'

import { Container, Wrapper } from 'screens/Layout/Layout.style'

export const Layout = ({ children }) => {
  const [isMobile, setMobile] = useState(
    window.innerWidth < +theme.media.desktop.match(/\d+/g)
  )

  const handleSizeChange = () =>
    setMobile(window.innerWidth < +theme.media.desktop.match(/\d+/g))

  useEffect(() => {
    window.addEventListener('resize', handleSizeChange)

    return () => window.removeEventListener('resize', handleSizeChange)
  }, [isMobile])

  return (
    <Container>
      {isMobile ? <HeaderMobile /> : <Header />}
      <Wrapper>{children}</Wrapper>
      {isMobile ? <FooterMobile /> : <Footer />}
    </Container>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired
}
