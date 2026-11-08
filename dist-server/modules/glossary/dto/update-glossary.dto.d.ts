import { CreateGlossaryDto } from './create-glossary.dto';
declare const UpdateGlossaryDto_base: import("@nestjs/common").Type<Partial<CreateGlossaryDto>>;
export declare class UpdateGlossaryDto extends UpdateGlossaryDto_base {
    remove_image?: string;
}
export {};
