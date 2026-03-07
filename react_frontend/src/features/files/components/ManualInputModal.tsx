import React, { useState } from 'react'
import { Modal, Input, Button, message } from 'antd'
import { useFileUiStore } from '../store/files.store'
import { useUploadFileMutation } from '@/entities/file/queries/file.mutation'
import { z } from 'zod'
import { notifyWarning } from '@/shared/utils/notify'

// MVP 极简表格：用户粘贴以逗号或制表符分隔的文本
export const ManualInputModal: React.FC = () => {
  const { isManualInputModalOpen, closeManualInputModal } = useFileUiStore()
  const { mutateAsync: uploadFile, isPending } = useUploadFileMutation()

  const [datasetName, setDatasetName] = useState('')
  const [rawData, setRawData] = useState('')

  const handleGenerateAndUpload = async () => {
    if (!datasetName.trim()) return notifyWarning('请输入数据集名称')
    if (!rawData.trim()) return notifyWarning('请输入数据内容')

    // 1. 将用户输入的制表符(Excel复制的)替换为标准逗号 CSV 格式
    const csvContent = rawData.replace(/\t/g, ',')

    // 2. 核心黑魔法：在浏览器内存中直接生成一份纯粹的 CSV Blob 文件！
    // 加入 \uFEFF 是为了防止 Excel 打开时出现中文乱码 (BOM头)
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })

    // 3. 构造虚拟文件名
    const safeName = datasetName.endsWith('.csv') ? datasetName : `${datasetName}.csv`

    // 4. 欺骗后端，走标准文件上传接口
    try {
      await uploadFile({ file: blob, fileName: safeName })
      handleClose()
    } catch (e) {
      // 错误已被 mutation 内部拦截
    }
  }

  const handleClose = () => {
    if (isPending) return
    setDatasetName('')
    setRawData('')
    closeManualInputModal()
  }

  return (
    <Modal
      title="手动构建数据集"
      open={isManualInputModalOpen}
      onCancel={handleClose}
      onOk={handleGenerateAndUpload}
      confirmLoading={isPending}
      okText="生成并上传"
      width={600}
    >
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">数据集名称</label>
        <Input
          placeholder="例如：2026年第一季度销售数据"
          value={datasetName}
          onChange={(e) => setDatasetName(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between">
          <span>数据内容 (CSV格式)</span>
          <span className="text-xs text-slate-400 font-normal">可直接从 Excel 复制粘贴至此</span>
        </label>
        <Input.TextArea
          rows={10}
          placeholder="列名1,列名2,列名3&#10;数据A,数据B,数据C"
          value={rawData}
          onChange={(e) => setRawData(e.target.value)}
          className="font-mono text-sm whitespace-pre"
        />
      </div>
    </Modal>
  )
}
