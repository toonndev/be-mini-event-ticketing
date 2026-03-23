import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Booking } from './Booking';
import { EVENT_CATEGORIES } from '../dto/event.dto';

export type EventStatus = 'draft' | 'published' | 'cancelled';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  name!: string;

  @Column('text')
  description!: string;

  @Column('timestamptz')
  date!: Date;

  @Column({ name: 'end_date', type: 'timestamptz', nullable: true })
  endDate!: Date | null;

  @Column({ length: 255 })
  venue!: string;

  @Column({ name: 'ticket_price', type: 'decimal', precision: 10, scale: 2, default: 0 })
  ticketPrice!: number;

  @Column({ length: 100, default: EVENT_CATEGORIES[6] })
  category!: string;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl!: string | null;

  @Column({ name: 'total_tickets' })
  totalTickets!: number;

  @Column({ name: 'remaining_tickets' })
  remainingTickets!: number;

  @Column({ name: 'max_tickets_per_user', default: 5 })
  maxTicketsPerUser!: number;

  @Column({ type: 'varchar', length: 20, default: 'published' })
  status!: EventStatus;

  @Column({ name: 'tags', type: 'simple-array', nullable: true })
  tags!: string[] | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => Booking, (b) => b.event)
  bookings!: Booking[];
}
