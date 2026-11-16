-- ============================================================================
-- Migration 008: Chuyển ADV_ON_HIT sang VARCHAR(50) & Hỗ trợ Nhiều ảnh Hitbox / Glossary
-- ============================================================================

-- 1. Đổi ADV_ON_HIT từ INT sang VARCHAR(50) để hỗ trợ nhập chữ (HKD, SKD, Launch, KD, +2, -4...)
ALTER TABLE character_moves MODIFY COLUMN ADV_ON_HIT VARCHAR(50) NULL;

-- 2. Thêm cột hitbox_urls (JSON mảng hoặc chuỗi phân tách) để hỗ trợ nhiều ảnh hitbox cho đòn đánh
ALTER TABLE character_moves ADD COLUMN hitbox_urls TEXT NULL AFTER hitbox_url;

-- 3. Thêm cột image_urls (JSON mảng hoặc chuỗi phân tách) để hỗ trợ nhiều ảnh minh họa cho thuật ngữ Glossary
ALTER TABLE glossaries ADD COLUMN image_urls TEXT NULL AFTER image_url;
