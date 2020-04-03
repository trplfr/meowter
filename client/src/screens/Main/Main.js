import React from 'react'

import { Login } from 'screens/Auth/components'

import { ErrorBoundary } from 'common/components/ErrorBoundary/ErrorBoundary'
import { Screen, Left, Right, Title } from './Main.style'

export const Main = () => {
  return (
    <Screen>
      <Left>
        <Title>meowter</Title>
      </Left>
      <Right>
        <ErrorBoundary>
          <Login />
        </ErrorBoundary>
      </Right>
    </Screen>
  )
}
