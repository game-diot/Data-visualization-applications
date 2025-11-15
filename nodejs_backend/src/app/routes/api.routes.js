import express from "express";
import fileRouter from "../../modules/file-upload/routes/files.routes.js";
const router = express.Router();

router.use("/files", fileRouter);

export default router;
