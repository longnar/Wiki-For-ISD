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
exports.CreateNewsDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateNewsDto {
}
exports.CreateNewsDto = CreateNewsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Balance Patch v5.2.0', description: 'Tiêu đề bản cập nhật' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tiêu đề không được để trống' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNewsDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'v5.2.0', description: 'Phiên bản game' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Phiên bản không được để trống' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNewsDto.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2024-05-15', description: 'Ngày phát hành (YYYY-MM-DD)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNewsDto.prototype, "release_date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1, description: '1 nếu là bản cập nhật lớn, 0 nếu là hotfix' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateNewsDto.prototype, "is_major", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Hệ thống (System)\n- Tăng blockstun...', description: 'Nội dung chi tiết bản cập nhật' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Nội dung bản cập nhật không được để trống' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNewsDto.prototype, "content", void 0);
//# sourceMappingURL=create-news.dto.js.map