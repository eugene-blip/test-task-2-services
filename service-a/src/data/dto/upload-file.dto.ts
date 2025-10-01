import { ApiProperty } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}

export class FetchDataDto {
  @ApiProperty({ 
    description: 'URL of the public API to fetch data from',
    example: 'https://jsonplaceholder.typicode.com/users'
  })
  url: string;

  @ApiProperty({ 
    description: 'File format to save data',
    enum: ['json', 'excel'],
    default: 'json'
  })
  format?: 'json' | 'excel';
}
