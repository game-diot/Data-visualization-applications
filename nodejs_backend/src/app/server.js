import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "../database/connection.js";
import { apiRouter } from "./routes/index.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { requestLogger } from "./middleware/logger.middleware.js";


const app = express();


const env = process.env.NODE_ENV || "development";
dotenv.config({
  path: `.env.${env}`,
});
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: "http://localhost:5173",
    method: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type","Authorization"],
}))


app.use(requestLogger);

app.use(express.json());
app.use("/api", apiRouter);

app.use(errorHandler);

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🟢 DataV后端服务URL为localhost：${PORT}`);
  });
};

startServer();
