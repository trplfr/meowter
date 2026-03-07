import { useState, type ReactNode } from 'react'
import { Link } from 'atomic-router-react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'
import { Menu, Bell, Home, User, Search, PenLine } from 'lucide-react'

import { routes } from '@core/router'
import { Navigator } from '@ui/index'

import { CreateMeowForm } from '@modules/CreateMeow'
import { Sidebar } from '@modules/Sidebar'

import s from './AuthLayout.module.scss'

interface AuthLayoutProps {
  title: ReactNode
  panel?: ReactNode
  contentClassName?: string
  children: ReactNode
}

export const AuthLayout = ({ title, panel, contentClassName, children }: AuthLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isActive = useUnit({
    feed: routes.feed.$isOpened,
    catProfile: routes.catProfile.$isOpened,
    search: routes.search.$isOpened,
    createMeow: routes.createMeow.$isOpened
  })

  const navItems = [
    { route: routes.feed, icon: Home, active: isActive.feed },
    { route: routes.catProfile, params: { username: 'me' }, icon: User, active: isActive.catProfile },
    { route: routes.search, icon: Search, active: isActive.search },
    { route: routes.createMeow, icon: PenLine, active: isActive.createMeow }
  ]

  return (
    <div className={s.shell}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className={s.main}>
        <header className={s.header}>
          <button className={s.burger} onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <span className={s.burgerDesktop}>
            <Menu size={24} />
          </span>
          <h1 className={s.title}>{title}</h1>
          <Link to={routes.notifications} className={s.bell}>
            <Bell size={24} />
          </Link>
        </header>

        <div className={clsx(s.content, contentClassName)}>
          {children}
        </div>
      </main>

      <aside className={s.panel}>
        {panel ?? <CreateMeowForm />}
      </aside>

      <Navigator items={navItems} />
    </div>
  )
}
