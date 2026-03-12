import React from 'react'
import { Card, List, Tag, Skeleton, Typography, Tooltip, Empty } from 'antd'
import {
  InfoCircleOutlined,
  DotChartOutlined,
  LineChartOutlined,
  BarChartOutlined,
} from '@ant-design/icons'
import { useAnalysisCatalog } from '@/entities/analysis/queries/analysis.queries'

const { Text } = Typography

// 给不同分析方法配个简单的图标
const METHOD_ICONS: Record<string, React.ReactNode> = {
  descriptive: <BarChartOutlined />,
  correlation: <DotChartOutlined />,
  group_compare: <LineChartOutlined />,
}

interface Props {
  fileId: string
  qualityVersion: number
  selectedMethod: string | null
  onMethodSelect: (methodType: string) => void
}

export const AnalysisCatalogPanel: React.FC<Props> = ({
  fileId,
  qualityVersion,
  selectedMethod,
  onMethodSelect,
}) => {
  const { data: catalog, isLoading, error } = useAnalysisCatalog(fileId, qualityVersion)

  if (isLoading)
    return (
      <Card className="shadow-sm border-slate-200 h-full">
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    )
  if (error || !catalog)
    return (
      <Card className="shadow-sm border-slate-200 h-full flex items-center justify-center">
        <Empty description="获取分析目录失败" />
      </Card>
    )

  return (
    <div className="flex flex-col h-full gap-4">
      {/* 模块 A：分析能力矩阵 (Method Cards) */}
      <Card title="选择分析模型" size="small" className="shadow-sm border-slate-200 flex-none">
        <div className="grid grid-cols-2 gap-3">
          {catalog.methods.map((method) => {
            const isSelected = selectedMethod === method.methodType

            // 样式计算
            let cardClass = 'p-3 rounded-lg border transition-all duration-200 relative '
            if (!method.isAvailable) {
              cardClass += 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
            } else if (isSelected) {
              cardClass +=
                'border-indigo-500 bg-indigo-50 shadow-sm cursor-pointer ring-1 ring-indigo-500'
            } else {
              cardClass +=
                'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 cursor-pointer'
            }

            return (
              <Tooltip
                key={method.methodType}
                title={!method.isAvailable ? method.disabledReason : ''}
                color="red"
                placement="top"
              >
                <div
                  className={cardClass}
                  onClick={() => method.isAvailable && onMethodSelect(method.methodType)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={method.isAvailable ? 'text-indigo-600' : 'text-slate-400'}>
                      {METHOD_ICONS[method.methodType] || <DotChartOutlined />}
                    </span>
                    <Text
                      strong
                      className={method.isAvailable ? 'text-slate-800' : 'text-slate-500'}
                    >
                      {method.displayName}
                    </Text>
                    {!method.isAvailable && <InfoCircleOutlined className="text-red-400 ml-auto" />}
                  </div>
                  <Text type="secondary" className="text-xs line-clamp-2 leading-relaxed">
                    {method.description}
                  </Text>
                </div>
              </Tooltip>
            )
          })}
        </div>
      </Card>

      {/* 模块 B：字段画像 (Column List) */}
      <Card
        title="字段画像"
        size="small"
        className="shadow-sm border-slate-200 flex-1 flex flex-col"
        bodyStyle={{ flex: 1, overflowY: 'auto', padding: 0 }}
      >
        <List
          size="small"
          dataSource={catalog.columns}
          renderItem={(col) => (
            <List.Item className="hover:bg-slate-50 border-b border-slate-100 last:border-0 px-4 py-2">
              <div className="flex justify-between w-full items-center">
                <Text ellipsis className="w-32 font-medium text-slate-700" title={col.columnName}>
                  {col.columnName}
                </Text>
                <Tag
                  color={
                    col.isNumeric ? 'blue' : col.dataType === 'categorical' ? 'orange' : 'default'
                  }
                  className="m-0 border-0 bg-opacity-20 font-mono text-xs"
                >
                  {col.dataType}
                </Tag>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}
