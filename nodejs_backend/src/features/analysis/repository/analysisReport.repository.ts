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
}

export const analysisReportRepository = new AnalysisReportRepository();
