import { Spin } from 'antd'
import React from 'react'

type LoadingBlockProps = {
  text?: string
  fullScreen?: boolean
  className?: string
}

export const LoadingBlock: React.FC<LoadingBlockProps> = ({
  text = '加载中...',
  fullScreen = false,
  className = '',
}) => {
  const baseClass = fullScreen
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80'
    : 'flex flex-col items-center justify-center p-10 w-full h-full min-h-[200px]'

  return (
    <div className={`${baseClass} ${className}`.trim()}>
      <Spin size="large" />
      <div className="mt-4 text-gray-500">{text}</div>
    </div>
  )
}
