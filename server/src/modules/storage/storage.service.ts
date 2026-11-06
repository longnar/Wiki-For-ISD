import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private isCloudinaryEnabled = false;

  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');
    const cloudinaryUrl = this.configService.get<string>('CLOUDINARY_URL');

    if (cloudinaryUrl || (cloudName && apiKey && apiSecret)) {
      if (cloudinaryUrl) {
        cloudinary.config({ cloudinary_url: cloudinaryUrl });
      } else {
        cloudinary.config({
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret,
          secure: true,
        });
      }
      this.isCloudinaryEnabled = true;
      this.logger.log('Persistent Cloud Storage (Cloudinary) enabled successfully.');
    } else {
      this.logger.log(
        'Local disk storage active (saving to /uploads). Provide CLOUDINARY_* env to persist files on Render.',
      );
    }
  }

  /**
   * Tải tệp lên: Sử dụng Cloudinary nếu đã cấu hình, hoặc lưu trữ cục bộ (/uploads/...)
   */
  async uploadFile(file: Express.Multer.File, folder = 'general'): Promise<string> {
    if (!file) return '';

    if (this.isCloudinaryEnabled && file.path) {
      try {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: `idol_showdown/${folder}`,
          resource_type: 'auto',
          use_filename: true,
          unique_filename: true,
        });

        // Xóa file tạm cục bộ sau khi đã đẩy lên Cloudinary
        fs.unlink(file.path, (err) => {
          if (err) this.logger.warn(`Could not remove temp file: ${file.path}`);
        });

        return uploadResult.secure_url;
      } catch (error) {
        this.logger.error(`Cloudinary upload failed: ${error.message}. Falling back to local URL.`);
      }
    }

    // Chế độ lưu cục bộ fallback
    return `/uploads/${file.filename}`;
  }

  /**
   * Xóa tệp: Hỗ trợ cả URL Cloudinary và đường dẫn tệp cục bộ
   */
  async deleteFile(fileUrlOrPath: string | null): Promise<void> {
    if (!fileUrlOrPath) return;

    // 1. Nếu là URL Cloudinary
    if (fileUrlOrPath.includes('cloudinary.com') && this.isCloudinaryEnabled) {
      try {
        // Trích xuất public_id từ Cloudinary URL (e.g. idol_showdown/characters/image_xyz)
        const parts = fileUrlOrPath.split('/');
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex !== -1 && parts.length > uploadIndex + 2) {
          // Bỏ version nếu có (ví dụ v123456789)
          const publicPathParts = parts.slice(uploadIndex + 1);
          if (publicPathParts[0].startsWith('v') && !isNaN(Number(publicPathParts[0].substring(1)))) {
            publicPathParts.shift();
          }
          const publicIdWithExt = publicPathParts.join('/');
          const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
          await cloudinary.uploader.destroy(publicId);
          return;
        }
      } catch (error) {
        this.logger.warn(`Could not delete Cloudinary asset: ${error.message}`);
      }
    }

    // 2. Nếu là file cục bộ (/uploads/...)
    const filename = fileUrlOrPath.replace(/^\/uploads\//, '');
    const filepath = path.join(process.cwd(), 'uploads', filename);
    fs.unlink(filepath, (err) => {
      if (err && err.code !== 'ENOENT') {
        this.logger.warn(`Could not delete local file: ${filepath} (${err.message})`);
      }
    });
  }
}
