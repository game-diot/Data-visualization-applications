// src/features/cleaning/components/ModificationsList.tsx
import React from 'react'
import { List, Tag, Card, Typography, Empty, Skeleton, Space, Button } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import { useCleaningModifications } from '@/entities/cleaning/queries/cleaning.queries'

const { Text } = Typography

interface Props {
  fileId: string
  sessionId: string
}

export const ModificationsList: React.FC<Props> = ({ fileId, sessionId }) => {
  // 消费我们在防腐层写好的 Hook，拿到的直接是完美的 VM 数组
  const { data: records, isLoading, error } = useCleaningModifications(fileId, sessionId)

  if (isLoading)
    return (
      <div className="p-4">
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    )
  if (error)
    return <div className="text-red-500 p-4">加载修改记录失败：{(error as Error).message}</div>

  const hasRecords = records && records.length > 0

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
        <Text type="secondary">
          这里记录了您在“数据预览”界面产生的所有手工干预动作（如修改单元格、删除行）。
          <br />
          这些动作将在您点击“开始清洗”时，优先于自动化规则被引擎执行。
        </Text>
        <Button type="primary" ghost icon={<EditOutlined />}>
          去预览界面进行编辑
        </Button>
      </div>

      {!hasRecords ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="当前会话暂无手工修改记录" />
      ) : (
        records.map((record) => (
          <Card
            key={record.recordId}
            size="small"
            title={
              <Text strong className="text-slate-700">
                提交时间：{record.createdAtFormatted}
              </Text>
            }
            extra={
              <Space>
                <Text type="secondary">共 {record.diffCount} 项操作</Text>
                {/* 状态高亮：待应用是显眼的蓝色，已被消耗过则是暗灰色 */}
                <Tag color={record.isConsumed ? 'default' : 'processing'} className="m-0">
                  {record.consumedStatusText}
                </Tag>
              </Space>
            }
            className="shadow-sm border-slate-200 mb-4"
          >
            <List
              size="small"
              dataSource={record.diffs}
              renderItem={(diff) => (
                <List.Item className="hover:bg-slate-50 transition-colors">
                  <div className="flex w-full items-center">
                    {/* 操作类型 Badge */}
                    <div className="w-28 flex-shrink-0">
                      <Tag color={diff.op === 'delete_row' ? 'error' : 'blue'}>{diff.opText}</Tag>
                    </div>
                    {/* 目标定位 */}
                    <div className="w-1/3 text-slate-600 flex-shrink-0">{diff.targetText}</div>
                    {/* 变更详情 (使用等宽字体更像代码/数据) */}
                    <div className="flex-1 font-mono text-sm text-slate-800 bg-slate-100 px-2 py-1 rounded">
                      {diff.changeDescription}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        ))
      )}
    </div>
  )
}
