# Idol Showdown Wiki — Tra cứu Frame Data & Glossary cho người mới

Web app wiki cho game đối kháng **Idol Showdown** (hololive fan game): xem danh sách nhân vật,
frame data từng đòn đánh, chỉ số cơ bản, thuật ngữ fighting game (Basic / Advanced) và tin
patch. Khách chỉ xem; **admin** đăng nhập để CRUD dữ liệu. Giao diện tiếng Việt.

## Tech stack

| Tầng | Công nghệ |
|---|---|
| Frontend | React 19 + Vite 8 (port 3000), CSS thuần (không dùng Tailwind), font Pixelify Sans |
| Backend | **NestJS 10** + TypeORM 0.3 + Passport JWT + Swagger, biên dịch TS → `dist-server/` (port 5000) |
| Database | MySQL 8.4 (Docker local) / Aiven Cloud MySQL (prod, SSL) |
| Deploy | Render (`*.onrender.com`), Node 20.x |
| Dev env | Dev Container (`.devcontainer/`) + `docker-compose.yml` |

## Luồng chạy runtime

```text
Browser ──> React (Vite :3000) ──proxy /api, /uploads──> NestJS (:5000) ──TypeORM──> MySQL
                                                          ├─ /uploads  -> thư mục uploads/ (ảnh upload)
                                                          ├─ /*        -> dist/ (frontend build, SPA)
                                                          └─ /api/docs -> Swagger UI
```

- `server.js` (entry `npm start`) chỉ nạp `.env` rồi `require('dist-server/main.js')`.
  Nếu chưa build NestJS → báo lỗi và thoát. **Phải `npm run build` (hoặc `build:nestjs`) trước.**
- `npm start` = `node database/migrate.js && node server.js` → migration tự chạy mỗi lần khởi động.
- Mọi request đi qua `SecurityMiddleware` (áp cho `*`).

## Cấu trúc thư mục

```text
.
├── server.js                  # Entry: load dist-server/main.js
├── server/
│   └── src/                   # ★ NestJS source (backend)
│       ├── main.ts            # bootstrap: CORS, ValidationPipe, Swagger, trust proxy, HOST/PORT
│       ├── app.module.ts      # TypeORM (MySQL), ServeStatic (uploads, dist), import modules
│       ├── app.controller.ts  # GET /api, GET /health/db
│       ├── entities/          # User, Character, CharacterMove, CharacterBaseStat, Glossary, NewsPatch, SecurityAuditLog
│       └── modules/
│           ├── auth/          # login/register, JwtStrategy, JwtAuthGuard + RolesGuard, @Roles()
│           ├── character/     # CRUD nhân vật, moves (kèm ảnh hitbox), base stats
│           ├── glossary/      # CRUD thuật ngữ (kèm ảnh)
│           ├── news/          # CRUD patch notes (JSON body)
│           └── security/      # IDS middleware, audit log, Discord webhook
├── dist-server/               # Output build NestJS (ĐƯỢC commit vào git — build lại sau mỗi lần sửa server/src)
├── src/                       # ★ React frontend
│   ├── main.tsx               # mount <App/>
│   ├── App.jsx                # State-based router (activePage), login modal, trang Home/Contacts/Glossary hub/Thêm nhân vật
│   ├── App.css, index.css     # Style chính (KHÔNG đổi giá trị kích thước/vị trí khi refactor)
│   ├── api/                   # client.js (apiRequest + Bearer token + object `api`), character.api.js
│   ├── components/
│   │   ├── character/         # CharacterSelectGrid, CharacterDetailView (frame data)
│   │   ├── glossary/          # GlossaryScreen (list + search + CRUD)
│   │   └── news/              # NewsScreen (patch notes + CRUD)
│   ├── data/                  # Dữ liệu fallback offline: characterFallbackData, glossaryData, newsData
│   ├── utils/                 # characterAssets (map tên → ảnh), characterButtons, decodeImage
│   └── assets/                # Ảnh branding, cards, buttons, decorative
├── asset/                     # Promo Art TP + Cutout (import từ src/utils/characterAssets.js) và logo nhân vật (chưa dùng)
├── public/cards/              # Ảnh card nhân vật dạng base64 (.txt) + manifest.json cho carousel trang chủ
├── database/
│   ├── schema/                # 001_initial_schema.sql (bảng chính + seed admin, dùng cho Docker initdb)
│   ├── migrations/            # db_migration_002..006_*.sql — chạy bởi migrate.js
│   ├── migrate.js             # Runner migration idempotent (bảng schema_migrations)
│   ├── setup.js               # Chạy 001_initial_schema.sql
│   ├── seed_characters.js     # Seed nhân vật + stats + moves
│   ├── sync_all_moves.js      # Đồng bộ moves từ src/data/characterFallbackData.js vào DB
│   └── update_admin_password.js
├── docs/                      # ARCHITECTURE.md, DATABASE.md, DEPLOY_AIVEN.md, tài liệu .docx
├── .devcontainer/             # Dev Container Node 20 + MySQL
├── .github/                   # dependabot + skills/archify (skill vendored bên thứ 3, không liên quan app)
├── docker-compose.yml         # MySQL 8.4, mount 001_initial_schema.sql vào initdb
├── vite.config.mjs            # proxy /api & /uploads → localhost:5000
├── tsconfig.json              # cho frontend (noEmit)
└── tsconfig.server.json       # build server/src → dist-server (commonjs, decorators)
```

