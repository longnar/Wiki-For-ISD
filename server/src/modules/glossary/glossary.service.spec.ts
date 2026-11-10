import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GlossaryService } from './glossary.service';
import { Glossary } from '../../entities/glossary.entity';
import { StorageService } from '../storage/storage.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('GlossaryService', () => {
  let service: GlossaryService;
  let repoMock: any;
  let storageServiceMock: any;

  const mockGlossary: Glossary = {
    id: 1,
    term: 'Hitstun',
    definition: 'Thời gian nhân vật bị choáng sau khi trúng đòn.',
    level: 'basic',
    parent_id: null,
    parent: null,
    children: [],
    image_url: '/uploads/hitstun.png',
    video_url: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockChildGlossary: Glossary = {
    ...mockGlossary,
    id: 2,
    term: 'Blockstun',
    parent_id: 1,
    image_url: null,
  };

  const mockGrandChildGlossary: Glossary = {
    ...mockGlossary,
    id: 3,
    term: 'Pushblock',
    parent_id: 2,
    image_url: null,
  };

  beforeEach(async () => {
    repoMock = {
      find: jest.fn().mockResolvedValue([mockGlossary]),
      findOne: jest.fn().mockImplementation(({ where }) => {
        if (where?.id === 1) return Promise.resolve({ ...mockGlossary });
        if (where?.id === 2) return Promise.resolve({ ...mockChildGlossary });
        if (where?.id === 3) return Promise.resolve({ ...mockGrandChildGlossary });
        if (where?.term === 'Hitstun') return Promise.resolve({ ...mockGlossary });
        return Promise.resolve(null);
      }),
      create: jest.fn().mockImplementation((dto) => ({ id: 2, ...dto })),
      save: jest.fn().mockImplementation((item) => Promise.resolve(item)),
      remove: jest.fn().mockResolvedValue(true),
    };

    storageServiceMock = {
      uploadFile: jest.fn().mockResolvedValue('/uploads/mock-image.png'),
      deleteFile: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GlossaryService,
        {
          provide: getRepositoryToken(Glossary),
          useValue: repoMock,
        },
        {
          provide: StorageService,
          useValue: storageServiceMock,
        },
      ],
    }).compile();

    service = module.get<GlossaryService>(GlossaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllGlossaries', () => {
    it('should return all glossaries sorted by term ASC', async () => {
      const result = await service.getAllGlossaries();
      expect(result).toHaveLength(1);
      expect(result[0].term).toBe('Hitstun');
      expect(repoMock.find).toHaveBeenCalledWith({
        relations: ['parent', 'children'],
        order: { term: 'ASC' },
      });
    });
  });

  describe('deleteGlossary', () => {
    it('should delete glossary and delete associated file', async () => {
      const result = await service.deleteGlossary(1);
      expect(result.message).toBe('Glossary term deleted successfully.');
      expect(repoMock.remove).toHaveBeenCalled();
      expect(storageServiceMock.deleteFile).toHaveBeenCalledWith('/uploads/hitstun.png');
    });

    it('should throw NotFoundException if term does not exist', async () => {
      await expect(service.deleteGlossary(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateGlossary hierarchy & cycle detection', () => {
    it('should allow valid multi-level parent assignment (grandchild -> child -> root)', async () => {
      const result = await service.updateGlossary(3, { parent_id: 2 });
      expect(result.glossary.parent_id).toBe(2);
      expect(repoMock.save).toHaveBeenCalled();
    });

    it('should reject self-parenting', async () => {
      await expect(service.updateGlossary(1, { parent_id: 1 })).rejects.toThrow(BadRequestException);
    });

    it('should reject setting a descendant (grandchild) as parent to prevent cycles', async () => {
      await expect(service.updateGlossary(1, { parent_id: 3 })).rejects.toThrow(BadRequestException);
    });

    it('should reject setting non-existent parent_id', async () => {
      await expect(service.updateGlossary(2, { parent_id: 999 })).rejects.toThrow(BadRequestException);
    });
  });
});
