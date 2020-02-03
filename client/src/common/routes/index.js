import React from 'react'
import { Switch, Route } from 'react-router-dom'

import { NotFound } from 'screens/NotFound'

export const Router = () => {
  return (
    <Switch>
      <Route path='*' key='404' component={NotFound} />
    </Switch>
  )
}
