import cors, { CorsOptions } from "cors";

// 可允许的前端域名列表
const allowedOrigins = [
  "http://localhost:3000", // React 开发环境
  "http://127.0.0.1:3000",
  // 生产环境可以加你部署的前端域名
  // "https://your-frontend-domain.com",
];

// CORS 配置
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // origin 为 undefined 时（Postman / curl / server-side requests）允许通过
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Authorization",
  ],
  credentials: true, // 允许携带 cookie
  preflightContinue: false, // 预检请求由 cors 处理
};

// 导出中间件
export const corsMiddleware = cors(corsOptions);
