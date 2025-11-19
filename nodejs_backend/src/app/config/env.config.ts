import dotenv from "dotenv";
import path from "path";

// 根据环境加载不同的 .env 文件
const envFile: string =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// 定义配置接口
interface IConfig {
  env: string | undefined;
  port: number;
  mongoUri: string | undefined;
  jwtSecret: string | undefined;
}

export const config: IConfig = {
  env: process.env.NODE_ENV,
  port: process.env.PORT ? Number(process.env.PORT) : 5000,
  // 🚀 关键修改：使用 MONGODB_URL
  mongoUri: process.env.MONGODB_URL,
  jwtSecret: process.env.JWT_SECRET,
};
