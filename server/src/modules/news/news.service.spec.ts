import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NewsService } from './news.service';
import { News } from '../../entities/news.entity';
import { NotFoundException } from '@nestjs/common';

describe('NewsService', () => {
  let service: NewsService;
  let repoMock: any;

  const mockNewsItem: News = {
    id: 1,
    title: 'Balance Patch v5.2.0',
    version: 'v5.2.0',
    release_date: '2024-05-15',
    is_major: 1,
    content: 'Patch notes content...',
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    repoMock = {
      find: jest.fn().mockResolvedValue([mockNewsItem]),
      findOne: jest.fn().mockImplementation(({ where: { id } }) => {
        if (id === 1) return Promise.resolve(mockNewsItem);
        return Promise.resolve(null);
      }),
      create: jest.fn().mockImplementation((dto) => ({ id: 2, ...dto })),
      save: jest.fn().mockImplementation((patch) => Promise.resolve(patch)),
      remove: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsService,
        {
          provide: getRepositoryToken(News),
          useValue: repoMock,
        },
      ],
    }).compile();

    service = module.get<NewsService>(NewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllNews', () => {
    it('should return an array of news sorted by release_date DESC', async () => {
      const result = await service.getAllNews();
      expect(result).toHaveLength(1);
      expect(result[0].version).toBe('v5.2.0');
      expect(repoMock.find).toHaveBeenCalledWith({
        order: { release_date: 'DESC', id: 'DESC' },
      });
    });
  });

  describe('getNewsById', () => {
    it('should return a news item if found', async () => {
      const result = await service.getNewsById(1);
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException if news item is not found', async () => {
      await expect(service.getNewsById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createNews', () => {
    it('should successfully create and return a new patch', async () => {
      const dto = {
        title: 'New Hotfix v5.2.1',
        version: 'v5.2.1',
        release_date: '2024-06-01',
        is_major: 0,
        content: 'Fixed minor bugs',
      };
      const result = await service.createNews(dto);
      expect(result.message).toBe('Tạo bản cập nhật thành công.');
      expect(result.patch.title).toBe(dto.title);
      expect(repoMock.save).toHaveBeenCalled();
    });
  });

  describe('deleteNews', () => {
    it('should remove existing news item', async () => {
      const result = await service.deleteNews(1);
      expect(result.message).toBe('Xóa bản cập nhật thành công.');
      expect(repoMock.remove).toHaveBeenCalled();
    });

    it('should throw NotFoundException when deleting non-existent item', async () => {
      await expect(service.deleteNews(999)).rejects.toThrow(NotFoundException);
    });
  });
});
