// src/features/cleaning/components/CleaningReportDrawer.tsx
import React, { useState } from 'react'
import { Drawer, Descriptions, Typography, Divider, List, Tag, Space, Button, Skeleton } from 'antd'
import { RocketOutlined, FileExcelOutlined } from '@ant-design/icons'
import { useCleaningReportDetail } from '@/entities/cleaning/queries/cleaning.queries'
import { DataPreviewModal } from '@/shared/ui/DataPreviewModal'
import { useNavigate } from '@tanstack/react-router'

const { Text, Title } = Typography

interface Props {
  fileId: string
  qualityVersion: number
  cleaningVersion: number | null // null 表示抽屉关闭
  onClose: () => void
}

export const CleaningReportDrawer: React.FC<Props> = ({
  fileId,
  qualityVersion,
  cleaningVersion,
  onClose,
}) => {
  // 消费详情 Hook。当 cleaningVersion 为 null 时，Hook 内部的 enabled: false 会自动拦截请求
  const {
    data: detail,
    isLoading,
    error,
  } = useCleaningReportDetail(fileId, qualityVersion, cleaningVersion)
  // 🌟 核心组装 1：加一个状态，控制大屏弹窗的开关
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const navigate = useNavigate()

  // ... 你的 Drawer 底部代码 ...
  return (
    <>
      <Drawer
        title={`清洗报告详情 (Quality V${qualityVersion} ➔ Cleaning V${cleaningVersion})`}
        placement="right"
        width={600}
        onClose={onClose}
        open={cleaningVersion !== null}
        footer={
          <div className="flex justify-between items-center">
            <Text type="secondary">本报告作为不可变快照，已永久存档。</Text>
            <Space>
              {/* 🌟 核心组装 2：给按钮通电！ */}
              <Button icon={<FileExcelOutlined />} onClick={() => setIsPreviewOpen(true)}>
                预览产物数据
              </Button>

              {/* 🚀 终极时空传送门：带着版本的血统凭证，跃迁至分析模块！ */}
              <Button
                type="primary"
                icon={<RocketOutlined />}
                onClick={() => {
                  navigate({
                    to: '/files/$fileId/analysis',
                    params: { fileId: fileId }, // 确保组件 props 里有 fileId
                    search: {
                      // 🚀 核心修复：用 nullish 合并运算符，把 null 洗成 undefined
                      qv: qualityVersion ?? undefined,
                      cv: cleaningVersion ?? undefined,
                    },
                  })
                }}
                className="bg-indigo-600 hover:bg-indigo-500" // 搞个高亮的颜色
              >
                基于此版本去分析 (Analysis)
              </Button>
            </Space>
          </div>
        }
      >
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 10 }} />
        ) : error ? (
          <div className="text-red-500">加载详情失败：{(error as Error).message}</div>
        ) : detail ? (
          <div className="space-y-6">
            {/* 1. 核心减负指标 */}
            <div>
              <Title level={5}>📊 数据形态变化</Title>
              <Descriptions bordered size="small" column={2} className="mt-2 shadow-sm">
                <Descriptions.Item label="行数变化">{detail.compareRows}</Descriptions.Item>
                <Descriptions.Item label="列数变化">{detail.compareColumns}</Descriptions.Item>
                <Descriptions.Item label="应用手工修改">
                  {detail.userActionsCount} 项
                </Descriptions.Item>
              </Descriptions>
            </div>

            {/* 2. 自动化规则拦截成果 */}
            <div>
              <Title level={5}>🛡️ 规则清洗成果</Title>
              <Descriptions bordered size="small" column={1} className="mt-2 shadow-sm">
                <Descriptions.Item label="缺失值填充 (Cells)">
                  <Tag color="blue">{detail.diffMetrics.missingFilled} 处</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="重复项剔除 (Rows)">
                  <Tag color="volcano">{detail.diffMetrics.duplicateRemoved} 行</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="类型强制转换 (Cols)">
                  {detail.diffMetrics.typeCastCols.length > 0 ? (
                    <Space wrap>
                      {detail.diffMetrics.typeCastCols.map((col) => (
                        <Tag color="cyan" key={col}>
                          {col}
                        </Tag>
                      ))}
                    </Space>
                  ) : (
                    <Text type="secondary">无</Text>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </div>

            {/* 3. 物理产物信息 */}
            {detail.assetInfo && (
              <div>
                <Title level={5}>📦 物理产物</Title>
                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                  <Space direction="vertical" size="small">
                    <Text>
                      <Text strong>格式：</Text>
                      <Tag>{detail.assetInfo.format}</Tag>
                    </Text>
                    <Text>
                      <Text strong>大小：</Text>
                      {detail.assetInfo.sizeFormatted}
                    </Text>
                    <Text className="text-xs text-slate-400 break-all">
                      <Text strong>路径：</Text>
                      {detail.assetInfo.path}
                    </Text>
                  </Space>
                </div>
              </div>
            )}

            <Divider />

            {/* 4. 引擎执行日志 (Logs) */}
            <div>
              <Title level={5}>📝 引擎执行日志</Title>
              <div className="bg-[#1e1e1e] rounded-md p-4 max-h-64 overflow-y-auto mt-2">
                <List
                  size="small"
                  split={false}
                  dataSource={detail.logs}
                  renderItem={(log) => (
                    <List.Item className="py-1 px-0">
                      <Text className="font-mono text-xs text-green-400 break-words">{log}</Text>
                    </List.Item>
                  )}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-slate-400 text-center py-10">暂无数据</div>
        )}
      </Drawer>
      {/* 🌟 核心组装 3：把全屏预览器挂载在外面，跟 Drawer 兄弟节点关系 */}
      {/* 双重保险：只有当 Drawer 拿到真实的版本号时才渲染，避免给后端发 null 报错 */}
      {qualityVersion !== null && cleaningVersion !== null && (
        <DataPreviewModal
          open={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          fileId={fileId}
          qualityVersion={qualityVersion}
          cleaningVersion={cleaningVersion}
        />
      )}
    </>
  )
}
