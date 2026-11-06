import { Repository } from 'typeorm';
import { Glossary } from '../../entities/glossary.entity';
import { CreateGlossaryDto } from './dto/create-glossary.dto';
import { StorageService } from '../storage/storage.service';
export declare class GlossaryService {
    private glossaryRepo;
    private storageService;
    constructor(glossaryRepo: Repository<Glossary>, storageService: StorageService);
    private deleteUploadedFile;
    getAllGlossaries(): Promise<Glossary[]>;
    createGlossary(dto: CreateGlossaryDto, file?: Express.Multer.File): Promise<{
        message: string;
        glossary: Glossary;
    }>;
    updateGlossary(id: number, dto: Partial<CreateGlossaryDto>, file?: Express.Multer.File): Promise<{
        message: string;
        glossary: Glossary;
    }>;
    deleteGlossary(id: number): Promise<{
        message: string;
    }>;
}
