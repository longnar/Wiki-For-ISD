import { ConfigService } from '@nestjs/config';
export declare class StorageService {
    private readonly configService;
    private readonly logger;
    private isCloudinaryEnabled;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File, folder?: string): Promise<string>;
    deleteFile(fileUrlOrPath: string | null): Promise<void>;
}
