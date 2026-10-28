
import type { Response } from "express";

interface SuccessResponse<T> {
  success: true;
  message: string;
  data?: T;
}

interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string>;
  code?: string;
}

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200,
): Response => {
  const response: SuccessResponse<T> = {
    success: true,
    message,
    ...(data !== undefined && { data }),
  };

  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errors?: Record<string, string>,
  code?: string,
): Response => {
  const response: ErrorResponse = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(code && { code }),
  };

  return res.status(statusCode).json(response);
};
