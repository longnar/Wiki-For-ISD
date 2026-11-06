import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('News')
@Controller('api')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('news')
  @ApiOperation({ summary: 'Lấy danh sách các bản cập nhật / tin tức' })
  getAllNews() {
    return this.newsService.getAllNews();
  }

  @Get('news/:id')
  @ApiOperation({ summary: 'Lấy chi tiết một bản cập nhật theo ID' })
  getNewsById(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.getNewsById(id);
  }

  @Post('admin/news')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thêm bản cập nhật mới (Admin)' })
  createNews(@Body() dto: CreateNewsDto) {
    return this.newsService.createNews(dto);
  }

  @Put('admin/news/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật bản cập nhật (Admin)' })
  updateNews(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateNewsDto>) {
    return this.newsService.updateNews(id, dto);
  }

  @Delete('admin/news/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa bản cập nhật (Admin)' })
  deleteNews(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.deleteNews(id);
  }
}
