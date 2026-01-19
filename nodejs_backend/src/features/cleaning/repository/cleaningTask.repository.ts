import mongoose from "mongoose";
import { ICleaningTask } from "../models/interfaces/cleaningTask.interface";
import { CleaningTaskModel } from "../models/cleanTask.model";
import { CleaningTaskStatus } from "../constant/cleaningTaskStatus.constant";
import { CleaningReportModel } from "../models/cleanReport.model";

export class CleaningTaskRepository {
  /**
   * 创建Task
   */
  async create(data: Partial<ICleaningTask>): Promise<ICleaningTask> {
    return CleaningTaskModel.create(data);
  }
  /**
   * 更新状态
   */
  async updateStatus(
    taskId: mongoose.Types.ObjectId,
    status: CleaningTaskStatus,
    extras: Partial<ICleaningTask> = {}
  ): Promise<ICleaningTask | null> {
    return CleaningTaskModel.findByIdAndUpdate(
      taskId,
      {
        $set: { status, ...extras },
      },
      { new: true }
    );
  }
  /**
   * 计算下一个 cleaningVersion
   * 逻辑：查找该 File 下最大的 cleaningVersion + 1
   * 即使跨 Session，只要是同一个 File，Version 就应该全局递增 (或者按你的需求：基于 QualityVersion 递增)
   * *按你之前的约定：基于 QualityVersion 的局部递增* * 修正逻辑：findMax where fileId & qualityVersion
   */
  /**
   * 🟢 修正后的版本计算逻辑
   * 规则：CleaningVersion = Max(CleaningReport.version) + 1
   * 意义：只有成功的清洗才算一个版本。失败的任务不占版本号。
   */
  async getNextCleaningVersion(
    fileId: mongoose.Types.ObjectId,
    qualityVersion: number
  ): Promise<number> {
    const lastReport = await CleaningReportModel.findOne({
      fileId,
      qualityVersion,
    })
      .sort({ cleaningVersion: -1 }) // 找最大的成功版本
      .select("cleaningVersion")
      .lean();

    return (lastReport?.cleaningVersion || 0) + 1;
  }

  async findLatestBySession(sessionId: mongoose.Types.ObjectId) {
    return CleaningTaskModel.findOne({ sessionId })
      .sort({ createdAt: -1 })
      .lean();
  }
}

export const cleaningTaskRepository = new CleaningTaskRepository();
