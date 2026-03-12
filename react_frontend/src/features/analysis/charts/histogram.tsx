// src/features/analysis/mappers/charts/histogram.mapper.ts
import type { EChartsOption } from 'echarts'

interface HistogramData {
  bins: number[]
  counts: number[]
}

export const mapHistogramToOption = (title: string, data: HistogramData): EChartsOption => {
  // ECharts 直方图通常用柱状图模拟，x 轴是区间
  const xAxisData = data.bins.slice(0, -1).map((edge, i) => {
    return `${edge.toFixed(1)} ~ ${data.bins[i + 1].toFixed(1)}`
  })

  return {
    title: { text: title, left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: xAxisData, axisLabel: { interval: 'auto', rotate: 30 } },
    yAxis: { type: 'value', name: '频数 (Count)' },
    series: [
      {
        name: '频数',
        type: 'bar',
        data: data.counts,
        itemStyle: { color: '#6366f1' }, // Tailwind Indigo-500
        barWidth: '99%', // 模拟连续直方图
      },
    ],
  }
}
