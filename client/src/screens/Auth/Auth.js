import React from 'react'
import { Switch } from 'react-router'

import { LayoutRoute } from 'components'
import { Login, Registration, Step } from 'screens/Auth/components'

import { Anchor } from 'core/styles/typography'

export const Auth = () => {
  return (
    <Switch>
      <LayoutRoute
        path='/login'
        component={Login}
        helmet={{
          title: 'вход',
          description: 'Страница авторизации'
        }}
        footer={{
          body: <Anchor to='/recovery'>Восстановить пароль</Anchor>
        }}
      />
      <LayoutRoute
        path='/registration'
        component={Registration}
        helmet={{
          title: 'регистрация',
          description: 'Страница регистрации'
        }}
        footer={{
          body: <Anchor to='/login'>Войти в аккаунт</Anchor>
        }}
      />
      <LayoutRoute
        path='/avatar'
        component={Step}
        helmet={{
          title: 'аватар',
          description: 'Страница выбора аватара'
        }}
        footer={{
          body: <Anchor to='/feed'>Пропустить</Anchor>
        }}
      />
    </Switch>
  )
}
