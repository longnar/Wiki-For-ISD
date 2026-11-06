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
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cloudinary_1 = require("cloudinary");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let StorageService = StorageService_1 = class StorageService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(StorageService_1.name);
        this.isCloudinaryEnabled = false;
        const cloudName = this.configService.get('CLOUDINARY_CLOUD_NAME');
        const apiKey = this.configService.get('CLOUDINARY_API_KEY');
        const apiSecret = this.configService.get('CLOUDINARY_API_SECRET');
        const cloudinaryUrl = this.configService.get('CLOUDINARY_URL');
        if (cloudinaryUrl || (cloudName && apiKey && apiSecret)) {
            if (cloudinaryUrl) {
                cloudinary_1.v2.config({ cloudinary_url: cloudinaryUrl });
            }
            else {
                cloudinary_1.v2.config({
                    cloud_name: cloudName,
                    api_key: apiKey,
                    api_secret: apiSecret,
                    secure: true,
                });
            }
            this.isCloudinaryEnabled = true;
            this.logger.log('Persistent Cloud Storage (Cloudinary) enabled successfully.');
        }
        else {
            this.logger.log('Local disk storage active (saving to /uploads). Provide CLOUDINARY_* env to persist files on Render.');
        }
    }
    async uploadFile(file, folder = 'general') {
        if (!file)
            return '';
        if (this.isCloudinaryEnabled && file.path) {
            try {
                const uploadResult = await cloudinary_1.v2.uploader.upload(file.path, {
                    folder: `idol_showdown/${folder}`,
                    resource_type: 'auto',
                    use_filename: true,
                    unique_filename: true,
                });
                fs.unlink(file.path, (err) => {
                    if (err)
                        this.logger.warn(`Could not remove temp file: ${file.path}`);
                });
                return uploadResult.secure_url;
            }
            catch (error) {
                this.logger.error(`Cloudinary upload failed: ${error.message}. Falling back to local URL.`);
            }
        }
        return `/uploads/${file.filename}`;
    }
    async deleteFile(fileUrlOrPath) {
        if (!fileUrlOrPath)
            return;
        if (fileUrlOrPath.includes('cloudinary.com') && this.isCloudinaryEnabled) {
            try {
                const parts = fileUrlOrPath.split('/');
                const uploadIndex = parts.indexOf('upload');
                if (uploadIndex !== -1 && parts.length > uploadIndex + 2) {
                    const publicPathParts = parts.slice(uploadIndex + 1);
                    if (publicPathParts[0].startsWith('v') && !isNaN(Number(publicPathParts[0].substring(1)))) {
                        publicPathParts.shift();
                    }
                    const publicIdWithExt = publicPathParts.join('/');
                    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
                    await cloudinary_1.v2.uploader.destroy(publicId);
                    return;
                }
            }
            catch (error) {
                this.logger.warn(`Could not delete Cloudinary asset: ${error.message}`);
            }
        }
        const filename = fileUrlOrPath.replace(/^\/uploads\//, '');
        const filepath = path.join(process.cwd(), 'uploads', filename);
        fs.unlink(filepath, (err) => {
            if (err && err.code !== 'ENOENT') {
                this.logger.warn(`Could not delete local file: ${filepath} (${err.message})`);
            }
        });
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map