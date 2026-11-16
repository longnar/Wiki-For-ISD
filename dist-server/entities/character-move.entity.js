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
exports.CharacterMove = void 0;
const typeorm_1 = require("typeorm");
const character_entity_1 = require("./character.entity");
let CharacterMove = class CharacterMove {
};
exports.CharacterMove = CharacterMove;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CharacterMove.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CharacterMove.prototype, "character_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], CharacterMove.prototype, "CHAR_NAME", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 150 }),
    __metadata("design:type", String)
], CharacterMove.prototype, "CHAR_MOVE", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], CharacterMove.prototype, "DAMAGE", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], CharacterMove.prototype, "START_UP", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], CharacterMove.prototype, "ACTIVE", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], CharacterMove.prototype, "RECOVERY", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], CharacterMove.prototype, "ADV_ON_BLOCK", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], CharacterMove.prototype, "ADV_ON_HIT", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], CharacterMove.prototype, "INVULNERABILITY", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], CharacterMove.prototype, "hitbox_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], CharacterMove.prototype, "hitbox_urls", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], CharacterMove.prototype, "hitbox_caption", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true, default: 'normal' }),
    __metadata("design:type", String)
], CharacterMove.prototype, "move_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true, default: 'Mid' }),
    __metadata("design:type", String)
], CharacterMove.prototype, "guard", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], CharacterMove.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], CharacterMove.prototype, "properties", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], CharacterMove.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => character_entity_1.Character, (character) => character.moves, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'character_id' }),
    __metadata("design:type", character_entity_1.Character)
], CharacterMove.prototype, "character", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CharacterMove.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CharacterMove.prototype, "updated_at", void 0);
exports.CharacterMove = CharacterMove = __decorate([
    (0, typeorm_1.Entity)('character_moves')
], CharacterMove);
//# sourceMappingURL=character-move.entity.js.map