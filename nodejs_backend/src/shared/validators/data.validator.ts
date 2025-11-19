// src/common/validators/dataValidator.ts
import { ValidationException } from "../exceptions/validation.exception";

export class DataValidator {
  static ensureNonEmpty(value: unknown, fieldName: string) {
    if (value === undefined || value === null || value === "") {
      throw new ValidationException(`${fieldName} 不能为空`);
    }
  }

  static ensurePositiveNumber(value: unknown, fieldName: string) {
    const num = Number(value);
    if (isNaN(num) || num <= 0) {
      throw new ValidationException(`${fieldName} 必须是正整数`);
    }
  }

  static ensureInRange(
    value: number,
    min: number,
    max: number,
    fieldName: string
  ) {
    if (value < min || value > max) {
      throw new ValidationException(`${fieldName} 必须在 ${min}~${max} 之间`);
    }
  }

  static ensureArray(value: unknown, fieldName: string) {
    if (!Array.isArray(value)) {
      throw new ValidationException(`${fieldName} 必须为数组`);
    }
  }
}
