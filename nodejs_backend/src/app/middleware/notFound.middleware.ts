import type { Request, Response, NextFunction } from "express";

export const notFoundMiddleware = (
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(404).json({
    message: "Route Not Found",
  });
};
