import { CharacterService } from './character.service';
import { CreateCharacterDto } from './dto/create-character.dto';
import { CreateMoveDto, UpsertBaseStatsDto } from './dto/create-move.dto';
export declare class CharacterController {
    private readonly characterService;
    constructor(characterService: CharacterService);
    getAllCharacters(): Promise<import("../../entities/character.entity").Character[]>;
    getCharacterById(id: number): Promise<import("../../entities/character.entity").Character>;
    getCharacterMoves(id: number): Promise<import("../../entities/character-move.entity").CharacterMove[]>;
    getCharacterBaseStats(id: number): Promise<import("../../entities/character-base-stat.entity").CharacterBaseStat>;
    createCharacter(dto: CreateCharacterDto, file?: Express.Multer.File): Promise<{
        message: string;
        character: import("../../entities/character.entity").Character;
    }>;
    updateCharacter(id: number, dto: Partial<CreateCharacterDto>, file?: Express.Multer.File): Promise<{
        message: string;
        character: import("../../entities/character.entity").Character;
    }>;
    deleteCharacter(id: number): Promise<{
        message: string;
    }>;
    createCharacterMove(id: number, dto: CreateMoveDto, file?: Express.Multer.File): Promise<{
        message: string;
        move: import("../../entities/character-move.entity").CharacterMove;
    }>;
    updateCharacterMove(id: number, moveId: number, dto: Partial<CreateMoveDto>, file?: Express.Multer.File): Promise<{
        message: string;
        move: import("../../entities/character-move.entity").CharacterMove;
    }>;
    deleteCharacterMove(id: number, moveId: number): Promise<{
        message: string;
    }>;
    upsertCharacterBaseStats(id: number, dto: UpsertBaseStatsDto): Promise<{
        message: string;
        base_stats: import("../../entities/character-base-stat.entity").CharacterBaseStat;
    }>;
    parseMizuumi(id: number, wikitext: string): Promise<{
        character: {
            id: number;
            name: string;
        };
        totalParsed: number;
        moves: import("./mizuumi-parser.service").ParsedMizuumiMove[];
    }>;
    batchSaveMoves(id: number, moves: any[]): Promise<{
        message: string;
        inserted: number;
        updated: number;
        total: number;
    }>;
}
