import { FilterOutlined } from '@ant-design/icons'
import { Button, Empty } from 'antd'
import React from 'react'

interface EmptyStateProps {
  title?: string
  description?: string
  onReset?: () => void
  action?: React.ReactNode // [新增] 允许外部传入自定义的 JSX 操作区域
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = '暂无数据',
  description = '当前列表空空如也',
  onReset,
  action, // [提取新增的 action]
}) => {
  return (
    <div className="flex w-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 py-16">
      <Empty
        description={
          <div className="mt-2 flex flex-col items-center gap-2">
            <span className="text-base font-medium text-slate-700">{title}</span>
            <span className="text-sm text-slate-500">{description}</span>
          </div>
        }
      >
        {/* 渲染逻辑：优先渲染外部传入的 action，否则回退到默认的 onReset 按钮 */}
        {action ? (
          <div className="mt-4">{action}</div>
        ) : onReset ? (
          <Button type="primary" ghost icon={<FilterOutlined />} onClick={onReset} className="mt-4">
            清空过滤条件
          </Button>
        ) : null}
      </Empty>
    </div>
  )
}
