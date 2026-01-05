// 1. 引用模块内的常量
import { FileStage } from "../constant/file-stage.constant";
// 2. 引用模块内的核心数据接口 (上一轮重构的成果)
import { IQualityAnalysisResult } from "../../Step001.5_quality-analysis/models/interface/quality-result.interface";

/**
 * [Internal] 创建文件 DTO
 * 场景：Controller 从 HTTP Request (Multer) 解析出文件后，传递给 Service 进行落库
 */
export interface CreateFileServiceDTO {
  name: string; // 原始文件名
  storedName: string; // 磁盘上的文件名 (UUID)
  path: string; // 物理绝对路径
  size: number; // 字节大小
  mimetype: string; // MIME 类型
  extension: string; // 后缀名

  // 可选元数据
  userId?: string; // 如果系统支持多租户
  hash?: string; // 文件指纹 (MD5) 用于秒传检测
}

/**
 * [Internal] 更新文件 DTO
 * 场景：各个处理阶段 (Quality, Cleaning, Analysis) 异步完成后，更新文件状态
 */
export interface UpdateFileServiceDTO {
  stage?: FileStage;

  // 外部任务关联
  fastApiFileId?: string;

  // 性能监控
  analysisStartedAt?: Date;
  analysisCompletedAt?: Date;

  // 核心结果 (复用 Interface，保证类型一致性)
  analysisResult?: IQualityAnalysisResult;

  // 错误处理
  errorMessage?: string;
}
