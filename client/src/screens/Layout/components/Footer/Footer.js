import React from 'react'
import { useSelector } from 'react-redux'

import { useResize } from 'common/helpers'

import { Container } from './Footer.style'

export const Footer = () => {
  const isMobile = useResize()
  const content = useSelector(state => state.footer.content)

  if (isMobile) {
    return <Container>{content}</Container>
  }

  return <Container>Desktop!</Container>
}
