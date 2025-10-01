import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchDto {
  @ApiProperty({ 
    description: 'Search query',
    example: 'john',
    required: false 
  })
  @IsOptional()
  @IsString()
  query?: string;

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
