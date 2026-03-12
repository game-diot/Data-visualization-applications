import React from 'react'
import { Drawer, Spin, Alert, Typography, Descriptions, Collapse, Tag, Row, Col } from 'antd'
import ReactECharts from 'echarts-for-react'
import { useAnalysisReportDetail } from '@/entities/analysis/queries/analysis.queries' // 假设你已封装此查询详情的Hook
import { mapHistogramToOption } from '../../mappers/charts/histogram.mapper'
import { mapHeatmapToOption } from '../../mappers/charts/heatmap.mapper'

const { Text, Title } = Typography
const { Panel } = Collapse

interface Props {
  fileId: string
  qualityVersion: number
  cleaningVersion: number
  analysisVersion: number | null
  open: boolean
  onClose: () => void
}

export const AnalysisReportDrawer: React.FC<Props> = ({
  fileId,
  qualityVersion,
  cleaningVersion,
  analysisVersion,
  open,
  onClose,
}) => {
  const {
    data: report,
    isLoading,
    error,
  } = useAnalysisReportDetail(fileId, qualityVersion, cleaningVersion, analysisVersion)

  if (!open || !analysisVersion) return null

  // 1. Loading 与 Error 兜底
  let content
  if (isLoading) {
    content = (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    )
  } else if (error || !report) {
    content = <Alert type="error" message="获取报告详情失败" />
  } else {
    // 2. 核心渲染逻辑
    const { summary, charts, logs, warnings } = report

    content = (
      <div className="flex flex-col gap-6">
        {/* === A. 摘要区域 === */}
        <Descriptions bordered size="small" column={2} className="bg-white shadow-sm">
          <Descriptions.Item label="分析类型">
            <Tag color="purple">{summary.analysis_type}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="参与列数">
            {summary.selected_columns.length} 列
          </Descriptions.Item>
          <Descriptions.Item label="输入数据形状">
            {summary.input_shape.rows} 行, {summary.input_shape.cols} 列
          </Descriptions.Item>
          <Descriptions.Item label="过滤后使用形状">
            <Text strong className="text-blue-600">
              {summary.selected_shape.rows}
            </Text>{' '}
            行, {summary.selected_shape.cols} 列
          </Descriptions.Item>
        </Descriptions>

        {/* === B. 警告信息 (如果有) === */}
        {warnings && warnings.length > 0 && (
          <Alert
            message="分析过程产生警告"
            description={
              <ul className="pl-4 m-0">
                {warnings.map((w: string, i: number) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            }
            type="warning"
            showIcon
          />
        )}

        {/* === C. 图表渲染区 (核心魔法) === */}
        {charts && charts.length > 0 && (
          <div>
            <Title level={5} className="mb-4 text-slate-700">
              可视化结果
            </Title>
            <Row gutter={[16, 16]}>
              {charts.map((chart: any, idx: number) => {
                let option = null

                // 🏭 智能路由：根据 type 匹配对应的 Mapper
                if (chart.type === 'histogram') {
                  option = mapHistogramToOption(chart.title, chart.data)
                } else if (chart.type === 'heatmap') {
                  option = mapHeatmapToOption(chart.title, chart.data)
                } else {
                  return (
                    <Col span={24} key={idx}>
                      <Alert message={`暂不支持的图表类型: ${chart.type}`} type="info" />
                    </Col>
                  )
                }

                // 渲染 ECharts
                return (
                  <Col span={chart.type === 'heatmap' ? 24 : 12} key={idx}>
                    <div className="bg-white border border-slate-100 rounded-lg p-2 shadow-sm">
                      <ReactECharts
                        option={option}
                        style={{
                          height: chart.type === 'heatmap' ? '500px' : '300px',
                          width: '100%',
                        }}
                        notMerge={true} // 极其重要：防止多个图表互相污染状态
                      />
                    </div>
                  </Col>
                )
              })}
            </Row>
          </div>
        )}

        {/* === D. 开发者执行日志 === */}
        <Collapse ghost>
          <Panel header={<Text type="secondary">查看后端执行日志 (Dev Logs)</Text>} key="1">
            <div className="bg-slate-900 text-green-400 p-4 rounded-md font-mono text-xs max-h-64 overflow-y-auto">
              {logs.map((log: string, index: number) => (
                <div key={index}>{`> ${log}`}</div>
              ))}
            </div>
          </Panel>
        </Collapse>
      </div>
    )
  }

  return (
    <Drawer
      title={`分析报告详情 - 版本 V${analysisVersion}`}
      placement="right"
      width={800} // 足够宽以展示图表
      onClose={onClose}
      open={open}
      destroyOnClose // 关闭时销毁 DOM，释放 ECharts 内存
    >
      {content}
    </Drawer>
  )
}
