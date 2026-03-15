import React, { useState } from 'react'
import { Button, Card, Skeleton, Typography, message } from 'antd'
import {
  LoadingOutlined,
  BlockOutlined,
  CopyOutlined,
  ThunderboltOutlined, // ✅ 替换不存在的 MagicWandOutlined
} from '@ant-design/icons'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import classNames from 'classnames' // ✅ 需要安装: npm install classnames

import { useNativeAIStream } from '../../hooks/useNativeAIStream'
import type { AIInsightStreamReqDTO } from '@/entities/analysis/dto/ai.dto'

const { Text } = Typography

interface AIInsightPanelProps {
  fileId: string
  qualityVersion: number
  cleaningVersion: number
  analysisVersion: number
  chartId: string
  analysisType: string
  chartDataSummary: Record<string, any>
}

export const AIInsightPanel: React.FC<AIInsightPanelProps> = ({
  fileId,
  qualityVersion,
  cleaningVersion,
  analysisVersion,
  chartId,
  analysisType,
  chartDataSummary,
}) => {
  const { content, isStreaming, isLoading, error, generateInsight, stopGenerating } =
    useNativeAIStream()

  const [panelVisible, setPanelVisible] = useState<boolean>(false)

  const handleGenerate = async () => {
    setPanelVisible(true)
    const payload: AIInsightStreamReqDTO = {
      fileId,
      qualityVersion,
      cleaningVersion,
      analysisVersion,
      chartId,
      analysisType,
      chartDataSummary,
    }
    await generateInsight(payload)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    message.success('洞察结论已复制到剪贴板！')
  }

  return (
    <div className="w-full my-6 font-sans">
      <div className="flex justify-end mb-4">
        <Button
          type="primary"
          icon={isStreaming ? <LoadingOutlined /> : <ThunderboltOutlined />} // ✅ 修复图标
          onClick={isStreaming ? stopGenerating : handleGenerate}
          className={classNames(
            'rounded-full h-10 px-6 font-medium shadow-lg transition-all duration-300',
            isStreaming
              ? 'bg-red-500 hover:bg-red-600 shadow-red-200'
              : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:shadow-purple-200 animate-ai-breathing',
          )}
        >
          {isLoading ? 'AI 正在深度思考...' : isStreaming ? '停止生成' : '✨ 智能解读当前图表'}
        </Button>
      </div>

      <div
        className={classNames(
          // 外层只负责动画和隐藏溢出，防止收起时内容漏出来
          'transition-all duration-500 ease-in-out overflow-hidden w-full',
          // 把最大高度设为一个合理值，比如 800px（视你的屏幕设计而定）
          panelVisible ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <Card
          className="shadow-inner border border-purple-100 rounded-2xl bg-white/60 backdrop-blur-sm"
          style={{
            padding: '24px',
            maxHeight: '600px', // 内部滚动区最大高度
            overflowY: 'auto', // 内容过多时显示纵向滚动条
            overflowX: 'hidden', // 彻底封杀横向滚动条
          }}
        >
          {isLoading && (
            <div className="space-y-4">
              <Skeleton active paragraph={{ rows: 4 }} title={{ width: '40%' }} />
              <div className="flex justify-end pt-4">
                <Button size="small" type="link" danger onClick={stopGenerating}>
                  停止生成
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-center">
              <Text strong className="text-base">
                AI 模块降级告警：{error}
              </Text>
              <div className="mt-2 text-gray-500 text-sm">
                可能由于免费额度用尽或网络波动，请稍后再试。
              </div>
            </div>
          )}

          {(content || isStreaming) && !isLoading && !error && (
            <div className="relative">
              <div className="absolute -top-2 -left-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold flex items-center">
                {isStreaming ? (
                  <>
                    <BlockOutlined className="mr-1.5 animate-pulse" />
                    AI 正在逐字分析中
                  </>
                ) : (
                  <>✨ AI 智能洞察完成</>
                )}{' '}
                {/* ✅ 修复：原来末尾是 } 而不是 )} */}
              </div>

              {/* 🚀 核心 2：强制打断长文本，完美换行 */}
              <div
                className={classNames(
                  // max-w-none 取消 prose 默认的最大宽度限制，铺满容器
                  // break-words 强制长单词或无空格的乱码折行
                  // whitespace-pre-wrap 完美保留 AI 换行符的同时允许自动折行
                  'prose prose-purple max-w-none pt-6 text-gray-800 break-words whitespace-pre-wrap w-full',
                  isStreaming &&
                    "animate-cursor-blink after:content-['▋'] after:ml-0.5 after:text-purple-600 after:font-mono after:text-lg",
                )}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              </div>

              {!isStreaming && content && (
                <div className="flex justify-end pt-5 mt-5 border-t border-gray-100 animate-fadeIn">
                  <Button
                    type="dashed"
                    icon={<CopyOutlined />}
                    onClick={handleCopy}
                    className="rounded-lg text-purple-600 border-purple-200"
                  >
                    一键复制结论
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
