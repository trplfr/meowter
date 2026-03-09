import { useState, useEffect } from 'react'
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
const MONTH = 30 * DAY
const YEAR = 12 * MONTH

const formatShort = (diff: number): string | null => {
  if (diff < MINUTE) {
    return `${Math.max(1, Math.floor(diff / 1000))} с.`
  }

  if (diff < HOUR) {
    return `${Math.floor(diff / MINUTE)} м.`
  }

  if (diff < DAY) {
    return `${Math.floor(diff / HOUR)} ч.`
  }

  if (diff < WEEK) {
    return `${Math.floor(diff / DAY)} дн.`
  }

  if (diff < MONTH) {
    return `${Math.floor(diff / WEEK)} нед.`
  }

  if (diff < YEAR) {
    return `${Math.floor(diff / MONTH)} мес.`
  }

  return null
}

// SSR-safe: рендерим статичный формат, на клиенте обновляем
export const TimeAgo = ({ date }: TimeAgoProps) => {
  const d = new Date(date)
  const fullDate = format(d, 'd MMMM yyyy, HH:mm', { locale: ru })
  const staticFormatted = format(d, 'd MMM yyyy', { locale: ru })
  const [text, setText] = useState(staticFormatted)

  useEffect(() => {
    const update = () => {
      const diff = Date.now() - d.getTime()
      const short = formatShort(diff)
      setText(short || format(d, 'd MMM yyyy', { locale: ru }))
    }

    update()

    const interval = setInterval(update, MINUTE)
    return () => clearInterval(interval)
  }, [date])

  return (
    <time className={s.time} dateTime={date} title={fullDate}>
      {text}
    </time>
  )
}
