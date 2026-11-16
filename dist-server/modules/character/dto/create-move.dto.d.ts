export declare class CreateMoveDto {
    CHAR_NAME: string;
    CHAR_MOVE: string;
    DAMAGE?: number;
    START_UP?: number;
    ACTIVE?: number;
    RECOVERY?: number;
    ADV_ON_BLOCK?: number;
    ADV_ON_HIT?: string | number;
    INVULNERABILITY?: string;
    hitbox_url?: string;
    hitbox_urls?: string;
    hitbox_caption?: string;
    move_type?: string;
    guard?: string;
    version?: string;
    properties?: string;
    description?: string;
}
export declare class UpsertBaseStatsDto {
    HP?: number;
    WALKSPEED?: number;
    JUMP_START_UP?: number;
    DASH_START_UP?: number;
    BACKDASH?: number;
    REVERSAL?: string;
}
