import { BadRequestException } from "@shared/exceptions/badRequest.exception";
import type { AnalysisConfigDTO } from "../dto/analysisConfig.dto";
import type { ColumnProfileDTO } from "../dto/columnProfile.dto";
import { computeCatalog } from "./analysisiCatalog.util";

/**
 * Node 端 validate stage：提前拦截明显无效请求
 * 只依赖 dtype + 用户选列，不做语义识别
 */
export function validateAnalysisConfigOrThrow(
  allColumns: ColumnProfileDTO[],
  selectedColumns: string[] | null,
  config: AnalysisConfigDTO,
) {
  // 0) MVP：filters/sample 若存在，建议直接拒绝（避免用户误以为生效）
  // 这个校验你可以在 run service 里做，这里先留接口位置

  const catalog = computeCatalog(allColumns, selectedColumns);
  const entry = catalog.find((x) => x.type === config.type);
  if (!entry) {
    throw new BadRequestException(`Unsupported analysis type: ${config.type}`);
  }
  if (!entry.enabled) {
    throw new BadRequestException(entry.reason || "Invalid analysis config");
  }

  // group_compare 强制需要 target + groupBy（UI 可能分步选择）
  if (config.type === "group_compare") {
    if (!config.groupBy)
      throw new BadRequestException("groupBy is required for group_compare");
    if (!config.target)
      throw new BadRequestException("target is required for group_compare");
  }

  // correlation 需要至少2列（通常 columns>=2）
  if (
    config.type === "correlation" &&
    (!config.columns || config.columns.length < 2)
  ) {
    throw new BadRequestException("correlation requires at least 2 columns");
  }
}
