import { Request, Response, NextFunction } from 'express';
import * as eventService from '../services/event.service';
import { AppError } from '../types';
import { MSG_MASTER } from '../message/msg-master';
import { parsePagination, buildPaginationMeta, setContentRange } from '../utils/pagination';
import { CreateEventDto, UpdateEventDto } from '../dto/event.dto';
import * as sse from '../utils/sse';

const computeStatus = (event: { remainingTickets: number; totalTickets: number }) => {
  if (event.remainingTickets === 0) return 'sold_out';
  if (event.remainingTickets / event.totalTickets <= 0.1) return 'almost_full';
  return 'available';
};

export const getEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const paging = parsePagination(req);
    const [events, total] = await eventService.findAllEvents(paging.skip, paging.limit);
    const result = events.map((e) => ({ ...e, status: computeStatus(e) }));

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

    const event = await eventService.createEvent(dto);
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
};

export const updateEvent = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const dto = req.body as UpdateEventDto;

    if (dto.date && new Date(dto.date) <= new Date()) {
      throw new AppError(MSG_MASTER.INVALID_PARAMETERS, 'Event date must be in the future');
    }

    const event = await eventService.findEventById(req.params.id);
    if (!event) throw new AppError(MSG_MASTER.NOT_FOUND, 'Event not found');

    const updated = await eventService.updateEvent(event, dto);
    res.json({ ...updated, status: computeStatus(updated) });
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

export const liveEvent = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const event = await eventService.findEventById(req.params.id);
    if (!event) throw new AppError(MSG_MASTER.NOT_FOUND, 'Event not found');

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // ส่งข้อมูลปัจจุบันทันทีที่ connect
    res.write(`data: ${JSON.stringify({ remainingTickets: event.remainingTickets, status: computeStatus(event) })}\n\n`);

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
    res.json({ ...event, status: computeStatus(event) });
  } catch (err) {
    next(err);
  }
};
