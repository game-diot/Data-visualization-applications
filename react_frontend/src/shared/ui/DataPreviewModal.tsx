import React, { useEffect, useState } from 'react'
import { Modal, Table, Alert, Spin } from 'antd'
import Papa from 'papaparse'
// 假设你配置了 httpClient
import { httpClient } from '@/shared/http/client'

interface Props {
  open: boolean
  onClose: () => void
  fileId: string
  qualityVersion: number
  cleaningVersion: number
}

export const DataPreviewModal: React.FC<Props> = ({
  open,
  onClose,
  fileId,
  qualityVersion,
  cleaningVersion,
}) => {
  const [data, setData] = useState<any[]>([])
  const [columns, setColumns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    const fetchAndParseCSV = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await httpClient.get(
          `/cleaning/${fileId}/quality/${qualityVersion}/cleaning/${cleaningVersion}/preview`,
          { responseType: 'text' },
        )

        // 🌟 核心修复：智能解包！
        // 因为我们的全局拦截器已经剥壳了，所以这里的 response 大概率直接就是字符串。
        // 如果不是字符串，再退化去取 .data（做个双重保险）
        const csvText = typeof response === 'string' ? response : (response as any).data

        // 校验一下，防止 undefined 再次炸掉 PapaParse
        if (!csvText) {
          throw new Error('获取到的 CSV 内容为空')
        }
        // 2. 使用 PapaParse 在浏览器内存中秒级解析 CSV
        Papa.parse(csvText, {
          header: true, // 将第一行作为 object 的 key
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0 && results.data.length === 0) {
              setError('CSV 解析失败')
              return
            }

            const parsedData = results.data as any[]
            setData(parsedData)

            // 3. 动态生成 Ant Design 的 Table Columns
            if (parsedData.length > 0) {
              const headers = Object.keys(parsedData[0])
              const dynamicColumns = headers.map((header) => ({
                title: header,
                dataIndex: header,
                key: header,
                ellipsis: true, // 内容太长自动省略号
                width: 150, // 固定宽度，防止表格挤压变形
              }))
              setColumns(dynamicColumns)
            }
          },
        })
      } catch (err: any) {
        setError(err.message || '获取预览数据失败')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAndParseCSV()
  }, [open, fileId, cleaningVersion, qualityVersion])

  return (
    <Modal
      title={`数据快照预览 (Cleaning V${cleaningVersion})`}
      open={open}
      onCancel={onClose}
      footer={null} // 纯预览，不需要确定/取消按钮
      width="80vw" // 宽屏展示，视野极佳
      centered
      destroyOnClose
    >
      <div className="py-4">
        {error && <Alert message={error} type="error" showIcon className="mb-4" />}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            dataSource={data}
            columns={columns}
            rowKey={(record, index) => index?.toString() || Math.random().toString()}
            size="small"
            scroll={{ x: 'max-content', y: '60vh' }} // 开启虚拟滚动条
            pagination={{
              pageSize: 50, // 前端假分页，每页 50 条极其流畅
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条数据`,
            }}
            bordered
          />
        )}
      </div>
    </Modal>
  )
}
