import { MissingStatisticsDTO,DuplicateStatisticsDTO,AnomalyDetailDTO,AnomalyStatisticsDTO } from "./quality-substructures.dto";


/** * FastAPI 返回的完整质量分析结果
 * 对应 Python 端的: QualityCheckResponse
 */
export interface FastApiQualityResultDTO {
  file_id: string; // Python 侧回传 ID

  // --- 基础统计 ---
  row_count: number;
  column_count: number;

  // --- 质量评分 ---
  quality_score: number; // 0 - 100

  // --- 详细维度 ---
  missing: MissingStatisticsDTO;
  duplicates: DuplicateStatisticsDTO;
  anomalies: AnomalyStatisticsDTO;

  // --- 元数据 ---
  types: Record<string, string>; // e.g. { "age": "int64", "name": "object" }
}
