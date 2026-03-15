// src/features/analysis/mappers/ai-payload.mapper.ts

/**
 * 🚀 AI 专属数据降维提纯器 (Data Dimension Reducer)
 * 作用：将臃肿的 ECharts 原始数据，压缩成极简的 JSON 摘要，防止大模型 Token 爆炸
 */
export const buildAIChartSummary = (chart: any): Record<string, any> => {
  // 1. 针对【相关性热力图】的智能降维
  if (chart.type === 'heatmap' && chart.data?.matrix && chart.data?.labels) {
    const labels = chart.data.labels
    const matrix = chart.data.matrix
    const strongPairs = []

    // 遍历矩阵右上角（避免重复），只提取绝对值 >= 0.5 的强相关特征
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) {
        const val = matrix[i][j]
        if (Math.abs(val) >= 0.5) {
          // 阈值可以根据你的业务调整
          strongPairs.push({
            feature1: labels[i],
            feature2: labels[j],
            r: Number(val.toFixed(3)), // 保留三位小数，极度压缩体积
          })
        }
      }
    }

    return {
      chartType: 'Correlation Heatmap',
      title: chart.title,
      insight_target: '请重点分析以下强相关特征背后的业务逻辑：',
      strongPairs, // 传给 AI 的只有这几个核心键值对！
    }
  }

  // 替换成这样：
  if (chart.type === 'histogram' || chart.type === 'bar') {
    return {
      chartType: chart.type,
      title: chart.title,
      // 🚀 换成更聪明的引导语，直接把图表 X 轴和 Y 轴的意义告诉它
      insight_target: `请根据图表标题 "${chart.title}"，分析该分布的业务意义，推测其集中趋势或差异原因。`,
    }
  }

  // 3. 兜底策略：如果是不认识的图表，只传标题和元数据，绝对不传 raw data
  return {
    chartType: chart.type,
    title: chart.title,
    meta: chart.meta || {},
  }
}
