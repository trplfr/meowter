import { useEffect, useRef, type ReactNode } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'
import { ArrowLeft, House, User, Search, Plus, Heart } from 'lucide-react'

import { routes } from '@core/router'
import { Navigator, ScrollButton } from '@ui/index'
import { $unreadCount, startPolling, stopPolling } from '@logic/notifications'

import { CreateMeowForm } from '@modules/CreateMeow'
import { Sidebar } from '@modules/Sidebar'

import s from './Layout.module.scss'

interface LayoutProps {
  title: ReactNode
  panel?: ReactNode
  contentClassName?: string
  headerAction?: ReactNode
  children: ReactNode
}

export const Layout = ({
  title,
  panel,
  contentClassName,
  headerAction,
  children
}: LayoutProps) => {
  const contentRef = useRef<HTMLDivElement>(null)

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
    createMeow: routes.createMeow.$isOpened,
    notifications: routes.notifications.$isOpened
  })

  const navItems = [
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
      params: { username: 'me' },
      icon: User,
      active: isActive.catProfile
    }
  ]

  return (
    <div className={s.shell}>
      <Sidebar />

      <main className={s.main}>
        <header className={s.header}>
          <button
            className={s.backButton}
            type='button'
            aria-label='Назад'
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className={s.title}>{title}</h1>
          {headerAction ? (
            <div className={s.headerRight}>{headerAction}</div>
          ) : (
            <div className={s.headerRight} />
          )}
        </header>

        <div ref={contentRef} className={clsx(s.content, contentClassName)}>
          {children}
          <ScrollButton scrollRef={contentRef} />
        </div>
      </main>

      <aside className={s.panel}>
        {panel !== null && (panel ?? <CreateMeowForm />)}
      </aside>

      <Navigator items={navItems} />
    </div>
  )
}
