import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import * as eventService from '../services/event.service';
import { AppError } from '../types';
import { MSG_MASTER } from '../message/msg-master';
import { parsePagination, buildPaginationMeta, setContentRange } from '../utils/pagination';
import { CreateEventDto, UpdateEventDto, EVENT_CATEGORIES } from '../dto/event.dto';
import * as sse from '../utils/sse';

const computeTicketStatus = (event: { remainingTickets: number; totalTickets: number }) => {
  if (event.remainingTickets === 0) return 'sold_out';
  if (event.remainingTickets / event.totalTickets <= 0.1) return 'almost_full';
  return 'available';
};

export const getCategories = (_req: Request, res: Response) => {
  res.json(EVENT_CATEGORIES);
};

export const getEvents = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const paging = parsePagination(req);
    const isAdmin = req.userRole === 'admin';

    const search = (req.query.search as string | undefined)?.trim() || undefined;
    const category = (req.query.category as string | undefined)?.trim() || undefined;
    const status = isAdmin ? ((req.query.status as string | undefined)?.trim() || undefined) : undefined;

    const [events, total] = await eventService.findAllEvents({
      skip: paging.skip,
      take: paging.limit,
      onlyPublished: !isAdmin,
      search,
      category,
      status,
    });
    const result = events.map((e) => ({ ...e, ticketStatus: computeTicketStatus(e) }));

    setContentRange(res, total, paging, result.length);
    res.json({
      data: result,
      pagination: buildPaginationMeta(total, paging),
    });
  } catch (err) {
    next(err);
  }
};

export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = req.body as CreateEventDto;

    if (new Date(dto.date) <= new Date()) {
      throw new AppError(MSG_MASTER.INVALID_PARAMETERS, 'Event date must be in the future');
    }

    if (dto.endDate && new Date(dto.endDate) <= new Date(dto.date)) {
      throw new AppError(MSG_MASTER.INVALID_PARAMETERS, 'End date must be after start date');
    }

    const event = await eventService.createEvent(dto);
    res.status(201).json({ ...event, ticketStatus: computeTicketStatus(event) });
  } catch (err) {
    next(err);
  }
};

export const updateEvent = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const dto = req.body as UpdateEventDto;

    // if (dto.date && new Date(dto.date) <= new Date()) {
    //   throw new AppError(MSG_MASTER.INVALID_PARAMETERS, 'Event date must be in the future');
    // }

    if (dto.endDate && dto.date && new Date(dto.endDate) <= new Date(dto.date)) {
      throw new AppError(MSG_MASTER.INVALID_PARAMETERS, 'End date must be after start date');
    }

    const event = await eventService.findEventById(req.params.id);
    if (!event) throw new AppError(MSG_MASTER.NOT_FOUND, 'Event not found');

    const updated = await eventService.updateEvent(event, dto);
    res.json({ ...updated, ticketStatus: computeTicketStatus(updated) });
  } catch (err) {
    next(err);
  }
};

export const deleteEvent = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const event = await eventService.findEventById(req.params.id);
    if (!event) throw new AppError(MSG_MASTER.NOT_FOUND, 'Event not found');

    await eventService.deleteEvent(event);
    res.status(200).json({ message: 'Event deleted' });
  } catch (err) {
    next(err);
  }
};

export const liveAllEvents = (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sse.subscribeGlobal(res);
  req.on('close', () => sse.unsubscribeGlobal(res));
};

export const liveEvent = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const event = await eventService.findEventById(req.params.id);
    if (!event) throw new AppError(MSG_MASTER.NOT_FOUND, 'Event not found');

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    res.write(`data: ${JSON.stringify({ remainingTickets: event.remainingTickets, ticketStatus: computeTicketStatus(event) })}\n\n`);

    sse.subscribe(event.id, res);

    req.on('close', () => sse.unsubscribe(event.id, res));
  } catch (err) {
    next(err);
  }
};

export const getEventById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const event = await eventService.findEventById(req.params.id);
    if (!event) throw new AppError(MSG_MASTER.NOT_FOUND, 'Event not found');
    res.json({ ...event, ticketStatus: computeTicketStatus(event) });
  } catch (err) {
    next(err);
  }
};
