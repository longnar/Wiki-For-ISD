import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from '../../entities/news.entity';
import { CreateNewsDto } from './dto/create-news.dto';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private readonly newsRepo: Repository<News>,
  ) {}

  async getAllNews(): Promise<News[]> {
    return this.newsRepo.find({
      order: {
        release_date: 'DESC',
        id: 'DESC',
      },
    });
  }

  async getNewsById(id: number): Promise<News> {
    const news = await this.newsRepo.findOne({ where: { id } });
    if (!news) {
      throw new NotFoundException(`Bản cập nhật với ID ${id} không tồn tại.`);
    }
    return news;
  }

  async createNews(dto: CreateNewsDto) {
    const newPatch = this.newsRepo.create({
      title: dto.title,
      version: dto.version,
      release_date: dto.release_date || null,
      is_major: dto.is_major !== undefined ? Number(dto.is_major) : 1,
      content: dto.content,
    });

    const saved = await this.newsRepo.save(newPatch);
    return {
      message: 'Tạo bản cập nhật thành công.',
      patch: saved,
    };
  }

  async updateNews(id: number, dto: Partial<CreateNewsDto>) {
    const patch = await this.newsRepo.findOne({ where: { id } });
    if (!patch) {
      throw new NotFoundException(`Bản cập nhật với ID ${id} không tồn tại.`);
    }

    if (dto.title !== undefined) patch.title = dto.title;
    if (dto.version !== undefined) patch.version = dto.version;
    if (dto.release_date !== undefined) patch.release_date = dto.release_date || null;
    if (dto.is_major !== undefined) patch.is_major = Number(dto.is_major);
    if (dto.content !== undefined) patch.content = dto.content;

    const saved = await this.newsRepo.save(patch);
    return {
      message: 'Cập nhật bản cập nhật thành công.',
      patch: saved,
    };
  }

  async deleteNews(id: number) {
    const patch = await this.newsRepo.findOne({ where: { id } });
    if (!patch) {
      throw new NotFoundException(`Bản cập nhật với ID ${id} không tồn tại.`);
    }

    await this.newsRepo.remove(patch);
    return {
      message: 'Xóa bản cập nhật thành công.',
    };
  }
}
