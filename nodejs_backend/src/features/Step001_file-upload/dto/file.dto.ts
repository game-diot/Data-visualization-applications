// 引入必要的类型
import { FileStage } from "../models/File.model";
import { FastApiAnalysisResultDTO } from "../../Step001.5_quality-analysis/dto/QualityResult.dto";

// ==========================================
// 1. Service 层使用的 DTO (内部流转)
// ==========================================

/**
 * 创建文件记录的 DTO
 * 场景：Controller 解析完 multer 的文件后，打包发给 Service
 * 注意：这里不包含 id, createdAt 等自动生成的字段
 */
export interface CreateFileServiceDTO {
  name: string; // 原始文件名
  storedName: string; // 存盘后的文件名
  path: string; // 物理路径 (绝不能发给前端)
  size: number; // 大小
  mimetype: string; // 类型
  extension: string; // 后缀
  userId?: string; // 用户ID
  hash?: string; // 文件指纹
}

/**
 * 更新文件状态/信息的 DTO
 * 场景：文件分析完成后，更新数据库状态
 */
export interface UpdateFileDTO {
  stage?: FileStage;
  fastApiFileId?: string;
  analysisStartedAt?: Date;
  analysisCompletedAt?: Date;
  analysisResult?: FastApiAnalysisResultDTO; // 巨大的分析结果
  errorMessage?: string;
}

// ==========================================
// 2. 响应给前端的 DTO (Output / Response)
// ==========================================

/**
 * 文件基础信息 VO (View Object)
 * 场景：文件列表页，不需要展示详细的分析结果，只展示基础信息
 * 关键点：这里剔除了 path (安全)，剔除 huge result (性能)
 */
export interface FileResponseDTO {
  id: string; // 对应 _id
  name: string; // 原始名
  size: number;
  extension: string;
  stage: FileStage; // 前端根据这个显示进度条或状态图标
  uploadTime: Date; // 对应 createdAt
  qualityScore?: number; // 如果有结果，可以把分数提出来显示
}

/**
 * 文件详情 VO
 * 场景：点击具体的分析报告时使用，包含所有结果
 */
export interface FileDetailResponseDTO extends FileResponseDTO {
  analysisResult?: FastApiAnalysisResultDTO; // 包含详细数据
  errorMessage?: string; // 如果失败，告诉前端原因
}
