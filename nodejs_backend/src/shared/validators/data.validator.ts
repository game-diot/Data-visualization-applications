// src/common/validators/dataValidator.ts
import { ValidationException } from "../exceptions/validation.exception";

export class DataValidator {
  // 1. 移除了 ensureNonEmpty，建议复用 CommonValidator.isRequired，避免重复造轮子

  /**
   * 确保是正整数 (例如分页参数、ID等)
   * 修复：增加了 Number.isInteger 检查
   */
  static ensurePositiveInt(value: unknown, fieldName: string) {
    const num = Number(value);
    // 必须是数字，必须是整数，且必须大于 0
    if (isNaN(num) || !Number.isInteger(num) || num <= 0) {
      throw new ValidationException({
        field: fieldName,
        message: `${fieldName} 必须是正整数`,
      });
    }
  }

  /**
   * 确保是正数 (包含小数，例如金额、权重)
   */
  static ensurePositiveNumber(value: unknown, fieldName: string) {
    const num = Number(value);
    if (isNaN(num) || num <= 0) {
      throw new ValidationException({
        field: fieldName,
        message: `${fieldName} 必须是正数`,
      });
    }
  }

  /**
   * 范围检查
   * 优化：入参类型改为 unknown，内部先转数字，防止 crash
   */
  static ensureInRange(
    value: unknown,
    min: number,
    max: number,
    fieldName: string
  ) {
    const num = Number(value);
    if (isNaN(num) || num < min || num > max) {
      throw new ValidationException({
        field: fieldName,
        message: `${fieldName} 必须在 ${min}~${max} 之间`,
      });
    }
  }

  static ensureArray(value: unknown, fieldName: string) {
    if (!Array.isArray(value)) {
      throw new ValidationException({
        field: fieldName,
        message: `${fieldName} 必须为数组`,
      });
    }
    // 可选：检查空数组
    if (value.length === 0) {
      throw new ValidationException({
        field: fieldName,
        message: `${fieldName} 不能为空数组`,
      });
    }
  }
}
