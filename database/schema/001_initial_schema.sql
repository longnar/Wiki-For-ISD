-- Create Database (Run this manually in MySQL if not already created)
CREATE DATABASE IF NOT EXISTS idol_showdown_wiki;
USE idol_showdown_wiki;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'guest') NOT NULL DEFAULT 'guest',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Characters Table
CREATE TABLE IF NOT EXISTS characters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    debut_date DATE,
    description TEXT,
    difficulty INT DEFAULT 1, -- 1 (Easy) to 6 (Hardest)
    type VARCHAR(100), -- e.g., Rushdown, Zoner, Grappler, Puppet, etc.
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Character Moves Table
CREATE TABLE IF NOT EXISTS character_moves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    character_id INT NOT NULL,
    CHAR_NAME VARCHAR(100) NOT NULL,
    CHAR_MOVE VARCHAR(150) NOT NULL,
    DAMAGE INT,
    START_UP INT,
    ACTIVE INT,
    RECOVERY INT,
    ADV_ON_BLOCK INT,
    ADV_ON_HIT INT,
    INVULNERABILITY VARCHAR(255),
    hitbox_url VARCHAR(255),
    hitbox_caption VARCHAR(255),
    move_type VARCHAR(50) DEFAULT 'normal',
    guard VARCHAR(50) DEFAULT 'Mid',
    version VARCHAR(100),
    properties TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_character_moves_character
        FOREIGN KEY (character_id) REFERENCES characters(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Character Base Stats Table (one row per character)
CREATE TABLE IF NOT EXISTS character_base_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    character_id INT NOT NULL UNIQUE,
    HP INT,
    WALKSPEED INT,
    JUMP_START_UP INT,
    DASH_START_UP INT,
    BACKDASH INT,
    REVERSAL VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_character_base_stats_character
        FOREIGN KEY (character_id) REFERENCES characters(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Glossaries Table
CREATE TABLE IF NOT EXISTS glossaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    term VARCHAR(100) NOT NULL UNIQUE,
    definition TEXT NOT NULL,
    level ENUM('basic', 'advanced') NOT NULL DEFAULT 'basic',
    parent_id INT NULL DEFAULT NULL,
    image_url VARCHAR(255),
    video_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_glossaries_parent
        FOREIGN KEY (parent_id) REFERENCES glossaries(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Default Admin User
-- Username: admin
-- Password: admin123
INSERT INTO users (username, password_hash, role) 
VALUES ('admin', '$2b$10$l70Ybfbr5a6.88Qp2By3QuuiWls9bjqmm1PAc7.Ujb1TWTWHezyPe', 'admin')
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash);
