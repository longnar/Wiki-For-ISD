import { Repository } from 'typeorm';
import { Character } from '../../entities/character.entity';
import { CharacterMove } from '../../entities/character-move.entity';
import { CharacterBaseStat } from '../../entities/character-base-stat.entity';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { CreateMoveDto } from './dto/create-move.dto';
import { UpsertBaseStatsDto } from './dto/create-move.dto';
import { StorageService } from '../storage/storage.service';
import { MizuumiParserService, ParsedMizuumiMove } from './mizuumi-parser.service';
export declare class CharacterService {
    private characterRepo;
    private moveRepo;
    private baseStatRepo;
    private storageService;
    private mizuumiParser;
    constructor(characterRepo: Repository<Character>, moveRepo: Repository<CharacterMove>, baseStatRepo: Repository<CharacterBaseStat>, storageService: StorageService, mizuumiParser: MizuumiParserService);
    private deleteUploadedFile;
    getAllCharacters(): Promise<Character[]>;
    getCharacterById(id: number): Promise<Character>;
    createCharacter(dto: CreateCharacterDto, file?: Express.Multer.File): Promise<{
        message: string;
        character: Character;
    }>;
    updateCharacter(id: number, dto: UpdateCharacterDto, file?: Express.Multer.File): Promise<{
        message: string;
        character: Character;
    }>;
    deleteCharacter(id: number): Promise<{
        message: string;
    }>;
    getCharacterMoves(characterId: number): Promise<CharacterMove[]>;
    getCharacterBaseStats(characterId: number): Promise<CharacterBaseStat | null>;
    createCharacterMove(characterId: number, dto: CreateMoveDto, file?: Express.Multer.File): Promise<{
        message: string;
        move: CharacterMove;
    }>;
    updateCharacterMove(moveId: number, characterId: number, dto: Partial<CreateMoveDto>, file?: Express.Multer.File): Promise<{
        message: string;
        move: CharacterMove;
    }>;
    deleteCharacterMove(moveId: number, characterId: number): Promise<{
        message: string;
    }>;
    upsertCharacterBaseStats(characterId: number, dto: UpsertBaseStatsDto): Promise<{
        message: string;
        base_stats: CharacterBaseStat;
    }>;
    parseMizuumiWikitext(characterId: number, wikitext: string): Promise<{
        character: {
            id: number;
            name: string;
        };
        totalParsed: number;
        moves: ParsedMizuumiMove[];
    }>;
    batchSaveMoves(characterId: number, moves: ParsedMizuumiMove[]): Promise<{
        message: string;
        inserted: number;
        updated: number;
        total: number;
    }>;
}
