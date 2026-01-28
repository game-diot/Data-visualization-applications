import {
  AnalysisCatalogItem,
  ANALYSIS_CATALOG,
} from "../constant/analysisiCatalog.constant";
import type { ColumnProfileDTO } from "../dto/columnProfile.dto";

export interface CatalogComputedItem extends AnalysisCatalogItem {
  enabled: boolean;
  reason?: string;
}

function countByDType(cols: ColumnProfileDTO[]) {
  let numeric = 0,
    categorical = 0,
    datetime = 0,
    unknown = 0;
  for (const c of cols) {
    if (c.dtype === "numeric") numeric++;
    else if (c.dtype === "categorical") categorical++;
    else if (c.dtype === "datetime") datetime++;
    else unknown++;
  }
  return { numeric, categorical, datetime, unknown, total: cols.length };
}

/**
 * 根据 columns（全量列画像）与 selectedColumns（列名选择，可空）计算“可用分析方法”
 * - selectedColumns 为 null => 全列
 * - selectedColumns 为 [] => 应该在上层校验并拒绝
 */
export function computeCatalog(
  allColumns: ColumnProfileDTO[],
  selectedColumns: string[] | null,
): CatalogComputedItem[] {
  const chosen =
    selectedColumns == null
      ? allColumns
      : allColumns.filter((c) => selectedColumns.includes(c.name));

  const { numeric, categorical, datetime, total } = countByDType(chosen);

  return ANALYSIS_CATALOG.map((item) => {
    const req = item.requirements;

    // 基础列数要求
    if (req.minColumns && total < req.minColumns) {
      return {
        ...item,
        enabled: false,
        reason: `至少需要选择 ${req.minColumns} 列`,
      };
    }

    // dtype 要求
    if (req.minNumeric && numeric < req.minNumeric) {
      return {
        ...item,
        enabled: false,
        reason: `至少需要 ${req.minNumeric} 个数值列`,
      };
    }
    if (req.minCategorical && categorical < req.minCategorical) {
      return {
        ...item,
        enabled: false,
        reason: `至少需要 ${req.minCategorical} 个类别列`,
      };
    }
    if (req.minDatetime && datetime < req.minDatetime) {
      return {
        ...item,
        enabled: false,
        reason: `至少需要 ${req.minDatetime} 个时间列`,
      };
    }

    return { ...item, enabled: true };
  });
}
