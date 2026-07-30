import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('[Error Handler]:', err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: err.issues.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Handling duplicate unique fields
    if (err.code === 'P2002') {
      const targets = (err.meta?.target as string[]) || [];
      res.status(409).json({
        status: 'error',
        message: `A record with this ${targets.join(', ')} already exists.`,
      });
      return;
    }
    // Handling record not found
    if (err.code === 'P2025') {
      res.status(404).json({
        status: 'error',
        message: 'The requested record was not found or has been deleted.',
      });
      return;
    }
  }

  const isProduction = process.env.NODE_ENV === 'production';
  res.status(500).json({
    status: 'error',
    message: isProduction ? 'Internal Server Error' : err.message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
}
