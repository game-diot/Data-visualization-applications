import mongoose from "mongoose";
import { ICleaningSession } from "../models/interfaces/cleaningSession.interface";
import { CleaningSessionModel } from "../models/cleaningSession.model";
import { CleaningSessionStatus } from "../constant/cleaningSessionStatus.constant";

export class CleaningSessionRepository {
  /**
   *创建session
   */
  async create(
    fileId: mongoose.Types.ObjectId,
    qualityVersion: number,
  ): Promise<ICleaningSession> {
    return CleaningSessionModel.create({
      fileId,
      qualityVersion,
      status: "draft",
      latestCleaningVersion: 0,
    });
  }
  /**
   * ✅ 创建 session 前：自动关闭同 fileId + qualityVersion 下所有 active(session.status in draft/running)
   */
  async closeActiveByFileAndQuality(fileId: string, qualityVersion: number) {
    return CleaningSessionModel.updateMany(
      {
        fileId,
        qualityVersion,
        status: { $in: ["draft", "running"] },
      },
      {
        $set: { status: "closed", closedAt: new Date() },
      },
    );
  }

  /**
   * ✅（顺手修复）findActiveByFileAndQuality 的排序字段拼写：createdAt
   */
  async findActiveByFileAndQuality(
    fileId: mongoose.Types.ObjectId,
    qualityVersion: number,
  ): Promise<ICleaningSession | null> {
    return CleaningSessionModel.findOne({
      fileId,
      qualityVersion,
      status: { $in: ["draft", "running"] },
    })
      .sort({ createdAt: -1 }) // ✅ 修复：createAt -> createdAt
      .lean();
  }
  /**
   * 通过id查找session
   */
  async findActiveById(
    id: mongoose.Types.ObjectId | string,
  ): Promise<ICleaningSession | null> {
    return CleaningSessionModel.findById(id).lean();
  }
  /**
   * 锁定session（draft->running）
   */
  async lockedSession(
    sessionId: mongoose.Types.ObjectId,
  ): Promise<ICleaningSession | null> {
    return CleaningSessionModel.findByIdAndUpdate(
      sessionId,
      {
        $set: { status: "running", lockedAt: new Date() },
      },
      { new: true },
    );
  }
  /**
   * 关闭session（any ->closed）
   */
  async closedSession(
    sessionId: mongoose.Types.ObjectId,
  ): Promise<ICleaningSession | null> {
    return CleaningSessionModel.findByIdAndUpdate(
      sessionId,
      { $set: { status: "closed", closedAt: new Date() } },
      { new: true },
    );
  }
}

export const cleaningSessionRepository = new CleaningSessionRepository();
