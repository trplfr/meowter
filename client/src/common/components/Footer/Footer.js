import React from 'react'
import PropTypes from 'prop-types'

import { Anchor } from 'core/styles/typography'

import { Back } from 'common/components'
import { useResize } from 'common/helpers'

import { Container } from './Footer.style'

export const Footer = ({ link, isMenu }) => {
  const isMobile = useResize()

  if (isMobile) {
    if (isMenu) {
      return null
    }

    return (
      <Container>
        {!link.isBack && <Anchor to={link.to}>{link.content}</Anchor>}
        {link.isBack && <Back>{link.content}</Back>}
      </Container>
    )
  }

  return null
}

Footer.propTypes = {
  link: PropTypes.exact({
    to: PropTypes.string,
    content: PropTypes.string,
    isBack: PropTypes.bool
  }),
  isMenu: PropTypes.bool
}
