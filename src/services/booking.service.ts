import { EntityManager } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { Booking } from '../entities/Booking';
import { Event } from '../entities/Event';

export const lockEventById = (manager: EntityManager, id: string) =>
  manager
    .getRepository(Event)
    .createQueryBuilder('event')
    .setLock('pessimistic_write')
    .where('event.id = :id', { id })
    .getOne();

export const sumUserBookings = (manager: EntityManager, userId: string, eventId: string) =>
  manager
    .getRepository(Booking)
    .createQueryBuilder('booking')
    .select('COALESCE(SUM(booking.quantity), 0)', 'used')
    .where('booking.user_id = :userId', { userId })
    .andWhere('booking.event_id = :eventId', { eventId })
    .getRawOne<{ used: string }>();

export const saveEvent = (manager: EntityManager, event: Event) =>
  manager.save(event);

export const insertBooking = (manager: EntityManager, userId: string, event: Event, quantity: number) =>
  manager.save(manager.create(Booking, { user: { id: userId }, event, quantity }));

export const findBookingsByUser = (userId: string) =>
  AppDataSource.getRepository(Booking).find({
    where: { user: { id: userId } },
    relations: ['event'],
    order: { bookedAt: 'DESC' },
  });

export const findBookingByIdAndUser = (id: string, userId: string) =>
  AppDataSource.getRepository(Booking).findOne({
    where: { id, user: { id: userId } },
    relations: ['event'],
  });

export const deleteBooking = (manager: EntityManager, booking: Booking) =>
  manager.remove(booking);

export const findBookingsByEvent = (eventId: string, skip: number, take: number) =>
  AppDataSource.getRepository(Booking).findAndCount({
    where: { event: { id: eventId } },
    relations: ['user'],
    order: { bookedAt: 'DESC' },
    skip,
    take,
  });
