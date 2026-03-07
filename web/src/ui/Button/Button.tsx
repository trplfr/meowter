import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Slot } from '@radix-ui/react-slot'
import clsx from 'clsx'

import { Loader } from '@ui/Loader'

import s from './Button.module.scss'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variant style */
  variant?: 'primary' | 'outline' | 'ghost'
  /** Full width button */
  fullWidth?: boolean
  /** Loading state */
  isLoading?: boolean
  /** Render as child element (Link, a, etc.) */
  asChild?: boolean
  children: ReactNode
}

export const Button = ({
  variant = 'primary',
  fullWidth = false,
  isLoading = false,
  asChild = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) => {
  const Component = asChild ? Slot : 'button'

  return (
    <Component
      className={clsx(
        s.button,
        s[variant],
        fullWidth && s.fullWidth,
        isLoading && s.loading,
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader size={24} /> : children}
    </Component>
  )
}
