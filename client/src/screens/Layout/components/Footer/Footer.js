import React from 'react'
import { Route, Switch } from 'react-router'

import { useResize } from 'common/helpers'

import { FooterMenu as Menu } from './FooterMenu'

export const Footer = () => {
  const isMobile = useResize()

  // TODO: сделать компонент «прислать через ...»

  const routes = [
    {
      route: '/',
      to: '/login',
      content: 'Войти в аккаунт',
      isLink: true,
      isMenu: false
    },
    {
      route: '/registration',
      to: '/login',
      content: 'Войти в аккаунт',
      isLink: true,
      isMenu: false
    },
    {
      route: '/recovery',
      to: '/login',
      content: 'Войти в аккаунт',
      isLink: true,
      isMenu: false
    },
    {
      route: '/recovery/login',
      to: '/error',
      content: 'Прислать через ...',
      isLink: true,
      isMenu: false
    },
    {
      route: '/login',
      to: '/recovery',
      content: 'Восстановить пароль',
      isLink: true,
      isMenu: false
    },
    {
      route: '/registration/avatar',
      to: '/user',
      content: 'Пропустить',
      isLink: true,
      isMenu: false
    },
    {
      route: '/error',
      to: null,
      content: 'Назад',
      isLink: false,
      isMenu: false
    },
    {
      route: '/404',
      to: null,
      content: 'Назад',
      isLink: false,
      isMenu: false
    },
    {
      route: '/not-logged-in',
      to: '/login',
      content: 'Войти в аккаунт',
      isLink: true,
      isMenu: false
    }
  ]

  if (isMobile) {
    return (
      <Switch>
        {routes.map(item => (
          <Route exact={item.route === '/'} key={item.route} path={item.route}>
            <Menu
              to={item.to}
              content={item.content}
              isLink={item.isLink}
              isMenu={item.isMenu}
            />
          </Route>
        ))}
      </Switch>
    )
  }

  return null
}
