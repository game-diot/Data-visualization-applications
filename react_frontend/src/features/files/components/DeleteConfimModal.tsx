import React from 'react'
import { Modal, Typography, Alert } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { useFileUiStore } from '../store/files.store'
import { useDeleteFileMutation } from '@/entities/file/queries/file.mutation'

const { Text } = Typography

export const DeleteConfirmModal: React.FC = () => {
  const { isDeleteModalOpen, closeDeleteModal, activeFile } = useFileUiStore()
  const { mutateAsync: deleteFile, isPending } = useDeleteFileMutation()

  const handleDelete = async () => {
    if (!activeFile) return
    await deleteFile(activeFile.id)
    closeDeleteModal()
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-red-500">
          <ExclamationCircleOutlined />
          <span>确认删除数据集？</span>
        </div>
      }
      open={isDeleteModalOpen}
      onCancel={closeDeleteModal}
      onOk={handleDelete}
      confirmLoading={isPending}
      okButtonProps={{ danger: true }}
      okText="确认删除"
      destroyOnClose
    >
      <div className="py-4">
        <p className="mb-2">
          您即将删除数据集{' '}
          <Text strong className="text-slate-800">
            {activeFile?.name}
          </Text>
          。
        </p>
        <Alert
          type="warning"
          showIcon
          message="此操作不可逆！该数据集关联的质量报告、清洗记录和分析模型也将受到影响。"
          className="text-xs"
        />
      </div>
    </Modal>
  )
}
