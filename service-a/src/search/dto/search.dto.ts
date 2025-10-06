import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchDto {
  @ApiProperty({
    description: 'Filter by coin ID (exact or partial match)',
    example: 'bitcoin',
    required: false,
  })
  @IsOptional()
  @IsString()
  coinId?: string;

  @ApiProperty({
    description: 'Filter by vsCurrency (e.g., usd, eur)',
    example: 'usd',
    required: false,
  })
  @IsOptional()
  @IsString()
  vsCurrency?: string;

  @ApiProperty({
    description: 'Filter by days (exact value used during fetch)',
    example: 30,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  days?: number;

  @ApiProperty({ 
    description: 'Page number (1-indexed)',
    example: 1,
    default: 1,
    required: false 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ 
    description: 'Number of results per page',
    example: 10,
    default: 10,
    required: false 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({ 
    description: 'Field to sort by',
    example: 'createdAt',
    required: false 
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({ 
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'desc',
    required: false 
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export interface SearchResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  query?: string;
  duration: number;
}
