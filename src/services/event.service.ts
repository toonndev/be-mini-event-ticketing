import { AppDataSource } from '../database/data-source';
import { Event } from '../entities/Event';
import { ILike } from 'typeorm';

const eventRepo = () => AppDataSource.getRepository(Event);

export interface FindAllEventsOptions {
  skip: number;
  take: number;
  onlyPublished?: boolean;
  search?: string;
  category?: string;
  status?: string;
}

export const findAllEvents = ({ skip, take, onlyPublished = true, search, category, status }: FindAllEventsOptions) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (onlyPublished) {
    where.status = 'published';
  } else if (status) {
    where.status = status;
  }

  if (category) {
    where.category = category;
  }

  if (search) {
    // search across name and description — run two queries and merge, or use QueryBuilder
    return eventRepo()
      .createQueryBuilder('event')
      .where(onlyPublished ? 'event.status = :pub' : '1=1', { pub: 'published' })
      .andWhere(status && !onlyPublished ? 'event.status = :status' : '1=1', { status })
      .andWhere(category ? 'event.category = :category' : '1=1', { category })
      .andWhere('(event.name ILIKE :search OR event.description ILIKE :search)', { search: `%${search}%` })
      .orderBy('event.date', 'ASC')
      .skip(skip)
      .take(take)
      .getManyAndCount();
  }

  return eventRepo().findAndCount({
    where,
    order: { date: 'ASC' },
    skip,
    take,
  });
};

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
