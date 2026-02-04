import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/api-error';
import { logger } from '../utils/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error({
    err,
    method: req.method,
    url: req.url,
    body: req.body,
  });

  // Handle ApiError
  if (err instanceof ApiError) {
    res.status(err.statusCode).json(err.toJSON());
    return;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const details: Record<string, string[]> = {};
    err.errors.forEach((e) => {
      const path = e.path.join('.');
      if (!details[path]) {
        details[path] = [];
      }
      details[path].push(e.message);
    });

    res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details,
    });
    return;
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        // Unique constraint violation
        const field = (err.meta?.target as string[])?.join(', ') || 'field';
        res.status(409).json({
          code: 'CONFLICT',
          message: `A record with this ${field} already exists`,
        });
        return;
      case 'P2025':
        // Record not found
        res.status(404).json({
          code: 'NOT_FOUND',
          message: 'Record not found',
        });
        return;
      case 'P2003':
        // Foreign key constraint failed
        res.status(400).json({
          code: 'BAD_REQUEST',
          message: 'Invalid reference to related record',
        });
        return;
      default:
        break;
    }
  }

  // Handle Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Invalid data provided',
    });
    return;
  }

  // Default 500 error
  res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message,
  });
}
