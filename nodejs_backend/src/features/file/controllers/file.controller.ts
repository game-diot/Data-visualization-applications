import { Request, Response, NextFunction } from "express";
import path from "path";
import { fileService } from "../services/file.service";
import { responseUtils } from "../../../shared/utils/response.util";
import { CreateFileServiceDTO } from "../dto/fileService.dto";
import { ValidationException } from "../../../shared/exceptions/validation.exception";
import { PaginationQuery } from "../../../shared/types/pagination.type";

export const fileController = {
  /**
   * 上传文件主入口
   * 流程：
   * 1. Multer 接收文件并落盘
   * 2. 组装 DTO
   * 3. Service 处理 (计算Hash -> 秒传检测 -> 入库 -> 🚀异步触发分析)
   * 4. 立即返回响应 (前端无需等待分析完成)
   */
  async uploadFile(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. 基础校验
      if (!req.file) {
        throw new ValidationException([
          {
            field: "file",
            message: "File is required or format not supported.",
          },
        ]);
      }

      const file = req.file;

      // 2. 组装 DTO
      const fileData: CreateFileServiceDTO = {
        name: Buffer.from(file.originalname, "latin1").toString("utf8"), // 中文名修复
        storedName: file.filename,
        path: file.path.replace(/\\/g, "/"), // Windows 路径兼容
        size: file.size,
        mimetype: file.mimetype,
        extension: path.extname(file.originalname).toLowerCase(),
        // userId: req.user?.id // 如果有鉴权
      };

      // 3. 调用业务逻辑
      // processUpload 内部会自动调用 qualityService.startAnalysis(newFile)
      // 并且使用了 .catch() 来确保不会阻塞当前线程，实现"Fire and Forget"
      const result = await fileService.processUpload(fileData);

      // 4. 立即返回
      // ⚠️ 修复：responseUtils.created 的参数顺序是 (res, data, message)
      // 你原本的代码传的是 (res, fileData, msg)，但 result 包含了 _id，这才是前端需要的
      return responseUtils.created(res, result, "文件上传成功，后台分析已启动");
    } catch (error) {
      next(error);
    }
  },

  /**
   * 获取文件列表
   */
  async getAllFiles(req: Request, res: Response, next: NextFunction) {
    try {
      const query: PaginationQuery = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        pageSize: req.query.pageSize
          ? parseInt(req.query.pageSize as string)
          : 10,
        sortBy: (req.query.sortBy as string) || "createdAt",
        order: (req.query.order as "asc" | "desc") || "desc",
      };

      // 🛠️ 核心修复 1：提取过滤条件并构造 Mongoose Filter
      const filter: any = {};

      // 处理文本搜索 (假设前端传的是 query，我们要去匹配文件的 name 或 originalName 字段)
      if (req.query.query) {
        const searchKeyword = req.query.query as string;
        // 使用正则进行不区分大小写的模糊搜索
        // ⚠️ 请根据你的 Mongoose Schema，把 'originalName' 替换为你实际存储文件名的字段（比如 'name' 或 'filename'）
        filter.name = { $regex: searchKeyword, $options: "i" };
        // 💡 扩展提示：如果你想同时搜索文件名和后缀，可以使用 $or：
        filter.$or = [
          { name: { $regex: searchKeyword, $options: "i" } },
          { format: { $regex: searchKeyword, $options: "i" } },
        ];
      }

      // 处理阶段筛选 (排除掉 'all' 的情况)
      // 处理宏观阶段筛选
      if (req.query.stage && req.query.stage !== "all") {
        const stage = req.query.stage as string;

        switch (stage) {
          case "stage_uploaded":
            // 包含刚上传和上传失败的
            filter.stage = { $in: ["uploaded", "uploaded_failed"] };
            break;

          case "stage_quality":
            // 🌟 体检阶段：包含所有跟 quality 相关的枚举
            filter.stage = {
              $in: [
                "quality_pending",
                "quality_analyzing",
                "quality_done",
                "quality_failed",
              ],
            };
            break;

          case "stage_cleaning":
            // 🌟 清洗阶段：包含所有跟 cleaning 相关的枚举
            filter.stage = {
              $in: [
                "cleaning_pending",
                "cleaning_processing",
                "cleaning_done",
                "cleaning_failed",
              ],
            };
            break;

          case "stage_analysis":
            // 🌟 分析阶段：包揽分析的生老病死
            filter.stage = {
              $in: [
                "analysis_pending",
                "analysis_processing",
                "analysis_done",
                "analysis_failed",
              ],
            };
            break;

          case "stage_ai":
            filter.stage = {
              $in: ["ai_pending", "ai_generating", "ai_done", "ai_failed"],
            };
            break;
        }
      }

      // 🛠️ 核心修复 2：把 filter 传给 Service
      const result = await fileService.getAllFiles(query, filter);

      return responseUtils.success(res, result, "获取文件列表成功");
    } catch (error) {
      next(error);
    }
  },

  /**
   * 获取详情
   */
  async getFileById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const file = await fileService.getFileById(id);

      // ⚠️ 修复：传入 file 数据
      return responseUtils.success(res, file, "获取文件详情成功");
    } catch (error) {
      next(error);
    }
  },

  /**
   * 更新文件（对外接口：只允许改 name）
   */
  async updateFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // 只允许 name
      const allowedKeys = new Set(["name"]);
      const bodyKeys = Object.keys(req.body ?? {});
      const forbidden = bodyKeys.filter((k) => !allowedKeys.has(k));

      if (forbidden.length > 0) {
        return responseUtils.fail(
          res,
          `Forbidden fields: ${forbidden.join(", ")}`,
          400,
        );
      }

      const nameRaw = req.body?.name;

      // 没有传 name，或者 name 不是 string
      if (nameRaw === undefined) {
        return responseUtils.fail(res, "name is required", 400);
      }
      if (typeof nameRaw !== "string") {
        return responseUtils.fail(res, "name must be a string", 400);
      }

      const name = nameRaw.trim();
      if (name.length === 0) {
        return responseUtils.fail(res, "name cannot be empty", 400);
      }
      if (name.length > 128) {
        return responseUtils.fail(res, "name is too long (max 128)", 400);
      }

      // 调用新的 public 方法（只更新 name）
      const updatedFile = await fileService.updateFilePublic(id, { name });

      return responseUtils.success(res, updatedFile, "更新文件成功");
    } catch (error) {
      next(error);
    }
  },

  async deleteFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) return responseUtils.fail(res, "文件 ID 必填", 400);

      const deletedFile = await fileService.hardDeleteFile(id);
      return responseUtils.success(res, deletedFile, "删除文件成功");
    } catch (error) {
      next(error);
    }
  },
};
