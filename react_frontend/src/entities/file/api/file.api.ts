import { httpClient } from '@/shared/http/client'
import type { FileDTO, FilesListResponseDTO } from '../dto/file.dto'

// 列表查询参数的类型定义
export interface GetFilesParams {
  page: number
  pageSize: number
  query?: string
  stage?: string
  order?: string
  sortBy?: string
}

export const fileApi = {
  /**
   * 获取数据集列表
   * * @remarks
   * 由于 httpClient 的拦截器在运行时已经直接返回了 body.data，
   * 所以我们通过 as unknown as FilesListResponseDTO 强行纠正 TS 的类型推导，
   * 确保上层调用时，拿到的直接是我们在 001 定义好的 DTO。
   */
  getFiles: async (params: GetFilesParams): Promise<FilesListResponseDTO> => {
    // 发起 GET 请求
    const response = await httpClient.get('/files', { params })

    // 拦截器已经去掉了 { code, status, data: { ... } } 的外壳
    // 此时的 response 在运行时就是 { items: [...], total: 1, ... }
    return response as unknown as FilesListResponseDTO
  },
  /**
   * 001: 上传文件 (支持真实文件或手动生成的 Blob)
   */
  uploadFiles: async (file: File | Blob, fileName?: string): Promise<FileDTO> => {
    // 1. 构建原生的 FormData 对象
    const formData = new FormData()

    // 2. 将文件塞入 form-data。
    // 如果是手动输入的源数据，前端会在第三个参数传入自定义的 fileName
    if (fileName) {
      formData.append('file', file, fileName)
    } else {
      formData.append('file', file)
    }

    // 3. 发送 POST 请求
    // ⚠️ 注意：一定要在这里覆盖 headers，告诉 axios 这是一个表单上传，而不是默认的 application/json
    const response = await httpClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    // 因为你的 httpClient 拦截器会自动返回 body.data
    // 而此时 body.data 正好就是返回 JSON 里的 data 对象，完美对应 FileDTO
    return response as unknown as FileDTO
  },
  /**
   * 003: 获取指定文件详情
   */
  getFileById: async (id: string): Promise<FileDTO> => {
    const response = await httpClient.get(`/files/${id}`)
    return response as unknown as FileDTO
  },
  /**
   * 004: 更新文件信息
   * @param id 文件ID
   * @param data 需要修改的字段（如 { name: '新名字' }）
   */
  updateFile: async (id: string, data: Partial<FileDTO>): Promise<FileDTO> => {
    // 调用 httpClient，拦截器会自动解包返回 body.data
    const response = await httpClient.put(`/files/${id}`, data)
    return response as unknown as FileDTO
  },

  /**
   * 005: 删除文件
   * @param id 文件唯一标识
   */
  deleteFile: async (id: string): Promise<FileDTO> => {
    // 调用 DELETE 请求，路径参数携带 ID
    const response = await httpClient.delete(`/files/${id}`)
    // 拦截器自动解包后，这里得到的是被删除文件的 DTO
    return response as unknown as FileDTO
  },
}
