import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Glossary } from '../../entities/glossary.entity';
import { CreateGlossaryDto } from './dto/create-glossary.dto';
import { UpdateGlossaryDto } from './dto/update-glossary.dto';
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

  private async validateNoCycle(termId: number, proposedParentId: number): Promise<void> {
    if (proposedParentId === termId) {
      throw new BadRequestException('Một thuật ngữ không thể làm cha của chính nó.');
    }

    const visited = new Set<number>([termId]);
    let currentParentId: number | null | undefined = proposedParentId;
    let steps = 0;
    const MAX_DEPTH = 100;

    while (currentParentId && steps < MAX_DEPTH) {
      if (visited.has(currentParentId)) {
        throw new BadRequestException(
          'Không thể chọn thuật ngữ con/cháu làm cha vì sẽ tạo ra vòng lặp phân cấp.',
        );
      }
      visited.add(currentParentId);

      const ancestor = await this.glossaryRepo.findOne({
        where: { id: currentParentId },
        select: ['id', 'parent_id'],
      });
      if (!ancestor) {
        if (steps === 0) {
          throw new BadRequestException('Thuật ngữ cha được chọn không tồn tại.');
        }
        break;
      }
      currentParentId = ancestor.parent_id;
      steps++;
    }
  }

  async getAllGlossaries(): Promise<Glossary[]> {
    return this.glossaryRepo.find({
      relations: ['parent', 'children'],
      order: { term: 'ASC' },
    });
  }

  async createGlossary(dto: CreateGlossaryDto, file?: Express.Multer.File) {
    const { term, definition, level, video_url, parent_id } = dto;
    const glossaryLevel = level === 'advanced' ? 'advanced' : 'basic';
    const imageUrl = file ? await this.storageService.uploadFile(file, 'glossary') : null;

    let parentIdNum: number | null = null;
    if (parent_id !== undefined && parent_id !== null && `${parent_id}`.trim() !== '') {
      parentIdNum = Number(parent_id);
      if (!isNaN(parentIdNum) && parentIdNum > 0) {
        const parentTerm = await this.glossaryRepo.findOne({ where: { id: parentIdNum } });
        if (!parentTerm) {
          if (file) await this.deleteUploadedFile(imageUrl);
          throw new BadRequestException('Thuật ngữ cha được chọn không tồn tại.');
        }
      } else {
        parentIdNum = null;
      }
    }

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
        parent_id: parentIdNum,
        image_url: imageUrl,
        video_url: video_url && video_url.trim() !== '' ? video_url.trim() : null,
      });

      const saved = await this.glossaryRepo.save(newGlossary);
      return { message: 'Glossary term created successfully.', glossary: saved };
    } catch (error) {
      if (file) await this.deleteUploadedFile(imageUrl);
      throw error;
    }
  }

  async updateGlossary(id: number, dto: UpdateGlossaryDto, file?: Express.Multer.File) {
    const glossary = await this.glossaryRepo.findOne({ where: { id } });
    if (!glossary) {
      throw new NotFoundException('Glossary term not found.');
    }

    if (dto.term && dto.term !== glossary.term) {
      const existing = await this.glossaryRepo.findOne({ where: { term: dto.term, id: Not(id) } });
      if (existing) {
        throw new BadRequestException(`The term '${dto.term}' is already in use.`);
      }
    }

    let nextParentId = glossary.parent_id;
    if (dto.parent_id !== undefined) {
      if (dto.parent_id === null || `${dto.parent_id}`.trim() === '' || Number(dto.parent_id) === 0) {
        nextParentId = null;
      } else {
        const pId = Number(dto.parent_id);
        await this.validateNoCycle(id, pId);
        nextParentId = pId;
      }
    }

    let imageUrl = glossary.image_url;
    if (file) {
      if (glossary.image_url) await this.deleteUploadedFile(glossary.image_url);
      imageUrl = await this.storageService.uploadFile(file, 'glossary');
    } else if (dto.remove_image === 'true' || dto.remove_image === '1') {
      if (glossary.image_url) await this.deleteUploadedFile(glossary.image_url);
      imageUrl = null;
    }

    glossary.parent_id = nextParentId;
    glossary.term = dto.term !== undefined ? dto.term : glossary.term;
    glossary.definition = dto.definition !== undefined ? dto.definition : glossary.definition;
    glossary.level = dto.level !== undefined ? (dto.level === 'advanced' ? 'advanced' : 'basic') : glossary.level;
    glossary.image_url = imageUrl;
    if (dto.video_url !== undefined) {
      glossary.video_url = dto.video_url && dto.video_url.trim() !== '' ? dto.video_url.trim() : null;
    }

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
