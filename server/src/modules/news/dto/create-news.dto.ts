import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNewsDto {
  @ApiProperty({ example: 'Balance Patch v5.2.0', description: 'Tiêu đề bản cập nhật' })
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'v5.2.0', description: 'Phiên bản game' })
  @IsNotEmpty({ message: 'Phiên bản không được để trống' })
  @IsString()
  version: string;

  @ApiPropertyOptional({ example: '2024-05-15', description: 'Ngày phát hành (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  release_date?: string;

  @ApiPropertyOptional({ example: 1, description: '1 nếu là bản cập nhật lớn, 0 nếu là hotfix' })
  @IsOptional()
  is_major?: number;

  @ApiProperty({ example: 'Hệ thống (System)\n- Tăng blockstun...', description: 'Nội dung chi tiết bản cập nhật' })
  @IsNotEmpty({ message: 'Nội dung bản cập nhật không được để trống' })
  @IsString()
  content: string;
}
