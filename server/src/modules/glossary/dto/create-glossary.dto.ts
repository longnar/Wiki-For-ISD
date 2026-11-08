import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { GlossaryLevel } from '../../../entities/glossary.entity';

export class CreateGlossaryDto {
  @ApiProperty({ example: 'Okizeme', description: 'Tên thuật ngữ' })
  @IsNotEmpty({ message: 'Term is required.' })
  @IsString()
  term: string;

  @ApiProperty({ example: 'Đòn tấn công khi đối thủ vừa đứng dậy', description: 'Định nghĩa thuật ngữ' })
  @IsNotEmpty({ message: 'Definition is required.' })
  @IsString()
  definition: string;

  @ApiPropertyOptional({ example: 'basic', enum: ['basic', 'advanced'], description: 'Cấp độ thuật ngữ' })
  @IsOptional()
  @IsEnum(['basic', 'advanced'])
  level?: GlossaryLevel;

  @ApiPropertyOptional({ example: 1, description: 'ID thuật ngữ cha (nếu là thuật ngữ con)' })
  @IsOptional()
  @Type(() => Number)
  parent_id?: number | null;

  @ApiPropertyOptional({ example: 'https://youtube.com/watch?v=xxx', description: 'URL Video minh họa' })
  @IsOptional()
  @IsString()
  video_url?: string;
}
