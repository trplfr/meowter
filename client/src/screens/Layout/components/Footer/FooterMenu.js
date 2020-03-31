import React from 'react'
import PropTypes from 'prop-types'

import { Back } from 'common/components'
import { Anchor } from 'core/styles/typography'

import { Container } from './FooterMenu.style'

export const FooterMenu = ({ to, content, isLink, isMenu }) => {
  if (isMenu) {
    return null
  }

  return (
    <Container>
      {isLink ? <Anchor to={to}>{content}</Anchor> : <Back>{content}</Back>}
    </Container>
  )
}

FooterMenu.propTypes = {
  to: PropTypes.string,
  content: PropTypes.string,
  isLink: PropTypes.bool,
  isMenu: PropTypes.bool
}
