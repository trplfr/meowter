import { Link } from 'atomic-router-react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'
import {
  House,
  Search,
  Plus,
  Heart,
  User,
  LogOut,
  type LucideIcon
} from 'lucide-react'

import { type RouteInstance } from 'atomic-router'

import { routes } from '@core/router'
import { $session, logout } from '@logic/session'
import { $unreadCount } from '@logic/notifications'

import logo from '@assets/images/hello.png'

import s from './Sidebar.module.scss'

interface SidebarNavItem {
  route: RouteInstance<any>
  params?: Record<string, string>
  icon: LucideIcon
  active: boolean
  create?: boolean
  badge?: number
}

export const Sidebar = () => {
  const [session, unreadCount, onLogout] = useUnit([
    $session,
    $unreadCount,
    logout
  ])

  const isActive = useUnit({
    feed: routes.feed.$isOpened,
    search: routes.search.$isOpened,
    createMeow: routes.createMeow.$isOpened,
    notifications: routes.notifications.$isOpened,
    catProfile: routes.catProfile.$isOpened
  })

  const navItems: SidebarNavItem[] = [
    { route: routes.feed, icon: House, active: isActive.feed },
    { route: routes.search, icon: Search, active: isActive.search },
    {
      route: routes.createMeow,
      icon: Plus,
      active: isActive.createMeow,
      create: true
    },
    {
      route: routes.notifications,
      icon: Heart,
      active: isActive.notifications,
      badge: unreadCount
    },
    {
      route: routes.catProfile,
      params: { username: session?.username || 'me' },
      icon: User,
      active: isActive.catProfile
    }
  ]

  return (
    <aside className={s.sidebar}>
      <Link to={routes.feed} params={{}} className={s.logo}>
        <img src={logo} alt='Meowter' width={423} height={248} />
      </Link>

      <nav className={s.nav} aria-label='Боковое меню'>
        {navItems.map((item, i) => (
          <Link
            key={i}
            to={item.route}
            params={item.params ?? {}}
            className={clsx(
              s.navItem,
              item.active && s.active,
              item.create && s.create
            )}
            aria-current={item.active ? 'page' : undefined}
          >
            <item.icon size={24} />
            {item.badge !== undefined && item.badge > 0 && (
              <span className={s.badge}>
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <button
        type='button'
        className={s.logoutButton}
        onClick={() => onLogout()}
        aria-label='Выйти'
      >
        <LogOut size={24} />
      </button>
    </aside>
  )
}
