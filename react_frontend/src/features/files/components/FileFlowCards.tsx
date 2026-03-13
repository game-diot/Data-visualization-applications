import React from 'react'
import { Card, Button, Badge, Row, Col, Progress, Space, Skeleton } from 'antd'
import { SearchOutlined, ClearOutlined, LineChartOutlined } from '@ant-design/icons'
import type { DatasetDetailVM } from '@/entities/file/types/file.types'
import { useNavigate } from '@tanstack/react-router'
import { useCleaningReports } from '@/entities/cleaning/queries/cleaning.queries'
import { useAnalysisReports } from '@/entities/analysis/queries/analysis.queries'

export const FileFlowCards: React.FC<{ data: DatasetDetailVM }> = ({ data }) => {
  const navigate = useNavigate()

  const resolvedQv = 1 || 0

  const { data: cleaningReports, isLoading: isCleaningLoading } = useCleaningReports(
    data.id,
    resolvedQv,
  )
  const latestCv = cleaningReports?.[0]?.cleaningVersion || 0

  const { data: analysisReports, isLoading: isAnalysisLoading } = useAnalysisReports(
    data.id,
    resolvedQv,
    latestCv,
  )
  // =========================================================
  // ✅ 安全的状态推导 (绝对纯净，只看当前版本快照的数量)
  // =========================================================
  const cleaningReportCount = cleaningReports?.length || 0
  // 🚀 修复：不再信任 data.flowStatus.cleaning，只看真实的报告数量
  const isCleaningDone = cleaningReportCount > 0

  const analysisReportCount = analysisReports?.length || 0
  // 🚀 修复：不再信任 data.flowStatus.analysis，只看真实的报告数量
  const isAnalysisDone = analysisReportCount > 0
  return (
    <Row gutter={[16, 16]} className="items-stretch">
      {/* 1. 质量检测卡片 */}
      <Col span={8}>
        <Card title="1. 数据质量检测" bordered={false} className="shadow-sm h-full flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center py-4">
            {data.flowStatus.quality === 'done' ? (
              <Progress
                type="dashboard"
                percent={data.qualityScore}
                strokeColor={data.qualityScore > 80 ? '#10b981' : '#f59e0b'}
              />
            ) : (
              <Badge status="default" text="尚未生成质量报告" className="text-slate-400 mb-4" />
            )}
          </div>
          <Button
            type="primary"
            ghost
            block
            icon={<SearchOutlined />}
            onClick={() => navigate({ to: '/files/$fileId/quality', params: { fileId: data.id } })}
          >
            {data.flowStatus.quality === 'done' ? '查看质量报告' : '立即开始体检'}
          </Button>
        </Card>
      </Col>

      {/* 2. 数据清洗卡片 */}
      <Col span={8}>
        <Card title="2. 数据清洗工作台" bordered={false} className="shadow-sm h-full flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center p-10">
            {isCleaningLoading ? (
              <div className="flex flex-col items-center gap-2">
                <Badge status="processing" text="正在获取清洗状态..." />
                <Skeleton.Button
                  active
                  size="small"
                  style={{ width: 120, height: 24, borderRadius: 999 }}
                />
              </div>
            ) : isCleaningDone ? (
              <Space direction="vertical" align="center" size="small">
                <Badge
                  status="success"
                  text={<span className="font-medium text-slate-700">清洗已完成</span>}
                />
                <div className="bg-blue-50 px-3 py-1 rounded-full mt-2 border border-blue-100">
                  <span className="text-sm text-blue-600">
                    📦 累计生成了 <span className="font-bold text-lg">{cleaningReportCount}</span>{' '}
                    个产物快照
                  </span>
                </div>
              </Space>
            ) : (
              <Badge status="default" text="保持原始数据状态" />
            )}
          </div>
          <Button
            type={isCleaningDone ? 'default' : 'primary'}
            ghost={!isCleaningDone}
            block
            icon={<ClearOutlined />}
            onClick={() => navigate({ to: '/files/$fileId/cleaning', params: { fileId: data.id } })}
          >
            {isCleaningDone ? '进入工作台继续清洗' : '进入清洗配置'}
          </Button>
        </Card>
      </Col>

      {/* 3. 模型分析卡片 */}
      <Col span={8}>
        <Card title="3. 智能分析与图表" bordered={false} className="shadow-sm h-full flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center p-10">
            {isAnalysisLoading ? (
              <div className="flex flex-col items-center gap-2">
                <Badge status="processing" text="正在获取分析记录..." />
                <Skeleton.Button
                  active
                  size="small"
                  style={{ width: 120, height: 24, borderRadius: 999 }}
                />
              </div>
            ) : isAnalysisDone ? (
              <Space direction="vertical" align="center" size="small">
                <Badge
                  status="processing"
                  text={<span className="font-medium text-slate-700">包含历史分析图表</span>}
                />
                <div className="bg-purple-50 px-3 py-1 rounded-full mt-2 border border-purple-100">
                  <span className="text-sm text-purple-600">
                    📊 累计生成了 <span className="font-bold text-lg">{analysisReportCount}</span>{' '}
                    个分析大屏
                  </span>
                </div>
              </Space>
            ) : (
              <Badge status="default" text="暂无分析记录" className="text-slate-400" />
            )}
          </div>
          <Button
            type={isAnalysisDone ? 'default' : 'primary'}
            block
            icon={<LineChartOutlined />}
            onClick={() =>
              navigate({
                to: '/files/$fileId/analysis',
                params: { fileId: data.id },
                search: { qv: resolvedQv, cv: latestCv },
              })
            }
            className={
              isAnalysisDone
                ? ''
                : 'bg-slate-900 text-white hover:bg-slate-800 hover:text-white border-none'
            }
          >
            {isAnalysisDone ? '查看历史图表并分析' : '创建分析任务'}
          </Button>
        </Card>
      </Col>
    </Row>
  )
}
