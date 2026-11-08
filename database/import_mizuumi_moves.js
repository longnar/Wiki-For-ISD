/**
 * CLI Tool: Nhập Frame Data từ mã nguồn Mizuumi Wiki vào CSDL MySQL và Fallback Data
 *
 * Cách sử dụng:
 *   node database/import_mizuumi_moves.js --char "Shirakami Fubuki" --file raw_fubuki.txt
 *   node database/import_mizuumi_moves.js --char "Fubuki" --text "{{IS MoveData ...}}"
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

function parseMizuumiWikitext(rawContent, characterName = '') {
  if (!rawContent) return [];
  const moves = [];
  const templateRegex = /\{\{\s*(?:IS\s+MoveData|MoveData|Move|IdolMove)[\s\S]*?\}\}/gi;
  const matches = rawContent.match(templateRegex) || rawContent.split(/(?=\{\{|\|-)/g);

  for (const block of matches) {
    const rawProps = {};
    const lineRegex = /\|\s*([a-zA-Z0-9_\- ]+?)\s*=\s*([^|\n}]+)/g;
    let match;
    while ((match = lineRegex.exec(block)) !== null) {
      const k = match[1].trim().toLowerCase().replace(/[\s-]/g, '_');
      rawProps[k] = match[2].trim();
    }

    const command = rawProps['input'] || rawProps['char_move'] || rawProps['move'] || rawProps['cmd'] || rawProps['name'];
    if (!command) continue;

    const parseNum = (v) => {
      if (v === undefined || v === null || v === '') return null;
      const m = String(v).match(/([+-]?\d+)/);
      return m ? parseInt(m[1], 10) : null;
    };

    const cmd = command.trim();
    let moveType = 'normal';
    const cmdLower = cmd.toLowerCase();
    if (cmdLower.includes('super') || cmdLower.includes('star') || cmdLower.includes('climax')) moveType = 'super';
    else if (cmdLower.includes('236') || cmdLower.includes('214') || cmdLower.includes('623') || cmdLower.includes('22')) moveType = 'special';

    moves.push({
      CHAR_MOVE: cmd,
      CHAR_NAME: characterName || 'Fighter',
      DAMAGE: parseNum(rawProps['damage'] || rawProps['dmg']),
      START_UP: parseNum(rawProps['startup'] || rawProps['start_up']),
      ACTIVE: parseNum(rawProps['active']),
      RECOVERY: parseNum(rawProps['recovery'] || rawProps['rec']),
      ADV_ON_BLOCK: parseNum(rawProps['onblock'] || rawProps['on_block'] || rawProps['adv_on_block']),
      ADV_ON_HIT: parseNum(rawProps['onhit'] || rawProps['on_hit'] || rawProps['adv_on_hit']),
      INVULNERABILITY: rawProps['invuln'] || rawProps['invulnerability'] || null,
      guard: rawProps['guard'] || 'Mid',
      move_type: moveType,
      version: rawProps['version'] || null,
      properties: rawProps['properties'] || rawProps['props'] || null,
      description: rawProps['description'] || rawProps['desc'] || null,
      hitbox_url: rawProps['hitbox'] || rawProps['image'] ? `https://wiki.gbl.gg/images/${rawProps['hitbox'] || rawProps['image']}` : null,
      hitbox_caption: rawProps['caption'] || null,
    });
  }

  return moves;
}

async function main() {
  const args = process.argv.slice(2);
  let charName = '';
  let filePath = '';
  let textContent = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--char' && args[i + 1]) charName = args[++i];
    if (args[i] === '--file' && args[i + 1]) filePath = args[++i];
    if (args[i] === '--text' && args[i + 1]) textContent = args[++i];
  }

  if (filePath) {
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      console.error(`[Error] File không tồn tại: ${fullPath}`);
      process.exit(1);
    }
    textContent = fs.readFileSync(fullPath, 'utf8');
  }

  if (!textContent) {
    console.log('Sử dụng: node database/import_mizuumi_moves.js --char <TênNhânVật> --file <ĐườngDẫnFileWikitext>');
    console.log('Hoặc:   node database/import_mizuumi_moves.js --char <TênNhânVật> --text "<MãNguồnWikitext>"');
    return;
  }

  console.log(`[Parser] Đang bóc tách dữ liệu cho nhân vật: "${charName || 'Unknown'}"...`);
  const parsedMoves = parseMizuumiWikitext(textContent, charName);
  console.log(`[Parser] Đã bóc tách thành công ${parsedMoves.length} đòn đánh:`);
  parsedMoves.forEach((m, idx) => {
    console.log(`  ${idx + 1}. [${m.CHAR_MOVE}] - Dmg: ${m.DAMAGE ?? '-'} | Start: ${m.START_UP ?? '-'}F | Guard: ${m.guard} | Type: ${m.move_type}`);
  });

  // Lưu vào database nếu có cấu hình DB_HOST
  if (process.env.DB_HOST) {
    try {
      console.log('\n[Database] Đang kết nối tới MySQL...');
      const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'idol_showdown_wiki',
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      });

      const [chars] = await conn.query('SELECT id, name FROM characters');
      const matchedChar = chars.find((c) =>
        c.name.toLowerCase().includes(charName.toLowerCase()) ||
        charName.toLowerCase().includes(c.name.toLowerCase())
      );

      if (!matchedChar) {
        console.warn(`[Database] Không tìm thấy nhân vật khớp với "${charName}".`);
      } else {
        console.log(`[Database] Đang nạp ${parsedMoves.length} đòn vào nhân vật "${matchedChar.name}" (ID: ${matchedChar.id})...`);
        for (const m of parsedMoves) {
          await conn.query(
            `INSERT INTO character_moves 
              (character_id, CHAR_NAME, CHAR_MOVE, DAMAGE, START_UP, ACTIVE, RECOVERY, ADV_ON_BLOCK, ADV_ON_HIT, INVULNERABILITY, guard, move_type, version, properties, description, hitbox_url, hitbox_caption)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
              DAMAGE = VALUES(DAMAGE),
              START_UP = VALUES(START_UP),
              ACTIVE = VALUES(ACTIVE),
              RECOVERY = VALUES(RECOVERY),
              ADV_ON_BLOCK = VALUES(ADV_ON_BLOCK),
              ADV_ON_HIT = VALUES(ADV_ON_HIT),
              INVULNERABILITY = VALUES(INVULNERABILITY),
              guard = VALUES(guard),
              move_type = VALUES(move_type),
              version = VALUES(version),
              properties = VALUES(properties),
              description = VALUES(description),
              hitbox_url = COALESCE(VALUES(hitbox_url), hitbox_url),
              hitbox_caption = COALESCE(VALUES(hitbox_caption), hitbox_caption)`,
            [
              matchedChar.id,
              matchedChar.name,
              m.CHAR_MOVE,
              m.DAMAGE,
              m.START_UP,
              m.ACTIVE,
              m.RECOVERY,
              m.ADV_ON_BLOCK,
              m.ADV_ON_HIT,
              m.INVULNERABILITY,
              m.guard,
              m.move_type,
              m.version,
              m.properties,
              m.description,
              m.hitbox_url,
              m.hitbox_caption,
            ]
          );
        }
        console.log('[Database] Hoàn tất nạp CSDL thành công!');
      }

      await conn.end();
    } catch (err) {
      console.error('[Database] Lỗi khi lưu vào MySQL:', err.message);
    }
  }
}

main().catch(console.error);

