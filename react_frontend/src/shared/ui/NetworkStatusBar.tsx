import { WifiOutlined } from '@ant-design/icons'
import { Alert } from 'antd'
import React, { useEffect, useState } from 'react'

type NetworkStatusBarProps = {
  message?: string
}

export const NetworkStatusBar: React.FC<NetworkStatusBarProps> = ({
  message = '当前网络已断开，部分功能（如任务轮询）将暂停。请检查您的网络连接。',
}) => {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  )

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] animate-in fade-in slide-in-from-top duration-300">
      <Alert message={message} type="error" showIcon icon={<WifiOutlined />} banner />
    </div>
  )
}
