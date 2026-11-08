import { Injectable } from '@nestjs/common';

export interface ParsedMizuumiMove {
  CHAR_MOVE: string;
  CHAR_NAME?: string;
  DAMAGE: number | null;
  START_UP: number | null;
  ACTIVE: number | null;
  RECOVERY: number | null;
  ADV_ON_BLOCK: number | null;
  ADV_ON_HIT: number | null;
  INVULNERABILITY: string | null;
  guard: string | null;
  move_type: string;
  version: string | null;
  properties: string | null;
  description: string | null;
  hitbox_url: string | null;
  hitbox_caption: string | null;
  status?: 'new' | 'modified' | 'unchanged';
  diffFields?: string[];
  existingMoveId?: number;
}

@Injectable()
export class MizuumiParserService {
  /**
   * Bóc tách chuỗi mã nguồn (Wikitext / MediaWiki / JSON) thành danh sách các đòn đánh chuẩn
   */
  parseWikitext(rawContent: string, characterName: string = ''): ParsedMizuumiMove[] {
    if (!rawContent || typeof rawContent !== 'string') return [];

    const trimmed = rawContent.trim();

    // 1. Nếu nội dung là JSON (cho phép dán JSON trực tiếp)
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const json = JSON.parse(trimmed);
        if (Array.isArray(json)) {
          return json.map((item) => this.normalizeMoveObject(item, characterName)).filter((m) => Boolean(m.CHAR_MOVE));
        }
      } catch {
        // Tiếp tục thử parse wikitext
      }
    }

    // 2. Parse Wikitext Templates (MediaWiki {{IS MoveData ...}} hoặc {{Move ...}})
    const moves: ParsedMizuumiMove[] = [];
    const templateRegex = /\{\{\s*(?:IS\s+MoveData|MoveData|Move|IdolMove)[\s\S]*?\}\}/gi;
    const matches = rawContent.match(templateRegex);

    if (matches && matches.length > 0) {
      for (const block of matches) {
        const move = this.parseSingleTemplate(block, characterName);
        if (move && move.CHAR_MOVE) {
          moves.push(move);
        }
      }
    }

    // 3. Nếu không tìm thấy template kiểu chuẩn, thử quét các khối cặp key = value phân tách bởi {{ hoặc |-
    if (moves.length === 0) {
      const genericBlocks = rawContent.split(/(?=\{\{|\{\||\|-)/g);
      for (const block of genericBlocks) {
        if (block.includes('input') || block.includes('startup') || block.includes('damage') || block.includes('CHAR_MOVE')) {
          const move = this.parseKeyValueBlock(block, characterName);
          if (move && move.CHAR_MOVE) {
            moves.push(move);
          }
        }
      }
    }

    return moves;
  }

  private parseSingleTemplate(block: string, characterName: string): ParsedMizuumiMove | null {
    return this.parseKeyValueBlock(block, characterName);
  }

  private parseKeyValueBlock(block: string, characterName: string): ParsedMizuumiMove | null {
    const rawProps: Record<string, string> = {};

    // Match các dòng có dạng | key = value hoặc | key: value
    const lineRegex = /\|\s*([a-zA-Z0-9_\- ]+?)\s*=\s*([^|\n}]+)/g;
    let match: RegExpExecArray | null;

    while ((match = lineRegex.exec(block)) !== null) {
      const key = match[1].trim().toLowerCase().replace(/[\s-]/g, '_');
      const val = match[2].trim();
      rawProps[key] = val;
    }

    const command =
      rawProps['input'] ||
      rawProps['char_move'] ||
      rawProps['move'] ||
      rawProps['cmd'] ||
      rawProps['command'] ||
      rawProps['name'];

    if (!command) return null;

    return this.normalizeMoveObject(
      {
        CHAR_MOVE: command,
        CHAR_NAME: rawProps['char_name'] || characterName,
        DAMAGE: rawProps['damage'] || rawProps['dmg'],
        START_UP: rawProps['startup'] || rawProps['start_up'] || rawProps['start'],
        ACTIVE: rawProps['active'],
        RECOVERY: rawProps['recovery'] || rawProps['rec'],
        ADV_ON_BLOCK: rawProps['onblock'] || rawProps['on_block'] || rawProps['adv_on_block'] || rawProps['block_adv'],
        ADV_ON_HIT: rawProps['onhit'] || rawProps['on_hit'] || rawProps['adv_on_hit'] || rawProps['hit_adv'],
        INVULNERABILITY: rawProps['invuln'] || rawProps['invulnerability'] || rawProps['invincible'],
        guard: rawProps['guard'],
        version: rawProps['version'] || rawProps['stance'],
        properties: rawProps['properties'] || rawProps['props'] || rawProps['attribute'],
        description: rawProps['description'] || rawProps['desc'] || rawProps['notes'],
        hitbox_url: rawProps['hitbox'] || rawProps['hitbox_url'] || rawProps['image'],
        hitbox_caption: rawProps['caption'] || rawProps['hitbox_caption'],
      },
      characterName,
    );
  }

  private normalizeMoveObject(raw: any, characterName: string): ParsedMizuumiMove {
    const charMove = String(raw.CHAR_MOVE || raw.input || '').trim();
    const moveType = this.inferMoveType(charMove, raw.move_type || raw.type);

    return {
      CHAR_MOVE: charMove,
      CHAR_NAME: String(raw.CHAR_NAME || characterName || '').trim(),
      DAMAGE: this.parseNumber(raw.DAMAGE ?? raw.damage ?? raw.dmg),
      START_UP: this.parseNumber(raw.START_UP ?? raw.startup ?? raw.start_up),
      ACTIVE: this.parseNumber(raw.ACTIVE ?? raw.active),
      RECOVERY: this.parseNumber(raw.RECOVERY ?? raw.recovery),
      ADV_ON_BLOCK: this.parseNumber(raw.ADV_ON_BLOCK ?? raw.onBlock ?? raw.on_block),
      ADV_ON_HIT: this.parseNumber(raw.ADV_ON_HIT ?? raw.onHit ?? raw.on_hit),
      INVULNERABILITY: raw.INVULNERABILITY || raw.invuln ? String(raw.INVULNERABILITY || raw.invuln).trim() : null,
      guard: this.normalizeGuard(raw.guard),
      move_type: moveType,
      version: raw.version ? String(raw.version).trim() : null,
      properties: raw.properties ? String(raw.properties).trim() : null,
      description: raw.description || raw.desc ? String(raw.description || raw.desc).trim() : null,
      hitbox_url: this.normalizeHitboxUrl(raw.hitbox_url || raw.hitbox || raw.image),
      hitbox_caption: raw.hitbox_caption || raw.caption ? String(raw.hitbox_caption || raw.caption).trim() : null,
    };
  }

  private parseNumber(val: any): number | null {
    if (val === undefined || val === null || val === '') return null;
    if (typeof val === 'number') return isNaN(val) ? null : val;
    const str = String(val).trim();
    // Bóc tách số nguyên, hỗ trợ cả số âm -5 hoặc dương +3
    const match = str.match(/([+-]?\d+)/);
    if (!match) return null;
    const num = parseInt(match[1], 10);
    return isNaN(num) ? null : num;
  }

  private normalizeGuard(guard: any): string {
    if (!guard) return 'Mid';
    const g = String(guard).trim().toLowerCase();
    if (g.includes('low')) return 'Low';
    if (g.includes('overhead') || g.includes('high')) return 'Overhead';
    if (g.includes('all')) return 'All';
    if (g.includes('air')) return 'Air';
    return 'Mid';
  }

  private inferMoveType(command: string, explicitType?: string): string {
    if (explicitType) {
      const t = explicitType.toLowerCase();
      if (t.includes('super') || t.includes('star') || t.includes('ultra')) return 'super';
      if (t.includes('special')) return 'special';
      if (t.includes('normal')) return 'normal';
    }
    const cmd = command.toLowerCase();
    if (cmd.includes('super') || cmd.includes('star') || cmd.includes('climax') || cmd.includes('say fan')) {
      return 'super';
    }
    if (
      cmd.includes('236') ||
      cmd.includes('214') ||
      cmd.includes('623') ||
      cmd.includes('421') ||
      cmd.includes('22') ||
      cmd.includes('632146') ||
      cmd.includes('41236')
    ) {
      return 'special';
    }
    return 'normal';
  }

  private normalizeHitboxUrl(url: any): string | null {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
      return trimmed;
    }
    // Nếu là tên file ảnh wiki (ví dụ IS_Fubuki_5L.png)
    return `https://wiki.gbl.gg/images/${trimmed}`;
  }

  /**
   * So sánh danh sách moves vừa parse với các moves hiện có trong CSDL của nhân vật
   */
  diffMoves(parsedMoves: ParsedMizuumiMove[], existingMoves: any[]): ParsedMizuumiMove[] {
    const existingMap = new Map<string, any>();
    for (const em of existingMoves) {
      const key = (em.CHAR_MOVE || '').trim().toLowerCase();
      existingMap.set(key, em);
    }

    return parsedMoves.map((pm) => {
      const key = (pm.CHAR_MOVE || '').trim().toLowerCase();
      const existing = existingMap.get(key);

      if (!existing) {
        return {
          ...pm,
          status: 'new',
          diffFields: [],
        };
      }

      // So sánh các trường kỹ thuật
      const diffFields: string[] = [];
      if (existing.DAMAGE !== pm.DAMAGE) diffFields.push('DAMAGE');
      if (existing.START_UP !== pm.START_UP) diffFields.push('START_UP');
      if (existing.ACTIVE !== pm.ACTIVE) diffFields.push('ACTIVE');
      if (existing.RECOVERY !== pm.RECOVERY) diffFields.push('RECOVERY');
      if (existing.ADV_ON_BLOCK !== pm.ADV_ON_BLOCK) diffFields.push('ADV_ON_BLOCK');
      if (existing.ADV_ON_HIT !== pm.ADV_ON_HIT) diffFields.push('ADV_ON_HIT');
      if (pm.guard && existing.guard !== pm.guard) diffFields.push('guard');
      if (pm.properties && existing.properties !== pm.properties) diffFields.push('properties');

      const isModified = diffFields.length > 0;

      return {
        ...pm,
        existingMoveId: existing.id,
        status: isModified ? 'modified' : 'unchanged',
        diffFields,
      };
    });
  }
}

