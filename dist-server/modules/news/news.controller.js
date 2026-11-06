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
exports.NewsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const news_service_1 = require("./news.service");
const create_news_dto_1 = require("./dto/create-news.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let NewsController = class NewsController {
    constructor(newsService) {
        this.newsService = newsService;
    }
    getAllNews() {
        return this.newsService.getAllNews();
    }
    getNewsById(id) {
        return this.newsService.getNewsById(id);
    }
    createNews(dto) {
        return this.newsService.createNews(dto);
    }
    updateNews(id, dto) {
        return this.newsService.updateNews(id, dto);
    }
    deleteNews(id) {
        return this.newsService.deleteNews(id);
    }
};
exports.NewsController = NewsController;
__decorate([
    (0, common_1.Get)('news'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách các bản cập nhật / tin tức' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], NewsController.prototype, "getAllNews", null);
__decorate([
    (0, common_1.Get)('news/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết một bản cập nhật theo ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NewsController.prototype, "getNewsById", null);
__decorate([
    (0, common_1.Post)('admin/news'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, jwt_auth_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Thêm bản cập nhật mới (Admin)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_news_dto_1.CreateNewsDto]),
    __metadata("design:returntype", void 0)
], NewsController.prototype, "createNews", null);
__decorate([
    (0, common_1.Put)('admin/news/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, jwt_auth_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật bản cập nhật (Admin)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], NewsController.prototype, "updateNews", null);
__decorate([
    (0, common_1.Delete)('admin/news/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, jwt_auth_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa bản cập nhật (Admin)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NewsController.prototype, "deleteNews", null);
exports.NewsController = NewsController = __decorate([
    (0, swagger_1.ApiTags)('News'),
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [news_service_1.NewsService])
], NewsController);
//# sourceMappingURL=news.controller.js.map