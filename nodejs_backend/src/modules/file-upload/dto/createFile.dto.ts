export interface CreateFileDTO {
  name: string; // 原始文件名
  storedName: string; // 存储在服务器的文件名
  path: string; // 文件路径
  size: number; // 文件大小
  type?: string; // 文件类型
  totalRows?: number;
  totalCols?: number;
  uploadTime?: Date;
  stage?: "uploaded" | "parsed" | "processed";
}
