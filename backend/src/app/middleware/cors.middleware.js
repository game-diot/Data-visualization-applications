// src/app/middleware/cors.middleware.js
import cors from 'cors';

const allowedOrigins = [
    'http://localhost:3000', // React 开发环境
    'http://127.0.0.1:3000',
    // 生产环境可以加你部署的前端域名，比如：
    // 'https://your-frontend-domain.com'
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true // 允许携带 cookie
};

export default cors(corsOptions);
