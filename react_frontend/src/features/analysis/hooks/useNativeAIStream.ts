import { useState, useCallback, useRef } from 'react'
import type { AIInsightStreamReqDTO } from '../../../entities/analysis/dto/ai.dto' // 根据你的实际路径调整

interface UseNativeAIStreamReturn {
  content: string // 拼装好的、正在不断生长的完整 Markdown 文本
  isStreaming: boolean // 是否正在打字机输出中
  isLoading: boolean // 是否在等待首字节响应 (TTFB)，用于展示骨架屏
  error: string | null // 错误信息
  generateInsight: (payload: AIInsightStreamReqDTO) => Promise<void> // 触发函数
  stopGenerating: () => void // 强制打断函数
}

export const useNativeAIStream = (): UseNativeAIStreamReturn => {
  const [content, setContent] = useState<string>('')
  const [isStreaming, setIsStreaming] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // 用于保存中断控制器，允许用户点击“停止生成”
  const abortControllerRef = useRef<AbortController | null>(null)

  const generateInsight = useCallback(async (payload: AIInsightStreamReqDTO) => {
    // 状态初始化
    setContent('')
    setError(null)
    setIsLoading(true)
    setIsStreaming(false)

    // 创建新的中断控制器
    abortControllerRef.current = new AbortController()

    try {
      // 🚀 1. 发起原生的 Fetch 请求
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const response = await fetch(`${baseURL}/api/v1/ai/insight/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 如果你的项目有 Token，这里别忘了带上 Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal, // 绑定中断信号
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder('utf-8')

      if (!reader) {
        throw new Error('Response body stream is not available')
      }

      // 收到第一滴水，关闭骨架屏，开启打字机状态
      setIsLoading(false)
      setIsStreaming(true)

      let buffer = ''

      // 🚀 2. 循环读取数据流 (接管水管)
      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break // 流结束
        }

        // 解码收到的二进制字节为文本
        buffer += decoder.decode(value, { stream: true })

        // 按 SSE 协议的空行 (\n\n) 切割事件包
        const lines = buffer.split('\n\n')
        // 保留最后一个可能还没接收完整的片段在 buffer 里
        buffer = lines.pop() || ''

        // 🚀 3. 逐行解析你刚才在 Apifox 里看到的格式
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6).trim() // 砍掉 'data: ' 前缀

            if (dataStr === '[DONE]') {
              // 接收到后端发出的结束信号
              setIsStreaming(false)
              return
            }

            try {
              // 将 '{"text": "身高"}' 解析成 JSON 对象
              const parsed = JSON.parse(dataStr)
              if (parsed.text) {
                // 核心魔法：把新的文字追加到已有内容后面，触发 React 重新渲染！
                setContent((prev) => prev + parsed.text)
              } else if (parsed.error) {
                throw new Error(parsed.error)
              }
            } catch (e) {
              console.warn('解析 SSE 数据块失败，忽略此块:', dataStr, e)
              // 忽略解析失败的块，继续接收后面的，保证打字机不断
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('用户主动停止了 AI 生成')
      } else {
        console.error('AI Stream 请求失败:', err)
        setError(err.message || '生成洞察时发生未知错误')
      }
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
      abortControllerRef.current = null
    }
  }, [])

  // 提供给 UI 的打断方法
  const stopGenerating = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  return {
    content,
    isStreaming,
    isLoading,
    error,
    generateInsight,
    stopGenerating,
  }
}
