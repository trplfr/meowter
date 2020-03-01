import React from 'react'
import { Route, Switch } from 'react-router'

import { Login, Registration } from 'screens/Auth/components'

import { Screen } from 'screens/Auth/Auth.style'

export const Auth = () => {
  return (
    <Screen>
      <Switch>
        <Route path='/login' component={Login} />
        <Route path='/registration' component={Registration} />
      </Switch>
    </Screen>
  )
}
