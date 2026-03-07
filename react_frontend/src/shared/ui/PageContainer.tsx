import React from 'react'

interface PageContainerProps {
  title?: React.ReactNode
  extra?: React.ReactNode
  children: React.ReactNode
}

export const PageContainer: React.FC<PageContainerProps> = ({ title, extra, children }) => {
  return (
    <div className="flex flex-col h-full">
      {(title || extra) && (
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
          <h1 className="text-xl font-semibold m-0">{title}</h1>
          <div>{extra}</div>
        </div>
      )}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
