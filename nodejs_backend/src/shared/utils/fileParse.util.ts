import fs from "fs/promises";
import path from "path";
import { parse } from "csv-parse/sync"; // CSV 解析本身很快，可以用 Sync 模式处理 Buffer
import * as XLSX from "xlsx";
import { BaseException } from "../exceptions/base.exception";
import { ERROR_CODES } from "../constants/error.constant";
import { HTTP_STATUS } from "../constants/http.constant";

/**
 * 文件解析工具集
 * 职责：将 CSV/Excel 文件读取并解析为 JSON 对象数组
 */
export const fileParseUtils = {
  /**
   * 解析文件主入口
   * @param filePath 文件物理路径
   * @returns 解析后的对象数组
   */
  async parse(filePath: string): Promise<any[]> {
    // 1. 检查文件是否存在
    try {
      await fs.access(filePath);
    } catch {
      throw new BaseException(
        "文件不存在或已被删除",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.FILE_NOT_FOUND
      );
    }

    const ext = path.extname(filePath).toLowerCase();

    try {
      // 2. 根据后缀分发处理
      if (ext === ".csv") {
        return await this.parseCsv(filePath);
      } else if (ext === ".xlsx" || ext === ".xls") {
        return await this.parseExcel(filePath);
      } else {
        throw new BaseException(
          `不支持的文件格式: ${ext}`,
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.FILE_TYPE_NOT_ALLOWED
        );
      }
    } catch (error: any) {
      // 3. 捕获解析过程中的具体错误 (如格式损坏)
      if (error instanceof BaseException) {
        throw error;
      }
      throw new BaseException(
        `文件解析失败: ${error.message}`,
        HTTP_STATUS.UNPROCESSABLE_ENTITY, // 422 无法处理的内容
        ERROR_CODES.FILE_PARSE_ERROR,
        { originalError: error.message }
      );
    }
  },

  /**
   * 解析 CSV
   */
  async parseCsv(filePath: string): Promise<any[]> {
    // 异步读取文件内容 (I/O 不阻塞)
    const fileContent = await fs.readFile(filePath);

    // 解析 Buffer
    return parse(fileContent, {
      columns: true, // 第一行作为 Key
      skip_empty_lines: true, // 跳过空行
      trim: true, // 去除单元格空格
    });
  },

  /**
   * 解析 Excel
   */
  async parseExcel(filePath: string): Promise<any[]> {
    // 异步读取文件 Buffer
    const fileContent = await fs.readFile(filePath);

    // XLSX read 也可以处理 Buffer
    const workbook = XLSX.read(fileContent, { type: "buffer" });

    // 默认读取第一个 Sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error("Excel 文件中没有工作表");
    }

    const sheet = workbook.Sheets[sheetName];

    // 转换为 JSON
    return XLSX.utils.sheet_to_json(sheet);
  },
};
