import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // If headers are already sent, delegate to default express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle errors
  console.error("Error encountered:", err);

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      error: 'Conflict',
      message: 'Resource with these unique fields already exists'
    });
  }

  // JWT unauthorized errors (assuming an auth middleware might throw a specific error type)
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
       error: 'Unauthorized',
       message: err.message
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: err.name || 'Error',
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
