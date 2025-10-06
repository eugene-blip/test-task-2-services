import { ApiProperty } from '@nestjs/swagger';

export class FetchResultDto {
  @ApiProperty({ description: 'Number of records fetched from API' })
  recordCount!: number;

  @ApiProperty({ description: 'Path to the saved file' })
  filePath!: string;

  @ApiProperty({ description: 'File format used to save data', example: 'json' })
  format!: string;

  @ApiProperty({ description: 'Processing duration in milliseconds' })
  duration!: number;

  @ApiProperty({ description: 'Number of records inserted into MongoDB' })
  insertedCount!: number;
}

export class FetchDataResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Cryptocurrency data fetched and saved successfully' })
  message!: string;

  @ApiProperty({ type: FetchResultDto })
  data!: FetchResultDto;
}
