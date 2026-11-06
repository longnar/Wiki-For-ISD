import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Glossary } from '../../entities/glossary.entity';
import { CreateGlossaryDto } from './dto/create-glossary.dto';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class GlossaryService {
  constructor(
    @InjectRepository(Glossary)
    private glossaryRepo: Repository<Glossary>,
    private storageService: StorageService,
  ) {}

  private async deleteUploadedFile(relativeUrl: string | null) {
    if (!relativeUrl) return;
    await this.storageService.deleteFile(relativeUrl);
  }

  async getAllGlossaries(): Promise<Glossary[]> {
    return this.glossaryRepo.find({ order: { term: 'ASC' } });
  }

  async createGlossary(dto: CreateGlossaryDto, file?: Express.Multer.File) {
    const { term, definition, level, video_url } = dto;
    const glossaryLevel = level === 'advanced' ? 'advanced' : 'basic';
    const imageUrl = file ? await this.storageService.uploadFile(file, 'glossary') : null;

    try {
      const existing = await this.glossaryRepo.findOne({ where: { term } });
      if (existing) {
        if (file) await this.deleteUploadedFile(imageUrl);
        throw new BadRequestException(`The glossary term '${term}' already exists.`);
      }

      const newGlossary = this.glossaryRepo.create({
        term,
        definition,
        level: glossaryLevel,
        image_url: imageUrl,
        video_url: video_url || null,
      });

      const saved = await this.glossaryRepo.save(newGlossary);
      return { message: 'Glossary term created successfully.', glossary: saved };
    } catch (error) {
      if (file) await this.deleteUploadedFile(imageUrl);
      throw error;
    }
  }

  async updateGlossary(id: number, dto: Partial<CreateGlossaryDto>, file?: Express.Multer.File) {
    const glossary = await this.glossaryRepo.findOne({ where: { id } });
    if (!glossary) {
      throw new NotFoundException('Glossary term not found.');
    }

    let imageUrl = glossary.image_url;
    if (file) {
      if (glossary.image_url) await this.deleteUploadedFile(glossary.image_url);
      imageUrl = await this.storageService.uploadFile(file, 'glossary');
    }

    if (dto.term && dto.term !== glossary.term) {
      const existing = await this.glossaryRepo.findOne({ where: { term: dto.term, id: Not(id) } });
      if (existing) {
        if (file) await this.deleteUploadedFile(imageUrl);
        throw new BadRequestException(`The term '${dto.term}' is already in use.`);
      }
    }

    glossary.term = dto.term !== undefined ? dto.term : glossary.term;
    glossary.definition = dto.definition !== undefined ? dto.definition : glossary.definition;
    glossary.level = dto.level !== undefined ? (dto.level === 'advanced' ? 'advanced' : 'basic') : glossary.level;
    glossary.image_url = imageUrl;
    glossary.video_url = dto.video_url !== undefined ? (dto.video_url || null) : glossary.video_url;

    const saved = await this.glossaryRepo.save(glossary);
    return { message: 'Glossary term updated successfully.', glossary: saved };
  }

  async deleteGlossary(id: number) {
    const glossary = await this.glossaryRepo.findOne({ where: { id } });
    if (!glossary) throw new NotFoundException('Glossary term not found.');

    await this.glossaryRepo.remove(glossary);
    if (glossary.image_url) await this.deleteUploadedFile(glossary.image_url);

    return { message: 'Glossary term deleted successfully.' };
  }
}
