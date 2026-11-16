import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMoveDto {
  @ApiProperty({ example: 'Gawr Gura', description: 'Tên nhân vật' })
  @IsNotEmpty({ message: 'CHAR_NAME is required.' })
  @IsString()
  CHAR_NAME: string;

  @ApiProperty({ example: 'Trident Thrust', description: 'Tên đòn đánh' })
  @IsNotEmpty({ message: 'CHAR_MOVE is required.' })
  @IsString()
  CHAR_MOVE: string;

  @ApiPropertyOptional({ example: 800 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  DAMAGE?: number;

  @ApiPropertyOptional({ example: 6 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  START_UP?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ACTIVE?: number;

  @ApiPropertyOptional({ example: 14 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  RECOVERY?: number;

  @ApiPropertyOptional({ example: -2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ADV_ON_BLOCK?: number;

  @ApiPropertyOptional({ example: '+4 hoặc HKD' })
  @IsOptional()
  ADV_ON_HIT?: string | number;

  @ApiPropertyOptional({ example: 'Upper body invulnerable on frames 1-4' })
  @IsOptional()
  @IsString()
  INVULNERABILITY?: string;

  @ApiPropertyOptional({ example: '/uploads/hitbox-12345.png' })
  @IsOptional()
  @IsString()
  hitbox_url?: string;

  @ApiPropertyOptional({ example: '["/uploads/hitbox-1.png", "/uploads/hitbox-2.png"]' })
  @IsOptional()
  hitbox_urls?: string;

  @ApiPropertyOptional({ example: 'Frame 6-8 Active Hitbox' })
  @IsOptional()
  @IsString()
  hitbox_caption?: string;

  @ApiPropertyOptional({ example: 'normal' })
  @IsOptional()
  @IsString()
  move_type?: string;

  @ApiPropertyOptional({ example: 'Mid' })
  @IsOptional()
  @IsString()
  guard?: string;

  @ApiPropertyOptional({ example: 'Chemistry / Gadget' })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiPropertyOptional({ example: 'Special-cancellable on block' })
  @IsOptional()
  @IsString()
  properties?: string;

  @ApiPropertyOptional({ example: 'Core poke used in neutral.' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpsertBaseStatsDto {
  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  HP?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  WALKSPEED?: number;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  JUMP_START_UP?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  DASH_START_UP?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  BACKDASH?: number;

  @ApiPropertyOptional({ example: 'Shining Trident' })
  @IsOptional()
  @IsString()
  REVERSAL?: string;
}
