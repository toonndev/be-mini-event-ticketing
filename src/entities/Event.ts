import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Booking } from './Booking';

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

  @Column({ length: 255 })
  venue!: string;

  @Column({ name: 'total_tickets' })
  totalTickets!: number;

  @Column({ name: 'remaining_tickets' })
  remainingTickets!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => Booking, (b) => b.event)
  bookings!: Booking[];
}
