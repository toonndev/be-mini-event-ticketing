import { Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

type ClassConstructor<T> = new () => T;

export const validateDto = <T extends object>(DtoClass: ClassConstructor<T>) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const dto = plainToInstance(DtoClass, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      res.status(400).json({
        error: 'Validation error',
        details: errors.map((e) => ({
          property: e.property,
          constraints: e.constraints,
        })),
      });
      return;
    }

    req.body = dto;
    next();
  };
