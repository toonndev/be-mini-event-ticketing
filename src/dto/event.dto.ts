import { IsString, IsDateString, IsInt, MinLength, Min } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  description!: string;

  @IsDateString()
  date!: string;

  @IsString()
  @MinLength(1)
  venue!: string;

  @IsInt()
  @Min(1)
  totalTickets!: number;
}
