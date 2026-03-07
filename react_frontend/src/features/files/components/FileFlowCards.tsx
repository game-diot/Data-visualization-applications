import React from 'react'
import { Card, Button, Badge, Row, Col, Progress } from 'antd'
import { SearchOutlined, ClearOutlined, LineChartOutlined } from '@ant-design/icons'
import type { DatasetDetailVM } from '@/entities/file/types/file.types'
import { useNavigate } from '@tanstack/react-router' // 假设使用 TanStack Router
import { notifyInfo } from '@/shared/utils/notify'

export const FileFlowCards: React.FC<{ data: DatasetDetailVM }> = ({ data }) => {
  const navigate = useNavigate()

  return (
    <Row gutter={16}>
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
            onClick={() => notifyInfo('质量检测模块即将开放，敬请期待！')}
          >
            {data.flowStatus.quality === 'done' ? '查看质量报告' : '立即开始体检'}
          </Button>
        </Card>
      </Col>

      {/* 2. 数据清洗卡片 */}
      <Col span={8}>
        <Card title="2. 数据清洗工作台" bordered={false} className="shadow-sm h-full flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center py-4">
            <Badge
              status={data.flowStatus.cleaning === 'done' ? 'success' : 'default'}
              text={data.flowStatus.cleaning === 'done' ? '已生成清洗版本' : '保持原始数据状态'}
            />
          </div>
          <Button
            block
            icon={<ClearOutlined />}
            onClick={() => notifyInfo('数据清洗模块即将开放，敬请期待！')}
          >
            进入清洗工作台
          </Button>
        </Card>
      </Col>

      {/* 3. 模型分析卡片 */}
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
            className="bg-slate-900 text-white hover:!bg-slate-800 hover:!text-white border-none"
          >
            创建分析任务
          </Button>
        </Card>
      </Col>
    </Row>
  )
}
