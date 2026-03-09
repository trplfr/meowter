import { useState, useEffect, useCallback, type RefObject } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'
import clsx from 'clsx'

import s from './ScrollButton.module.scss'

interface ScrollButtonProps {
  /** ref на скроллируемый контейнер */
  scrollRef: RefObject<HTMLElement | null>
}

export const ScrollButton = ({ scrollRef }: ScrollButtonProps) => {
  const [visible, setVisible] = useState(false)
  const [direction, setDirection] = useState<'up' | 'down'>('up')

  const updateState = useCallback(() => {
    const el = scrollRef.current
    if (!el) {
      return
    }

    const { scrollTop, scrollHeight, clientHeight } = el
    const atTop = scrollTop <= 10
    const atBottom = scrollTop + clientHeight >= scrollHeight - 10

    // прячем если в самом верху или самом низу
    if (atTop || atBottom) {
      setVisible(false)
      return
    }

    setVisible(true)

    // верхняя половина -> кнопка вниз, нижняя -> кнопка вверх
    const middle = (scrollHeight - clientHeight) / 2
    setDirection(scrollTop > middle ? 'up' : 'down')
  }, [scrollRef])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) {
      return
    }

    el.addEventListener('scroll', updateState, { passive: true })
    updateState()

    return () => el.removeEventListener('scroll', updateState)
  }, [scrollRef, updateState])

  const handleClick = () => {
    const el = scrollRef.current
    if (!el) {
      return
    }

    el.scrollTo({
      top: direction === 'up' ? 0 : el.scrollHeight,
      behavior: 'smooth'
    })
  }

  return (
    <button
      type='button'
      aria-label={direction === 'up' ? 'Наверх' : 'Вниз'}
      className={clsx(s.button, visible && s.visible)}
      onClick={handleClick}
    >
      {direction === 'up' ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
    </button>
  )
}
