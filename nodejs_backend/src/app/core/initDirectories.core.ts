// src/app/core/initDirectories.core.ts
import fs from "fs";
import path from "path";

const dirs = ["logs", "uploads", "export", "temp"];

export const initDirectories = () => {
  dirs.forEach((dir) => {
    const full = path.join(process.cwd(), dir);
    if (!fs.existsSync(full)) {
      fs.mkdirSync(full, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
};
