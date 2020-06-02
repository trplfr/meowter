import React from 'react'
import PropTypes from 'prop-types'

import { useResize } from 'helpers'

import { Container } from './Footer.style'

export const Footer = ({ isMenu, body }) => {
  const { isMobile } = useResize()

  if (isMobile) {
    if (isMenu) {
      return null
    }

    return <Container>{body && body}</Container>
  }

  return null
}

Footer.propTypes = {
  body: PropTypes.element,
  isMenu: PropTypes.bool
}
