import { type LucideIcon } from 'lucide-react'
import { Link } from 'atomic-router-react'
import clsx from 'clsx'

import { type RouteInstance } from 'atomic-router'

import s from './Navigator.module.scss'

interface NavigatorItem {
  route: RouteInstance<any>
  params?: Record<string, string>
  icon: LucideIcon
  active: boolean
}

interface NavigatorProps {
  items: NavigatorItem[]
}

export const Navigator = ({ items }: NavigatorProps) => {
  return (
    <nav className={s.nav} aria-label="Навигация">
      {items.map((item, i) => (
        <Link
          key={i}
          to={item.route}
          params={item.params ?? {}}
          className={clsx(s.item, item.active && s.active)}
          aria-current={item.active ? 'page' : undefined}
        >
          <item.icon size={24} />
        </Link>
      ))}
    </nav>
  )
}
