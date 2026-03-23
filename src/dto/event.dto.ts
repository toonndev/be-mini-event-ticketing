import {
  IsString, IsDateString, IsInt, MinLength, Min, IsOptional,
  IsNumber, IsUrl, IsIn, IsArray, Max,
} from 'class-validator';

export const EVENT_CATEGORIES = [
  'concert',
  'conference',
  'sport',
  'workshop',
  'festival',
  'exhibition',
  'other',
] as const;

export class CreateEventDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  description!: string;

  @IsDateString()
  date!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsString()
  @MinLength(1)
  venue!: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  ticketPrice?: number;

  @IsIn(EVENT_CATEGORIES)
  category!: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsInt()
  @Min(1)
  totalTickets!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  maxTicketsPerUser?: number;

  @IsOptional()
  @IsIn(['draft', 'published', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
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
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  venue?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  ticketPrice?: number;

  @IsOptional()
  @IsIn(EVENT_CATEGORIES)
  category?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  totalTickets?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  maxTicketsPerUser?: number;

  @IsOptional()
  @IsIn(['draft', 'published', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
