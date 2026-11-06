-- Migration: Create news table and seed initial patch data

CREATE TABLE IF NOT EXISTS news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    release_date DATE NULL,
    is_major TINYINT(1) DEFAULT 1,
    content LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed initial patches if news table is empty
INSERT INTO news (id, version, title, release_date, is_major, content)
SELECT * FROM (
    SELECT 
        1 AS id,
        'v5.2.0' AS version,
        'Balance Patch v5.2.0' AS title,
        '2024-05-15' AS release_date,
        1 AS is_major,
        'He thong (System)\n  - Blockstun buffer tang tu 4 -> 5.\n  - Universal overhead: Hien tai la -5 tren block.\n  - Superchat reversal: Gio day se kich hoat IPS (Infinite Prevention System - He thong chong combo vo tan).\n  - Gan nhu tat ca cac don light normals gio day se bi giam luong meter gain khi bi block. Cac truong hop ngoai le se duoc ghi chu o phan lien quan.\n  - Tat ca cac don EX (1-bar) deu bi tang thoi gian meter penalty them 1 giay.\n  - Burst:\n    - Tai nguyen yeu cau de burst gio day duoc chuan hoa dua tren luong mau cua nhan vat. Tai nguyen yeu cau hien tai se tinh theo ty le phan tram (%).\n    - Burst gio day khong the bi burst nguoc lai.\n    - Neutral burst gio day se cung cap 90 superchat (tuong duong 3 bars).\n\nNhan vat (Characters)\nFubuki\n  - 5M: O frame thu 7, giam tam danh cua hitbox. Tu frame thu 8 tro di, hitbox tro lai nhu cu.\n  - 4H: Tang recovery them 5.\n  - 214L/LSSR: Tang recovery them 5.\n  - 22H: Tang recovery them 7.\n  - 236S: Tang startup them 2.\n\nKorone\n  - 5M: O frame thu 7, giam tam danh cua hitbox. Tu frame thu 8 tro di, hitbox tro lai nhu cu.\n  - 2M: Tang pushback khi bi block.\n  - 22L: Giam vertical knockback doi voi nhung doi thu dang dung tren mat dat.\n  - 22H: Giam sat thuong tu 160 -> 140.\n\nSora\n  - 22L:\n    - Giam nhe chieu cao cua don launch (hat tung).\n    - Mot khi da o tren khong, gio day co the dieu huong (drift) bang cac nut nhap trai/phai.\n  - 236S: Them mot hitbox o ngay phia tren dau cua Sora.\n\nSuisei\n  - 5L/2L: Duoc mien tru khoi viec bi giam meter gain cua don light normal.\n  - 2M: Tang attack level tu 1 -> 2.\n  - 5H: Giam startup di 2.\n  - 3H: Tang blockstun them 2.\n  - 236H: Giam startup cua armor tu 11 -> 7.\n  - 214M: Sat thuong tang tu 30 -> 60.\n  - 214H: Tang thoi gian ton tai cua projectile them 60 frames.\n  - 22S:\n    - Khong con khoa Suisei khoi viec cancel cac chieu thuc khac khi chieu nay duoc su dung.\n    - Ban them cac dac tinh bo sung khi duoc cancel tu Dash va Backdash.\n    - kyou mo kawaii.\n\nAyame\n  - 3H: Gio day se lao ve phia truoc (advances). Giam blockstun.\n  - 236L: Tang recovery them 4.\n  - 236M: Tang recovery them 8.\n  - 214H:\n    - Giam tam bay xa (travel range).\n    - Giam startup cua projectile invuln tu 7 -> 5.\n  - 22H: Giam sat thuong tu 180 -> 160.\n  - 22S: Cac bong ma gio day se bien mat neu Ayame bi trung burst.\n\nCoco\n  - Fire: Gio day ton tai lau hon gap 2 lan.\n  - Backdash: Giam thoi gian invuln di 1, tang recovery them 2.\n  - 3H: Tang startup them 2.\n  - 214L: Tang startup them 2, tang recovery them 3.\n  - 214M:\n    - Giam nhe tam danh.\n    - Dieu chinh hieu ung chuyen dong de nhin ro rang truc quan hon khi va cham voi doi thu.\n  - 214H: Giam blockstun di 7.\n  - 214G: Giam ty le scaling tu 0.5x -> 0.25x.\n  - 22G: Tang recovery khi bi whiff.\n  - 22S:\n    - Gio day ban 1 superchat ngay lan dau su dung.\n    - Ban 6 superchat sau moi 25 frames giu nut bam.\n    - Giam startup cua projectile invuln tu 14 -> 10.\n  - 236S: Tang startup them 2.\n\nAki\n  - Grab: Sua loi ky thuat hoan doi vi tri ben man hinh.\n  - 5H: Giam blockstun di 2, giam knockback khi bi block o don danh dau tien.\n  - 6M: Giam hieu ung keo hut doi thu vao khi bi block.\n  - j.H: Them mot hitbox phu nam o phia duoi trong nhung active frames muon hon.\n  - 236M: Dieu chinh lai goc danh va diem xuat hien, tang attack level them 2.\n  - 214M: Dieu chinh lai goc danh va diem xuat hien, khong con bi whiff voi doi thu ngoi.\n  - [2]8L: Giam recovery di 5.\n\nBotan\n  - Jump: Dieu chinh lai hurtbox.\n  - 5H: Tang attack level them 2, tang horizontal knockback khi bi block.\n\nPekora\n  - 214M: Giam sat thuong tu 120 xuong 80.\n  - 22M: Sua loi bug khi projectile gay ra trang thai air tech ngay khi vua duoc trieu hoi.\n  - j.S: Tang horizontal hurtbox.\n\nOllie\n  - Dash: Giam startup tu 7 -> 4.\n  - 5H: Tang kich thuoc upper hitbox, tang vertical juggle knockback.\n  - j.2S: Thoi gian khung khi tiep dat giam tu 5 -> 0.\n  - j.M: Tang thoi gian untech time.\n  - 236L: Dot song thu hai bi -2 blockstun, dot song thu ba bi -4 blockstun.\n  - 236M/H: Tang hitstun va blockstun them 5.\n  - 214M: Khung armor xuat hien som hon 1 frame.\n  - 22L/M: Giam kich thuoc lower hurtbox.\n  - j.214L: Attack level cua tat ca cac don danh gio day co dinh la 1.\n  - j.214M: Tang pushback khi bi block.\n  - j.214H: Giam startup di 2 frames.\n\nIna\n  - 4M: Gio day co the cancel ra don khac khi danh trung projectile.\n  - 3M: Gio day chi co the duoc cancel bang cac don special moves.\n  - [4]6L Tako: Gian cach thoi gian giua cac don multihits.\n  - [2]8H: Giam sat thuong tu 180 -> 160.\n  - 22S: Cac chu Tako gio day ton tai lau hon va khong bien mat khi Ina bi trung don.\n\nKoyori\n  - g.2L: Them mot upper hitbox phu o phia tren.\n  - g.2M: Tang grounded vertical knockback, sat thuong giam tu 50 -> 45.\n  - c.2H: Tang tam danh.\n  - g.2H: Sat thuong tang tu 85 -> 110.\n  - j.L: Sat thuong giam tu 60 -> 40.\n  - j.M: Tang nhe vertical juggle knockback.\n  - j.H: Sat thuong tang tu 90 -> 100.\n  - Throw: Gio day co the cancel thang sang chieu 5S.\n  - c.5S: Giam recovery di 2.\n  - g.236L: Tang nhe vertical juggle knockback.\n  - c.236M: Tang vertical knockback khi bi block o tren khong.\n  - c.236H: Giam startup xuong con 10.\n  - g.214L: Tang attack level them 1.\n  - 236S: Tang kich thuoc hitbox de bao phu mot chut phan hong sung.\n\nTro thu (Collabs)\nRoboco\n  - Off collab: Giam thoi gian ten lua cham dat, tang gian cach giua cac dot, tang kich thuoc hitbox.\nMarine\n  - Off collab: Khong con bi bien mat khi nguoi trieu hoi bi dinh don.\n  - Call in: Sat thuong don 1 la 100, don 2 la 50, don 3 va 4 la 25.\nMoona\n  - Off collab: Ton tai lau hon them 1 giay.\nKaela\n  - Off collab: Hieu ung tang phong thu ty le nghich voi luong mau toi da.\nFauna\n  - Off collab: Hoi phuc cham tu tu 100 mau trong 10 giay.\nSubaru\n  - Off collab: Trieu hoi nhan vat phu chay ra xa, giam sat thuong tu 80 -> 40.\nMiko\n  - Off collab: Xuat hien o vi tri xa hon ve phia truoc.\nKanata\n  - Call-in: Sat thuong giam xuong con 300.' AS content
    UNION ALL
    SELECT 
        2, 
        'v5.1.12', 
        'Patch v5.1.12', 
        '2024-04-02', 
        0, 
        'Sua loi he thong (Hotfixes)\n  - Sua loi am thanh lap vo han khi don Superchat ket thuc dung luc tran dau hoa.\n  - Toi uu hoa hieu nang render hat hieu ung tuyet roi cua Fubuki tren cac cau hinh may yeu.\n  - Sua loi desync trong che do Rollback Netcode khi nguoi choi su dung phim Pause lien tuc.'
    UNION ALL
    SELECT 
        3, 
        'v5.1.11', 
        'Patch v5.1.11', 
        '2024-03-18', 
        0, 
        'Dieu chinh nhan vat (Character Tuning)\nBotan\n  - Sua loi hoat anh nem luu dan bi tre 2 frames khi thuc hien sau cu nhay lui.\nAyame\n  - Can bang lai thoi gian hoi chieu cua Quy luot khi doi thu o trang thai nam san.'
    UNION ALL
    SELECT 
        4, 
        'v5.1.10', 
        'Patch v5.1.10', 
        '2024-02-28', 
        0, 
        'Cap nhat Tro Thu (Collab Adjustments)\n  - Marine: Dieu chinh goc roi cua hom kho bau de tranh tinh trang roi ra ngoai mep man hinh.\n  - Roboco: Cai thien do chinh xac cua duong ngam tia laser.'
    UNION ALL
    SELECT 
        5, 
        'v5.1.9', 
        'Patch v5.1.9', 
        '2024-01-20', 
        0, 
        'Tinh chinh che do luyen tap (Training Mode)\n  - Bo sung tuy chon hien thi Frame Advantage theo thoi gian thuc tren thanh thong so.\n  - Them tuy chon gia lap do tre mang tu 1 den 5 frames delay.'
    UNION ALL
    SELECT 
        6, 
        'v5.1.8', 
        'Patch v5.1.8', 
        '2023-12-15', 
        0, 
        'Cap nhat giai dau mua dong (Winter Update)\n  - Cap nhat giao dien giai dau Idol Showdown Next Fest.\n  - Sua loi giao dien hien thi ten nhan vat trong phong cho nhieu nguoi choi.'
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM news LIMIT 1);
