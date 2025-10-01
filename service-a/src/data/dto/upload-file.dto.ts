import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class UploadFileDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}

export class FetchDataDto {
  @ApiProperty({ 
    description: 'Cryptocurrency ID (e.g., bitcoin, ethereum, cardano)',
    example: 'bitcoin',
    default: 'bitcoin'
  })
  @IsString()
  coinId: string;

  @ApiProperty({ 
    description: 'Target currency for historical data (e.g., usd, eur, gbp)',
    example: 'usd',
    default: 'usd'
  })
  @IsString()
  vsCurrency: string;

  @ApiProperty({ 
    description: 'Number of days to retrieve historical data for (1, 7, 14, 30, 90, 180, 365, max)',
    example: 30,
    default: 30
  })
  @IsNumber()
  days: number;

  @ApiProperty({ 
    description: 'File format to save data',
    enum: ['json', 'excel'],
    default: 'json'
  })
  @IsOptional()
  @IsEnum(['json', 'excel'])
  format?: 'json' | 'excel';
}
