export interface UpdateFileDTO {
  name?: string;
  storedName?: string;
  path?: string;
  size?: number;
  type?: string;
  totalRows?: number;
  totalCols?: number;
  stage?: "uploaded" | "parsed" | "processed";
}
