import { GlossaryService } from './glossary.service';
import { CreateGlossaryDto } from './dto/create-glossary.dto';
import { UpdateGlossaryDto } from './dto/update-glossary.dto';
export declare class GlossaryController {
    private readonly glossaryService;
    constructor(glossaryService: GlossaryService);
    getAllGlossaries(): Promise<import("../../entities/glossary.entity").Glossary[]>;
    createGlossary(dto: CreateGlossaryDto, file?: Express.Multer.File): Promise<{
        message: string;
        glossary: import("../../entities/glossary.entity").Glossary;
    }>;
    updateGlossary(id: number, dto: UpdateGlossaryDto, file?: Express.Multer.File): Promise<{
        message: string;
        glossary: import("../../entities/glossary.entity").Glossary;
    }>;
    deleteGlossary(id: number): Promise<{
        message: string;
    }>;
}
