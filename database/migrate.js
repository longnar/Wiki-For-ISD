const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const migrationPattern = /^db_migration_\d+_.+\.sql$/;

// Lỗi MySQL nghĩa là "đã tồn tại rồi": cột trùng, index trùng, bảng đã có
const alreadyExistsErrors = new Set(['ER_DUP_FIELDNAME', 'ER_DUP_KEYNAME', 'ER_TABLE_EXISTS_ERROR']);

const splitStatements = (sql) => sql
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean);

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'idol_showdown_wiki',
        connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT || 10000),
        ssl: process.env.DB_SSL === 'true'
            ? {
                ca: process.env.DB_CA_PATH
                    ? fs.readFileSync(process.env.DB_CA_PATH, 'utf8')
                    : undefined,
                rejectUnauthorized: false
            }
            : undefined
    });

    try {
        await connection.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version VARCHAR(100) PRIMARY KEY,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        const [appliedRows] = await connection.query('SELECT version FROM schema_migrations');
        const applied = new Set(appliedRows.map((row) => row.version));
        const migrations = fs.readdirSync(path.join(__dirname, 'migrations'))
            .filter((file) => migrationPattern.test(file))
            .sort();

        for (const migration of migrations) {
            if (applied.has(migration)) {
                console.log(`Skipping ${migration} (already applied).`);
                continue;
            }

            console.log(`Applying ${migration}...`);
            for (const statement of splitStatements(fs.readFileSync(path.join(__dirname, 'migrations', migration), 'utf8'))) {
                try {
                    await connection.query(statement);
                } catch (error) {
                    // DB tạo mới từ 001_initial_schema.sql đã có sẵn cột/index/bảng mà migration cũ thêm vào
                    // -> bỏ qua câu lệnh đó thay vì làm dừng cả chuỗi migration phía sau
                    if (!alreadyExistsErrors.has(error.code)) throw error;
                    console.log(`  - Bỏ qua câu lệnh (${error.code}): ${error.message}`);
                }
            }
            await connection.query('INSERT INTO schema_migrations (version) VALUES (?)', [migration]);
        }

        console.log('Database migrations completed successfully.');
    } finally {
        await connection.end();
    }
}

migrate().catch((error) => {
    console.error('Database migration failed:', error.message);
    process.exitCode = 1;
});
