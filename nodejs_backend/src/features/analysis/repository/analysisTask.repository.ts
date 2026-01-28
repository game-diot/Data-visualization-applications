import mongoose from "mongoose";
import type { AnalysisTaskStatus } from "../constant/analysisTaskStatus.constant";
import type { AnalysisTaskStage } from "../constant/analysisTaskStage.constant";
import { IAnalysisTask } from "../models/interface/analysisTask.interface";
import { AnalysisTaskModel } from "../models/analysisTask.model";

export class AnalysisTaskRepository {
  async create(data: Partial<IAnalysisTask>): Promise<IAnalysisTask> {
    return AnalysisTaskModel.create(data);
  }

  async findById(
    taskId: mongoose.Types.ObjectId | string,
  ): Promise<IAnalysisTask | null> {
    return AnalysisTaskModel.findById(taskId).lean<any>();
  }

  /**
   * ✅ 统一状态更新（按 task._id）
   */
  async updateStatus(
    taskId: mongoose.Types.ObjectId | string,
    status: AnalysisTaskStatus,
    extras: Partial<IAnalysisTask> = {},
  ): Promise<IAnalysisTask | null> {
    return AnalysisTaskModel.findByIdAndUpdate(
      taskId,
      { $set: { status, ...extras } },
      { new: true },
    ).lean<any>();
  }

  /**
   * ✅ 单独更新 stage（避免与 status 混写）
   */
  async updateStage(
    taskId: mongoose.Types.ObjectId | string,
    stage: AnalysisTaskStage,
    extras: Partial<IAnalysisTask> = {},
  ): Promise<IAnalysisTask | null> {
    return AnalysisTaskModel.findByIdAndUpdate(
      taskId,
      { $set: { stage, ...extras } },
      { new: true },
    ).lean<any>();
  }

  /**
   * currentTask：同 fileId + qv + cv 下，pending/running 最新
   */
  async findCurrentTask(
    fileId: mongoose.Types.ObjectId,
    qualityVersion: number,
    cleaningVersion: number,
  ): Promise<IAnalysisTask | null> {
    return AnalysisTaskModel.findOne({
      fileId,
      qualityVersion,
      cleaningVersion,
      status: { $in: ["pending", "running"] },
    })
      .sort({ createdAt: -1 })
      .lean<any>();
  }

  /**
   * latestTask：同 fileId + qv + cv 下，任意状态最新
   */
  async findLatestTask(
    fileId: mongoose.Types.ObjectId,
    qualityVersion: number,
    cleaningVersion: number,
  ): Promise<IAnalysisTask | null> {
    return AnalysisTaskModel.findOne({
      fileId,
      qualityVersion,
      cleaningVersion,
    })
      .sort({ createdAt: -1 })
      .lean<any>();
  }

  /**
   * 可选：列出同输入版本组下的任务（调试用）
   */
  async listByInputVersion(
    fileId: mongoose.Types.ObjectId,
    qualityVersion: number,
    cleaningVersion: number,
    limit = 20,
  ): Promise<IAnalysisTask[]> {
    return AnalysisTaskModel.find({
      fileId,
      qualityVersion,
      cleaningVersion,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean<any>();
  }
}

export const analysisTaskRepository = new AnalysisTaskRepository();
