import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100,
    message: { error: 'Too many requests, please try again later.' }
});

export default limiter;
