"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCharacterDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_character_dto_1 = require("./create-character.dto");
class UpdateCharacterDto extends (0, swagger_1.PartialType)(create_character_dto_1.CreateCharacterDto) {
}
exports.UpdateCharacterDto = UpdateCharacterDto;
//# sourceMappingURL=update-character.dto.js.map