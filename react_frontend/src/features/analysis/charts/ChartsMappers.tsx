// --- src/features/analysis/mappers/charts/histogram.mapper.ts ---
import type { EChartsOption } from 'echarts'

// 声明 Histogram 需要的数据结构
interface HistogramData {
  bins: number[]
  counts: number[]
}

export const mapHistogramToOption = (title: string, data: HistogramData): EChartsOption => {
  // 拼接 X 轴的区间标签 (例如 "965.0 ~ 1062.5")
  const xAxisData = data.bins.slice(0, -1).map((edge, i) => {
    return `${edge.toFixed(1)} ~ ${data.bins[i + 1].toFixed(1)}`
  })

  return {
    title: { text: title, left: 'center', textStyle: { fontSize: 14, fontWeight: 'normal' } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: { interval: 0, rotate: 30, fontSize: 10 },
    },
    yAxis: { type: 'value', name: '频数' },
    series: [
      {
        name: 'Count',
        type: 'bar',
        data: data.counts,
        itemStyle: { color: '#6366f1' }, // Tailwind Indigo-500
        barWidth: '95%', // 模拟连续分布
      },
    ],
  }
}

// 宽容的数据接口：兼容后端可能发来的各种变体命名
interface HeatmapData {
  labels?: string[]
  columns?: string[] // 兼容 pandas 的 columns
  matrix?: any[][]
  values?: any[][] // 兼容叫 values 的矩阵
  data?: any[][] // 兼容叫 data 的矩阵
}

export const mapHeatmapToOption = (title: string, rawData: HeatmapData): EChartsOption => {
  // 1. 智能提取键名 (兼容后端不同的 JSON 命名习惯)
  const labels = rawData.labels || rawData.columns || []
  const matrix = rawData.matrix || rawData.values || rawData.data || []

  const seriesData: [number, number, number | string][] = []

  // 2. 绝对安全的遍历与转换
  matrix.forEach((row, yIndex) => {
    row.forEach((value, xIndex) => {
      let safeValue: number | string = '-' // ECharts 接受 '-' 作为缺失值的占位符

      // 防御性判断：处理数字、字符串数字、甚至 null/NaN
      if (typeof value === 'number' && !isNaN(value)) {
        safeValue = Number(value.toFixed(3))
      } else if (typeof value === 'string' && !isNaN(Number(value))) {
        safeValue = Number(Number(value).toFixed(3))
      }

      seriesData.push([xIndex, yIndex, safeValue as any])
    })
  })

  return {
    title: { text: title, left: 'center', textStyle: { fontSize: 15 } },
    tooltip: { position: 'top' },
    grid: { left: '10%', right: '10%', bottom: '20%', top: '15%', containLabel: true },
    xAxis: { type: 'category', data: labels, axisLabel: { rotate: 45 } },
    yAxis: { type: 'category', data: labels, inverse: true },
    visualMap: {
      min: -1,
      max: 1,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      inRange: { color: ['#ef4444', '#ffffff', '#3b82f6'] },
    },
    series: [
      {
        name: 'Correlation',
        type: 'heatmap',
        data: seriesData,
        label: { show: true, fontSize: 10 },
        itemStyle: { borderColor: '#fff', borderWidth: 2 },
      },
    ],
  }
}

// 宽容的数据接口：兼容后端可能发来的各种 TopK 频数命名
interface BarData {
  labels?: string[]
  categories?: string[]
  keys?: string[]
  values?: number[]
  counts?: number[]
  data?: number[]
}

export const mapBarToOption = (title: string, rawData: BarData): EChartsOption => {
  // 1. 智能提取键名 (兼容后端的字典 key)
  const xData = rawData.labels || rawData.categories || rawData.keys || []
  const yData = rawData.values || rawData.counts || rawData.data || []

  return {
    title: { text: title, left: 'center', textStyle: { fontSize: 14, fontWeight: 'normal' } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '20%', containLabel: true },
    xAxis: {
      type: 'category',
      data: xData,
      axisLabel: {
        interval: 0,
        rotate: 30, // 类别名字可能会很长，倾斜 30 度防重叠
        fontSize: 10,
        width: 80,
        overflow: 'truncate', // 如果太长就打省略号
      },
    },
    yAxis: { type: 'value', name: '频数' },
    series: [
      {
        name: 'Count',
        type: 'bar',
        data: yData,
        itemStyle: {
          color: '#0ea5e9', // Tailwind Sky-500，和直方图区分开
          borderRadius: [4, 4, 0, 0], // 顶部圆角，更好看
        },
        barWidth: '50%',
      },
    ],
  }
}
