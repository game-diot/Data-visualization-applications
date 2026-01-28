import type { ColumnDType } from "../dto/columnProfile.dto";

/**
 * 将 Quality snapshot.types（pandas dtype 字符串）映射为平台 dtype
 * 常见：int64/float64/object/bool/datetime64[ns]/category
 */
export function mapPandasDTypeToColumnDType(pandasType: string): ColumnDType {
  const t = (pandasType || "").toLowerCase();

  // numeric
  if (
    t.includes("int") ||
    t.includes("float") ||
    t.includes("double") ||
    t.includes("number") ||
    t.includes("decimal")
  ) {
    return "numeric";
  }

  // datetime
  if (t.includes("datetime") || t.includes("date") || t.includes("time")) {
    return "datetime";
  }

  // categorical/text/bool
  if (
    t.includes("object") ||
    t.includes("category") ||
    t.includes("bool") ||
    t.includes("string")
  ) {
    return "categorical";
  }

  return "unknown";
}
