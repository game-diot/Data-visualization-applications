import { Router } from "express";
import { generateInsightStream } from "../controller/ai.controller"; // 替换为你刚才写 Controller 的真实路径

const AIrouter = Router();

// 🚀 挂载流式解析接口
// POST /api/v1/ai/insight/stream
AIrouter.post("/insight/stream", generateInsightStream);

export default AIrouter;
