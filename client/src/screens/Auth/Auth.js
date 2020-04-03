import React from 'react'
import { Switch } from 'react-router'

import { LayoutRoute } from 'common/components'

import { Login, Registration } from 'screens/Auth/components'

export const Auth = () => {
  return (
    <Switch>
      <LayoutRoute
        path='/login'
        component={Login}
        helmet={{
          title: 'вход'
        }}
        header={{
          isBack: true
        }}
        footer={{
          link: {
            to: '/recovery',
            content: 'Восстановить пароль'
          }
        }}
      />
      <LayoutRoute
        path='/registration'
        component={Registration}
        helmet={{
          title: 'регистрация'
        }}
        header={{
          isBack: true
        }}
        footer={{
          link: {
            to: '/login',
            content: 'Войти в аккаунт'
          }
        }}
      />
    </Switch>
  )
}
