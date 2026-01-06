import { EventEmitter } from "events";
import { IAnalysisError } from "features/file/models/interface/ianalysisError.interface";
import { IQualityAnalysisResult } from "features/quality/models/interface/quality-result.interface";

/**
 * 1. 定义事件映射表 (Type Map)
 * key: 事件名称
 * value: 事件携带的数据 (Payload)
 * * 以后新增事件，只需要在这里添加一行定义，全项目都会有自动提示
 */
export type AppEventMap = {
  // ===== File 模块事件 =====
  FILE_UPLOADED: {
    fileId: string;
    filePath: string;
    userId?: string;
  };

  FILE_SOFT_DELETED: {
    fileId: string;
  };

  FILE_HARD_DELETED: {
    fileId: string;
  };

  // ===== Quality 模块事件 (未来扩展) =====
  QUALITY_ANALYSIS_STARTED: { fileId: string };
  QUALITY_ANALYSIS_COMPLETED: {
    fileId: string;
    result: IQualityAnalysisResult;
    version: number; // ✅ 必须带上版本号
  };
  QUALITY_ANALYSIS_FAILED: { fileId: string; error: IAnalysisError };
};

/**
 * 2. 强类型 EventBus 类
 * 继承原生 EventEmitter，但重写了 emit 和 on 方法以支持类型检查
 */
class TypedEventBus extends EventEmitter {
  // 重写 emit：只能发送 Map 里定义的事件，且 payload 必须匹配
  emit<K extends keyof AppEventMap>(
    event: K,
    payload: AppEventMap[K]
  ): boolean {
    return super.emit(event, payload);
  }

  // 重写 on：监听回调函数的参数会自动获得类型推导
  on<K extends keyof AppEventMap>(
    event: K,
    listener: (payload: AppEventMap[K]) => void
  ): this {
    return super.on(event, listener);
  }
}

// 3. 导出单例
export const eventBus = new TypedEventBus();

// 设置最大监听器数量 (防止内存泄漏警告)
eventBus.setMaxListeners(20);
