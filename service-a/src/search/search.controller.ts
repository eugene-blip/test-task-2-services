import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchDto } from './dto/search.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Advanced search with custom filters and pagination' })
  async search(@Query() searchDto: SearchDto) {
    // Extract search filters from query parameters
    const { page, limit, sortBy, sortOrder, ...filters } = searchDto;

    // Remove undefined/null values from filters
    const cleanFilters = Object.entries(filters)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    const result = await this.searchService.search(cleanFilters, searchDto);
    return {
      success: true,
      ...result,
    };
  }
}