## Scripts (`package.json`)

| Lệnh | Tác dụng |
|---|---|
| `npm run dev` | Chạy song song `dev:server` (build NestJS + nodemon server.js) và `dev:client` (Vite) |
| `npm run build` | `tsc -p tsconfig.server.json && vite build` → `dist-server/` + `dist/` |
| `npm start` / `start:server` | Migrate DB rồi chạy server |
| `npm run build:nestjs` / `start:nestjs` | Build / chạy riêng NestJS |
| `npm run db:up` / `db:down` / `db:logs` | Docker MySQL |
| `npm run db:migrate` / `db:setup` | Migration / khởi tạo schema |
| `npm test` | Chưa có test |

URL: Frontend `http://localhost:3000`, API `http://localhost:5000`, Swagger `http://localhost:5000/api/docs`.

## API (NestJS)

Public:
- `GET /api` — trạng thái, `GET /health/db`
- `POST /api/auth/login`, `POST /api/auth/register`
- `GET /api/characters`, `GET /api/characters/:id` (kèm `moves`, `base_stats`), `GET /api/characters/:id/moves`, `GET /api/characters/:id/base-stats`
- `GET /api/glossaries`
- `GET /api/news`, `GET /api/news/:id`

Admin (JWT Bearer + `@Roles('admin')`):
- `POST|PUT|DELETE /api/admin/characters[/:id]` — multipart, field ảnh `image`
- `POST|PUT|DELETE /api/admin/characters/:id/moves[/:moveId]` — multipart/JSON, field ảnh `hitbox`
- `PUT /api/admin/characters/:id/base-stats`
- `POST|PUT|DELETE /api/admin/glossaries[/:id]` — multipart, field `image`
- `POST|PUT|DELETE /api/admin/news[/:id]` — JSON `{ title, content, version?, release_date?, is_major? }`, trả `{ message, patch }`
- `GET /api/admin/security/logs?limit=`, `POST /api/admin/security/test-webhook`

Upload lưu ở `uploads/` với tên `<fieldname>-<timestamp>-<random><ext>`, DB lưu URL `/uploads/...`;
file cũ bị xóa khi thay ảnh hoặc xóa bản ghi.

## Database

Bảng: `users` (role `admin|guest`), `characters`, `character_moves` (FK cascade, cột frame data viết HOA:
`CHAR_NAME, CHAR_MOVE, DAMAGE, START_UP, ACTIVE, RECOVERY, ADV_ON_BLOCK, ADV_ON_HIT, INVULNERABILITY` +
`hitbox_url, hitbox_caption, move_type, guard, version, properties, description`), `character_base_stats`
(1-1, cột `HP, WALKSPEED, JUMP_START_UP, DASH_START_UP, BACKDASH, REVERSAL`), `glossaries` (`level basic|advanced`),
`news_patches` (migration 006), `security_audit_logs`, `schema_migrations`.

- TypeORM `synchronize: false` → schema do file SQL quản lý. Thêm cột = thêm file
  `database/migrations/db_migration_<số>_<tên>.sql` **và** cập nhật entity tương ứng.
