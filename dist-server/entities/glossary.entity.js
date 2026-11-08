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
exports.Glossary = void 0;
const typeorm_1 = require("typeorm");
let Glossary = class Glossary {
};
exports.Glossary = Glossary;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Glossary.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, unique: true }),
    __metadata("design:type", String)
], Glossary.prototype, "term", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Glossary.prototype, "definition", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['basic', 'advanced'], default: 'basic' }),
    __metadata("design:type", String)
], Glossary.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parent_id', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Glossary.prototype, "parent_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Glossary, (glossary) => glossary.children, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'parent_id' }),
    __metadata("design:type", Glossary)
], Glossary.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Glossary, (glossary) => glossary.parent),
    __metadata("design:type", Array)
], Glossary.prototype, "children", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Glossary.prototype, "image_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Glossary.prototype, "video_url", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Glossary.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Glossary.prototype, "updated_at", void 0);
exports.Glossary = Glossary = __decorate([
    (0, typeorm_1.Entity)('glossaries')
], Glossary);
//# sourceMappingURL=glossary.entity.js.map