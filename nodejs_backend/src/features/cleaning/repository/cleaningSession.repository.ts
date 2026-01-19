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
    qualityVersion: number
  ): Promise<ICleaningSession> {
    return CleaningSessionModel.create({
      fileId,
      qualityVersion,
      status: "draft",
      latestCleaningVersion: 0,
    });
  }
  /**
   * 查找活跃 Session (draft 或 running)
   * 策略：如果有多个，返回最新的一个 (sort by createdAt desc)
   */
  async findActiveByFileAndQuality(
    fileId: mongoose.Types.ObjectId,
    qualityVersion: number
  ): Promise<ICleaningSession | null> {
    return CleaningSessionModel.findOne({
      fileId,
      qualityVersion,
      status: { $in: ["draft", "running"] },
    })
      .sort({ createAt: -1 })
      .lean();
  }
  /**
   * 通过id查找session
   */
  async findActiveById(
    id: mongoose.Types.ObjectId | string
  ): Promise<ICleaningSession | null> {
    return CleaningSessionModel.findById(id).lean();
  }
  /**
   * 锁定session（draft->running）
   */
  async lockedSession(
    sessionId: mongoose.Types.ObjectId
  ): Promise<ICleaningSession | null> {
    return CleaningSessionModel.findByIdAndUpdate(
      sessionId,
      {
        $set: { status: "running", lockedAt: new Date() },
      },
      { new: true }
    );
  }
  /**
   * 关闭session（any ->closed）
   */
  async closedSession(
    sessionId: mongoose.Types.ObjectId
  ): Promise<ICleaningSession | null> {
    return CleaningSessionModel.findByIdAndUpdate(
      sessionId,
      { $set: { status: "closed", closedAt: new Date() } },
      { new: true }
    );
  }
}

export const cleaningSessionRepository = new CleaningSessionRepository();
