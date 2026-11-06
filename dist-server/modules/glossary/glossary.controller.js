"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlossaryController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const multer_1 = require("multer");
const path = __importStar(require("path"));
const glossary_service_1 = require("./glossary.service");
const create_glossary_dto_1 = require("./dto/create-glossary.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const multerOptions = {
    storage: (0, multer_1.diskStorage)({
        destination: path.join(process.cwd(), 'uploads'),
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = path.extname(file.originalname);
            cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
    }),
    limits: {
        fileSize: 25 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Chỉ chấp nhận tệp định dạng hình ảnh (.png, .jpg, .webp, .svg, .gif).'), false);
        }
    },
};
let GlossaryController = class GlossaryController {
    constructor(glossaryService) {
        this.glossaryService = glossaryService;
    }
    getAllGlossaries() {
        return this.glossaryService.getAllGlossaries();
    }
    createGlossary(dto, file) {
        return this.glossaryService.createGlossary(dto, file);
    }
    updateGlossary(id, dto, file) {
        return this.glossaryService.updateGlossary(id, dto, file);
    }
    deleteGlossary(id) {
        return this.glossaryService.deleteGlossary(id);
    }
};
exports.GlossaryController = GlossaryController;
__decorate([
    (0, common_1.Get)('glossaries'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách các thuật ngữ Glossary' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GlossaryController.prototype, "getAllGlossaries", null);
__decorate([
    (0, common_1.Post)('admin/glossaries'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, jwt_auth_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', multerOptions)),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Thêm thuật ngữ Glossary mới (Admin)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_glossary_dto_1.CreateGlossaryDto, Object]),
    __metadata("design:returntype", void 0)
], GlossaryController.prototype, "createGlossary", null);
__decorate([
    (0, common_1.Put)('admin/glossaries/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, jwt_auth_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', multerOptions)),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật thuật ngữ Glossary (Admin)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], GlossaryController.prototype, "updateGlossary", null);
__decorate([
    (0, common_1.Delete)('admin/glossaries/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, jwt_auth_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa thuật ngữ Glossary (Admin)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], GlossaryController.prototype, "deleteGlossary", null);
exports.GlossaryController = GlossaryController = __decorate([
    (0, swagger_1.ApiTags)('Glossaries'),
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [glossary_service_1.GlossaryService])
], GlossaryController);
//# sourceMappingURL=glossary.controller.js.map