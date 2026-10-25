import type { NextFunction, Request, Response } from "express";
import multer from "multer";

import { logger } from "../utils/logger.js";

export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
};

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (res.headersSent) {
    return;
  }

  if (error instanceof SyntaxError && "body" in error) {
    res.status(400).json({
      success: false,
      message: "Invalid JSON body",
    });
    return;
  }

  if (error instanceof multer.MulterError) {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Audio file is too large"
        : error.message;

    res.status(400).json({
      success: false,
      message,
    });
    return;
  }

  if (
    error instanceof Error &&
    error.message.startsWith("Unsupported audio type")
  ) {
    res.status(415).json({
      success: false,
      message: error.message,
    });
    return;
  }

  const status =
    typeof (error as { statusCode?: unknown })?.statusCode === "number"
      ? (error as { statusCode: number }).statusCode
      : 500;

  logger.error("api.error", `${req.method} ${req.originalUrl} failed`, {
    message: error instanceof Error ? error.message : String(error),
  });

  const exposeError =
    status < 500 || process.env.NODE_ENV !== "production";

  res.status(status).json({
    success: false,
    message:
      exposeError && error instanceof Error
        ? error.message
        : "Internal server error",
  });
};