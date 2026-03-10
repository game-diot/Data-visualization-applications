// src/features/cleaning/pages/CleaningPage.tsx
import React, { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { Skeleton, Tabs, Alert, Typography } from 'antd'

// 引入全局组件
import { CleaningHeader } from '../components/CleaningHeader'
import { SessionController } from '../components/SessionController'

// 引入 Tab 内容组件 (前面 2 个 prompt 写好的)
import { RulesForm } from '../components/RulesForm'
import { ModificationsList } from '../components/ModificationsList'
import { CleaningReportsTable } from '../components/CleaningReportsTable'

// 引入防腐层 Hooks
import { useCleaningStatusPolling } from '../hooks/useCleaningStatusPolling'
import { useCleaningActiveSession } from '@/entities/cleaning/queries/cleaning.queries'

const { Title } = Typography

export default function CleaningPage() {
  // 1. 获取核心上下文参数
  // 注意：在实际集成 TanStack Router 时，这里需要确保路由配了 $fileId
  const { fileId } = useParams({ strict: false }) as { fileId: string }

  // MVP 阶段：暂定 qualityVersion 为 1 (后续可从 URL ?qv=x 中获取)
  const [qualityVersion] = useState<number>(1)

  // 2. 激活全局“呼吸灯”轮询监听
  const {
    data: statusData,
    isLoading: isStatusLoading,
    error: statusError,
  } = useCleaningStatusPolling(fileId, qualityVersion)

  // 3. 动态获取活跃的 Session ID (如果有的话)
  const { data: sessionData } = useCleaningActiveSession(
    fileId,
    statusData?.hasActiveSession ? qualityVersion : null,
  )

  // --- 全局兜底渲染 ---
  if (!fileId) return <Alert message="缺失 File ID" type="error" className="m-6" />
  if (isStatusLoading)
    return (
      <div className="p-8">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    )
  if (statusError)
    return (
      <Alert
        message="获取清洗引擎状态失败"
        description={(statusError as Error).message}
        type="error"
        className="m-6"
      />
    )

  // 状态机分流
  const isNoSession = statusData?.uiStatus === 'no_session'
  const sessionId = sessionData?.sessionId

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-slate-50/50">
      {/* 顶部仪表盘永远在线 */}
      <CleaningHeader fileId={fileId} qualityVersion={qualityVersion} statusData={statusData} />

      {/* 路由分叉：无会话 vs 有会话 */}
      {isNoSession ? (
        <SessionController fileId={fileId} qualityVersion={qualityVersion} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2">
          <Tabs
            defaultActiveKey="rules"
            size="large"
            tabBarStyle={{ paddingLeft: 16, marginBottom: 0 }}
            items={[
              {
                key: 'rules',
                label: <span className="px-4 tracking-wider">⚙️ 自动化清洗规则</span>,
                children: (
                  <div className="p-6 bg-slate-50/50 min-h-[500px]">
                    {/* 只有在确保 sessionId 拿到后才渲染庞大的表单 */}
                    {sessionId ? (
                      <RulesForm
                        fileId={fileId}
                        sessionId={sessionId}
                        qualityVersion={qualityVersion}
                      />
                    ) : (
                      <Skeleton active />
                    )}
                  </div>
                ),
              },
              {
                key: 'modifications',
                label: <span className="px-4 tracking-wider">✍️ 手工修改意图</span>,
                children: (
                  <div className="p-6 min-h-[500px]">
                    {sessionId ? (
                      <ModificationsList fileId={fileId} sessionId={sessionId} />
                    ) : (
                      <Skeleton active />
                    )}
                  </div>
                ),
              },
              {
                key: 'reports',
                label: <span className="px-4 tracking-wider">📜 历史版本与产物</span>,
                children: (
                  <div className="p-6 min-h-[500px]">
                    <CleaningReportsTable fileId={fileId} qualityVersion={qualityVersion} />
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}
    </div>
  )
}
