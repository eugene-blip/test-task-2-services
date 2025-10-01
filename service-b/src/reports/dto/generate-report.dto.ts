import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString } from 'class-validator';

export class GenerateReportDto {
  @ApiProperty({ 
    description: 'Start date for report (ISO format)',
    required: false,
    example: '2025-09-01T00:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ 
    description: 'End date for report (ISO format)',
    required: false,
    example: '2025-10-01T23:59:59Z'
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
