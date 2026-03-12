import React from 'react'
import { Card, Space, Typography, Tag, Button } from 'antd'
import { ExperimentOutlined, RollbackOutlined } from '@ant-design/icons'
import { useNavigate } from '@tanstack/react-router'
import type { DatasetDetailVM } from '@/entities/file/types/file.types'

const { Title, Text } = Typography

interface Props {
  fileDetail: DatasetDetailVM
  qualityVersion: number
  cleaningVersion: number
}

export const AnalysisHeader: React.FC<Props> = ({
  fileDetail,
  qualityVersion,
  cleaningVersion,
}) => {
  const navigate = useNavigate()

  return (
    <Card
      size="small"
      className="mb-6 shadow-sm border border-indigo-100 bg-white"
      styles={{
        body: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
        },
      }}
    >
      <Space size="large" align="center">
        <Space>
          <div className="bg-indigo-100 w-10 h-10 rounded-lg text-indigo-600 flex items-center justify-center">
            <ExperimentOutlined className="text-xl" />
          </div>
          <div className="flex flex-col">
            <Title level={4} className="!m-0 text-slate-800 tracking-wide">
              智能分析工作台
            </Title>
            <Text type="secondary" className="text-xs mt-1">
              {fileDetail.name} ({fileDetail.sizeFormatted})
            </Text>
          </div>
        </Space>

        {/* 🌟 核心：不可变快照的数据血统标识 */}
        <Space size="small" className="ml-8 border-l border-slate-200 pl-8">
          <Tag
            color="geekblue"
            className="m-0 border-0 bg-blue-50 px-3 py-1.5 rounded-full text-sm"
          >
            输入源: Quality V{qualityVersion}
          </Tag>
          <span className="text-slate-300 font-bold">➔</span>
          <Tag
            color="purple"
            className="m-0 border-0 bg-purple-50 px-3 py-1.5 rounded-full text-purple-600 font-medium text-sm"
          >
            依赖产物: Cleaning V{cleaningVersion}
          </Tag>
        </Space>
      </Space>

      <Button
        icon={<RollbackOutlined />}
        onClick={() => navigate({ to: '/files/$fileId', params: { fileId: fileDetail.id } })}
      >
        返回文件详情
      </Button>
    </Card>
  )
}
