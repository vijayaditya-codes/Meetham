import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'super-secret-access-token-key-for-meetham-12345';

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new UnauthorizedError('Missing or malformed Authorization header'));
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as TokenPayload;
    req.user = decoded;
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired access token'));
  }
}

export function authorize(...roles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError('You do not have permission to perform this action'));
      return;
    }

    next();
  };
}
