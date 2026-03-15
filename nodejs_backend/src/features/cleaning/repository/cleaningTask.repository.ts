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
    taskId: mongoose.Types.ObjectId | string,
    status: CleaningTaskStatus,
    extras: Partial<ICleaningTask> = {},
  ): Promise<ICleaningTask | null> {
    return CleaningTaskModel.findByIdAndUpdate(
      taskId,
      {
        $set: { status, ...extras },
      },
      { new: true },
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
  /**
   * 🚀 修复版：获取下一个清洗版本号
   * 必须无视任务状态 (status)，找出历史长河中绝对的 Max 版本号！
   */
  async getNextCleaningVersion(
    fileId: mongoose.Types.ObjectId | string,
  ): Promise<number> {
    const lastTask = await CleaningTaskModel.findOne({
      fileId: new mongoose.Types.ObjectId(fileId.toString()),
      // ⚠️ 绝不能在这里加 { status: 'success' } 的过滤条件！
      // 因为哪怕是 failed 的任务，它的版本号也被永久占用了。
    })
      .sort({ cleaningVersion: -1 }) // 倒序排，取最大值
      .select("cleaningVersion")
      .lean();

    // 拿到绝对的最大值后 + 1
    return (lastTask?.cleaningVersion || 0) + 1;
  }
  async findLatestBySession(sessionId: mongoose.Types.ObjectId) {
    return CleaningTaskModel.findOne({ sessionId })
      .sort({ createdAt: -1 })
      .lean();
  }

  findCurrentTask(fileId: mongoose.Types.ObjectId, qualityVersion: number) {
    return CleaningTaskModel.findOne({
      fileId,
      qualityVersion,
      status: { $in: ["pending", "running"] },
    })
      .sort({ createdAt: -1 })
      .lean();
  }

  findLatestTask(fileId: mongoose.Types.ObjectId, qualityVersion: number) {
    return CleaningTaskModel.findOne({
      fileId,
      qualityVersion,
    })
      .sort({ createdAt: -1 })
      .lean();
  }
}

export const cleaningTaskRepository = new CleaningTaskRepository();
