// src/common/validators/commonValidator.ts
import { ValidationException } from "../exceptions/validation.exception";

export class CommonValidator {
  /**
   * 必填项校验
   */
  static isRequired(value: unknown, fieldName: string) {
    if (value === undefined || value === null || value === "") {
      throw new ValidationException({
        field: fieldName,
        message: `${fieldName} 不能为空`,
      });
    }
  }

  static isString(value: unknown, fieldName: string) {
    if (typeof value !== "string") {
      throw new ValidationException({
        field: fieldName,
        message: `${fieldName} 必须是字符串`,
      });
    }
  }

  static isNumber(value: unknown, fieldName: string) {
    if (typeof value !== "number" || isNaN(value)) {
      throw new ValidationException({
        field: fieldName,
        message: `${fieldName} 必须是数字`,
      });
    }
  }

  static isEmail(value: unknown, fieldName = "邮箱") {
    // 先确保是字符串，防止 .test 报错
    if (typeof value !== "string") {
      throw new ValidationException({
        field: fieldName,
        message: `${fieldName} 格式无效`,
      });
    }

    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailReg.test(value)) {
      throw new ValidationException({
        field: fieldName,
        message: `${fieldName} 格式不合法`,
      });
    }
  }

  static isDate(value: unknown, fieldName = "日期") {
    // 允许 string 或 number 转日期
    if (typeof value !== "string" && typeof value !== "number") {
      throw new ValidationException({
        field: fieldName,
        message: `${fieldName} 格式不正确`,
      });
    }
    const d = new Date(value);
    if (isNaN(d.getTime())) {
      throw new ValidationException({
        field: fieldName,
        message: `${fieldName} 格式不正确`,
      });
    }
  }

  static minLength(value: unknown, min: number, fieldName: string) {
    // 安全检查：如果不是字符串，直接抛错，避免 crash
    if (typeof value !== "string" || value.length < min) {
      throw new ValidationException({
        field: fieldName,
        message: `${fieldName} 长度不能少于 ${min}`,
      });
    }
  }

  static maxLength(value: unknown, max: number, fieldName: string) {
    if (typeof value !== "string" || value.length > max) {
      throw new ValidationException({
        field: fieldName,
        message: `${fieldName} 长度不能大于 ${max}`,
      });
    }
  }
}
