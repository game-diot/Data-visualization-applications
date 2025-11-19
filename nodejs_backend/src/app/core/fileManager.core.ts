// src/app/core/fileManager.core.ts
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const uploadDir = path.join(ROOT, "uploads");

export const fileManager = {
  ensureUploadDir() {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  },

  saveFile(filePath: string, buffer: Buffer) {
    fs.writeFileSync(filePath, buffer);
  },

  deleteFile(filePath: string) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  },

  exists(filePath: string): boolean {
    return fs.existsSync(filePath);
  },
};
