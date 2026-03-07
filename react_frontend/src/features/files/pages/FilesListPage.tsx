import { Table, Button, Tooltip } from 'antd'
import { UploadOutlined, FormOutlined } from '@ant-design/icons'
import { useQueryFilters } from '@/shared/filters/useQueryFilters'
import { useTableFilters } from '@/shared/filters/useTableFilters'
import { FilterBar } from '@/shared/ui/FilterBar'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { ErrorPanel } from '@/shared/ui/ErrorPannel'
import { useFilesList } from '@/entities/file/queries/file.queries'
import { useFileUiStore } from '../store/files.store'
import { UploadModal } from '../components/UploadModal'
import { ManualInputModal } from '../components/ManualInputModal'
import { RenameModal } from '../components/RenameModal'
import { DeleteConfirmModal } from '../components/DeleteConfimModal'
import type { DatasetVM } from '@/entities/file/types/file.types'
import { filesSearchSchema, type FilesSearch } from '@/shared/filters/schemas/filters'
const DEFAULT_FILTERS: FilesSearch = {
  page: 1,
  pageSize: 10,
  order: 'desc',
  query: undefined,
  stage: 'all',
  sortBy: 'createdAt',
}
export default function FilesListPage() {
  // 获取打开弹窗的方法
  const { openUploadModal, openManualInputModal, openRenameModal, openDeleteModal } =
    useFileUiStore()
  const { filters, updateFilters, resetFilters } = useQueryFilters('/files', filesSearchSchema, {
    defaultFilters: DEFAULT_FILTERS,
  })
  const { handleTableChange } = useTableFilters(updateFilters)

  const { data, isLoading, error, refetch } = useFilesList({
    page: filters.page || 1,
    pageSize: filters.pageSize || 10,
    query: filters.query,
    stage: filters.stage !== 'all' ? filters.stage : undefined,
  })

  if (error) {
    return <ErrorPanel message="加载数据集列表失败" detail={(error as any).message}></ErrorPanel>
  }

  const columns = [
    {
      title: '数据集名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <span className="font-medium text-slate-700">
          {name}
          <span className="text-xs text-slate-400">({record.extension})</span>
        </span>
      ),
    },
    { title: '文件大小', dataIndex: 'sizeFormatted', key: 'sizeFormatted' },
    {
      title: '当前状态',
      dataIndex: 'uiStatus',
      key: 'stage',
      render: (uiStatus: any, record: any) => (
        <Tooltip title={record.errorMessage || record.stage}>
          <StatusBadge status={uiStatus} text={record.stage} />
        </Tooltip>
      ),
    },
    { title: '上传时间', dataIndex: 'uploadedAtFormatted', key: 'uploadedAtFormatted' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: DatasetVM) => (
        <div className="flex gap-2">
          <Button type="link" size="small">
            详情
          </Button>
          <Button type="link" size="small" onClick={() => openRenameModal(record)}>
            重命名
          </Button>
          <Button type="link" size="small" danger onClick={() => openDeleteModal(record)}>
            删除
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">数据集管理</h1>
        <div className="flex gap-3">
          <Button icon={<FormOutlined />} onClick={openManualInputModal}>
            手动输入
          </Button>
          <Button type="primary" icon={<UploadOutlined />} onClick={openUploadModal}>
            上传文件
          </Button>
        </div>
      </div>
      <FilterBar
        initialQuery={filters.query}
        initialStage={filters.stage}
        stageOptions={[
          { label: '已上传', value: 'uploaded' },
          { label: '处理完成', value: 'cleaning_done' },
          { label: '处理失败', value: 'failed' },
        ]}
        onFilterChange={updateFilters}
        onReset={() => resetFilters}
      />
      <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-2 mt-4">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data?.data || []}
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            current: filters.page || 1,
            pageSize: filters.pageSize || 10,
            total: data?.total || 0,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 个数据集`,
          }}
        ></Table>
      </div>
      {/* 挂载弹窗组件 (Zustand 驱动，放在这里不会随表格频繁重渲染) */}
      <UploadModal />
      <ManualInputModal />
      <RenameModal />
      <DeleteConfirmModal />
    </div>
  )
}
