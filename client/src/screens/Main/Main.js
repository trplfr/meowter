import React from 'react'

import { Login } from 'screens/Auth/components'

import { Screen, Left, Right, Title } from './Main.style'

export const Main = () => {
  return (
    <Screen>
      <Left>
        <Title>meowter</Title>
      </Left>
      <Right>
        <Login />
      </Right>
    </Screen>
  )
}
