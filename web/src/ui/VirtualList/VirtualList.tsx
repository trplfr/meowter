import { useRef, useEffect, type ReactNode } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

import s from './VirtualList.module.scss'

interface VirtualListProps<T> {
  items: T[]
  estimateSize: number
  overscan?: number
  hasMore?: boolean
  pending?: boolean
  onLoadMore?: () => void
  renderItem: (item: T, index: number) => ReactNode
  className?: string
}

export const VirtualList = <T,>({
  items,
  estimateSize,
  overscan = 5,
  hasMore = false,
  pending = false,
  onLoadMore,
  renderItem,
  className
}: VirtualListProps<T>) => {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan
  })

  const virtualItems = virtualizer.getVirtualItems()
  const lastItem = virtualItems[virtualItems.length - 1]

  // загрузка следующей страницы когда дошли до конца
  useEffect(() => {
    if (!lastItem) {
      return
    }

    if (
      lastItem.index >= items.length - 1 &&
      hasMore &&
      !pending &&
      onLoadMore
    ) {
      onLoadMore()
    }
  }, [lastItem?.index, items.length, hasMore, pending, onLoadMore])

  return (
    <div ref={parentRef} className={className || s.container}>
      <div className={s.content} style={{ height: virtualizer.getTotalSize() }}>
        <div
          className={s.items}
          style={{ transform: `translateY(${virtualItems[0]?.start ?? 0}px)` }}
        >
          {virtualItems.map(virtualRow => (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
            >
              {renderItem(items[virtualRow.index], virtualRow.index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
