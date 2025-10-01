import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchDto } from './dto/search.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search data with text query and pagination' })
  async search(@Query() searchDto: SearchDto) {
    const result = await this.searchService.search(searchDto);
    return {
      success: true,
      ...result,
    };
  }

  @Post('advanced')
  @ApiOperation({ summary: 'Advanced search with custom filters' })
  async advancedSearch(
    @Body() filters: Record<string, any>,
    @Query() searchDto: SearchDto,
  ) {
    const result = await this.searchService.advancedSearch(filters, searchDto);
    return {
      success: true,
      ...result,
    };
  }
}
