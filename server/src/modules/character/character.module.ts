import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Character } from '../../entities/character.entity';
import { CharacterMove } from '../../entities/character-move.entity';
import { CharacterBaseStat } from '../../entities/character-base-stat.entity';
import { CharacterService } from './character.service';
import { CharacterController } from './character.controller';
import { MizuumiParserService } from './mizuumi-parser.service';

@Module({
  imports: [TypeOrmModule.forFeature([Character, CharacterMove, CharacterBaseStat])],
  controllers: [CharacterController],
  providers: [CharacterService, MizuumiParserService],
  exports: [CharacterService, MizuumiParserService],
})
export class CharacterModule {}
