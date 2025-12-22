/**
 * 数组操作工具集
 * 职责：提供通用的数组处理方法，如分块、去重、分组
 */
export const arrayUtils = {
  /**
   * 数组分块 (用于批量数据库操作)
   * @param arr 源数组
   * @param size 每个块的大小 (必须大于 0)
   * @example chunk([1,2,3,4,5], 2) => [[1,2], [3,4], [5]]
   */
  chunk<T>(arr: T[], size: number): T[][] {
    // 🛑 防御性检查：防止死循环
    if (size < 1) {
      throw new Error("Batch size must be greater than 0");
    }

    // 如果数组为空，直接返回空数组
    if (!arr || arr.length === 0) {
      return [];
    }

    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  },

  /**
   * 对象数组去重 (用于数据清洗)
   * @param arr 源数组
   * @param keySelector 唯一键生成器
   * @example uniqueBy(users, u => u.id)
   */
  uniqueBy<T>(arr: T[], keySelector: (item: T) => string | number): T[] {
    if (!arr || arr.length === 0) return [];

    const map = new Map();
    arr.forEach((item) => {
      const key = keySelector(item);
      // 只保留第一次出现的元素
      if (!map.has(key)) {
        map.set(key, item);
      }
    });
    return Array.from(map.values());
  },

  /**
   * 数组分组 (用于数据分析/聚合)
   * @param arr 源数组
   * @param keySelector 分组键生成器
   * @example groupBy(students, s => s.classId)
   */
  groupBy<T>(
    arr: T[],
    keySelector: (item: T) => string | number
  ): Record<string, T[]> {
    if (!arr || arr.length === 0) return {};

    return arr.reduce((groups, item) => {
      const key = keySelector(item);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {} as Record<string | number, T[]>);
  },
};
