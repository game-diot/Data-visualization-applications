import {
  type Request,
  type Response,
  type NextFunction,
  response,
} from "express";
import Joi from "joi";
import { errorHandler } from "./error.middleware.js";

const fileSchema = Joi.object({
  originName: Joi.string().required(),
  storeName: Joi.string().required(),
  path: Joi.string().required(),
  size: Joi.number().required(),
  status: Joi.string().valid("updated", "process", "failed").default("updated"),
  updateTime: Joi.date().default(() => new Date()),
});

/**
 * 文件参数校验中间件
 */
export const validateFileMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = fileSchema.validate(req.body, { abortEarly: true });

  if (error) {
    return errorHandler(error, req, res, next);
  }

  next();
};
