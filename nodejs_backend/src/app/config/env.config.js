// src/config/config.js
import dotenv from 'dotenv';
import path from 'path';

// 根据环境加载不同的 .env 文件
const envFile =
    process.env.NODE_ENV === 'production'
        ? '.env.production'
        : '.env.development';

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const config = {
    env: process.env.NODE_ENV,
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET
};

export default config;
