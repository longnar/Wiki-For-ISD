import { Character } from './character.entity';
export declare class CharacterMove {
    id: number;
    character_id: number;
    CHAR_NAME: string;
    CHAR_MOVE: string;
    DAMAGE: number | null;
    START_UP: number | null;
    ACTIVE: number | null;
    RECOVERY: number | null;
    ADV_ON_BLOCK: number | null;
    ADV_ON_HIT: string | null;
    INVULNERABILITY: string | null;
    hitbox_url: string | null;
    hitbox_urls: string | null;
    hitbox_caption: string | null;
    move_type: string | null;
    guard: string | null;
    version: string | null;
    properties: string | null;
    description: string | null;
    character: Character;
    created_at: Date;
    updated_at: Date;
}
