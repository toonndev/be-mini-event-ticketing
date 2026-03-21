import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';
import { MSG_MASTER } from '../message/msg-master';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err);

  if (err instanceof AppError) {
    res.status(err.httpStatus).json({
      code: err.code,
      msg: err.message,
      description: err.description,
    });
    return;
  }

  const fallback = MSG_MASTER.GENERIC_SERVER_ERROR;
  res.status(fallback.httpStatus).json({
    code: fallback.code,
    msg: fallback.msg,
    description: err.message || fallback.description,
  });
};
