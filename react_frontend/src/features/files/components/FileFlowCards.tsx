import React from 'react'
import { Card, Button, Badge, Row, Col, Progress, Space, Skeleton } from 'antd'
import { SearchOutlined, ClearOutlined, LineChartOutlined } from '@ant-design/icons'
import type { DatasetDetailVM } from '@/entities/file/types/file.types'
import { useNavigate } from '@tanstack/react-router'
import { notifyInfo } from '@/shared/utils/notify'
import { useCleaningReports } from '@/entities/cleaning/queries/cleaning.queries'

export const FileFlowCards: React.FC<{ data: DatasetDetailVM }> = ({ data }) => {
  const navigate = useNavigate()

  // 🌟 消费 reports 接口预热缓存并获取数量
  const { data: reports, isLoading: isReportsLoading } = useCleaningReports(data.id, 1)

  const reportCount = reports?.length || 0

  // 🌟 核心破局：不要只相信 flowStatus！只要真实的报告数量大于 0，它就是 100% 被清洗过的！
  const isCleaningDone = data.flowStatus?.cleaning === 'done' || reportCount > 0
  return (
    <Row gutter={[16, 16]} className="items-stretch">
      {/* ========================================================= */}
      {/* 1. 质量检测卡片 */}
      {/* ========================================================= */}
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
            onClick={() => {
              navigate({
                to: '/files/$fileId/quality',
                params: { fileId: data.id },
              })
            }}
          >
            {data.flowStatus.quality === 'done' ? '查看质量报告' : '立即开始体检'}
          </Button>
        </Card>
      </Col>

      {/* ========================================================= */}
      {/* 2. 数据清洗卡片 */}
      {/* ========================================================= */}
      <Col span={8}>
        <Card title="2. 数据清洗工作台" bordered={false} className="shadow-sm h-full flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center p-10">
            {isCleaningDone ? (
              // 🌟 状态 1：已清洗
              isReportsLoading ? (
                // 数据加载中的骨架屏防抖
                <div className="flex flex-col items-center gap-2">
                  <Badge status="success" text="清洗已完成" />
                  <Skeleton.Button
                    active
                    size="small"
                    style={{ width: 120, height: 24, borderRadius: 999 }}
                  />
                </div>
              ) : (
                <Space direction="vertical" align="center" size="small">
                  <Badge
                    status="success"
                    text={<span className="font-medium text-slate-700">清洗已完成</span>}
                  />
                  <div className="bg-blue-50 px-3 py-1 rounded-full mt-2 border border-blue-100 ">
                    <span className="text-sm text-blue-600">
                      📦 累计生成了 <span className="font-bold text-lg">{reportCount}</span>{' '}
                      个产物快照
                    </span>
                  </div>
                </Space>
              )
            ) : (
              // 🌟 状态 2：未清洗
              <Badge status="default" text="保持原始数据状态" />
            )}
          </div>

          <Button
            type={isCleaningDone ? 'default' : 'primary'}
            ghost={!isCleaningDone}
            block
            icon={<ClearOutlined />}
            onClick={() => {
              navigate({
                to: '/files/$fileId/cleaning',
                params: { fileId: data.id },
              })
            }}
          >
            {isCleaningDone ? '进入工作台继续清洗' : '进入清洗配置'}
          </Button>
        </Card>
      </Col>

      {/* ========================================================= */}
      {/* 3. 模型分析卡片 */}
      {/* ========================================================= */}
      <Col span={8}>
        <Card title="3. 智能分析与图表" bordered={false} className="shadow-sm h-full flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center py-4">
            <Badge
              status={data.flowStatus.analysis === 'done' ? 'processing' : 'default'}
              text={data.flowStatus.analysis === 'done' ? '包含历史分析图表' : '暂无分析记录'}
            />
          </div>
          <Button
            type="default"
            block
            icon={<LineChartOutlined />}
            onClick={() => notifyInfo('模型分析模块即将开放，敬请期待！')}
            // 使用 Tailwind 覆盖，避免内联样式的优先级问题
            className="bg-slate-900 text-white hover:bg-slate-800 hover:text-white border-none"
          >
            创建分析任务
          </Button>
        </Card>
      </Col>
    </Row>
  )
}
