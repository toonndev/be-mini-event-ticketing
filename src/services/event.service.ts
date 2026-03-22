import { AppDataSource } from '../database/data-source';
import { Event } from '../entities/Event';

const eventRepo = () => AppDataSource.getRepository(Event);

export const findAllEvents = (skip: number, take: number) =>
  eventRepo().findAndCount({ order: { date: 'ASC' }, skip, take });

export const findEventById = (id: string) =>
  eventRepo().findOne({ where: { id } });

export const createEvent = (data: { name: string; description: string; date: string; venue: string; totalTickets: number }) => {
  const event = eventRepo().create({ ...data, remainingTickets: data.totalTickets });
  return eventRepo().save(event);
};
