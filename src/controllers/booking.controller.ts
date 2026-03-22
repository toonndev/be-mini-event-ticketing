import { Response, NextFunction } from 'express';
import { AppDataSource } from '../database/data-source';
import * as bookingService from '../services/booking.service';
import { AuthRequest } from '../middleware/authMiddleware';
import { AppError } from '../types';
import { MSG_MASTER } from '../message/msg-master';
import { CreateBookingDto } from '../dto/booking.dto';
import * as sse from '../utils/sse';

const computeTicketStatus = (remainingTickets: number, totalTickets: number): string => {
  if (remainingTickets === 0) return 'sold_out';
  if (remainingTickets / totalTickets <= 0.1) return 'almost_full';
  return 'available';
};

const emitTicketUpdate = (eventId: string, remainingTickets: number, totalTickets: number) => {
  sse.emit(eventId, { remainingTickets, status: computeTicketStatus(remainingTickets, totalTickets) });
};

export const createBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { eventId, quantity } = req.body as CreateBookingDto;
    const userId = req.userId!;

    const booking = await AppDataSource.transaction(async (manager) => {
      const event = await bookingService.lockEventById(manager, eventId);
      if (!event) throw new AppError(MSG_MASTER.NOT_FOUND, 'Event not found');

      if (event.remainingTickets < quantity) {
        throw new AppError(MSG_MASTER.DUPLICATE_ENTRY, 'Not enough tickets available');
      }

      const row = await bookingService.sumUserBookings(manager, userId, eventId);
      const used = Number(row?.used ?? 0);
      if (used + quantity > 5) {
        throw new AppError(MSG_MASTER.INVALID_PARAMETERS, 'Booking quota exceeded (max 5 per event)');
      }

      event.remainingTickets -= quantity;
      await bookingService.saveEvent(manager, event);

      return bookingService.insertBooking(manager, userId, event, quantity);
    });

    emitTicketUpdate(booking.event.id, booking.event.remainingTickets, booking.event.totalTickets);

    res.status(201).json({
      id: booking.id,
      eventId: booking.event.id,
      eventName: booking.event.name,
      eventDate: booking.event.date,
      venue: booking.event.venue,
      quantity: booking.quantity,
      bookedAt: booking.bookedAt,
    });
  } catch (err) {
    next(err);
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userId = req.userId!;

    const booking = await bookingService.findBookingByIdAndUser(id, userId);
    if (!booking) throw new AppError(MSG_MASTER.NOT_FOUND, 'Booking not found');

    await AppDataSource.transaction(async (manager) => {
      const event = await bookingService.lockEventById(manager, booking.event.id);
      if (!event) throw new AppError(MSG_MASTER.NOT_FOUND, 'Event not found');

      event.remainingTickets += booking.quantity;
      await bookingService.saveEvent(manager, event);
      await bookingService.deleteBooking(manager, booking);

      emitTicketUpdate(event.id, event.remainingTickets, event.totalTickets);
    });

    res.status(200).json({ message: 'Booking cancelled', refundedTickets: booking.quantity });
  } catch (err) {
    next(err);
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const bookings = await bookingService.findBookingsByUser(req.userId!);
    const result = bookings.map((b) => ({
      id: b.id,
      eventId: b.event.id,
      eventName: b.event.name,
      eventDate: b.event.date,
      venue: b.event.venue,
      quantity: b.quantity,
      bookedAt: b.bookedAt,
    }));
    res.json(result);
  } catch (err) {
    next(err);
  }
};
