import React from 'react'
import { useHistory } from 'react-router'
import PropTypes from 'prop-types'

import { Anchor } from 'core/styles/typography'

import { Back, Button } from 'common/components'
import { useResize } from 'common/helpers'

import { Container } from './Footer.style'

export const Footer = ({ link, button, isMenu }) => {
  const isMobile = useResize()
  const history = useHistory()

  if (isMobile) {
    if (isMenu) {
      return null
    }

    return (
      <Container>
        {button && (
          <Button onClick={() => history.push(button.to)}>
            {button.content}
          </Button>
        )}
        {link.isBack ? (
          <Back>{link.content}</Back>
        ) : (
          <Anchor to={link.to}>{link.content}</Anchor>
        )}
      </Container>
    )
  }

  return null
}

Footer.propTypes = {
  button: PropTypes.exact({
    to: PropTypes.string,
    content: PropTypes.string
  }),
  link: PropTypes.exact({
    to: PropTypes.string,
    content: PropTypes.string,
    isBack: PropTypes.bool
  }),
  isMenu: PropTypes.bool
}
