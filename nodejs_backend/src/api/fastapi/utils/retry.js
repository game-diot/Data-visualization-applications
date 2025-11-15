import { logger } from "./logger.js";
import { FastAPITimeoutError, FastAPIError } from "./errors.js";

export async function retryRequest(fn, retries = 3) {
  let attempt = 0;

  while (attempt < retries) {
    try {
      attempt++;
      return await fn();
    } catch (err) {
      const isTimeout = err.code === "ECONNABORTED";
      const is5xx = err.response?.status >= 500;

      logger.error(`FastAPI 请求失败（第 ${attempt} 次）: ${err.message}`);

      if ((isTimeout || is5xx) && attempt < retries) {
        const delay = Math.pow(2, attempt) * 300;
        logger.info(`等待 ${delay}ms 后重试...`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      if (isTimeout) throw new FastAPITimeoutError("FastAPI 请求超时");
      throw new FastAPIError(err.message);
    }
  }
}
