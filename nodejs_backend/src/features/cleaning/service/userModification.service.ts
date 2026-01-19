import mongoose from "mongoose";
import { userModificationRepository } from "../repository/userModification.repository";
import { CreateUserModificationDTO } from "../dto/userModification.dto";
import { BadRequestException } from "../../../shared/exceptions/badRequest.exception";
// 假设 CleaningSessionRepository 已存在 (环节 4 会开发，这里先引用)
import { cleaningSessionRepository } from "../repository/cleaningSession.repository";

export const userModificationService = {
  /**
   * 提交修改
   */
  async addModification(fileId: string, dto: CreateUserModificationDTO) {
    // 1. 校验 Session 是否存在且属于当前文件
    const session = await cleaningSessionRepository.findActiveById(
      dto.sessionId
    );

    if (!session) {
      throw new BadRequestException("Session not found");
    }

    if (session.fileId.toString() !== fileId) {
      throw new BadRequestException("Session mismatch for this file");
    }

    if (session.status === "closed") {
      throw new BadRequestException("Cannot modify an archived session");
    }

    // 2. 落库
    return userModificationRepository.create({
      fileId: new mongoose.Types.ObjectId(fileId),
      sessionId: new mongoose.Types.ObjectId(dto.sessionId),
      diffList: dto.modifications,
    });
  },

  /**
   * 获取列表
   */
  async listModifications(sessionId: string) {
    return userModificationRepository.findBySessionId(
      new mongoose.Types.ObjectId(sessionId)
    );
  },
};
