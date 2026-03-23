import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../types';
import { MSG_MASTER } from '../message/msg-master';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string; role: string };
      req.userId = payload.sub;
      req.userRole = payload.role;
    } catch {
      // invalid token — treat as unauthenticated
    }
  }
  next();
};

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    next(new AppError(MSG_MASTER.AUTH_CREDENTIALS_MISSING));
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string; role: string };
    req.userId = payload.sub;
    req.userRole = payload.role;
    next();
  } catch {
    next(new AppError(MSG_MASTER.INVALID_AUTH_CREDENTIALS));
  }
};
