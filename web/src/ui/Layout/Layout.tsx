import { type ReactNode } from 'react'
import clsx from 'clsx'

import s from './Layout.module.scss'

interface LayoutProps {
  children: ReactNode
  className?: string
}

/* Mobile-first container centered on desktop */
export const Layout = ({ children, className }: LayoutProps) => {
  return (
    <div className={clsx(s.layout, className)}>
      {children}
    </div>
  )
}
