import { type ReactNode } from 'react'
import clsx from 'clsx'

import s from './AuthLayout.module.scss'

interface LayoutProps {
  children: ReactNode
  className?: string
}

/* Mobile-first container centered on desktop */
export const AuthLayout = ({ children, className }: LayoutProps) => {
  return <div className={clsx(s.layout, className)}>{children}</div>
}
