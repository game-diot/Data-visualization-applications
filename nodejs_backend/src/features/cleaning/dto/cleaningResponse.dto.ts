// dto/cleaningResponse.dto.ts

// 1. 定义核心统计数据的结构 (对应 Schema 中的 ICleaningSummary)
export interface CleaningSummaryDTO {
  rowsBefore: number;
  rowsAfter: number;
  columnsBefore: number;
  columnsAfter: number;
  rowsRemoved: number;
  columnsRemoved: number;
  cellsModified: number;
  userActionsApplied: number;
  rulesApplied: string[];
  missingRateBefore: number;
  missingRateAfter: number;
  duplicateRateBefore: number;
  duplicateRateAfter: number;
}

// 2. 定义差异详情的结构 (对应 Schema 中的 ICleaningDiffSummary)
export interface CleaningDiffSummaryDTO {
  byRule?: {
    beforeProfile?: any;
    afterProfile?: any;
    metrics?: Record<string, any>;
    profileDelta?: {
      rowsDropped?: number;
      colsDropped?: number;
    };
  };
  byColumn?: any;
}

// 3. 基础 Session 概览 (保持不变)
export interface CleaningSessionSummaryDTO {
  sessionId: string;
  status: string; // 'active' | 'completed' | 'failed'
}

// 4. 基础 Task 概览 (保持不变)
export interface CleaningTaskSummaryDTO {
  taskId: string;
  status: string;
  startedAt?: Date;
  errorMessage?: string;
}

// 5. [修改] Report 概览 (用于列表或状态页)
export interface CleaningReportSummaryDTO {
  cleaningVersion: number;
  createdAt: Date;

  // 🚨 变更: 以前可能是 metrics 对象 + summary 字符串
  // 现在合并为一个强类型的 summary 对象
  summary: CleaningSummaryDTO;

  // 可选：列表页是否显示“包含产物”标记
  hasAsset?: boolean;
}

// 6. [修改] 顶层响应：聚合状态
export interface CleaningStatusResponseDTO {
  fileId: string;
  qualityVersion: number;
  session: CleaningSessionSummaryDTO | null;
  currentTask: CleaningTaskSummaryDTO | null;

  latestTask: CleaningTaskSummaryDTO | null;
  latestReport: CleaningReportSummaryDTO | null;
}

// 7. [修改] Report 详情 (用于详情页)
// 继承 Summary，增加大字段
export interface CleaningReportDetailDTO extends CleaningReportSummaryDTO {
  fileId: string;
  qualityVersion: number;
  taskId: string; // 新增：方便前端回溯任务

  // 🚨 变更: 字符串路径 -> 对象结构
  cleanedAsset: {
    path: string;
    preview?: any[];
  };

  // 🚨 新增: 差异详情
  diffSummary: CleaningDiffSummaryDTO;

  // 🚨 变更: detailLog -> logs (string[])
  logs: string[];
}
