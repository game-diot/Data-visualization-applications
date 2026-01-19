import mongoose from "mongoose";
import { cleaningSessionRepository } from "../repository/cleaningSession.repository";
import { FileNotFoundException } from "../../../shared/exceptions/fileNotFound.exception";
import { BadRequestException } from "../../../shared/exceptions/badRequest.exception";
import { fileRepository } from "../../file/repository/file.repository"; // 需引用 File 检查

export const cleaningSessionService = {
  /**
   * 创建新 Session
   */
  async createSession(fileId: string, qualityVersion: number) {
    // 1. 校验文件是否存在 (可选，但推荐)
    const file = await fileRepository.findById(fileId);
    if (!file) throw new FileNotFoundException("File not found");

    // 2. 校验 qualityVersion 是否合法 (通常需要查 QualityReport，这里简化处理或后续补充)

    return cleaningSessionRepository.create(
      new mongoose.Types.ObjectId(fileId),
      qualityVersion
    );
  },

  /**
   * 获取活跃 Session
   */
  async getActiveSession(fileId: string, qualityVersion: number) {
    const session = await cleaningSessionRepository.findActiveByFileAndQuality(
      new mongoose.Types.ObjectId(fileId),
      qualityVersion
    );

    if (!session) {
      // 不直接抛错，返回 null 由 Controller 决定，或者在这里抛错
      // 这里的语义是 "Get or Fail"，所以抛错
      throw new FileNotFoundException("No active cleaning session found");
    }
    return session;
  },

  /**
   * 锁定 (在开始清洗任务前调用)
   */
  async lockSession(sessionId: string) {
    const session = await cleaningSessionRepository.findActiveById(sessionId);
    if (!session) throw new FileNotFoundException("Session not found");

    if (session.status === "closed") {
      throw new BadRequestException("Cannot lock a closed session");
    }

    return cleaningSessionRepository.lockedSession(session._id);
  },

  /**
   * 关闭 (清洗满意后调用)
   */
  async closeSession(sessionId: string) {
    return cleaningSessionRepository.closedSession(
      new mongoose.Types.ObjectId(sessionId)
    );
  },
};
