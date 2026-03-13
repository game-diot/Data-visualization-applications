import React from 'react'
import { Drawer, Spin, Alert, Typography, Descriptions, Collapse, Tag, Row, Col, Space } from 'antd'
import ReactECharts from 'echarts-for-react'
import { useAnalysisReportDetail } from '@/entities/analysis/queries/analysis.queries'
import { mapHistogramToOption, mapHeatmapToOption, mapBarToOption } from '../charts/ChartsMappers'

const { Text, Title } = Typography
const { Panel } = Collapse

interface Props {
  fileId: string
  qualityVersion: number
  cleaningVersion: number
  analysisVersion: number | null // null 表示抽屉关闭
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

  let content

  if (isLoading) {
    content = (
      <div className="flex justify-center items-center h-full">
        <Spin size="large" tip="正在生成可视化大屏..." />
      </div>
    )
  } else if (error || !report) {
    content = <Alert type="error" message="获取报告详情失败" className="mt-4" />
  } else {
    const { summary, charts, logs, warnings } = report

    content = (
      <div className="flex flex-col gap-6 pb-10">
        {/* ================= A. 分析摘要区 ================= */}
        <Descriptions
          bordered
          size="small"
          column={2}
          className="bg-white shadow-sm rounded-lg overflow-hidden"
        >
          <Descriptions.Item label="分析类型">
            <Tag color="purple" className="text-sm border-0 bg-purple-50">
              {summary.analysis_type}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="涉及列数">
            <Text strong className="text-indigo-600">
              {summary.selected_columns.length}
            </Text>{' '}
            列
          </Descriptions.Item>
          <Descriptions.Item label="前置切片">
            {summary.input_shape.rows} 行 ➔ <Text strong>{summary.selected_shape.rows}</Text> 行
          </Descriptions.Item>
          {/* 原来叫 "参与字段" 容易引起误会，改成 "全局底座字段" 或 "基础切片" */}
          <Descriptions.Item label="加载的数据集底座" span={2}>
            {summary.selected_columns.map((col) => (
              <Tag key={col} className="mr-1 mb-1">
                {col}
              </Tag>
            ))}
          </Descriptions.Item>
        </Descriptions>

        {/* ================= B. 警告面板 (防御性展示) ================= */}
        {warnings && warnings.length > 0 && (
          <Alert
            message="执行过程存在警告"
            description={
              <ul className="pl-4 m-0 text-xs">
                {warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            }
            type="warning"
            showIcon
          />
        )}

        {/* ================= C. ECharts 图表渲染区 ================= */}
        {charts && charts.length > 0 && (
          <div>
            <Title level={5} className="mb-4 text-slate-800 border-b pb-2">
              数据可视化展示
            </Title>
            <Row gutter={[16, 16]}>
              {charts.map((chart, idx) => {
                let option = null
                // 🏭 智能路由：根据后端传来的 type 匹配对应的 Mapper
                try {
                  if (chart.type === 'histogram') {
                    option = mapHistogramToOption(chart.title, chart.data)
                  } else if (chart.type === 'heatmap') {
                    option = mapHeatmapToOption(chart.title, chart.data)
                  } else if (chart.type === 'bar') {
                    // 🚀 只要加这两行，无缝接入新图表！
                    option = mapBarToOption(chart.title, chart.data)
                  } else {
                    return (
                      <Col span={24} key={idx}>
                        <Alert message={`未接入的图表类型: ${chart.type}`} type="info" />
                      </Col>
                    )
                  }
                } catch (e) {
                  return (
                    <Col span={24} key={idx}>
                      <Alert message={`图表数据解析失败: ${chart.title}`} type="error" />
                    </Col>
                  )
                }

                // 🌟 动态布局：热力图占全宽，直方图占一半 (两两并排)
                const isFullWidth = chart.type === 'heatmap'

                return (
                  <Col span={isFullWidth ? 24 : 12} key={idx}>
                    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                      <ReactECharts
                        option={option}
                        style={{ height: isFullWidth ? '500px' : '320px', width: '100%' }}
                        notMerge={true} // 绝对不可删：防止 Drawer 多次打开时图表状态互相污染
                        lazyUpdate={true}
                      />
                    </div>
                  </Col>
                )
              })}
            </Row>
          </div>
        )}

        {/* ================= D. 执行日志 (Dev Logs) ================= */}
        <Collapse ghost className="bg-slate-50 border border-slate-200 rounded-lg">
          <Panel
            header={
              <Text type="secondary" className="text-xs">
                查看底层执行日志 (Developer Logs)
              </Text>
            }
            key="1"
          >
            <div className="bg-slate-900 text-green-400 p-4 rounded-md font-mono text-xs max-h-64 overflow-y-auto shadow-inner">
              {logs.map((log, index) => (
                <div key={index} className="mb-1 leading-relaxed">{`> ${log}`}</div>
              ))}
            </div>
          </Panel>
        </Collapse>
      </div>
    )
  }

  return (
    <Drawer
      title={
        <Space>
          <span className="font-bold text-slate-800">分析大屏</span>
          <Tag color="blue" className="rounded-full">
            Version {analysisVersion}
          </Tag>
        </Space>
      }
      placement="right"
      width={900} // 足够宽才能容纳并排的 ECharts 和热力图矩阵
      onClose={onClose}
      open={open}
      destroyOnClose // 绝对不可删：关闭时销毁 DOM，强力回收 ECharts 的内存泄漏
    >
      {content}
    </Drawer>
  )
}
