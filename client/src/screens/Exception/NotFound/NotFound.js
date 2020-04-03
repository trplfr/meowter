import React from 'react'
import { Redirect } from 'react-router'

import {
  NotFoundCat as Cat,
  Container,
  Description,
  Heading
} from 'screens/Exception/Exception.style'

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
