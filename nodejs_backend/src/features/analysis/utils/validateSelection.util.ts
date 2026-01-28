import { BadRequestException } from "@shared/exceptions/badRequest.exception";
import type { DataSelectionDTO } from "../dto/dataSelection.dto";

export function validateSelectionOrThrow(selection: DataSelectionDTO) {
  if (!selection) return;

  // 1) rows 校验（end exclusive）
  const rows = selection.rows ?? null;
  if (rows) {
    const { start, end } = rows;

    if (!Number.isInteger(start) || !Number.isInteger(end)) {
      throw new BadRequestException("rows.start and rows.end must be integers");
    }
    if (start < 0) {
      throw new BadRequestException("rows.start must be >= 0");
    }
    // end is exclusive => must be > start
    if (end <= start) {
      throw new BadRequestException(
        "rows.end must be > rows.start (end is exclusive)",
      );
    }
  }

  // 2) columns 校验（null => all columns, [] => invalid）
  // undefined / null: 表示全列
  if (selection.columns !== undefined && selection.columns !== null) {
    if (!Array.isArray(selection.columns)) {
      throw new BadRequestException(
        "columns must be an array of strings or null",
      );
    }
    if (selection.columns.length === 0) {
      throw new BadRequestException(
        "columns cannot be empty array; use null for all columns",
      );
    }
    for (const col of selection.columns) {
      if (typeof col !== "string" || col.trim() === "") {
        throw new BadRequestException("columns must be non-empty strings");
      }
    }
  }

  // 3) MVP：filters/sample 预留但不支持（可选放这里统一拒绝）
  if (selection.filters && selection.filters.length > 0) {
    throw new BadRequestException("filters is not supported in MVP");
  }
  if (selection.sample && selection.sample.enabled) {
    throw new BadRequestException("sample is not supported in MVP");
  }
}
