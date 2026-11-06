import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, UseInterceptors, UploadedFile, ParseIntPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as path from 'path';
import { CharacterService } from './character.service';
import { CreateCharacterDto } from './dto/create-character.dto';
import { CreateMoveDto, UpsertBaseStatsDto } from './dto/create-move.dto';
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
    fileSize: 25 * 1024 * 1024, // 25MB (hỗ trợ ảnh GIF hoạt ảnh và PNG sắc nét)
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận tệp định dạng hình ảnh (.png, .jpg, .webp, .svg, .gif).'), false);
    }
  },
};

@ApiTags('Characters')
@Controller('api')
export class CharacterController {
  constructor(private readonly characterService: CharacterService) {}

  @Get('characters')
  @ApiOperation({ summary: 'Lấy danh sách nhân vật' })
  getAllCharacters() {
    return this.characterService.getAllCharacters();
  }

  @Get('characters/:id')
  @ApiOperation({ summary: 'Lấy chi tiết nhân vật theo ID' })
  getCharacterById(@Param('id', ParseIntPipe) id: number) {
    return this.characterService.getCharacterById(id);
  }

  @Get('characters/:id/moves')
  @ApiOperation({ summary: 'Lấy danh sách đòn đánh của nhân vật' })
  getCharacterMoves(@Param('id', ParseIntPipe) id: number) {
    return this.characterService.getCharacterMoves(id);
  }

  @Get('characters/:id/base-stats')
  @ApiOperation({ summary: 'Lấy chỉ số cơ bản của nhân vật' })
  getCharacterBaseStats(@Param('id', ParseIntPipe) id: number) {
    return this.characterService.getCharacterBaseStats(id);
  }

  @Post('admin/characters')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Tạo nhân vật mới (Admin)' })
  createCharacter(@Body() dto: CreateCharacterDto, @UploadedFile() file?: Express.Multer.File) {
    return this.characterService.createCharacter(dto, file);
  }

  @Put('admin/characters/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Cập nhật nhân vật (Admin)' })
  updateCharacter(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateCharacterDto>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.characterService.updateCharacter(id, dto, file);
  }

  @Delete('admin/characters/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa nhân vật (Admin)' })
  deleteCharacter(@Param('id', ParseIntPipe) id: number) {
    return this.characterService.deleteCharacter(id);
  }

  @Post('admin/characters/:id/moves')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('hitbox', multerOptions))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({ summary: 'Thêm đòn đánh cho nhân vật (Admin)' })
  createCharacterMove(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateMoveDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.characterService.createCharacterMove(id, dto, file);
  }

  @Put('admin/characters/:id/moves/:moveId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('hitbox', multerOptions))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({ summary: 'Cập nhật đòn đánh của nhân vật (Admin)' })
  updateCharacterMove(
    @Param('id', ParseIntPipe) id: number,
    @Param('moveId', ParseIntPipe) moveId: number,
    @Body() dto: Partial<CreateMoveDto>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.characterService.updateCharacterMove(moveId, id, dto, file);
  }

  @Delete('admin/characters/:id/moves/:moveId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa đòn đánh của nhân vật (Admin)' })
  deleteCharacterMove(
    @Param('id', ParseIntPipe) id: number,
    @Param('moveId', ParseIntPipe) moveId: number,
  ) {
    return this.characterService.deleteCharacterMove(moveId, id);
  }

  @Put('admin/characters/:id/base-stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật chỉ số cơ bản cho nhân vật (Admin)' })
  upsertCharacterBaseStats(@Param('id', ParseIntPipe) id: number, @Body() dto: UpsertBaseStatsDto) {
    return this.characterService.upsertCharacterBaseStats(id, dto);
  }
}