- `migrate.js` tách statement bằng `;` → không viết `;` bên trong chuỗi/procedure.
- Seed admin mặc định trong `001_initial_schema.sql`: `admin` / `admin123` (prod đã đổi qua `update_admin_password.js`).

## Biến môi trường (`.env`, xem `.env.example`)

`DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SSL, DB_CA_PATH`, `JWT_SECRET, JWT_EXPIRES_IN`,
`PORT, HOST, NODE_ENV, APP_URL`, `DISCORD_WEBHOOK_URL`. Render tự set `RENDER`/`RENDER_SERVICE_ID`.

## Frontend — cách tổ chức

- **Không dùng react-router** (dù có cài): điều hướng bằng state `activePage` trong `App.jsx`
  (`home`, `news`, `contacts`, `glossary`, `glossary-basic`, `glossary-advanced`, `selection`, `selection-add`).
- Auth: token JWT lưu `localStorage['idol-showdown-token']`. `apiRequest` tự gắn `Authorization`;
  gặp 401/403 → xóa token và phát event `auth-expired` → App mở lại modal login.
- **Offline fallback**: Glossary/News/Character detail dùng dữ liệu trong `src/data/` khi API lỗi hoặc rỗng;
  thao tác CRUD thất bại sẽ cập nhật state cục bộ.
- Ảnh nhân vật map theo tên qua `src/utils/characterAssets.js` (13 nhân vật: Aki, Ayame, Biboo, Botan, Coco,
  Fubuki, Ina, Korone, Koyori, Ollie, Pekora, Sora, Suisei).
- Carousel trang chủ tải ảnh base64 từ `public/cards/*.txt` theo `manifest.json`, decode thành Blob URL.
- Mỗi màn hình có file CSS riêng cạnh component.

## Điểm nổi bật

- **Hệ thống phát hiện xâm nhập (IDS)** tự viết (`security.middleware.ts`): chặn dò file nhạy cảm
  (`/.env`, `/.git`, `/wp-admin`…), bot scanner theo User-Agent (sqlmap, nikto…), path traversal,
  mẫu SQLi/XSS trong query → ghi `security_audit_logs` (kèm geo-IP qua ip-api.com) và gửi
  **Discord webhook** (cooldown 5 phút / IP + lý do), chạy nền bằng `setImmediate`.
- Bảo mật: đăng ký luôn tạo role `guest` (chống leo quyền), chỉ admin login được, CORS whitelist
  (localhost, `APP_URL`, `*.onrender.com`; nới lỏng khi dev), `trust proxy` cho Render, local có thể khóa `HOST=127.0.0.1`.
- Swagger tự sinh tại `/api/docs`; DTO dùng `class-validator` + `ValidationPipe({ whitelist, transform })`.
- Frame data theo chuẩn Mizuumi Wiki; script đồng bộ fallback data ↔ DB.
- Migration runner nhẹ, idempotent, tự chạy khi start.

## Lưu ý / điểm cần biết khi sửa code

- Backend Express cũ đã bị xóa (10/2026); News đã được port sang `server/src/modules/news`.
- `GET /health/db` của NestJS trả `ok` cố định, không thực sự query DB.
- `dist-server/` và một phần `node_modules/` được giữ trong git theo chủ ý.
  Sau khi sửa `server/src` phải chạy `npm run build:nestjs` và commit `dist-server` để khớp.
- JWT secret có giá trị mặc định hardcode nếu thiếu `JWT_SECRET` — luôn set ở prod.
- `index.html` trỏ tới `/favicon.svg` nhưng file này không tồn tại trong `public/`.
- Fallback data có `hitbox_url: '/hitboxes/*.svg'` nhưng thư mục `public/hitboxes/` không tồn tại.
- Quy tắc từ README: giữ nguyên API contract khi tái cấu trúc; **không đổi giá trị kích thước/vị trí
  trong `src/App.css` và `src/index.css`** khi refactor cấu trúc.
- Code style: frontend JSX không dấu chấm phẩy ở `App.jsx`, có dấu chấm phẩy ở các component mới;
  comment và message cho người dùng bằng tiếng Việt; backend NestJS dùng 2 spaces + single quote.
- Commit message theo Conventional Commits (`feat(scope): ...`, `fix(server): ...`, `chore: ...`).
