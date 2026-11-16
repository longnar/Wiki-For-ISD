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
exports.UpsertBaseStatsDto = exports.CreateMoveDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateMoveDto {
}
exports.CreateMoveDto = CreateMoveDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Gawr Gura', description: 'Tên nhân vật' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'CHAR_NAME is required.' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMoveDto.prototype, "CHAR_NAME", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Trident Thrust', description: 'Tên đòn đánh' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'CHAR_MOVE is required.' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMoveDto.prototype, "CHAR_MOVE", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 800 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateMoveDto.prototype, "DAMAGE", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 6 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateMoveDto.prototype, "START_UP", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 3 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateMoveDto.prototype, "ACTIVE", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 14 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateMoveDto.prototype, "RECOVERY", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: -2 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateMoveDto.prototype, "ADV_ON_BLOCK", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+4 hoặc HKD' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateMoveDto.prototype, "ADV_ON_HIT", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Upper body invulnerable on frames 1-4' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMoveDto.prototype, "INVULNERABILITY", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '/uploads/hitbox-12345.png' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMoveDto.prototype, "hitbox_url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '["/uploads/hitbox-1.png", "/uploads/hitbox-2.png"]' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMoveDto.prototype, "hitbox_urls", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Frame 6-8 Active Hitbox' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMoveDto.prototype, "hitbox_caption", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'normal' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMoveDto.prototype, "move_type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Mid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMoveDto.prototype, "guard", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Chemistry / Gadget' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMoveDto.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Special-cancellable on block' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMoveDto.prototype, "properties", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Core poke used in neutral.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMoveDto.prototype, "description", void 0);
class UpsertBaseStatsDto {
}
exports.UpsertBaseStatsDto = UpsertBaseStatsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpsertBaseStatsDto.prototype, "HP", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 50 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpsertBaseStatsDto.prototype, "WALKSPEED", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 4 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpsertBaseStatsDto.prototype, "JUMP_START_UP", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 3 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpsertBaseStatsDto.prototype, "DASH_START_UP", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpsertBaseStatsDto.prototype, "BACKDASH", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Shining Trident' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertBaseStatsDto.prototype, "REVERSAL", void 0);
//# sourceMappingURL=create-move.dto.js.map