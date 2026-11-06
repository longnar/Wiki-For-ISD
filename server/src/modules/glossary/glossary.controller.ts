import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, UseInterceptors, UploadedFile, ParseIntPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as path from 'path';
import { GlossaryService } from './glossary.service';
import { CreateGlossaryDto } from './dto/create-glossary.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';

const multerOptions = {
  storage: diskStorage({
    destination: path.join(process.cwd(), 'uploads'),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB (hỗ trợ GIF hoạt họa và PNG)
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận tệp định dạng hình ảnh (.png, .jpg, .webp, .svg, .gif).'), false);
    }
  },
};

@ApiTags('Glossaries')
@Controller('api')
export class GlossaryController {
  constructor(private readonly glossaryService: GlossaryService) {}

  @Get('glossaries')
  @ApiOperation({ summary: 'Lấy danh sách các thuật ngữ Glossary' })
  getAllGlossaries() {
    return this.glossaryService.getAllGlossaries();
  }

  @Post('admin/glossaries')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Thêm thuật ngữ Glossary mới (Admin)' })
  createGlossary(@Body() dto: CreateGlossaryDto, @UploadedFile() file?: Express.Multer.File) {
    return this.glossaryService.createGlossary(dto, file);
  }

  @Put('admin/glossaries/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Cập nhật thuật ngữ Glossary (Admin)' })
  updateGlossary(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateGlossaryDto>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.glossaryService.updateGlossary(id, dto, file);
  }

  @Delete('admin/glossaries/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa thuật ngữ Glossary (Admin)' })
  deleteGlossary(@Param('id', ParseIntPipe) id: number) {
    return this.glossaryService.deleteGlossary(id);
  }
}
