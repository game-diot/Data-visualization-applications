import React from 'react'
import { Alert, Collapse } from 'antd'

interface ErrorPanelProps {
  title: string

  detail?: React.ReactNode
  stack?: string
}

export const ErrorPanel: React.FC<ErrorPanelProps> = ({ detail, stack, title }) => {
  return (
    <Alert
      title={title}
      type="error"
      showIcon
      className="my-4 text-left"
      description={
        (detail || stack) && (
          <div className="mt-2">
            <Collapse ghost size="small">
              <Collapse.Panel
                header={<span className="text-xs text-slate-500">查看错误详情</span>}
                key="1"
              >
                {detail && (
                  <div className="mb-2 text-xs text-slate-600 break-words bg-slate-50 p-2 rounded border border-slate-100">
                    {typeof detail === 'string' ? detail : JSON.stringify(detail, null, 2)}
                  </div>
                )}
                {/* 只有在 Dev 并且有 stack 的情况下才会渲染这一块 */}
                {stack && (
                  <pre className="overflow-auto rounded bg-slate-900 p-2 text-[10px] text-emerald-400 max-h-48">
                    {stack}
                  </pre>
                )}
              </Collapse.Panel>
            </Collapse>
          </div>
        )
      }
    />
  )
}
