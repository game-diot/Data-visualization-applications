// src/common/validators/commonValidator.ts
import { ValidationException } from "../exceptions/validation.exception";

export class CommonValidator {
  static isString(value: unknown, fieldName: string) {
    if (typeof value !== "string") {
      throw new ValidationException(`${fieldName} 必须是字符串`);
    }
  }

  static isNumber(value: unknown, fieldName: string) {
    if (typeof value !== "number" || isNaN(value)) {
      throw new ValidationException(`${fieldName} 必须是数字`);
    }
  }

  static isEmail(value: string, fieldName = "邮箱") {
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailReg.test(value)) {
      throw new ValidationException(`${fieldName} 格式不合法`);
    }
  }

  static isDate(value: string, fieldName = "日期") {
    const d = new Date(value);
    if (isNaN(d.getTime())) {
      throw new ValidationException(`${fieldName} 格式不正确`);
    }
  }

  static minLength(value: string, min: number, fieldName: string) {
    if (value.length < min) {
      throw new ValidationException(`${fieldName} 长度不能少于 ${min}`);
    }
  }

  static maxLength(value: string, max: number, fieldName: string) {
    if (value.length > max) {
      throw new ValidationException(`${fieldName} 长度不能大于 ${max}`);
    }
  }
}
