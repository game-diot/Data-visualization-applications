import { useState } from 'react'
import { Modal, Upload } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { useFileUiStore } from '../store/files.store'
import { useUploadFileMutation } from '@/entities/file/queries/file.mutation'
import { checkUploadSecurityDeep } from '@/shared/security/uploadGuard'

const { Dragger } = Upload

export const UploadModal = () => {
  const { isUploadModalOpen, closeUploadModal } = useFileUiStore()
  const { mutateAsync: uploadFile, isPending } = useUploadFileMutation()
  const [fileList, setFileList] = useState<any[]>([])

  const hanldeClose = () => {
    if (isPending) return
    setFileList([])
    closeUploadModal()
  }

  return (
    <Modal
      title="上传数据集"
      open={isUploadModalOpen}
      onCancel={hanldeClose}
      footer={null}
      destroyOnHidden
    >
      <Dragger
        multiple={false}
        fileList={fileList}
        customRequest={async (options) => {
          const { file, onSuccess, onError } = options
          try {
            await uploadFile({ file: file as File })
            onSuccess?.('ok')
            hanldeClose()
          } catch (error) {
            onError?.(error as any)
          }
        }}
        beforeUpload={async (file) => {
          const isSafe = await checkUploadSecurityDeep(file)
          return isSafe ? true : Upload.LIST_IGNORE
        }}
        onChange={(info) => {
          setFileList(info.fileList)
        }}
        accept=".csv,.xlsx,.xls"
        disabled={isPending}
      >
        <p className="ant-upload-drag-icon text-blue-500">
          <InboxOutlined />
        </p>
        <p className=" ant-upload-text">点击或将文件拖拽到此区域上传</p>
        <p className="ant-upload-hint">支持 .csv，.xlsx，.xls格式。单文件最大限制20MB。</p>
      </Dragger>
    </Modal>
  )
}
