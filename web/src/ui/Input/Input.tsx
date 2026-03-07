import { type InputHTMLAttributes, useState } from 'react'
import clsx from 'clsx'

import { EyeClosed } from 'lucide-react'

import { CatEye } from '@ui/icons'

import s from './Input.module.scss'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Error message */
  error?: string
  /** Enable password visibility toggle */
  isPassword?: boolean
}

export const Input = ({
  error,
  isPassword = false,
  type = 'text',
  className,
  ...props
}: InputProps) => {
  const [visible, setVisible] = useState(false)

  const inputType = isPassword
    ? (visible ? 'text' : 'password')
    : type

  return (
    <div className={clsx(s.wrapper, error && s.hasError, className)}>
      <div className={s.field}>
        <input
          className={s.input}
          type={inputType}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className={clsx(s.toggle, visible && s.active)}
            onClick={() => setVisible(!visible)}
            tabIndex={-1}
          >
            {visible ? <CatEye size={20} /> : <EyeClosed size={20} />}
          </button>
        )}
      </div>
      {error && <span className={s.error}>{error}</span>}
    </div>
  )
}
