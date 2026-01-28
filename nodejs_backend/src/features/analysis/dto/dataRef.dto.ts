export type DataRefType = "local_file" | "s3" | "oss";

export type DataRefFormat = "csv" | "xlsx" | "parquet" | "json";

export interface DataRefDTO {
  type: DataRefType;
  path: string;
  format: DataRefFormat;

  encoding?: string;
  delimiter?: string | null;
  sheetName?: string | null;
}
