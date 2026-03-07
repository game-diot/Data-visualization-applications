import { useVirtualizer } from '@tanstack/react-virtual'
import React, { useRef } from 'react'

interface VirtualListProps<T> {
  items: T[]
  height: number // 容器高度
  itemHeight: number // 单项估算高度
  renderItem: (item: T, index: number) => React.ReactNode
}

export function VirtualList<T>({ items, height, itemHeight, renderItem }: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan: 5, // 提前渲染可视区外的 5 项，防止滚动白屏
  })

  return (
    <div
      ref={parentRef}
      style={{ height, overflow: 'auto' }}
      className="border border-gray-200 rounded-md"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {renderItem(items[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  )
}
