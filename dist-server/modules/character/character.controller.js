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
exports.CharacterController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const multer_1 = require("multer");
const path = __importStar(require("path"));
const character_service_1 = require("./character.service");
const create_character_dto_1 = require("./dto/create-character.dto");
const create_move_dto_1 = require("./dto/create-move.dto");
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
let CharacterController = class CharacterController {
    constructor(characterService) {
        this.characterService = characterService;
    }
    getAllCharacters() {
        return this.characterService.getAllCharacters();
    }
    getCharacterById(id) {
        return this.characterService.getCharacterById(id);
    }
    getCharacterMoves(id) {
        return this.characterService.getCharacterMoves(id);
    }
    getCharacterBaseStats(id) {
        return this.characterService.getCharacterBaseStats(id);
    }
    createCharacter(dto, file) {
        return this.characterService.createCharacter(dto, file);
    }
    updateCharacter(id, dto, file) {
        return this.characterService.updateCharacter(id, dto, file);
    }
    deleteCharacter(id) {
        return this.characterService.deleteCharacter(id);
    }
    createCharacterMove(id, dto, file) {
        return this.characterService.createCharacterMove(id, dto, file);
    }
    updateCharacterMove(id, moveId, dto, file) {
        return this.characterService.updateCharacterMove(moveId, id, dto, file);
    }
    deleteCharacterMove(id, moveId) {
        return this.characterService.deleteCharacterMove(moveId, id);
    }
    upsertCharacterBaseStats(id, dto) {
        return this.characterService.upsertCharacterBaseStats(id, dto);
    }
};
exports.CharacterController = CharacterController;
__decorate([
    (0, common_1.Get)('characters'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách nhân vật' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CharacterController.prototype, "getAllCharacters", null);
__decorate([
    (0, common_1.Get)('characters/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết nhân vật theo ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CharacterController.prototype, "getCharacterById", null);
__decorate([
    (0, common_1.Get)('characters/:id/moves'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách đòn đánh của nhân vật' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CharacterController.prototype, "getCharacterMoves", null);
__decorate([
    (0, common_1.Get)('characters/:id/base-stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chỉ số cơ bản của nhân vật' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CharacterController.prototype, "getCharacterBaseStats", null);
__decorate([
    (0, common_1.Post)('admin/characters'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, jwt_auth_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', multerOptions)),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo nhân vật mới (Admin)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_character_dto_1.CreateCharacterDto, Object]),
    __metadata("design:returntype", void 0)
], CharacterController.prototype, "createCharacter", null);
__decorate([
    (0, common_1.Put)('admin/characters/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, jwt_auth_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', multerOptions)),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật nhân vật (Admin)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], CharacterController.prototype, "updateCharacter", null);
__decorate([
    (0, common_1.Delete)('admin/characters/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, jwt_auth_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa nhân vật (Admin)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CharacterController.prototype, "deleteCharacter", null);
__decorate([
    (0, common_1.Post)('admin/characters/:id/moves'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, jwt_auth_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('hitbox', multerOptions)),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiConsumes)('multipart/form-data', 'application/json'),
    (0, swagger_1.ApiOperation)({ summary: 'Thêm đòn đánh cho nhân vật (Admin)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_move_dto_1.CreateMoveDto, Object]),
    __metadata("design:returntype", void 0)
], CharacterController.prototype, "createCharacterMove", null);
__decorate([
    (0, common_1.Put)('admin/characters/:id/moves/:moveId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, jwt_auth_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('hitbox', multerOptions)),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiConsumes)('multipart/form-data', 'application/json'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật đòn đánh của nhân vật (Admin)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('moveId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object, Object]),
    __metadata("design:returntype", void 0)
], CharacterController.prototype, "updateCharacterMove", null);
__decorate([
    (0, common_1.Delete)('admin/characters/:id/moves/:moveId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, jwt_auth_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa đòn đánh của nhân vật (Admin)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('moveId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], CharacterController.prototype, "deleteCharacterMove", null);
__decorate([
    (0, common_1.Put)('admin/characters/:id/base-stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, jwt_auth_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật chỉ số cơ bản cho nhân vật (Admin)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_move_dto_1.UpsertBaseStatsDto]),
    __metadata("design:returntype", void 0)
], CharacterController.prototype, "upsertCharacterBaseStats", null);
exports.CharacterController = CharacterController = __decorate([
    (0, swagger_1.ApiTags)('Characters'),
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [character_service_1.CharacterService])
], CharacterController);
//# sourceMappingURL=character.controller.js.map