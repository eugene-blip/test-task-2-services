import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiQuery, ApiOkResponse } from '@nestjs/swagger';
import { DataService } from './data.service';
import { FetchDataDto, UploadFileDto } from './dto/upload-file.dto';
import { FetchDataResponseDto } from './dto/fetch-response.dto';

@ApiTags('data')
@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Post('fetch')
  @ApiOperation({ summary: 'Fetch cryptocurrency historical data from CoinGecko API and save to file' })
  @ApiBody({ type: FetchDataDto })
  @ApiOkResponse({ description: 'Fetch result including insertedCount', type: FetchDataResponseDto })
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
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 100 })
  @ApiQuery({ name: 'skip', required: false, type: Number, example: 0 })
  async getAllData(
    @Query('limit') limitStr?: string,
    @Query('skip') skipStr?: string,
  ) {
    // Parse and validate query parameters manually
    let limit = 100;
    let skip = 0;

    if (limitStr !== undefined && limitStr !== '') {
      const parsedLimit = parseInt(limitStr, 10);
      if (isNaN(parsedLimit) || parsedLimit <= 0) {
        throw new BadRequestException('Limit must be a positive number');
      }
      limit = parsedLimit;
    }

    if (skipStr !== undefined && skipStr !== '') {
      const parsedSkip = parseInt(skipStr, 10);
      if (isNaN(parsedSkip) || parsedSkip < 0) {
        throw new BadRequestException('Skip must be a non-negative number');
      }
      skip = parsedSkip;
    }

    const data = await this.dataService.getAllData(limit, skip);
    const total = await this.dataService.getDataCount();

    return {
      success: true,
      data,
      pagination: {
        total,
        limit,
        skip,
      },
    };
  }
}
