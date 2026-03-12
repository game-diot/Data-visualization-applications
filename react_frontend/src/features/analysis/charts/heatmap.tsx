// src/features/analysis/mappers/charts/heatmap.mapper.ts
import type { EChartsOption } from 'echarts'

interface HeatmapData {
  labels: string[]
  matrix: number[][]
}

export const mapHeatmapToOption = (title: string, data: HeatmapData): EChartsOption => {
  // ECharts heatmap 需要将二维数组打平成 [x, y, value] 格式
  const seriesData: [number, number, number][] = []
  data.matrix.forEach((row, i) => {
    row.forEach((value, j) => {
      seriesData.push([j, i, Number(value.toFixed(3))]) // [x, y, value]
    })
  })

  return {
    title: { text: title, left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { position: 'top' },
    grid: { left: '10%', right: '10%', bottom: '15%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.labels,
      splitArea: { show: true },
      axisLabel: { rotate: 45 },
    },
    yAxis: { type: 'category', data: data.labels, splitArea: { show: true } },
    visualMap: {
      min: -1,
      max: 1,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      inRange: { color: ['#3b82f6', '#ffffff', '#ef4444'] }, // 蓝 -> 白 -> 红 (典型的相关性配色)
    },
    series: [
      {
        name: 'Correlation',
        type: 'heatmap',
        data: seriesData,
        label: { show: true },
        itemStyle: { borderColor: '#fff', borderWidth: 1 },
      },
    ],
  }
}
