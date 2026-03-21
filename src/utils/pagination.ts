import { Request, Response } from 'express';

export interface PaginationQuery {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const parsePagination = (req: Request, defaultLimit = 10): PaginationQuery => {
  const page = Math.max(1, Number.parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit as string) || defaultLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const buildPaginationMeta = (total: number, { page, limit }: PaginationQuery): PaginationMeta => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});

export const setContentRange = (res: Response, total: number, { skip, limit }: PaginationQuery, count: number): void => {
  const start = skip;
  const end = skip + count - 1;
  res.setHeader('Content-Range', `items ${start}-${end}/${total}`);
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
};
