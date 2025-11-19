import dotenv from "dotenv";

const env = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${env}` });

export const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
export const CORS_ORIGIN = "http://localhost:5173";
export const NODE_ENV = env;
