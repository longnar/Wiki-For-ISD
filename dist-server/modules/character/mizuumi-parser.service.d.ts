export interface ParsedMizuumiMove {
    CHAR_MOVE: string;
    CHAR_NAME?: string;
    DAMAGE: number | null;
    START_UP: number | null;
    ACTIVE: number | null;
    RECOVERY: number | null;
    ADV_ON_BLOCK: number | null;
    ADV_ON_HIT: number | null;
    INVULNERABILITY: string | null;
    guard: string | null;
    move_type: string;
    version: string | null;
    properties: string | null;
    description: string | null;
    hitbox_url: string | null;
    hitbox_caption: string | null;
    status?: 'new' | 'modified' | 'unchanged';
    diffFields?: string[];
    existingMoveId?: number;
}
export declare class MizuumiParserService {
    parseWikitext(rawContent: string, characterName?: string): ParsedMizuumiMove[];
    private parseSingleTemplate;
    private parseKeyValueBlock;
    private normalizeMoveObject;
    private parseNumber;
    private normalizeGuard;
    private inferMoveType;
    private normalizeHitboxUrl;
    diffMoves(parsedMoves: ParsedMizuumiMove[], existingMoves: any[]): ParsedMizuumiMove[];
}
