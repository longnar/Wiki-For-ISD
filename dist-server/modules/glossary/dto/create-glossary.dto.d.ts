import type { GlossaryLevel } from '../../../entities/glossary.entity';
export declare class CreateGlossaryDto {
    term: string;
    definition: string;
    level?: GlossaryLevel;
    parent_id?: number | null;
    video_url?: string;
}
