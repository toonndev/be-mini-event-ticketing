import { IsString, IsDateString, IsInt, MinLength, Min, IsOptional } from 'class-validator';

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

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  venue?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  totalTickets?: number;
}
