import express from "express";
import router from "./routes/index.js";
import {errorHandler} from "./middleware/error.middleware.js";
import {notFound} from "./middleware/notFound.middleware.js";
import logger from "./utils/logger.js";
import morgan from "morgan";
import corsMiddleware from "./middleware/cors.middleware.js";
import cors from "cors";
import limiter from "./middleware/rate-limit.middleware.js";
import helmet from "helmet";


const app = express();

app.use(morgan('combined',{
    stream:{
        write:(message)=>{logger.info(message.trim())}
    }
}));
//JSON解析
app.use(express.json());

app.use(limiter); // 全局使用频率限制
app.use(helmet());

app.use(cors());

app.use('/api',router)

app.use(notFound);

app.use(errorHandler);

export default app;