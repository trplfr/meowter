import React from 'react'

import { useResize } from 'common/helpers'

import Arrow from 'assets/icons/arrow.svg'

import { Back, Container } from './Header.style'

export const Header = () => {
  const isMobile = useResize()

  if (isMobile) {
    return (
      <Container>
        <Back>
          <Arrow />
        </Back>
      </Container>
    )
  }

  return <Container>Desktop!</Container>
}
