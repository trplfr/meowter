import React from 'react'
import { Switch } from 'react-router'

import { LayoutRoute } from 'components'

import { Login, Registration } from 'screens/Auth/components'
import { Anchor } from 'core/styles/typography'

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
          body: <Anchor to='/recovery'>Восстановить пароль</Anchor>
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
          body: <Anchor to='/login'>Войти в аккаунт</Anchor>
        }}
      />
    </Switch>
  )
}
