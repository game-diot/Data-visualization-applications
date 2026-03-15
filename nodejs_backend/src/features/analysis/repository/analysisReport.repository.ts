import mongoose from "mongoose";
import { IAnalysisReport } from "../models/interface/analysisReport.interface";
import { AnalysisReportModel } from "../models/analysisReport.model";

export class AnalysisReportRepository {
  async create(data: Partial<IAnalysisReport>): Promise<IAnalysisReport> {
    return AnalysisReportModel.create(data);
  }

  /**
   * 精确获取指定版本（用于回溯/对比）
   */
  async findByVersion(
    fileId: mongoose.Types.ObjectId,
    qualityVersion: number,
    cleaningVersion: number,
    analysisVersion: number,
  ): Promise<IAnalysisReport | null> {
    return AnalysisReportModel.findOne({
      fileId,
      qualityVersion,
      cleaningVersion,
      analysisVersion,
    }).lean();
  }

  /**
   * 获取输入版本组下的所有报告（列表页）
   */
  async listByInputVersion(
    fileId: mongoose.Types.ObjectId,
    qualityVersion: number,
    cleaningVersion: number,
  ): Promise<IAnalysisReport[]> {
    return AnalysisReportModel.find({
      fileId,
      qualityVersion,
      cleaningVersion,
    })
      .sort({ analysisVersion: -1 })
      .lean();
  }

  /**
   * 通过 taskId 获取报告（status 聚合用）
   */
  async findByTaskId(
    taskId: mongoose.Types.ObjectId,
  ): Promise<IAnalysisReport | null> {
    return AnalysisReportModel.findOne({ taskId }).lean();
  }

  /**
   * ✅ 版本分配：只从成功产物 Report 计算 max+1
   * 规则：analysisVersion = Max(report.analysisVersion)+1
   */
  async getNextAnalysisVersion(
    fileId: mongoose.Types.ObjectId,
    qualityVersion: number,
    cleaningVersion: number,
  ): Promise<number> {
    const last = await AnalysisReportModel.findOne({
      fileId,
      qualityVersion,
      cleaningVersion,
    })
      .sort({ analysisVersion: -1 })
      .select("analysisVersion")
      .lean();

    return (last?.analysisVersion || 0) + 1;
  }

  /**
   * 🚀 专门用于更新特定图表的 AI 洞察结果
   * 精确打击：只更新对应 report 下、特定 chartId 的图表节点
   */
  async updateChartAIInsight(
    fileId: mongoose.Types.ObjectId | string,
    qualityVersion: number,
    cleaningVersion: number,
    analysisVersion: number,
    chartId: string,
    aiInsight: string,
  ): Promise<boolean> {
    const result = await AnalysisReportModel.updateOne(
      {
        fileId: new mongoose.Types.ObjectId(fileId.toString()), // 确保转为 ObjectId
        qualityVersion,
        cleaningVersion,
        analysisVersion,
        "charts.id": chartId, // 🎯 精准匹配 charts 数组中 id 为 chartId 的对象
      },
      {
        $set: {
          "charts.$.aiInsight": aiInsight, // $ 代表上面匹配到的那一个具体的 chart
          "charts.$.aiStatus": "success",
        },
      },
    );

    // 如果修改数量 > 0，说明成功找到并更新了数据
    return result.modifiedCount > 0;
  }
}

export const analysisReportRepository = new AnalysisReportRepository();
