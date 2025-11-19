import fs from "fs";
import { parse } from "csv-parse/sync";
import * as XLSX from "xlsx";
import { DataParseException } from "../exceptions/dataParse.exception.js";

export const parseFile = (filePath: string): any[] => {
  if (!fs.existsSync(filePath)) {
    throw new DataParseException("文件不存在或已被删除");
  }

  try {
    if (filePath.endsWith(".csv")) {
      const buffer = fs.readFileSync(filePath);
      return parse(buffer, {
        columns: true,
        skip_empty_lines: true,
      });
    }

    if (filePath.endsWith(".xlsx") || filePath.endsWith(".xls")) {
      const workbook = XLSX.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      return XLSX.utils.sheet_to_json(sheet);
    }

    throw new DataParseException("不支持的文件格式");
  } catch (error) {
    throw new DataParseException("文件解析失败：" + error);
  }
};
