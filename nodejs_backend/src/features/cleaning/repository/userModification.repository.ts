import mongoose from "mongoose";
import { UserModificationItemDTO } from "../dto/userModification.dto";
import { IUserMondification } from "../models/interfaces/userModification.interface";
import { UserModificationModel } from "../models/userModification.model";
import { userModificationSchema } from "../schema/userModification.schema";

export class UserModificationRepository {
  /**
   * 创建新的修改记录
   */

  async create(params: {
    sessionId: mongoose.Types.ObjectId;
    fileId: mongoose.Types.ObjectId;
    diffList: UserModificationItemDTO[];
  }): Promise<IUserMondification> {
    return UserModificationModel.create({
      sessionId: params.sessionId,
      fileId: params.fileId,
      diffList: params.diffList,
      consumed: false,
    });
  }
  /**
   * 查询某 Session 下的所有修改记录
   * 关键：按 createdAt 升序排列，保证 replay 顺序正确
   */
  async findBySessionId(
    sessionId: mongoose.Types.ObjectId
  ): Promise<IUserMondification[]> {
    return UserModificationModel.find({ sessionId })
      .sort({ createAt: 1 })
      .lean();
  }
  /**
   * 批量标记已消费
   * 场景：CleaningTask 执行成功后调用
   */
  async markConsumed(ids: mongoose.Types.ObjectId[]): Promise<void> {
    await UserModificationModel.updateMany(
      { _id: { $in: ids } },
      { $set: { consumed: true } }
    );
  }
  /**
   * 级联删除 (当 Session 删除时)
   */
  async deleteBySessionId(sessionId: mongoose.Types.ObjectId): Promise<void> {
    await UserModificationModel.deleteMany({ sessionId });
  }
}

export const userModificationRepository = new UserModificationRepository();
