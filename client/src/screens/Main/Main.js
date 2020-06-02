import React from 'react'

import { Login } from 'screens/Auth/components'

import { Screen, Left, Right, Cat, Heading, Description } from './Main.style'

export const Main = () => {
  return (
    <Screen>
      <Left>
        <Cat />
        <Heading>Добро пожаловать</Heading>
        <Description>
          Если вам хочется принять участие в обсуждении последних новостей,
          вместо того, чтобы работать, заглядывайте к нам
        </Description>
      </Left>
      <Right>
        <Login />
      </Right>
    </Screen>
  )
}
