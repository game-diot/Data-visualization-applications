// src/app/utils/logger.js
import winston from 'winston';

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level}: ${message}`;
});

const logger = winston.createLogger({
    level: 'info', // 默认日志级别
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        colorize(), // 彩色输出（控制台）
        logFormat
    ),
    transports: [
        new winston.transports.Console(), // 控制台输出
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }), // 错误日志
        new winston.transports.File({ filename: 'logs/combined.log' }) // 所有日志
    ]
});

export default logger;
