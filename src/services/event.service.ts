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

export const updateEvent = async (
  event: Event,
  data: { name?: string; description?: string; date?: string; venue?: string; totalTickets?: number },
) => {
  if (data.name !== undefined) event.name = data.name;
  if (data.description !== undefined) event.description = data.description;
  if (data.date !== undefined) event.date = new Date(data.date);
  if (data.venue !== undefined) event.venue = data.venue;
  if (data.totalTickets !== undefined) {
    const booked = event.totalTickets - event.remainingTickets;
    if (data.totalTickets < booked) {
      throw new Error(`Cannot reduce totalTickets below already-booked count (${booked})`);
    }
    event.remainingTickets = data.totalTickets - booked;
    event.totalTickets = data.totalTickets;
  }
  return eventRepo().save(event);
};

export const deleteEvent = (event: Event) => eventRepo().remove(event);
