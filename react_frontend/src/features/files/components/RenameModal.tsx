import React, { useEffect } from 'react'
import { Modal, Input, Form, Button } from 'antd'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useFileUiStore } from '../store/files.store'
import { useRenameFileMutation } from '@/entities/file/queries/file.mutation'
import { securityValidators } from '@/shared/security/validators'

// 1. 契约定义
const renameSchema = z.object({
  name: securityValidators.safeName,
})
type RenameFormValues = z.infer<typeof renameSchema>

export const RenameModal: React.FC = () => {
  const { isRenameModalOpen, closeRenameModal, activeFile } = useFileUiStore()
  const { mutateAsync: renameFile, isPending } = useRenameFileMutation()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RenameFormValues>({
    resolver: zodResolver(renameSchema),
    defaultValues: { name: '' },
  })

  // 当弹窗打开且拿到当前选中文件时，自动填充旧名称
  useEffect(() => {
    if (isRenameModalOpen && activeFile) {
      reset({ name: activeFile.name })
    }
  }, [isRenameModalOpen, activeFile, reset])

  const onSubmit = async (data: RenameFormValues) => {
    if (!activeFile) return
    // 如果名字没变，直接关闭
    if (data.name === activeFile.name) {
      closeRenameModal()
      return
    }
    await renameFile({ id: activeFile.id, name: data.name })
    closeRenameModal()
  }

  return (
    <Modal
      title="重命名数据集"
      open={isRenameModalOpen}
      onCancel={closeRenameModal}
      footer={null}
      destroyOnClose
    >
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)} className="mt-4">
        <Form.Item validateStatus={errors.name ? 'error' : ''} help={errors.name?.message}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="请输入新的数据集名称" autoFocus disabled={isPending} />
            )}
          />
        </Form.Item>
        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={closeRenameModal} disabled={isPending}>
            取消
          </Button>
          <Button type="primary" htmlType="submit" loading={isPending}>
            确认
          </Button>
        </div>
      </Form>
    </Modal>
  )
}
