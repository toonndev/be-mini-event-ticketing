import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { Event } from './Event';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (u) => u.bookings)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Event, (e) => e.bookings)
  @JoinColumn({ name: 'event_id' })
  event!: Event;

  @Column()
  quantity!: number;

  @CreateDateColumn({ name: 'booked_at' })
  bookedAt!: Date;
}
