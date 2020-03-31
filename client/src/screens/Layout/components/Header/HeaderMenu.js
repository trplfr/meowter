import React from 'react'
import PropTypes from 'prop-types'

import { Back } from 'common/components'
import { H1 } from 'core/styles/typography'

import { Container, Wrapper } from './HeaderMenu.style'

export const HeaderMenu = ({
  title,
  isBorder,
  isBack,
  isBurger,
  isNotifications
}) => {
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
    </Container>
  )
}

HeaderMenu.propTypes = {
  title: PropTypes.string,
  isBorder: PropTypes.bool,
  isBack: PropTypes.bool,
  isBurger: PropTypes.bool,
  isNotifications: PropTypes.bool
}
