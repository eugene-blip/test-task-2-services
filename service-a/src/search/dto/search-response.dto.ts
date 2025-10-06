import { ApiProperty } from '@nestjs/swagger';

class TimeSeriesRecordDto {
  @ApiProperty({ example: 'bitcoin' })
  coinId!: string;

  @ApiProperty({ example: 'usd' })
  vsCurrency!: string;

  @ApiProperty({ example: 30 })
  days!: number;

  @ApiProperty({
    description: 'Array of [timestamp(ms), price] pairs',
    example: [[1696118400000, 27000.12], [1696204800000, 27123.45]],
    type: 'array',
    items: {
      type: 'array',
      items: { type: 'number' },
    },
  })
  prices!: [number, number][];

  @ApiProperty({ description: 'Record creation time', example: '2025-10-01T12:00:00.000Z' })
  createdAt?: string;

  @ApiProperty({ description: 'Record update time', example: '2025-10-01T12:00:00.000Z' })
  updatedAt?: string;
}

class PaginationDto {
  @ApiProperty({ example: 1 })
  page!: number;
  @ApiProperty({ example: 10 })
  limit!: number;
  @ApiProperty({ example: 42 })
  total!: number;
  @ApiProperty({ example: 5 })
  totalPages!: number;
  @ApiProperty({ example: true })
  hasNext!: boolean;
  @ApiProperty({ example: false })
  hasPrev!: boolean;
}

export class SearchResponseDto {
  @ApiProperty({ type: [TimeSeriesRecordDto] })
  data!: TimeSeriesRecordDto[];

  @ApiProperty({ type: PaginationDto })
  pagination!: PaginationDto;

  @ApiProperty({ description: 'Search duration in ms', example: 35 })
  duration!: number;
}
