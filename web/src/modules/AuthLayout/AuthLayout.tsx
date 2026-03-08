import { useState, useEffect, type ReactNode } from 'react'
import { Link } from 'atomic-router-react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'
import { Menu, Bell, ArrowLeft, Newspaper, User, Search, PenLine } from 'lucide-react'

import { routes } from '@core/router'
import { Navigator } from '@ui/index'
import { $unreadCount, startPolling, stopPolling } from '@logic/notifications'

import { CreateMeowForm } from '@modules/CreateMeow'
import { Sidebar } from '@modules/Sidebar'

import s from './AuthLayout.module.scss'

interface AuthLayoutProps {
  title: ReactNode
  panel?: ReactNode
  contentClassName?: string
  headerAction?: ReactNode
  backButton?: boolean
  children: ReactNode
}

export const AuthLayout = ({
  title,
  panel,
  contentClassName,
  headerAction,
  backButton,
  children
}: AuthLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const unreadCount = useUnit($unreadCount)
  const [onStartPolling, onStopPolling] = useUnit([startPolling, stopPolling])

  useEffect(() => {
    onStartPolling()
    return () => onStopPolling()
  }, [])

  const isActive = useUnit({
    feed: routes.feed.$isOpened,
    catProfile: routes.catProfile.$isOpened,
    search: routes.search.$isOpened,
    createMeow: routes.createMeow.$isOpened
  })

  const navItems = [
    { route: routes.feed, icon: Newspaper, active: isActive.feed },
    {
      route: routes.catProfile,
      params: { username: 'me' },
      icon: User,
      active: isActive.catProfile
    },
    { route: routes.search, icon: Search, active: isActive.search },
    { route: routes.createMeow, icon: PenLine, active: isActive.createMeow }
  ]

  const badgeText = unreadCount > 99 ? '99+' : String(unreadCount)

  return (
    <div className={s.shell}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className={s.main}>
        <header className={s.header}>
          {backButton ? (
            <button className={s.backButton} type="button" aria-label="Назад" onClick={() => window.history.back()}>
              <ArrowLeft size={24} />
            </button>
          ) : (
            <>
              <button className={s.burger} type="button" aria-label="Меню" onClick={() => setSidebarOpen(true)}>
                <Menu size={24} />
              </button>
              <span className={s.burgerDesktop}>
                <Menu size={24} />
              </span>
            </>
          )}
          <h1 className={s.title}>{title}</h1>
          {headerAction || (
            <Link to={routes.notifications} className={s.bell} aria-label="Уведомления">
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className={s.badge} aria-live="polite">{badgeText}</span>
              )}
            </Link>
          )}
        </header>

        <div className={clsx(s.content, contentClassName)}>{children}</div>
      </main>

      <aside className={s.panel}>{panel ?? <CreateMeowForm />}</aside>

      <Navigator items={navItems} />
    </div>
  )
}
