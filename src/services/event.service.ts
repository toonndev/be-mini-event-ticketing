import { AppDataSource } from '../database/data-source';
import { Event } from '../entities/Event';

const eventRepo = () => AppDataSource.getRepository(Event);

export const findAllEvents = (skip: number, take: number) =>
  eventRepo().findAndCount({ where: { status: 'published' }, order: { date: 'ASC' }, skip, take });

export const findEventById = (id: string) =>
  eventRepo().findOne({ where: { id } });

export const createEvent = (data: {
  name: string;
  description: string;
  date: string;
  endDate?: string;
  venue: string;
  ticketPrice?: number;
  category: string;
  imageUrl?: string;
  totalTickets: number;
  maxTicketsPerUser?: number;
  status?: string;
  tags?: string[];
}) => {
  const event = eventRepo().create({
    ...data,
    endDate: data.endDate ? new Date(data.endDate) : null,
    ticketPrice: data.ticketPrice ?? 0,
    imageUrl: data.imageUrl ?? null,
    maxTicketsPerUser: data.maxTicketsPerUser ?? 5,
    status: (data.status as Event['status']) ?? 'published',
    tags: data.tags ?? null,
    remainingTickets: data.totalTickets,
  });
  return eventRepo().save(event);
};

export const updateEvent = async (
  event: Event,
  data: {
    name?: string;
    description?: string;
    date?: string;
    endDate?: string;
    venue?: string;
    ticketPrice?: number;
    category?: string;
    imageUrl?: string;
    totalTickets?: number;
    maxTicketsPerUser?: number;
    status?: string;
    tags?: string[];
  },
) => {
  if (data.name !== undefined) event.name = data.name;
  if (data.description !== undefined) event.description = data.description;
  if (data.date !== undefined) event.date = new Date(data.date);
  if (data.endDate !== undefined) event.endDate = new Date(data.endDate);
  if (data.venue !== undefined) event.venue = data.venue;
  if (data.ticketPrice !== undefined) event.ticketPrice = data.ticketPrice;
  if (data.category !== undefined) event.category = data.category;
  if (data.imageUrl !== undefined) event.imageUrl = data.imageUrl;
  if (data.maxTicketsPerUser !== undefined) event.maxTicketsPerUser = data.maxTicketsPerUser;
  if (data.status !== undefined) event.status = data.status as Event['status'];
  if (data.tags !== undefined) event.tags = data.tags;
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
