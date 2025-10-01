import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Get,
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { DataService } from './data.service';
import { FetchDataDto, UploadFileDto } from './dto/upload-file.dto';

@ApiTags('data')
@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Post('fetch')
  @ApiOperation({ summary: 'Fetch cryptocurrency historical data from CoinGecko API and save to file' })
  @ApiBody({ type: FetchDataDto })
  async fetchData(@Body() fetchDataDto: FetchDataDto) {
    if (!fetchDataDto.coinId) {
      throw new BadRequestException('Cryptocurrency ID is required');
    }
    if (!fetchDataDto.vsCurrency) {
      throw new BadRequestException('Target currency is required');
    }
    if (!fetchDataDto.days) {
      throw new BadRequestException('Days parameter is required');
    }

    const format = fetchDataDto.format || 'json';
    const result = await this.dataService.fetchCryptoData(
      fetchDataDto.coinId,
      fetchDataDto.vsCurrency,
      fetchDataDto.days,
      format,
    );

    return {
      success: true,
      message: 'Cryptocurrency data fetched and saved successfully',
      data: result,
    };
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload and parse file, insert into MongoDB' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDto })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const result = await this.dataService.uploadAndInsertData(
      file.buffer,
      file.mimetype,
      file.originalname,
    );

    return {
      success: true,
      message: 'File uploaded and data inserted successfully',
      data: result,
    };
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all data with pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  async getAllData(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('skip', new ParseIntPipe({ optional: true })) skip?: number,
  ) {
    const data = await this.dataService.getAllData(limit || 100, skip || 0);
    const total = await this.dataService.getDataCount();

    return {
      success: true,
      data,
      pagination: {
        total,
        limit: limit || 100,
        skip: skip || 0,
      },
    };
  }
}
