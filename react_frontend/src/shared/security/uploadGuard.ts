import { notifyError } from '../utils/notify'

export const UPLOAD_SECURITY_CONFIG = {
  MAX_SIZE_MB: 20,
  ALLOWED_EXTENSIONS: ['.csv', '.xls', '.xlsx'],
}

// 辅助函数：读取文件的前 N 个字节
const readBuffer = (file: File, bytes: number): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(e.target.result))
      } else {
        reject(new Error('Buffer read error'))
      }
    }
    reader.onerror = reject
    // 仅切片读取头部字节，极速且不占内存
    reader.readAsArrayBuffer(file.slice(0, bytes))
  })
}

/**
 * @description 【终极防御】文件上传前置异步校验拦截器 (包含二进制魔数校验)
 */
export const checkUploadSecurityDeep = async (file: File): Promise<boolean> => {
  // 1. 容量溢出拦截
  const sizeInMB = file.size / 1024 / 1024
  if (sizeInMB > UPLOAD_SECURITY_CONFIG.MAX_SIZE_MB) {
    notifyError(`安全拦截：文件大小 (${sizeInMB.toFixed(1)}MB) 超限！`, '请稍后重试')
    return false
  }

  const fileName = file.name.toLowerCase()
  const isAllowedExt = UPLOAD_SECURITY_CONFIG.ALLOWED_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext),
  )
  if (!isAllowedExt) {
    notifyError(`安全拦截：不支持的文件后缀！`, '请稍后重试')
    return false
  }

  // 2. 深度防御：二进制魔数 (Magic Number) 校验
  try {
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const headerBytes = await readBuffer(file, 4)
      const hexSignature = Array.from(headerBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase()

      // 504B0304 是 ZIP/XLSX 的标准头，D0CF11E0 是老版本 XLS 的标准头
      if (!hexSignature.startsWith('504B0304') && !hexSignature.startsWith('D0CF11E0')) {
        notifyError('安全拦截', '安全拦截：文件内容与后缀名不符，疑似伪造文件！')
        return false
      }
    } else if (fileName.endsWith('.csv')) {
      // CSV 是纯文本，没有固定魔数，但我们可以检查它是否包含绝对不该出现的二进制空字符(0x00)
      const headerBytes = await readBuffer(file, 512)
      if (headerBytes.includes(0x00)) {
        notifyError('安全拦截', '安全拦截：CSV 文件中检测到非法二进制特征，疑似伪造！')
        return false
      }
    }
  } catch (error: any) {
    notifyError('安全拦截：文件读取失败，已终止上传。', error.message)
    return false
  }

  return true
}
