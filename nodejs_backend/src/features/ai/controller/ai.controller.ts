// ai.controller.ts
import { Request, Response } from "express";
import { analysisReportRepository } from "features/analysis/repository/analysisReport.repository";
import OpenAI from "openai";

// 🚀 1. 实例化通用的 OpenAI 客户端（挂载国内免费模型的 BaseURL 和 Key）
const openai = new OpenAI({
  apiKey: process.env.LLM_API_KEY,
  baseURL: process.env.LLM_BASE_URL,
});

export const generateInsightStream = async (req: Request, res: Response) => {
  try {
    // 解析前端传来的 001 契约数据
    const {
      fileId,
      qualityVersion,
      cleaningVersion,
      analysisVersion,
      chartId,
      analysisType,
      chartDataSummary,
    } = req.body;

    // 🚀 2. 建立 SSE (Server-Sent Events) 流式连接响应头
    // 这是让前端实现“打字机”效果的核心魔法！
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    // 如果存在代理（如 Nginx），这行可以防止代理缓冲，确保字符立刻发给前端
    res.setHeader("X-Accel-Buffering", "no");

    // 🚀 3. 组装 System Prompt (赋予 AI 数据分析师灵魂)
    const systemPrompt = `
      你是一名资深首席数据分析师。你的任务是根据图表统计结果，生成通俗易懂的数据洞察。
      要求：
      1. 严禁编造数据，严格基于用户提供的 JSON 摘要分析。
      2. 直奔主题，解释最重要的数值或关系（如强相关、极端分布）。
      3. 结合常识推测可能的原因。
      4. 给出1-2条后续的业务或分析建议。
      5. 使用 Markdown 格式排版，总字数严格控制在 200 字以内，不要输出任何寒暄语。
    `;

    const userPrompt = `
      当前分析类型：${analysisType}
      图表数据摘要：${JSON.stringify(chartDataSummary)}
    `;

    // 🚀 4. 发起大模型流式请求 (stream: true 是关键)
    const stream = await openai.chat.completions.create({
      model: process.env.LLM_MODEL || "glm-4-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      stream: true, // 开启流式传输
      temperature: 0.7, // 稍微发散一点，让分析不那么死板
    });

    let fullContent = ""; // 在内存里暂存完整的回答，为了最后的落盘保存

    // 🚀 5. 监听并透传数据流给前端
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || "";
      if (text) {
        fullContent += text;
        // 把数据按照 SSE 标准格式发给前端：以 "data: " 开头，以 "\n\n" 结尾
        res.write(`data: ${JSON.stringify({ text })}\n\n`);

        // 🚀 核心修复：使用 (res as any) 绕过 TypeScript 的静态类型检查，
        // 但保留 typeof 的运行时安全检查！
        if (typeof (res as any).flush === "function") {
          (res as any).flush();
        }
      }
    }

    // 🚀 6. 流式传输结束：向前端发送结束信号
    res.write("data: [DONE]\n\n");
    res.end();

    // ==========================================
    // 🌟 隐藏关卡：将最终完整的 AI 洞察存入 MongoDB 永久资产化！
    // ==========================================
    if (fullContent) {
      console.log(
        `[AI Insight] 流式输出完成，准备写入数据库... ChartId: ${chartId}`,
      );

      try {
        // 🚀 调用 Repository 进行精准打击更新
        const isUpdated = await analysisReportRepository.updateChartAIInsight(
          fileId,
          qualityVersion,
          cleaningVersion,
          analysisVersion,
          chartId,
          fullContent,
        );

        if (isUpdated) {
          console.log(
            `✅ [AI Insight] 落盘成功！图表 ${chartId} 已永久固化 AI 洞察。`,
          );
        } else {
          console.warn(
            `⚠️ [AI Insight] 落盘警告：未找到对应的报告或图表 ${chartId}`,
          );
        }
      } catch (dbError) {
        console.error("❌ [AI Insight] 落盘 MongoDB 失败:", dbError);
      }
    }
  } catch (error: any) {
    console.error("[AI Insight Stream Error]", error);
    // 错误处理也必须通过 SSE 发送
    res.write(
      `data: ${JSON.stringify({ error: error.message || "AI 服务异常" })}\n\n`,
    );
    res.end();
  }
};
