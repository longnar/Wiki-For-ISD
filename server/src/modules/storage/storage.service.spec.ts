import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;
  let configServiceMock: any;

  beforeEach(async () => {
    configServiceMock = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'CLOUDINARY_CLOUD_NAME') return null;
        if (key === 'CLOUDINARY_API_KEY') return null;
        if (key === 'CLOUDINARY_API_SECRET') return null;
        if (key === 'CLOUDINARY_URL') return null;
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should return empty string if no file is provided', async () => {
      const result = await service.uploadFile(null as any);
      expect(result).toBe('');
    });

    it('should return local uploads path when Cloudinary is not configured', async () => {
      const mockFile = {
        filename: 'hitbox-12345.gif',
        path: '/tmp/hitbox-12345.gif',
      } as Express.Multer.File;

      const result = await service.uploadFile(mockFile, 'hitboxes');
      expect(result).toBe('/uploads/hitbox-12345.gif');
    });
  });

  describe('deleteFile', () => {
    it('should do nothing if null or empty url is passed', async () => {
      await expect(service.deleteFile(null)).resolves.not.toThrow();
      await expect(service.deleteFile('')).resolves.not.toThrow();
    });
  });
});
