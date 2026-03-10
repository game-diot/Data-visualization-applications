// src/features/cleaning/components/SessionController.tsx
import React from 'react'
import { Result, Button, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useCleaningCreateSessionMutation } from '@/entities/cleaning/queries/cleaning.mutations'

const { Paragraph, Text } = Typography

interface Props {
  fileId: string
  qualityVersion: number
}

export const SessionController: React.FC<Props> = ({ fileId, qualityVersion }) => {
  const { mutate: createSession, isPending } = useCleaningCreateSessionMutation(fileId)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 my-6 flex flex-col items-center justify-center min-h-[50vh]">
      <Result
        icon={<div className="text-7xl mb-6">🛠️</div>}
        title={<span className="text-2xl font-bold text-slate-800">开启数据清洗之旅</span>}
        subTitle={
          <div className="max-w-lg mx-auto text-slate-500 mt-2">
            当前数据基准为{' '}
            <Text strong className="text-blue-600">
              质量报告 V{qualityVersion}
            </Text>
            。
            为了保证处理链路的绝对可追溯（Lineage），所有的自动化清洗与手工修改都必须在一个独立的“清洗会话
            (Session)”中进行。
          </div>
        }
        extra={
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            loading={isPending}
            onClick={() => createSession({ qualityVersion })}
            className="mt-6 px-8 h-12 text-lg rounded-lg shadow-md shadow-blue-500/20"
          >
            创建清洗工作区
          </Button>
        }
      />
    </div>
  )
}
