"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateGlossaryDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateGlossaryDto {
}
exports.CreateGlossaryDto = CreateGlossaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Okizeme', description: 'Tên thuật ngữ' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Term is required.' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGlossaryDto.prototype, "term", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Đòn tấn công khi đối thủ vừa đứng dậy', description: 'Định nghĩa thuật ngữ' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Definition is required.' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGlossaryDto.prototype, "definition", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'basic', enum: ['basic', 'advanced'], description: 'Cấp độ thuật ngữ' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['basic', 'advanced']),
    __metadata("design:type", String)
], CreateGlossaryDto.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1, description: 'ID thuật ngữ cha (nếu là thuật ngữ con)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateGlossaryDto.prototype, "parent_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://youtube.com/watch?v=xxx', description: 'URL Video minh họa' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGlossaryDto.prototype, "video_url", void 0);
//# sourceMappingURL=create-glossary.dto.js.map