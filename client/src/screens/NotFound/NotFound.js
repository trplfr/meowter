import React from 'react'
import { Redirect } from 'react-router'

import {
  Cat,
  Container,
  Description,
  Heading
} from 'screens/NotFound/NotFound.style'

export const NotFound = () => {
  return (
    <>
      <Redirect to='/404' />
      <Container>
        <Cat />
        <Heading>Ой!</Heading>
        <Description>Такой страницы нет...</Description>
      </Container>
    </>
  )
}
