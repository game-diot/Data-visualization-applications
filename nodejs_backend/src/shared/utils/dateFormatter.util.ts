/**
 * 日期时间工具集
 * 职责：提供统一的日期格式化标准，处理时区显示问题
 * 💡 注意：如果涉及复杂的日期计算 (如: "下周三"、"3天前")，建议引入 dayjs 库
 */
export const dateUtils = {
  /**
   * 格式化日期
   * @param date Date对象 / 时间戳 / 字符串
   * @param pattern 格式模板 (默认 YYYY-MM-DD HH:mm:ss)
   */
  format(
    date: Date | number | string | undefined,
    pattern = "YYYY-MM-DD HH:mm:ss"
  ): string {
    if (!date) return "-";

    const d = new Date(date);

    // 🛑 防御：检查是否为有效日期
    if (isNaN(d.getTime())) {
      return "Invalid Date";
    }

    const pad = (n: number) => n.toString().padStart(2, "0");

    const replacements: Record<string, string> = {
      YYYY: d.getFullYear().toString(),
      MM: pad(d.getMonth() + 1),
      DD: pad(d.getDate()),
      HH: pad(d.getHours()),
      mm: pad(d.getMinutes()),
      ss: pad(d.getSeconds()),
    };

    // 使用正则全局替换
    return pattern.replace(
      /YYYY|MM|DD|HH|mm|ss/g,
      (match) => replacements[match]
    );
  },

  /**
   * 生成适合作为文件名的当前时间戳
   * ✅ 场景：导出 Excel 报表时生成文件名
   * ❌ 格式：YYYYMMDD_HHmmss (不含冒号等非法字符)
   * @example report_20231201_143000.xlsx
   */
  formatForFileName(prefix = "file"): string {
    const now = new Date();
    const timeStr = this.format(now, "YYYYMMDD_HHmmss");
    return `${prefix}_${timeStr}`;
  },

  /**
   * 获取当前时间 (方便后续如果需要统一处理时区，改这里即可)
   */
  now(): Date {
    return new Date();
  },
};
