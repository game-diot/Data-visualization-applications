import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import {connectDB} from "./config/database.config.js";
import logger from "./utils/logger.js";
import config from "./config/env.config.js";
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI||'mongodb://localhost:27017/data-visualization';

const startServer = async () => {
    await connectDB(MONGODB_URI);
    const server = app.listen(PORT,()=>{
        console.log(`Server started on port ${PORT}`);
    });

    process.on('SIGTERM', () => {
        console.log(`SIGTERM received,closing server ...`);
        server.close(()=>{
            console.log(`Server Closed`);
        });
    });

    process.on('SIGINT', () => {
        console.log(`SIGINT received,closing server ...`);
        server.close(()=>{
            console.log(`Server Closed`);
        });
    });
}
startServer()