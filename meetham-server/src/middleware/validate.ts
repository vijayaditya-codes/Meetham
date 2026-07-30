import { ZodType } from 'zod';
import { Request, Response, NextFunction } from 'express';

export function validateBody<T>(schema: ZodType<T>) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateQuery<T>(schema: ZodType<T>) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req.query);
      for (const key of Object.keys(req.query)) {
        delete req.query[key];
      }
      Object.assign(req.query, parsed as any);
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateParams<T>(schema: ZodType<T>) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req.params);
      for (const key of Object.keys(req.params)) {
        delete req.params[key];
      }
      Object.assign(req.params, parsed as any);
      next();
    } catch (error) {
      next(error);
    }
  };
}
