import { httpClient } from '@/shared/http/client'
import type { FileDetailDTO, FileListResponseDTO } from '../dto/file.dto'

export const fileApi = {
  getFiles: async (params: { page: number; pageSize: number; query?: string; stage?: string }) => {
    const response = await httpClient.get<FileListResponseDTO>('/files', { params })
    return response.data
  },
  uploadFiles: async (file: File | Blob, fileName?: string) => {
    const formData = new FormData()
    formData.append('file', file, fileName || (file as File).name)
    const response = await httpClient.post('/files/upload', formData)
    return response.data
  },
  // 重命名文件 (仅允许修改 name)
  updateFile: async (id: string, name: string) => {
    const response = await httpClient.put(`/files/${id}`, { name })
    return response.data
  },

  // 删除文件 (前端不关心硬删软删，由后端语义决定)
  deleteFile: async (id: string) => {
    const response = await httpClient.delete(`/files/${id}`)
    return response.data
  },
  getFileDetail: async (id: string) => {
    const response = await httpClient.get<FileDetailDTO>(`/files/${id}`)
    return response.data
  },
}
