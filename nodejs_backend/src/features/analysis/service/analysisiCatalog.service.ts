import mongoose from "mongoose";
import { fileRepository } from "../../file/repository/file.repository"; // 按你项目路径调整
import { mapPandasDTypeToColumnDType } from "../utils/columnTypeMapper.util";
import type { ColumnProfileDTO } from "../dto/columnProfile.dto";

// 你需要对齐这里的 repository：能按 fileId + version 拿到 qualityReport（含 snapshot.types）
import { qualityReportRepository } from "../../quality/repository/qualityReport.repository"; // 按你项目实际路径调整
import { BadRequestException } from "@shared/exceptions/badRequest.exception";
import { FileNotFoundException } from "@shared/exceptions/fileNotFound.exception";
import { computeCatalog } from "../utils/analysisiCatalog.util";

function parseSelectedColumns(raw?: string): string[] | null {
  if (raw == null || raw.trim() === "") return null; // null 表示全列
  const arr = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // [] 非法：用户明确传了但为空
  if (arr.length === 0)
    throw new BadRequestException("selectedColumns cannot be empty");
  return arr;
}

export const analysisCatalogService = {
  /**
   * 获取可用分析 catalog（只依赖 quality types，不读文件）
   * GET /api/v1/analysis/:fileId/catalog?qualityVersion=&selectedColumns=a,b,c
   */
  async getCatalog(
    fileId: string,
    qualityVersion?: number,
    selectedColumnsRaw?: string,
  ) {
    const fId = new mongoose.Types.ObjectId(fileId);

    // 1) qualityVersion 默认值：File.latestQualityVersion
    let qVer = qualityVersion;
    if (qVer === undefined) {
      const file = await fileRepository.findById(fileId);
      if (!file) throw new FileNotFoundException("File not found");
      qVer = file.latestQualityVersion || 0;
    }
    if (!qVer)
      throw new BadRequestException(
        "qualityVersion is required (file has no qualityVersion)",
      );

    // 2) 取 qualityReport（按版本）
    // 你现有的 qualityReport 结构是 { snapshot: { types: {...} } }
    const report = await qualityReportRepository.findByFileIdAndVersion(
      fileId,
      qVer,
    );
    if (!report)
      throw new BadRequestException(
        `QualityReport not found for version=${qVer}`,
      );

    const types: Record<string, string> = report.snapshot?.types || {};
    const columns: ColumnProfileDTO[] = Object.entries(types).map(
      ([name, pandasType]) => ({
        name,
        dtype: mapPandasDTypeToColumnDType(pandasType),
      }),
    );

    // 3) selectedColumns（null=全列）
    const selectedColumns = parseSelectedColumns(selectedColumnsRaw);

    // 4) 计算可用 catalog
    const catalog = computeCatalog(columns, selectedColumns);

    return {
      fileId,
      qualityVersion: qVer,
      columns,
      selectedColumns, // 便于前端回显
      catalog,
    };
  },
};
