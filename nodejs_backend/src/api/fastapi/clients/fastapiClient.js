import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { FastAPITimeoutError, FastAPIError } from "../utils/error.js";
import { logger } from "../../../shared/utils/logger.js";
import { retryRequest } from "../utils/retry.js";

// axios 实例（统一设置）
const api = axios.create({
  baseURL: process.env.FASTAPI_BASE_URL || "http://127.0.0.1:8000",
  timeout: 30000, // 30s
});

/* --------------------------------------------------------
 * 1. 提交文件，开始 FastAPI 异步分析任务（推荐模式）
 * --------------------------------------------------------
 */
export async function startAnalyzeTask(filePath, options = {}) {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));
  form.append("options", JSON.stringify(options));

  return retryRequest(async () => {
    try {
      logger.info(`向 FastAPI 提交任务: ${filePath}`);

      const res = await api.post("/api/v1/quality/analyze", form, {
        headers: form.getHeaders(),
      });

      logger.info(`FastAPI 返回 taskId: ${res.data.taskId}`);

      return res.data; // 这里应包含 taskId
    } catch (err) {
      logger.error(`提交任务失败: ${err.message}`);
      throw new FastAPIError("FastAPI analyze 任务提交失败", err);
    }
  });
}

/* --------------------------------------------------------
 * 2. 查询任务状态（轮询型）
 * --------------------------------------------------------
 */
export async function getTaskStatus(taskId) {
  return retryRequest(async () => {
    try {
      logger.debug(`查询 FastAPI 任务状态: ${taskId}`);

      const res = await api.get(`/api/v1/tasks/${taskId}`);

      return res.data;
    } catch (err) {
      logger.error(`查询任务失败: ${err.message}`);
      throw new FastAPIError("FastAPI 查询任务失败", err);
    }
  });
}

/* --------------------------------------------------------
 * 3. 获取预览数据
 * --------------------------------------------------------
 */
export async function getPreview(filePath, limit = 5) {
  return retryRequest(async () => {
    try {
      logger.info(`请求 preview 数据: ${filePath}`);

      const res = await api.post("/api/v1/quality/preview", {
        path: filePath,
        limit,
      });

      return res.data;
    } catch (err) {
      logger.error(`获取 preview 失败: ${err.message}`);
      throw new FastAPIError("FastAPI preview 失败", err);
    }
  });
}

/* --------------------------------------------------------
 * 4. 清除缓存
 * --------------------------------------------------------
 */
export async function clearCache(filePath) {
  return retryRequest(async () => {
    try {
      logger.info(`清除 FastAPI 缓存: ${filePath}`);

      const res = await api.post("/api/v1/quality/clear", {
        path: filePath,
      });

      return res.data;
    } catch (err) {
      logger.error(`清除缓存失败: ${err.message}`);
      throw new FastAPIError("FastAPI 缓存清除失败", err);
    }
  });
}
