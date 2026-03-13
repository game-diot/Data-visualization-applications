import type { AnalysisCatalogResDTO, AnalysisReportsListResDTO } from '../dto/analysis.dto'
import type { AnalysisCatalogVM, AnalysisReportSummaryVM } from '../types/analysis.type'
import dayjs from 'dayjs'
export const mapCatalogDtoToVM = (dto: AnalysisCatalogResDTO): AnalysisCatalogVM => {
  return {
    // 过滤并映射列信息
    columns: dto.columns.map((col) => ({
      columnName: col.name,
      dataType: col.dtype,
      isNumeric: col.dtype === 'numeric',
    })),
    // 过滤并映射分析方法（清洗掉后端的 requirements 等细节）
    methods: dto.catalog.map((item) => ({
      methodType: item.type,
      displayName: item.name,
      description: item.description,
      isAvailable: item.enabled,
      disabledReason: item.reason || '数据特征不满足该分析的前置条件',
    })),
  }
}

const ANALYSIS_TYPE_MAP: Record<string, string> = {
  descriptive: '描述性统计',
  correlation: '相关性分析',
  group_compare: '分组对比',
}

export const mapReportListDtoToVM = (dto: AnalysisReportsListResDTO): AnalysisReportSummaryVM[] => {
  return (dto.reports || []).map((report) => {
    const type = report.summary?.analysis_type || 'unknown'
    const shape = report.summary?.selected_shape

    return {
      reportId: report._id || report.id || `v${report.analysisVersion}`,
      analysisVersion: report.analysisVersion,
      analysisType: type,
      analysisTypeLabel: ANALYSIS_TYPE_MAP[type] || '未知分析',
      dataShapeLabel: shape ? `基于 ${shape.rows} 行, ${shape.cols} 列` : '全局数据',
      createdAtFormatted: dayjs(report.createdAt).format('YYYY-MM-DD HH:mm:ss'),
    }
  })
}
