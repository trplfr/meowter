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
  create?: boolean
  badge?: number
}

interface NavigatorProps {
  items: NavigatorItem[]
}

export const Navigator = ({ items }: NavigatorProps) => {
  return (
    <nav className={s.nav} aria-label='Навигация'>
      {items.map((item, i) => (
        <Link
          key={i}
          to={item.route}
          params={item.params ?? {}}
          className={clsx(
            s.item,
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
  )
}
