import { Injectable, NotFoundException, BadRequestException, HttpException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Character } from '../../entities/character.entity';
import { CharacterMove } from '../../entities/character-move.entity';
import { CharacterBaseStat } from '../../entities/character-base-stat.entity';
import { CreateCharacterDto } from './dto/create-character.dto';
import { CreateMoveDto } from './dto/create-move.dto';
import { UpsertBaseStatsDto } from './dto/create-move.dto';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class CharacterService {
  constructor(
    @InjectRepository(Character)
    private characterRepo: Repository<Character>,
    @InjectRepository(CharacterMove)
    private moveRepo: Repository<CharacterMove>,
    @InjectRepository(CharacterBaseStat)
    private baseStatRepo: Repository<CharacterBaseStat>,
    private storageService: StorageService,
  ) {}

  private async deleteUploadedFile(relativeUrl: string | null) {
    if (!relativeUrl) return;
    await this.storageService.deleteFile(relativeUrl);
  }

  async getAllCharacters(): Promise<Character[]> {
    return this.characterRepo.find({ order: { name: 'ASC' } });
  }

  async getCharacterById(id: number): Promise<Character> {
    const character = await this.characterRepo.findOne({
      where: { id },
      relations: ['moves', 'base_stats'],
    });
    if (!character) throw new NotFoundException('Character not found.');
    return character;
  }

  async createCharacter(dto: CreateCharacterDto, file?: Express.Multer.File) {
    const imageUrl = file ? await this.storageService.uploadFile(file, 'characters') : null;
    try {
      const newCharacter = this.characterRepo.create({
        name: dto.name,
        debut_date: dto.debut_date || null,
        description: dto.description || null,
        difficulty: dto.difficulty ? Number(dto.difficulty) : 1,
        type: dto.type || null,
        image_url: imageUrl,
      });
      const saved = await this.characterRepo.save(newCharacter);
      return { message: 'Character created successfully.', character: saved };
    } catch (error) {
      if (file) await this.deleteUploadedFile(imageUrl);
      throw error;
    }
  }

  async updateCharacter(id: number, dto: Partial<CreateCharacterDto>, file?: Express.Multer.File) {
    const character = await this.characterRepo.findOne({ where: { id } });
    if (!character) {
      throw new NotFoundException('Character not found.');
    }

    let imageUrl = character.image_url;
    if (file) {
      if (character.image_url) await this.deleteUploadedFile(character.image_url);
      imageUrl = await this.storageService.uploadFile(file, 'characters');
    }

    character.name = dto.name !== undefined ? dto.name : character.name;
    character.debut_date = dto.debut_date !== undefined ? (dto.debut_date || null) : character.debut_date;
    character.description = dto.description !== undefined ? (dto.description || null) : character.description;
    character.difficulty = dto.difficulty !== undefined ? Number(dto.difficulty) : character.difficulty;
    character.type = dto.type !== undefined ? (dto.type || null) : character.type;
    character.image_url = imageUrl;

    const saved = await this.characterRepo.save(character);
    return { message: 'Character updated successfully.', character: saved };
  }

  async deleteCharacter(id: number) {
    const character = await this.characterRepo.findOne({ where: { id } });
    if (!character) throw new NotFoundException('Character not found.');

    await this.characterRepo.remove(character);
    if (character.image_url) await this.deleteUploadedFile(character.image_url);

    return { message: 'Character deleted successfully.' };
  }

  async getCharacterMoves(characterId: number): Promise<CharacterMove[]> {
    await this.getCharacterById(characterId);
    return this.moveRepo.find({ where: { character_id: characterId }, order: { id: 'ASC' } });
  }

  async getCharacterBaseStats(characterId: number): Promise<CharacterBaseStat | null> {
    await this.getCharacterById(characterId);
    return this.baseStatRepo.findOne({ where: { character_id: characterId } });
  }

  async createCharacterMove(characterId: number, dto: CreateMoveDto, file?: Express.Multer.File) {
    await this.getCharacterById(characterId);
    const hitboxUrl = file ? await this.storageService.uploadFile(file, 'hitboxes') : (dto.hitbox_url || null);
    const newMove = this.moveRepo.create({
      character_id: characterId,
      ...dto,
      hitbox_url: hitboxUrl,
    });
    const saved = await this.moveRepo.save(newMove);
    return { message: 'Character move created successfully.', move: saved };
  }

  async updateCharacterMove(moveId: number, characterId: number, dto: Partial<CreateMoveDto>, file?: Express.Multer.File) {
    const move = await this.moveRepo.findOne({ where: { id: moveId, character_id: characterId } });
    if (!move) throw new NotFoundException('Character move not found.');

    if (file) {
      if (move.hitbox_url) {
        await this.deleteUploadedFile(move.hitbox_url);
      }
      dto.hitbox_url = await this.storageService.uploadFile(file, 'hitboxes');
    }

    Object.assign(move, dto);
    const saved = await this.moveRepo.save(move);
    return { message: 'Character move updated successfully.', move: saved };
  }

  async deleteCharacterMove(moveId: number, characterId: number) {
    try {
      let move = await this.moveRepo.findOne({ where: { id: moveId, character_id: characterId } });
      if (!move) {
        move = await this.moveRepo.findOne({ where: { id: moveId } });
      }
      if (!move) {
        return { message: 'Character move not found or already deleted.' };
      }

      if (move.hitbox_url) {
        await this.deleteUploadedFile(move.hitbox_url);
      }

      await this.moveRepo.delete({ id: move.id });
      return { message: 'Character move deleted successfully.' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error('[Error] deleteCharacterMove failed:', error);
      throw new InternalServerErrorException(error.message || 'Lỗi khi xóa đòn đánh trong cơ sở dữ liệu.');
    }
  }

  async upsertCharacterBaseStats(characterId: number, dto: UpsertBaseStatsDto) {
    await this.getCharacterById(characterId);
    let baseStat = await this.baseStatRepo.findOne({ where: { character_id: characterId } });
    if (!baseStat) {
      baseStat = this.baseStatRepo.create({ character_id: characterId, ...dto });
    } else {
      Object.assign(baseStat, dto);
    }
    const saved = await this.baseStatRepo.save(baseStat);
    return { message: 'Character base stats saved successfully.', base_stats: saved };
  }
}
