import { Request, Response, NextFunction } from "express";
import { cleaningQueryService } from "../service/cleaningQuery.service";
import { responseUtils } from "../../../shared/utils/response.util";
import fs from "fs";
export const cleaningQueryController = {
  /**
   * GET /api/v1/cleaning/:fileId/status
   */
  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.params;
      const qVer = req.query.qualityVersion
        ? Number(req.query.qualityVersion)
        : undefined;

      const result = await cleaningQueryService.getCleaningStatus(fileId, qVer);
      return responseUtils.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/cleaning/:fileId/reports
   */
  async listReports(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.params;
      // 列表接口通常强制要求 qualityVersion，或者也可以默认最新
      const qVer = Number(req.query.qualityVersion);

      if (isNaN(qVer)) {
        return responseUtils.fail(res, "qualityVersion is required", 400);
      }

      const result = await cleaningQueryService.listReports(fileId, qVer);
      return responseUtils.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/cleaning/:fileId/reports/:version
   */
  async getReportDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId, version } = req.params;
      const qVer = Number(req.query.qualityVersion);

      if (isNaN(qVer)) {
        return responseUtils.fail(res, "qualityVersion is required", 400);
      }

      const result = await cleaningQueryService.getReportDetail(
        fileId,
        qVer,
        Number(version),
      );
      return responseUtils.success(res, result);
    } catch (error) {
      next(error);
    }
  },
  /**
   * 预览清洗产物 (返回 CSV 文本流)
   * 路由: GET /:fileId/quality/:qualityVersion/cleaning/:cleaningVersion/preview
   */
  async previewCleanedData(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId, qualityVersion, cleaningVersion } = req.params;

      // 1. 调用你刚发给我的 Service 方法，获取 Report 详情
      const report = await cleaningQueryService.getReportDetail(
        fileId,
        parseInt(qualityVersion, 10),
        parseInt(cleaningVersion, 10),
      );

      // 2. 校验产物引用是否存在
      if (!report.cleanedAsset || !report.cleanedAsset.path) {
        // 遵守规范：不抛异常，而是返回友好的 HTTP 状态
        return res.status(404).json({
          status: "error",
          code: 404,
          message: "该版本的清洗产物路径记录不存在",
        });
      }

      const filePath = report.cleanedAsset.path;

      // 3. 校验物理磁盘上的文件是否真的存在
      // 注意：这里需要确保 Node.js 进程对该路径有读取权限 (特别是在 Docker 挂载卷的场景下)
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          status: "error",
          code: 404,
          message: "物理产物文件已丢失或不在服务器挂载目录内",
        });
      }

      // 4. 设置极其关键的 Response Headers
      // 告诉前端：“准备好，我要发一段 UTF-8 编码的 CSV 纯文本过来了！”
      res.setHeader("Content-Type", "text/csv; charset=utf-8");

      // 5. 🚀 核心性能优化：使用流 (Stream) 管道，坚决不把文件读进 Node.js 内存！
      const readStream = fs.createReadStream(filePath);

      // 如果读取过程中磁盘发生意外错误，做个兜底防崩溃
      readStream.on("error", (err) => {
        if (!res.headersSent) {
          res
            .status(500)
            .json({ status: "error", code: 500, message: "文件流读取失败" });
        }
      });

      // 管道对接，直接将磁盘流导向 HTTP 响应流
      readStream.pipe(res);
    } catch (error) {
      // 走全局异常处理中间件 (比如处理 FileNotFoundException)
      next(error);
    }
  },
};
