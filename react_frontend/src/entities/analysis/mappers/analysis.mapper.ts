import type { AnalysisCatalogResDTO } from '../dto/analysis.dto'
import type { AnalysisCatalogVM } from '../types/analysis.type'

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
