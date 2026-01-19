import { Schema } from "mongoose";
import { FILE_STAGE_ENUM } from "../constant/file-stage.constant";
import { QualityAnalysisResultSchema } from "../../quality/schema/qualityResult.schema";
import { IFile } from "../models/interface/ifile.interface";
import { CleaningSessionModel } from "features/cleaning/models/cleaningSession.model";
import { CleaningReportModel } from "features/cleaning/models/cleanReport.model";
import { CleaningTaskModel } from "features/cleaning/models/cleanTask.model";
import { UserModificationModel } from "features/cleaning/models/userModification.model";

/**
 * File Mongoose Schema 定义
 */
export const fileSchema = new Schema<IFile>(
  {
    name: { type: String, required: true, trim: true },
    storedName: { type: String, required: true, unique: true },
    path: { type: String, required: true },
    size: { type: Number, required: true, min: 0 },
    mimetype: { type: String, required: true },
    extension: { type: String, required: true },

    userId: { type: String, index: true },
    hash: { type: String, index: true },

    stage: {
      type: String,
      enum: FILE_STAGE_ENUM,
      default: "uploaded",
      required: true,
      index: true,
    },

    fastApiFileId: { type: String, index: true },
    analysisError: {
      type: {
        stage: String,
        code: Schema.Types.Mixed, // 允许 string 或 number
        message: String,
        occurredAt: Date,
        details: Schema.Types.Mixed,
      },
      required: false,
      _id: false, // 不需要子文档 ID
    },

    uploadedAt: { type: Date, default: Date.now },
    analysisStartedAt: { type: Date },
    analysisCompletedAt: { type: Date },

    // ⭐️ [quality] 摘要字段定义 ⭐️
    latestQualityVersion: { type: Number }, // 不加 required，因为上传初期没有
    qualityScore: { type: Number },
    missingRate: { type: Number },
    duplicateRate: { type: Number },
    totalRows: { type: Number },
    totalColumns: { type: Number },

    // ✅ Cleaning 字段
    latestCleaningVersion: { type: Number },
    isCleaned: { type: Boolean, default: false },
  },
  {
    timestamps: true, // 自动管理 createdAt, updatedAt
    collection: "files",
  }
);

/**
 * 🧹 级联删除中间件
 * 当执行 file.deleteOne() 时触发
 */
fileSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    const fileId = this._id;
    console.log(`🧹 [Cascade Delete] Cleaning up data for File: ${fileId}`);

    try {
      await Promise.all([
        // 1. 删除会话
        CleaningSessionModel.deleteMany({ fileId }),
        // 2. 删除任务记录
        CleaningTaskModel.deleteMany({ fileId }),
        // 3. 删除清洗报告 (注意：这里还没删物理文件！物理文件删除通常由单独的 FileCleaner Job 处理)
        CleaningReportModel.deleteMany({ fileId }),
        // 4. 删除用户修改记录
        UserModificationModel.deleteMany({ fileId }),
      ]);
      next();
    } catch (error) {
      next(error as Error);
    }
  }
);

// 注意：如果使用的是 findByIdAndDelete，Mongoose 默认不会触发 document 级的 pre hooks。
// 需要在 Service 中先 findById 再 .deleteOne()，或者使用 pre('findOneAndDelete') (Query Middleware)。
// 为了稳健，建议在 Service 的 deleteFile 方法中显式调用这些删除逻辑，
// 而不是完全依赖 Mongoose Hook (Hook 隐蔽性太强，容易被忽略)。

// --- 索引 ---
fileSchema.index({ userId: 1, createdAt: -1 });
fileSchema.index({ hash: 1 });
