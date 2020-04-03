import React from 'react'

import {
  NotLoggedInCat as Cat,
  Container,
  Description,
  Heading
} from 'screens/Exception/Exception.style'

export const NotLoggedIn = () => {
  return (
    <>
      <Container>
        <Cat />
        <Heading>Ай!</Heading>
        <Description>Кажется, вам сюда нельзя...</Description>
      </Container>
    </>
  )
}
