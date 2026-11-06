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
exports.NewsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const news_entity_1 = require("../../entities/news.entity");
let NewsService = class NewsService {
    constructor(newsRepo) {
        this.newsRepo = newsRepo;
    }
    async getAllNews() {
        return this.newsRepo.find({
            order: {
                release_date: 'DESC',
                id: 'DESC',
            },
        });
    }
    async getNewsById(id) {
        const news = await this.newsRepo.findOne({ where: { id } });
        if (!news) {
            throw new common_1.NotFoundException(`Bản cập nhật với ID ${id} không tồn tại.`);
        }
        return news;
    }
    async createNews(dto) {
        const newPatch = this.newsRepo.create({
            title: dto.title,
            version: dto.version,
            release_date: dto.release_date || null,
            is_major: dto.is_major !== undefined ? Number(dto.is_major) : 1,
            content: dto.content,
        });
        const saved = await this.newsRepo.save(newPatch);
        return {
            message: 'Tạo bản cập nhật thành công.',
            patch: saved,
        };
    }
    async updateNews(id, dto) {
        const patch = await this.newsRepo.findOne({ where: { id } });
        if (!patch) {
            throw new common_1.NotFoundException(`Bản cập nhật với ID ${id} không tồn tại.`);
        }
        if (dto.title !== undefined)
            patch.title = dto.title;
        if (dto.version !== undefined)
            patch.version = dto.version;
        if (dto.release_date !== undefined)
            patch.release_date = dto.release_date || null;
        if (dto.is_major !== undefined)
            patch.is_major = Number(dto.is_major);
        if (dto.content !== undefined)
            patch.content = dto.content;
        const saved = await this.newsRepo.save(patch);
        return {
            message: 'Cập nhật bản cập nhật thành công.',
            patch: saved,
        };
    }
    async deleteNews(id) {
        const patch = await this.newsRepo.findOne({ where: { id } });
        if (!patch) {
            throw new common_1.NotFoundException(`Bản cập nhật với ID ${id} không tồn tại.`);
        }
        await this.newsRepo.remove(patch);
        return {
            message: 'Xóa bản cập nhật thành công.',
        };
    }
};
exports.NewsService = NewsService;
exports.NewsService = NewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(news_entity_1.News)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], NewsService);
//# sourceMappingURL=news.service.js.map