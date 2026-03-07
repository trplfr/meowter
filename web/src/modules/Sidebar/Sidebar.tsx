import { useRef } from 'react'
import { Trans } from '@lingui/react/macro'
import { Link } from 'atomic-router-react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { routes } from '@core/router'
import { $session, logout } from '@logic/session'

import logoutCat from '@assets/images/logout.png'

import s from './Sidebar.module.scss'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export const Sidebar = ({ open, onClose }: SidebarProps) => {
  const [session, onLogout] = useUnit([$session, logout])
  const hasBeenOpened = useRef(false)

  if (open) {
    hasBeenOpened.current = true
  }

  const handleLogout = () => {
    onClose()
    onLogout()
  }

  return (
    <>
      <div className={clsx(s.overlay, open && s.visible)} onClick={onClose} />
      <aside className={clsx(s.sidebar, hasBeenOpened.current && s.animated, open && s.open)}>
        <div className={s.profile}>
          {session?.avatarUrl ? (
            <img className={s.avatar} src={session.avatarUrl} alt="" />
          ) : (
            <div className={s.avatarPlaceholder} />
          )}

          <p className={s.displayName}>{session?.displayName}</p>
          <p className={s.username}>@{session?.username}</p>
        </div>

        <div className={s.separator} />

        <nav className={s.nav}>
          <Link to={routes.feed} className={s.navItem} onClick={onClose}>
            <Trans>Лента</Trans>
          </Link>
          {session?.username && (
            <Link
              to={routes.catProfile}
              params={{ username: session.username }}
              className={s.navItem}
              onClick={onClose}
            >
              <Trans>Профиль</Trans>
            </Link>
          )}
          <Link to={routes.search} className={s.navItem} onClick={onClose}>
            <Trans>Поиск</Trans>
          </Link>
          <Link to={routes.settings} className={s.navItem} onClick={onClose}>
            <Trans>Настройки</Trans>
          </Link>
        </nav>

        <div className={s.footer}>
          <img className={s.logoutCat} src={logoutCat} alt="" />
          <button className={s.logoutButton} onClick={handleLogout}>
            <Trans>Выйти из аккаунта</Trans>
          </button>
        </div>
      </aside>
    </>
  )
}
