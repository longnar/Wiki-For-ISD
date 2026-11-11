import { IsNotEmpty, IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCharacterDto {
  @ApiProperty({ example: 'Gawr Gura', description: 'Tên nhân vật' })
  @IsNotEmpty({ message: 'Character name is required.' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: '2020-09-13', description: 'Ngày ra mắt' })
  @IsOptional()
  @IsString()
  debut_date?: string;

  @ApiPropertyOptional({ example: 'Apex Predator of Hololive English', description: 'Mô tả nhân vật' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 2, description: 'Độ khó (1-6)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(6)
  difficulty?: number;

  @ApiPropertyOptional({ example: 'Rushdown', description: 'Loại nhân vật' })
  @IsOptional()
  @IsString()
  type?: string;
}
