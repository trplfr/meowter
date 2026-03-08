import { useState, useEffect } from 'react'
import { plural } from '@lingui/core/macro'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

import s from './MeowCard.module.scss'

interface TimeAgoProps {
  date: string
}

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY

const formatRelative = (diff: number) => {
  if (diff < MINUTE) {
    return plural(Math.max(1, Math.floor(diff / 1000)), {
      one: '# секунду назад',
      few: '# секунды назад',
      many: '# секунд назад',
      other: '# секунд назад'
    })
  }

  if (diff < HOUR) {
    const minutes = Math.floor(diff / MINUTE)
    return plural(minutes, {
      one: '# минуту назад',
      few: '# минуты назад',
      many: '# минут назад',
      other: '# минут назад'
    })
  }

  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR)
    return plural(hours, {
      one: '# час назад',
      few: '# часа назад',
      many: '# часов назад',
      other: '# часов назад'
    })
  }

  if (diff < WEEK) {
    const days = Math.floor(diff / DAY)
    return plural(days, {
      one: '# день назад',
      few: '# дня назад',
      many: '# дней назад',
      other: '# дней назад'
    })
  }

  return null
}

// SSR-safe: рендерим статичный формат, на клиенте обновляем
export const TimeAgo = ({ date }: TimeAgoProps) => {
  const d = new Date(date)
  const staticFormatted = format(d, 'd MMM, HH:mm', { locale: ru })
  const [text, setText] = useState(staticFormatted)

  useEffect(() => {
    const update = () => {
      const diff = Date.now() - d.getTime()
      const relative = formatRelative(diff)
      setText(relative || format(d, 'd MMM yyyy, HH:mm', { locale: ru }))
    }

    update()

    const interval = setInterval(update, MINUTE)
    return () => clearInterval(interval)
  }, [date])

  return <time className={s.time} dateTime={date}>{text}</time>
}
