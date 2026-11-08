-- Migration 007: Thêm cột parent_id cho bảng glossaries để hỗ trợ Child Glossary
ALTER TABLE glossaries ADD COLUMN parent_id INT NULL DEFAULT NULL AFTER level;

ALTER TABLE glossaries ADD CONSTRAINT fk_glossaries_parent FOREIGN KEY (parent_id) REFERENCES glossaries(id) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX idx_glossaries_parent_id ON glossaries(parent_id);

