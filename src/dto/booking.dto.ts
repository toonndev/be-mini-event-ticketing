import { IsUUID, IsInt, Min, Max } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  eventId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  quantity!: number;
}
