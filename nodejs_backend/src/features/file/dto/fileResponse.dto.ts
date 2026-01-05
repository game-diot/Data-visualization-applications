import { FileStage } from "../constant/file-stage.constant";
import { IQualityAnalysisResult } from "../../Step001.5_quality-analysis/models/interface/quality-result.interface";

/**
 * [Response] 文件列表项 VO (View Object)
 * 场景：文件列表页，轻量级数据，不包含巨大的 analysisResult
 */
export interface FileSummaryResponseDTO {
  id: string; // 映射自 _id
  name: string; // 原始文件名
  size: number; // 文件大小
  extension: string; // 后缀
  stage: FileStage; // 当前状态 (用于前端显示进度条/Badge)
  uploadTime: Date; // 映射自 createdAt

  // 仅透出关键指标，不透出整个结果对象
  qualityScore?: number;
}

/**
 * [Response] 文件详情 VO
 * 场景：点击查看详情/报告页，包含完整数据
 */
export interface FileDetailResponseDTO extends FileSummaryResponseDTO {
  // 完整的分析结果
  analysisResult?: IQualityAnalysisResult;

  // 如果失败，透出错误原因
  errorMessage?: string;

  // 任务耗时分析 (可选)
  analysisDuration?: number;
}
