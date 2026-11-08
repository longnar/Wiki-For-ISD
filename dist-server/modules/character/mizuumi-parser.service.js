"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MizuumiParserService = void 0;
const common_1 = require("@nestjs/common");
let MizuumiParserService = class MizuumiParserService {
    parseWikitext(rawContent, characterName = '') {
        if (!rawContent || typeof rawContent !== 'string')
            return [];
        const trimmed = rawContent.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            try {
                const json = JSON.parse(trimmed);
                if (Array.isArray(json)) {
                    return json.map((item) => this.normalizeMoveObject(item, characterName)).filter((m) => Boolean(m.CHAR_MOVE));
                }
            }
            catch {
            }
        }
        const moves = [];
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
    parseSingleTemplate(block, characterName) {
        return this.parseKeyValueBlock(block, characterName);
    }
    parseKeyValueBlock(block, characterName) {
        const rawProps = {};
        const lineRegex = /\|\s*([a-zA-Z0-9_\- ]+?)\s*=\s*([^|\n}]+)/g;
        let match;
        while ((match = lineRegex.exec(block)) !== null) {
            const key = match[1].trim().toLowerCase().replace(/[\s-]/g, '_');
            const val = match[2].trim();
            rawProps[key] = val;
        }
        const command = rawProps['input'] ||
            rawProps['char_move'] ||
            rawProps['move'] ||
            rawProps['cmd'] ||
            rawProps['command'] ||
            rawProps['name'];
        if (!command)
            return null;
        return this.normalizeMoveObject({
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
        }, characterName);
    }
    normalizeMoveObject(raw, characterName) {
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
    parseNumber(val) {
        if (val === undefined || val === null || val === '')
            return null;
        if (typeof val === 'number')
            return isNaN(val) ? null : val;
        const str = String(val).trim();
        const match = str.match(/([+-]?\d+)/);
        if (!match)
            return null;
        const num = parseInt(match[1], 10);
        return isNaN(num) ? null : num;
    }
    normalizeGuard(guard) {
        if (!guard)
            return 'Mid';
        const g = String(guard).trim().toLowerCase();
        if (g.includes('low'))
            return 'Low';
        if (g.includes('overhead') || g.includes('high'))
            return 'Overhead';
        if (g.includes('all'))
            return 'All';
        if (g.includes('air'))
            return 'Air';
        return 'Mid';
    }
    inferMoveType(command, explicitType) {
        if (explicitType) {
            const t = explicitType.toLowerCase();
            if (t.includes('super') || t.includes('star') || t.includes('ultra'))
                return 'super';
            if (t.includes('special'))
                return 'special';
            if (t.includes('normal'))
                return 'normal';
        }
        const cmd = command.toLowerCase();
        if (cmd.includes('super') || cmd.includes('star') || cmd.includes('climax') || cmd.includes('say fan')) {
            return 'super';
        }
        if (cmd.includes('236') ||
            cmd.includes('214') ||
            cmd.includes('623') ||
            cmd.includes('421') ||
            cmd.includes('22') ||
            cmd.includes('632146') ||
            cmd.includes('41236')) {
            return 'special';
        }
        return 'normal';
    }
    normalizeHitboxUrl(url) {
        if (!url || typeof url !== 'string')
            return null;
        const trimmed = url.trim();
        if (!trimmed)
            return null;
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
            return trimmed;
        }
        return `https://wiki.gbl.gg/images/${trimmed}`;
    }
    diffMoves(parsedMoves, existingMoves) {
        const existingMap = new Map();
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
            const diffFields = [];
            if (existing.DAMAGE !== pm.DAMAGE)
                diffFields.push('DAMAGE');
            if (existing.START_UP !== pm.START_UP)
                diffFields.push('START_UP');
            if (existing.ACTIVE !== pm.ACTIVE)
                diffFields.push('ACTIVE');
            if (existing.RECOVERY !== pm.RECOVERY)
                diffFields.push('RECOVERY');
            if (existing.ADV_ON_BLOCK !== pm.ADV_ON_BLOCK)
                diffFields.push('ADV_ON_BLOCK');
            if (existing.ADV_ON_HIT !== pm.ADV_ON_HIT)
                diffFields.push('ADV_ON_HIT');
            if (pm.guard && existing.guard !== pm.guard)
                diffFields.push('guard');
            if (pm.properties && existing.properties !== pm.properties)
                diffFields.push('properties');
            const isModified = diffFields.length > 0;
            return {
                ...pm,
                existingMoveId: existing.id,
                status: isModified ? 'modified' : 'unchanged',
                diffFields,
            };
        });
    }
};
exports.MizuumiParserService = MizuumiParserService;
exports.MizuumiParserService = MizuumiParserService = __decorate([
    (0, common_1.Injectable)()
], MizuumiParserService);
//# sourceMappingURL=mizuumi-parser.service.js.map