// src/features/cleaning/components/CleaningReportsTable.tsx
import React, { useState } from 'react'
import { Table, Button, Tag, Space, Typography } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import { useCleaningReports } from '@/entities/cleaning/queries/cleaning.queries'
import type { CleaningReportItemVM } from '@/entities/cleaning/types/cleaning.types'
import { CleaningReportDrawer } from './CleaningReportDrawer'

const { Text } = Typography

interface Props {
  fileId: string
  qualityVersion: number
}

export const CleaningReportsTable: React.FC<Props> = ({ fileId, qualityVersion }) => {
  // 消费列表 Hook
  const { data: reports, isLoading } = useCleaningReports(fileId, qualityVersion)

  // 抽屉的状态管理：记录当前想要查看的 cleaningVersion
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null)

  // 定义 Ant Design 表格列
  const columns = [
    {
      title: '清洗版本',
      dataIndex: 'versionLabel',
      key: 'versionLabel',
      render: (text: string) => (
        <Tag color="geekblue" className="text-sm font-bold">
          {text}
        </Tag>
      ),
    },
    {
      title: '生成时间',
      dataIndex: 'createdAtFormatted',
      key: 'createdAtFormatted',
      render: (text: string) => <Text type="secondary">{text}</Text>,
    },
    {
      title: '应用规则',
      dataIndex: 'rulesAppliedText',
      key: 'rulesAppliedText',
      render: (text: string) => <Text className="text-slate-600">{text}</Text>,
    },
    {
      title: '删减行数',
      dataIndex: 'rowsReduced',
      key: 'rowsReduced',
      render: (val: number) => (
        <span className={val > 0 ? 'text-volcano font-medium' : 'text-slate-400'}>-{val}</span>
      ),
    },
    {
      title: '修改单元格',
      dataIndex: 'cellsModified',
      key: 'cellsModified',
      render: (val: number) => <Text>{val.toLocaleString()} 处</Text>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: CleaningReportItemVM) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => setSelectedVersion(record.cleaningVersion)}
        >
          查看战报
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="mb-4 pb-4 border-b border-slate-100">
        <Text type="secondary">
          每一次成功执行的清洗任务，都会基于 Quality V{qualityVersion} 生成一份不可变的产物快照。
          <br />
          您可以随时回溯历史版本，或选择其中最优的一版进入分析建模模块。
        </Text>
      </div>

      <Table
        columns={columns}
        dataSource={reports || []}
        rowKey="id"
        loading={isLoading}
        pagination={false} // 通常一个文件的清洗版本不会太多，暂时关闭分页
        size="middle"
        className="border border-slate-200 rounded-lg shadow-sm"
      />

      {/* 挂载抽屉组件 */}
      <CleaningReportDrawer
        fileId={fileId}
        qualityVersion={qualityVersion}
        cleaningVersion={selectedVersion}
        onClose={() => setSelectedVersion(null)}
      />
    </div>
  )
}
