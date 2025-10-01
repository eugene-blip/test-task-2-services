import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryLogsDto {
  @ApiProperty({ 
    description: 'Event type filter',
    required: false,
    example: 'DATA_FETCHED'
  })
  @IsOptional()
  @IsString()
  eventType?: string;

  @ApiProperty({ 
    description: 'Service ID filter',
    required: false,
    example: 'service-a'
  })
  @IsOptional()
  @IsString()
  serviceId?: string;

  @ApiProperty({ 
    description: 'Start date (ISO format)',
    required: false,
    example: '2025-09-01T00:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ 
    description: 'End date (ISO format)',
    required: false,
    example: '2025-10-01T23:59:59Z'
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ 
    description: 'Page number',
    required: false,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ 
    description: 'Results per page',
    required: false,
    default: 50
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;
}
