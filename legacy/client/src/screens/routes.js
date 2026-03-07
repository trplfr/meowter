import React from 'react'
import { Switch, Route, Link } from 'react-router-dom'

import { Main, Auth, NotFound, Error, NotLoggedIn } from 'screens'
import { LayoutRoute, Button, Back } from 'common/components'
import { Anchor } from 'core/styles/typography'

export const Routes = () => {
  return (
    <Switch>
      <LayoutRoute
        exact
        path='/'
        key='Main'
        component={Main}
        helmet={{
          title: 'привет',
          description: 'Добро пожаловать в мяутер!'
        }}
        footer={{
          body: (
            <>
              <Button as={Link} to='/registration'>
                Зарегистрироваться
              </Button>
              <Anchor to='/login'>Войти в аккаунт</Anchor>
            </>
          )
        }}
      />
      <Route path='/login' key='Login' component={Auth} />
      <Route path='/registration' key='Registration' component={Auth} />
      <LayoutRoute
        path='/error'
        key='Error'
        component={Error}
        helmet={{
          title: 'ошибка'
        }}
        footer={{
          body: <Back>Назад</Back>
        }}
      />
      <LayoutRoute
        path='/not-logged-in'
        key='NotLoggedIn'
        component={NotLoggedIn}
        helmet={{
          title: 'ай'
        }}
        footer={{
          body: (
            <>
              <Button as={Link} to='/registration'>
                Зарегистрироваться
              </Button>
              <Anchor to='/login'>Войти в аккаунт</Anchor>
            </>
          )
        }}
      />
      <LayoutRoute
        path='*'
        key='404'
        component={NotFound}
        helmet={{
          title: 'не найдено'
        }}
        footer={{
          body: <Back>Назад</Back>
        }}
      />
    </Switch>
  )
}
