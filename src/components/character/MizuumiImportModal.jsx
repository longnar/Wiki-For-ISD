import { useState } from 'react';
import { characterApi } from '../../api/character.api';

// Bộ parser local dự phòng khi chạy offline hoặc backend không có kết nối DB
function localParseWikitext(raw, characterName) {
  const moves = [];
  const templateRegex = /\{\{\s*(?:IS\s+MoveData|MoveData|Move|IdolMove)[\s\S]*?\}\}/gi;
  const matches = raw.match(templateRegex) || raw.split(/(?=\{\{|\|-)/g);

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

export default function MizuumiImportModal({
  isOpen,
  character,
  existingMoves = [],
  onClose,
  onSuccess,
}) {
  const [step, setStep] = useState('INPUT'); // 'INPUT' | 'PREVIEW'
  const [wikitext, setWikitext] = useState('');
  const [parsedMoves, setParsedMoves] = useState([]);
  const [selectedMoveIndexes, setSelectedMoveIndexes] = useState(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Xử lý phân tích chuỗi mã nguồn wikitext
  const handleParse = async () => {
    if (!wikitext.trim()) {
      alert('Vui lòng dán mã nguồn wikitext từ Mizuumi Wiki!');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      let movesWithDiff = [];
      if (character?.id && typeof character.id === 'number') {
        const res = await characterApi.parseMizuumi(character.id, wikitext);
        if (res?.moves && Array.isArray(res.moves)) {
          movesWithDiff = res.moves;
        }
      }

      // Nếu backend chưa kết nối hoặc chạy offline
      if (movesWithDiff.length === 0) {
        const rawParsed = localParseWikitext(wikitext, character?.name);
        const existingMap = new Map();
        existingMoves.forEach((m) => {
          existingMap.set((m.CHAR_MOVE || '').trim().toLowerCase(), m);
        });

        movesWithDiff = rawParsed.map((pm) => {
          const existing = existingMap.get(pm.CHAR_MOVE.trim().toLowerCase());
          if (!existing) return { ...pm, status: 'new', diffFields: [] };

          const diffFields = [];
          if (existing.DAMAGE !== pm.DAMAGE) diffFields.push('DAMAGE');
          if (existing.START_UP !== pm.START_UP) diffFields.push('START_UP');
          if (existing.ACTIVE !== pm.ACTIVE) diffFields.push('ACTIVE');
          if (existing.RECOVERY !== pm.RECOVERY) diffFields.push('RECOVERY');
          if (existing.ADV_ON_BLOCK !== pm.ADV_ON_BLOCK) diffFields.push('ADV_ON_BLOCK');
          if (existing.ADV_ON_HIT !== pm.ADV_ON_HIT) diffFields.push('ADV_ON_HIT');

          return {
            ...pm,
            existingMoveId: existing.id,
            status: diffFields.length > 0 ? 'modified' : 'unchanged',
            diffFields,
          };
        });
      }

      if (movesWithDiff.length === 0) {
        setErrorMessage('Không bóc tách được đòn đánh nào từ đoạn mã đã dán. Vui lòng kiểm tra lại định dạng!');
        setIsProcessing(false);
        return;
      }

      setParsedMoves(movesWithDiff);
      // Mặc định chọn tất cả các đòn đánh
      const allIndices = new Set(movesWithDiff.map((_, i) => i));
      setSelectedMoveIndexes(allIndices);
      setStep('PREVIEW');
    } catch (err) {
      setErrorMessage('Lỗi khi phân tích: ' + (err.message || 'Vui lòng thử lại.'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle chọn từng đòn đánh
  const handleToggleSelectMove = (index) => {
    setSelectedMoveIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // Nút chọn nhanh
  const handleSelectAll = () => {
    setSelectedMoveIndexes(new Set(parsedMoves.map((_, i) => i)));
  };

  const handleDeselectAll = () => {
    setSelectedMoveIndexes(new Set());
  };

  const handleSelectModifiedAndNew = () => {
    const indices = new Set();
    parsedMoves.forEach((m, i) => {
      if (m.status === 'new' || m.status === 'modified') {
        indices.add(i);
      }
    });
    setSelectedMoveIndexes(indices);
  };

  // Xác nhận lưu vào Database
  const handleConfirmSave = async () => {
    if (selectedMoveIndexes.size === 0) {
      alert('Vui lòng chọn ít nhất một đòn đánh để lưu!');
      return;
    }

    const selectedMoves = Array.from(selectedMoveIndexes).map((idx) => parsedMoves[idx]);
    setIsProcessing(true);
    setErrorMessage('');

    try {
      if (character?.id && typeof character.id === 'number') {
        await characterApi.batchSaveMoves(character.id, selectedMoves);
      }
      if (onSuccess) {
        onSuccess(selectedMoves);
      }
      onClose();
    } catch (err) {
      setErrorMessage('Lỗi khi lưu vào Database: ' + (err.message || 'Vui lòng thử lại.'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Thống kê số lượng
  const countNew = parsedMoves.filter((m) => m.status === 'new').length;
  const countMod = parsedMoves.filter((m) => m.status === 'modified').length;
  const countUnc = parsedMoves.filter((m) => m.status === 'unchanged').length;

  return (
    <div className="figma-detail-modal-overlay" onClick={onClose}>
      <div
        className="figma-mizuumi-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Nhập Frame Data từ Mizuumi Wiki"
      >
        <div className="figma-mizuumi-modal-header">
          <div className="figma-mizuumi-modal-title-wrap">
            <h2 className="figma-mizuumi-modal-title">
              📥 Nhập Frame Data từ Mizuumi Wiki
            </h2>
            <span className="figma-mizuumi-modal-char-badge">
              Nhân vật: <strong>{character?.name || 'Chưa chọn'}</strong>
            </span>
          </div>
          <button type="button" className="figma-mizuumi-modal-close" onClick={onClose} aria-label="Đóng modal">
            &times;
          </button>
        </div>

        {errorMessage && (
          <div className="figma-mizuumi-error-alert" role="alert">
            <span>⚠️ {errorMessage}</span>
          </div>
        )}

        {step === 'INPUT' ? (
          /* BƯỚC 1: DÁN MÃ NGUỒN WIKITEXT */
          <div className="figma-mizuumi-step-content">
            <div className="figma-mizuumi-guide-box">
              <p className="figma-mizuumi-guide-text">
                💡 <strong>Hướng dẫn:</strong> Truy cập trang Mizuumi Wiki của nhân vật này, nhấn nút <code>View source</code> (hoặc <code>Edit source</code>) ở góc trên bên phải, copy toàn bộ hoặc các đoạn template <code>{'{{IS MoveData ...}}'}</code> rồi dán vào khung bên dưới.
              </p>
            </div>

            <textarea
              className="figma-mizuumi-textarea"
              placeholder={`Dán mã nguồn wikitext vào đây...\nVí dụ:\n{{IS MoveData\n| input = 5L\n| damage = 400\n| guard = Mid\n| startup = 5\n| active = 3\n| recovery = 9\n| onBlock = -2\n| onHit = +2\n...}}`}
              value={wikitext}
              onChange={(e) => setWikitext(e.target.value)}
              rows={14}
            />

            <div className="figma-mizuumi-modal-actions">
              <button type="button" className="btn-cancel-action" onClick={onClose} disabled={isProcessing}>
                Hủy
              </button>
              <button
                type="button"
                className="figma-mizuumi-btn-primary"
                onClick={handleParse}
                disabled={isProcessing || !wikitext.trim()}
              >
                {isProcessing ? 'Đang phân tích...' : '⚡ Phân Tích Dữ Liệu'}
              </button>
            </div>
          </div>
        ) : (
          /* BƯỚC 2: XEM TRƯỚC (PREVIEW) & TÍCH CHỌN ĐÒN ĐÁNH */
          <div className="figma-mizuumi-step-content">
            <div className="figma-mizuumi-summary-bar">
              <div className="figma-mizuumi-stats-badges">
                <span className="figma-mizuumi-stat-pill total">
                  Tổng bóc tách: <strong>{parsedMoves.length}</strong>
                </span>
                <span className="figma-mizuumi-stat-pill new">
                  Mới: <strong>{countNew}</strong>
                </span>
                <span className="figma-mizuumi-stat-pill modified">
                  Cập nhật: <strong>{countMod}</strong>
                </span>
                <span className="figma-mizuumi-stat-pill unchanged">
                  Không đổi: <strong>{countUnc}</strong>
                </span>
              </div>

              <div className="figma-mizuumi-quick-selects">
                <button type="button" className="figma-mizuumi-btn-sm" onClick={handleSelectAll}>
                  Chọn tất cả ({parsedMoves.length})
                </button>
                <button type="button" className="figma-mizuumi-btn-sm" onClick={handleSelectModifiedAndNew}>
                  Chỉ chọn đòn Mới &amp; Sửa ({countNew + countMod})
                </button>
                <button type="button" className="figma-mizuumi-btn-sm" onClick={handleDeselectAll}>
                  Bỏ chọn tất cả
                </button>
              </div>
            </div>

            <div className="figma-mizuumi-preview-table-wrap">
              <table className="figma-mizuumi-preview-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedMoveIndexes.size === parsedMoves.length && parsedMoves.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) handleSelectAll();
                          else handleDeselectAll();
                        }}
                        aria-label="Chọn tất cả đòn đánh"
                      />
                    </th>
                    <th>Trạng Thái</th>
                    <th style={{ textAlign: 'left' }}>Command</th>
                    <th>Damage</th>
                    <th>Guard</th>
                    <th>Startup</th>
                    <th>Active</th>
                    <th>Recovery</th>
                    <th>On Block</th>
                    <th>On Hit</th>
                    <th>Loại Đòn</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedMoves.map((m, idx) => {
                    const isSelected = selectedMoveIndexes.has(idx);
                    return (
                      <tr
                        key={idx}
                        className={`${isSelected ? 'selected' : ''} status-${m.status}`}
                        onClick={() => handleToggleSelectMove(idx)}
                      >
                        <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectMove(idx)}
                          />
                        </td>
                        <td>
                          {m.status === 'new' && (
                            <span className="figma-mizuumi-badge-status new">Mới</span>
                          )}
                          {m.status === 'modified' && (
                            <span className="figma-mizuumi-badge-status modified" title={`Thay đổi: ${m.diffFields?.join(', ')}`}>
                              Cập nhật
                            </span>
                          )}
                          {m.status === 'unchanged' && (
                            <span className="figma-mizuumi-badge-status unchanged">Không đổi</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'left', fontWeight: 'bold', color: '#fff' }}>
                          {m.CHAR_MOVE}
                          {m.version && <span className="figma-mizuumi-version-pill">{m.version}</span>}
                        </td>
                        <td>{m.DAMAGE ?? '-'}</td>
                        <td>{m.guard ?? 'Mid'}</td>
                        <td>{m.START_UP ? `${m.START_UP}F` : '-'}</td>
                        <td>{m.ACTIVE ? `${m.ACTIVE}F` : '-'}</td>
                        <td>{m.RECOVERY ? `${m.RECOVERY}F` : '-'}</td>
                        <td style={{ color: (m.ADV_ON_BLOCK || 0) >= 0 ? '#4ade80' : '#f87171', fontWeight: 'bold' }}>
                          {(m.ADV_ON_BLOCK || 0) > 0 ? `+${m.ADV_ON_BLOCK}` : m.ADV_ON_BLOCK ?? '-'}
                        </td>
                        <td style={{ color: (m.ADV_ON_HIT || 0) >= 0 ? '#4ade80' : '#f87171', fontWeight: 'bold' }}>
                          {(m.ADV_ON_HIT || 0) > 0 ? `+${m.ADV_ON_HIT}` : m.ADV_ON_HIT ?? '-'}
                        </td>
                        <td>
                          <span className={`figma-mizuumi-type-pill ${m.move_type}`}>
                            {m.move_type}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="figma-mizuumi-modal-actions">
              <button
                type="button"
                className="btn-cancel-action"
                onClick={() => setStep('INPUT')}
                disabled={isProcessing}
              >
                ⬅ Dán lại mã khác
              </button>
              <button
                type="button"
                className="figma-mizuumi-btn-primary"
                onClick={handleConfirmSave}
                disabled={isProcessing || selectedMoveIndexes.size === 0}
              >
                {isProcessing
                  ? 'Đang lưu vào CSDL...'
                  : `💾 Lưu ${selectedMoveIndexes.size} Đòn Đã Chọn Vào Database`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

