// src/shared/download/safeDownload.ts
import { rawHttpClient } from '@/shared/http/client'

const parseFilenameFromContentDisposition = (value?: string): string | null => {
  if (!value) return null
  // 简单解析 filename="xxx"
  const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(value)
  if (!match?.[1]) return null
  return decodeURIComponent(match[1].replace(/['"]/g, ''))
}

/**
 * 安全下载：从后端获取 blob 并在前端触发下载，不暴露物理路径
 * @returns 最终使用的文件名
 */
export const executeSafeDownload = async (fileId: string, fallbackFileName = 'download_asset') => {
  const resp = await rawHttpClient.get<Blob>(`/files/${fileId}/download`, {
    responseType: 'blob',
  })

  const cd = resp.headers?.['content-disposition'] as string | undefined
  const fileName = parseFilenameFromContentDisposition(cd) ?? fallbackFileName

  const blob = resp.data instanceof Blob ? resp.data : new Blob([resp.data])
  const url = window.URL.createObjectURL(blob)

  try {
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
  } finally {
    window.URL.revokeObjectURL(url)
  }

  return fileName
}
