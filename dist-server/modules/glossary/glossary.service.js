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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlossaryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const glossary_entity_1 = require("../../entities/glossary.entity");
const storage_service_1 = require("../storage/storage.service");
let GlossaryService = class GlossaryService {
    constructor(glossaryRepo, storageService) {
        this.glossaryRepo = glossaryRepo;
        this.storageService = storageService;
    }
    async deleteUploadedFile(relativeUrl) {
        if (!relativeUrl)
            return;
        await this.storageService.deleteFile(relativeUrl);
    }
    async validateNoCycle(termId, proposedParentId) {
        if (proposedParentId === termId) {
            throw new common_1.BadRequestException('Một thuật ngữ không thể làm cha của chính nó.');
        }
        const visited = new Set([termId]);
        let currentParentId = proposedParentId;
        let steps = 0;
        const MAX_DEPTH = 100;
        while (currentParentId && steps < MAX_DEPTH) {
            if (visited.has(currentParentId)) {
                throw new common_1.BadRequestException('Không thể chọn thuật ngữ con/cháu làm cha vì sẽ tạo ra vòng lặp phân cấp.');
            }
            visited.add(currentParentId);
            const ancestor = await this.glossaryRepo.findOne({
                where: { id: currentParentId },
                select: ['id', 'parent_id'],
            });
            if (!ancestor) {
                if (steps === 0) {
                    throw new common_1.BadRequestException('Thuật ngữ cha được chọn không tồn tại.');
                }
                break;
            }
            currentParentId = ancestor.parent_id;
            steps++;
        }
    }
    async getAllGlossaries() {
        return this.glossaryRepo.find({
            relations: ['parent', 'children'],
            order: { term: 'ASC' },
        });
    }
    async createGlossary(dto, file) {
        const { term, definition, level, video_url, parent_id } = dto;
        const glossaryLevel = level === 'advanced' ? 'advanced' : 'basic';
        const imageUrl = file ? await this.storageService.uploadFile(file, 'glossary') : null;
        let parentIdNum = null;
        if (parent_id !== undefined && parent_id !== null && `${parent_id}`.trim() !== '') {
            parentIdNum = Number(parent_id);
            if (!isNaN(parentIdNum) && parentIdNum > 0) {
                const parentTerm = await this.glossaryRepo.findOne({ where: { id: parentIdNum } });
                if (!parentTerm) {
                    if (file)
                        await this.deleteUploadedFile(imageUrl);
                    throw new common_1.BadRequestException('Thuật ngữ cha được chọn không tồn tại.');
                }
            }
            else {
                parentIdNum = null;
            }
        }
        try {
            const existing = await this.glossaryRepo.findOne({ where: { term } });
            if (existing) {
                if (file)
                    await this.deleteUploadedFile(imageUrl);
                throw new common_1.BadRequestException(`The glossary term '${term}' already exists.`);
            }
            const newGlossary = this.glossaryRepo.create({
                term,
                definition,
                level: glossaryLevel,
                parent_id: parentIdNum,
                image_url: imageUrl,
                video_url: video_url && video_url.trim() !== '' ? video_url.trim() : null,
            });
            const saved = await this.glossaryRepo.save(newGlossary);
            return { message: 'Glossary term created successfully.', glossary: saved };
        }
        catch (error) {
            if (file)
                await this.deleteUploadedFile(imageUrl);
            throw error;
        }
    }
    async updateGlossary(id, dto, file) {
        const glossary = await this.glossaryRepo.findOne({ where: { id } });
        if (!glossary) {
            throw new common_1.NotFoundException('Glossary term not found.');
        }
        if (dto.term && dto.term !== glossary.term) {
            const existing = await this.glossaryRepo.findOne({ where: { term: dto.term, id: (0, typeorm_2.Not)(id) } });
            if (existing) {
                throw new common_1.BadRequestException(`The term '${dto.term}' is already in use.`);
            }
        }
        let nextParentId = glossary.parent_id;
        if (dto.parent_id !== undefined) {
            if (dto.parent_id === null || `${dto.parent_id}`.trim() === '' || Number(dto.parent_id) === 0) {
                nextParentId = null;
            }
            else {
                const pId = Number(dto.parent_id);
                await this.validateNoCycle(id, pId);
                nextParentId = pId;
            }
        }
        let imageUrl = glossary.image_url;
        if (file) {
            if (glossary.image_url)
                await this.deleteUploadedFile(glossary.image_url);
            imageUrl = await this.storageService.uploadFile(file, 'glossary');
        }
        else if (dto.remove_image === 'true' || dto.remove_image === '1') {
            if (glossary.image_url)
                await this.deleteUploadedFile(glossary.image_url);
            imageUrl = null;
        }
        glossary.parent_id = nextParentId;
        glossary.term = dto.term !== undefined ? dto.term : glossary.term;
        glossary.definition = dto.definition !== undefined ? dto.definition : glossary.definition;
        glossary.level = dto.level !== undefined ? (dto.level === 'advanced' ? 'advanced' : 'basic') : glossary.level;
        glossary.image_url = imageUrl;
        if (dto.video_url !== undefined) {
            glossary.video_url = dto.video_url && dto.video_url.trim() !== '' ? dto.video_url.trim() : null;
        }
        const saved = await this.glossaryRepo.save(glossary);
        return { message: 'Glossary term updated successfully.', glossary: saved };
    }
    async deleteGlossary(id) {
        const glossary = await this.glossaryRepo.findOne({ where: { id } });
        if (!glossary)
            throw new common_1.NotFoundException('Glossary term not found.');
        await this.glossaryRepo.remove(glossary);
        if (glossary.image_url)
            await this.deleteUploadedFile(glossary.image_url);
        return { message: 'Glossary term deleted successfully.' };
    }
};
exports.GlossaryService = GlossaryService;
exports.GlossaryService = GlossaryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(glossary_entity_1.Glossary)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        storage_service_1.StorageService])
], GlossaryService);
//# sourceMappingURL=glossary.service.js.map