import React from 'react'

import { Login } from 'common/components/Login'

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
