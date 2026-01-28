export interface RowRangeDTO {
  start: number;
  end: number;
}

export type Filterop = "==" | "!=" | ">=" | "<=" | ">" | "<" | "in";

export interface FilterDTO {
  column: string;
  op: Filterop;
  value: any;
}

export interface SampleDTO {
  enabled: boolean;
  n?: number;
  frac?: number;
  randomSeed?: number;
}

/**
 * DataSelection:
 * - columns: null/undefined means ALL columns
 * - columns: [] is invalid (should be rejected by validator)
 * - rows.end is exclusive
 */

export interface DataSelectionDTO {
  rows?: RowRangeDTO | null;
  columns?: string[] | null;
  filters?: FilterDTO[];
  sample?: SampleDTO;
}
