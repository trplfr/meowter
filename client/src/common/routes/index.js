import React from 'react'
import { Switch, Route } from 'react-router-dom'

import { Main } from 'screens/Main'
import { Auth } from 'screens/Auth'
import { NotFound } from 'screens/NotFound'

export const Router = () => {
  return (
    <Switch>
      <Route exact path='/' key='Main' component={Main} />
      <Route path='/login' key='Login' component={Auth} />
      <Route path='/registration' key='Registration' component={Auth} />
      <Route path='*' key='404' component={NotFound} />
    </Switch>
  )
}
