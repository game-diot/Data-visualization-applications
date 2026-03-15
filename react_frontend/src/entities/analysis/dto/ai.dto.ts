// ==========================================
// 🌟 1. AI 流式解读请求参数 (React ➔ Node.js)
// ==========================================
export interface AIInsightStreamReqDTO {
  // 🩸 绝对血统凭证 (Lineage)：确保 AI 知道它在看哪个版本的数据，也为了 Node.js 能精准落盘
  fileId: string
  qualityVersion: number
  cleaningVersion: number
  analysisVersion: number

  // 🎯 目标定位：告诉后端，我们现在要解读的是当前分析报告里的哪一张图表
  chartId: string // 极其重要！这是唯一标识，例如 'chart_correlation_01'
  analysisType: string // 例如 'correlation' | 'descriptive'，Node.js 靠这个来切换不同的 Prompt 模板

  // 🛡️ 防腐降维核心：绝对不传原始数据！只传前端提纯后的精简摘要
  chartDataSummary: Record<string, any>
}
