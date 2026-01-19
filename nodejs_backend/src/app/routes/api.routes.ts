import { Router } from "express";
import { HTTP_STATUS } from "../../shared/constants/http.constant";

// ⚠️ 注意：我们需要在下一步创建这个文件，目前先写好引用路径
// 假设导出名为 fileRoutes
import { fileRouter } from "../../features/file/route/file.routes";
import { qualityRouter } from "features/quality/routes/quality.route";
import { cleaningRouter } from "features/cleaning/route/cleaning.route";

const router = Router();

// ==========================================
// 1. 系统基础路由 (Health Check)
// ==========================================
// 职责：供运维监控、Docker探针检查服务存活状态
router.get("/health", (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ==========================================
// 2. 业务模块路由挂载 (Feature Routes)
// ==========================================

// TODO: 等我们重构完 src/features/file 后，取消下面的注释
router.use("/files", fileRouter);
router.use("/quality", qualityRouter);
router.use("/cleaning", cleaningRouter);
export default router;
