import React from 'react'
import { Route, Switch } from 'react-router'

import { useResize } from 'common/helpers'

import { HeaderMenu as Menu } from './HeaderMenu'

export const Header = () => {
  const isMobile = useResize()

  // TODO: юзер должен идти из парамс, разобраться с query в search

  const routes = [
    {
      route: '/user',
      title: null,
      isBack: false,
      isBurger: true,
      isBorder: true,
      isNotifications: true
    },
    {
      route: '/meowt',
      title: 'Мяутнуть',
      isBack: true,
      isBurger: false,
      isBorder: false,
      isNotifications: false
    },
    {
      route: '/feed',
      title: 'Лента',
      isBack: false,
      isBurger: true,
      isBorder: true,
      isNotifications: true
    },
    {
      route: '/notifications',
      title: 'Оповещения',
      isBack: true,
      isBurger: false,
      isBorder: true,
      isNotifications: true
    },
    {
      route: '/settings',
      title: 'Настройки',
      isBack: true,
      isBurger: false,
      isBorder: true,
      isNotifications: true
    },
    {
      route: '/search',
      title: 'Поиск',
      isBack: true,
      isBurger: false,
      isBorder: true,
      isNotifications: true
    },
    {
      route: '/search/?',
      title: 'Поиск',
      isBack: false,
      isBurger: true,
      isBorder: true,
      isNotifications: true
    },
    {
      route: '/user/:id/comments',
      title: 'Обсуждение',
      isBack: true,
      isBurger: false,
      isBorder: true,
      isNotifications: true
    },
    {
      route: '/login',
      title: null,
      isBack: true,
      isBurger: false,
      isBorder: false,
      isNotifications: false
    },
    {
      route: '/registration',
      title: null,
      isBack: true,
      isBurger: false,
      isBorder: false,
      isNotifications: false
    },
    {
      route: '/registration/avatar',
      title: null,
      isBack: true,
      isBurger: false,
      isBorder: false,
      isNotifications: false
    },
    {
      route: '/recovery',
      title: null,
      isBack: true,
      isBurger: false,
      isBorder: false,
      isNotifications: false
    },
    {
      route: '/recovery/login',
      title: null,
      isBack: true,
      isBurger: false,
      isBorder: false,
      isNotifications: false
    }
  ]

  if (isMobile) {
    return (
      <Switch>
        {routes.map(item => (
          <Route key={item.route} path={item.route}>
            <Menu
              title={item.title}
              isBorder={item.isBorder}
              isBack={item.isBack}
              isBurger={item.isBurger}
              isNotifications={item.isNotifications}
            />
          </Route>
        ))}
      </Switch>
    )
  }

  return null
}
