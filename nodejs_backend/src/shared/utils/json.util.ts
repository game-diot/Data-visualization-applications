/**
 * JSON 容错处理工具
 * 职责：安全地解析和序列化 JSON，防止因格式错误或特殊类型 (BigInt) 导致程序崩溃
 */
export const jsonUtils = {
  /**
   * 安全解析 JSON
   * @param value JSON 字符串
   * @param fallback 解析失败时的默认值
   */
  parse<T>(value: string, fallback: T): T {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  },

  /**
   * 安全序列化 JSON
   * ✅ 特性：自动处理 BigInt (转为字符串)，防止 TypeError
   * @param value 要序列化的对象
   * @returns 序列化后的字符串，失败返回 "{}"
   */
  stringify(value: any): string {
    try {
      return JSON.stringify(value, (key, val) => {
        // 处理 BigInt: JSON 标准不支持 BigInt，直接序列化会报错
        // 策略：将其转换为字符串 (多数前端组件能兼容)
        if (typeof val === "bigint") {
          return val.toString();
        }
        return val;
      });
    } catch (error) {
      // 捕获循环引用 (Circular Structure) 等错误
      // 生产环境可以考虑在这里上报日志，但为了 safe 这里的确应该静默处理
      return "{}";
    }
  },
};
