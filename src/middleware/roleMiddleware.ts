import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { AppError } from '../types';
import { MSG_MASTER } from '../message/msg-master';
import { UserRole } from '../entities/User';

export const requireRole = (...roles: UserRole[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.userRole || !roles.includes(req.userRole as UserRole)) {
      next(new AppError(MSG_MASTER.INVALID_ACCESS_RIGHTS));
      return;
    }
    next();
  };
