import React from 'react'
import { Switch, Route } from 'react-router-dom'

import { Main, Auth, NotFound, Error, NotLoggedIn } from 'screens'
import { LayoutRoute } from 'common/components'

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
          button: {
            to: '/registration',
            content: 'Зарегистрироваться'
          },
          link: {
            to: '/login',
            content: 'Войти в аккаунт'
          }
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
          link: {
            content: 'Назад',
            isBack: true
          }
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
          button: {
            to: '/registration',
            content: 'Зарегистрироваться'
          },
          link: {
            to: '/login',
            content: 'Войти в аккаунт'
          }
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
          link: {
            content: 'Назад',
            isBack: true
          }
        }}
      />
    </Switch>
  )
}
