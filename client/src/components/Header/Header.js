import React from 'react'
import PropTypes from 'prop-types'

import { useResize } from 'helpers'

import { H1 } from 'core/styles/typography'

import { Container, Wrapper } from './Header.style'

export const Header = ({ left, title, right, isBorder }) => {
  const { isMobile } = useResize()

  if (isMobile) {
    return (
      <Container isBorder={isBorder}>
        {left}
        {title && (
          <Wrapper>
            <H1>{title}</H1>
          </Wrapper>
        )}
        {right}
      </Container>
    )
  }

  return null
}

Header.propTypes = {
  left: PropTypes.element,
  title: PropTypes.string,
  right: PropTypes.element,
  isBorder: PropTypes.bool
}
