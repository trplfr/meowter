import React from 'react'
import { useLocation } from 'react-router'

import {
  ErrorCat as Cat,
  Container,
  Description,
  Details,
  Heading
} from 'screens/Exception/Exception.style'

export const Error = () => {
  const { state } = useLocation()

  return (
    <>
      <Container>
        <Cat />
        <Heading>Упс...</Heading>
        <Description>Кажется, у нас что-то произошло...</Description>
        {state?.exception && (
          <Details>
            Error: {state?.error?.message}
            <br />
            {state?.exception?.componentStack}
          </Details>
        )}
      </Container>
    </>
  )
}
