import { ApiProperty } from '@nestjs/swagger';

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
  coinId: string;

  @ApiProperty({ 
    description: 'Target currency for historical data (e.g., usd, eur, gbp)',
    example: 'usd',
    default: 'usd'
  })
  vsCurrency: string;

  @ApiProperty({ 
    description: 'Number of days to retrieve historical data for (1, 7, 14, 30, 90, 180, 365, max)',
    example: 30,
    default: 30
  })
  days: number;

  @ApiProperty({ 
    description: 'File format to save data',
    enum: ['json', 'excel'],
    default: 'json'
  })
  format?: 'json' | 'excel';
}
