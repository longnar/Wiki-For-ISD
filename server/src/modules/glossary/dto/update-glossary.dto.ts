import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CreateGlossaryDto } from './create-glossary.dto';

export class UpdateGlossaryDto extends PartialType(CreateGlossaryDto) {
  @ApiPropertyOptional({ example: 'true', description: 'Đánh dấu xóa hình ảnh minh họa' })
  @IsOptional()
  remove_image?: string;
}
