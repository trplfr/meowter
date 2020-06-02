import React from 'react'
import PropTypes from 'prop-types'

import { H1 } from 'core/styles/typography'

import { Back } from 'components'
import { useResize } from 'helpers'

import { Container, Wrapper } from './Header.style'

export const Header = ({
  title,
  isBorder,
  isBack,
  isBurger,
  isNotifications,
  isMeowt
}) => {
  const isMobile = useResize()

  if (isMobile) {
    return (
      <Container isBorder={isBorder}>
        {isBack && <Back />}
        {isBurger && <></>}
        {title && (
          <Wrapper>
            <H1>{title}</H1>
          </Wrapper>
        )}
        {isNotifications && <></>}
        {isMeowt && <></>}
      </Container>
    )
  }

  return null
}

Header.propTypes = {
  title: PropTypes.string,
  isBorder: PropTypes.bool,
  isBack: PropTypes.bool,
  isBurger: PropTypes.bool,
  isNotifications: PropTypes.bool,
  isMeowt: PropTypes.bool
}
