import type { DatasetVM } from '@/entities/file/types/file.types'
import { create } from 'zustand'

interface FilesUIStore {
  isUploadModalOpen: boolean
  isManualInputModalOpen: boolean
  openUploadModal: () => void
  closeUploadModal: () => void
  openManualInputModal: () => void
  closeManualInputModal: () => void

  // 新增：列表行级操作状态
  activeFile: DatasetVM | null
  isRenameModalOpen: boolean
  isDeleteModalOpen: boolean

  openRenameModal: (file: DatasetVM) => void
  closeRenameModal: () => void
  openDeleteModal: (file: DatasetVM) => void
  closeDeleteModal: () => void
}

export const useFileUiStore = create<FilesUIStore>((set) => ({
  isUploadModalOpen: false,
  isManualInputModalOpen: false,
  openUploadModal: () => set({ isUploadModalOpen: true }),
  closeUploadModal: () => set({ isUploadModalOpen: false }),
  openManualInputModal: () => set({ isManualInputModalOpen: true }),
  closeManualInputModal: () => set({ isManualInputModalOpen: false }),
  // 新增
  activeFile: null,
  isRenameModalOpen: false,
  isDeleteModalOpen: false,

  openRenameModal: (file) => set({ isRenameModalOpen: true, activeFile: file }),
  closeRenameModal: () => set({ isRenameModalOpen: false, activeFile: null }),
  openDeleteModal: (file) => set({ isDeleteModalOpen: true, activeFile: file }),
  closeDeleteModal: () => set({ isDeleteModalOpen: false, activeFile: null }),
}))
