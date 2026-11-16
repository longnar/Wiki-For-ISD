import { useState, useEffect } from 'react';
import { characterApi } from '../../api/character.api';
import { getCharacterArt, getCharacterCutout } from '../../utils/characterAssets';
import { getFallbackDetails } from '../../data/characterFallbackData';
import selectionPolygon from '../../assets/decorative/selection-polygon.svg';
import MizuumiImportModal from './MizuumiImportModal';
import './CharacterDetailView.css';

export default function CharacterDetailView({ character, isAuthenticated = false, onBack, onCharacterUpdated }) {
  const fallback = getFallbackDetails(character?.name);
  const [stats, setStats] = useState(fallback.stats);
  const [moves, setMoves] = useState(fallback.moves);
  const [isEditingStats, setIsEditingStats] = useState(false);
  const [isEditingStyle, setIsEditingStyle] = useState(false);
  const [characterType, setCharacterType] = useState(character?.type || 'Fighter');
  const [styleInput, setStyleInput] = useState(character?.type || 'Fighter');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('TABLE'); // 'TABLE' | 'CARDS'
  const [expandedMoveIds, setExpandedMoveIds] = useState(new Set());

  // Lightbox xem ảnh Hitbox toàn màn hình
  const [activeHitboxModal, setActiveHitboxModal] = useState(null);

  // Hitbox file upload preview state (Admin)
  const [hitboxFile, setHitboxFile] = useState(null);
  const [hitboxPreview, setHitboxPreview] = useState('');

  // Stats edit form
  const [statsForm, setStatsForm] = useState(fallback.stats);

  // Move modal state (Admin)
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingMove, setEditingMove] = useState(null);
  const [moveForm, setMoveForm] = useState({
    CHAR_MOVE: '',
    move_type: 'normal',
    guard: 'Mid',
    version: '',
    DAMAGE: 500,
    START_UP: 6,
    ACTIVE: 3,
    RECOVERY: 10,
    ADV_ON_BLOCK: -2,
    ADV_ON_HIT: 2,
    INVULNERABILITY: 'None',
    hitbox_url: '',
    hitbox_caption: '',
    properties: '',
    description: ''
  });

  // Tải dữ liệu từ Database nếu có
  const loadDataFromApi = async (charId) => {
    if (!charId) return;
    try {
      const data = await characterApi.get(charId);
      const statsRes = data?.base_stats || data?.baseStats;
      const movesRes = data?.moves;
      if (statsRes) {
        setStats(statsRes);
        setStatsForm(statsRes);
      }
      if (Array.isArray(movesRes)) {
        setMoves(movesRes);
      }
    } catch (err) {
      console.warn('Could not load data from API, using fallback data:', err);
    }
  };

  useEffect(() => {
    const fb = getFallbackDetails(character?.name);
    setStats(fb.stats);
    setStatsForm(fb.stats);
    setMoves(fb.moves);
    setCharacterType(character?.type || 'Fighter');
    setStyleInput(character?.type || 'Fighter');

    if (character?.id && typeof character.id === 'number') {
      loadDataFromApi(character.id);
    }
  }, [character]);

  // Lưu Phong cách (Style) của nhân vật (Admin)
  const handleSaveStyle = async (e) => {
    e.preventDefault();
    try {
      if (character?.id && typeof character.id === 'number') {
        await characterApi.update(character.id, { type: styleInput });
      }
      setCharacterType(styleInput);
      const updatedChar = { ...character, type: styleInput };
      if (character) character.type = styleInput;
      if (onCharacterUpdated) onCharacterUpdated(updatedChar);
      setIsEditingStyle(false);
    } catch (err) {
      alert('Không thể lưu phong cách: ' + err.message);
    }
  };

  // Lưu thông số cơ bản (Admin)
  const handleSaveStats = async (e) => {
    e.preventDefault();
    try {
      if (character?.id && typeof character.id === 'number') {
        await characterApi.saveBaseStats(character.id, statsForm);
      }
      setStats({ ...statsForm });
      if (onCharacterUpdated) onCharacterUpdated({ ...character });
      setIsEditingStats(false);
    } catch (err) {
      alert('Không thể lưu chỉ số: ' + err.message);
    }
  };

  // Đóng modal lightbox khi nhấn phím Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveHitboxModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Xử lý chọn tệp ảnh Hitbox từ máy (Admin)
  const handleHitboxFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setHitboxFile(file);
      const previewUrl = URL.createObjectURL(file);
      setHitboxPreview(previewUrl);
    }
  };

  // Xóa ảnh Hitbox đã chọn hoặc đã tải lên
  const handleClearHitboxImage = () => {
    setHitboxFile(null);
    setHitboxPreview('');
    setMoveForm((prev) => ({ ...prev, hitbox_url: '', hitbox_caption: '' }));
  };

  // Mở form thêm đòn đánh
  const handleOpenAddMove = () => {
    setEditingMove(null);
    setHitboxFile(null);
    setHitboxPreview('');
    setMoveForm({
      CHAR_MOVE: '',
      move_type: 'normal',
      guard: 'Mid',
      version: '',
      DAMAGE: 500,
      START_UP: 6,
      ACTIVE: 3,
      RECOVERY: 10,
      ADV_ON_BLOCK: -2,
      ADV_ON_HIT: '+2',
      INVULNERABILITY: 'None',
      hitbox_url: '',
      hitbox_urls: '',
      hitbox_urls_text: '',
      hitbox_caption: '',
      properties: '',
      description: ''
    });
    setIsMoveModalOpen(true);
  };

  // Mở form sửa đòn đánh
  const handleOpenEditMove = (move) => {
    setEditingMove(move);
    setHitboxFile(null);
    setHitboxPreview(move.hitbox_url || '');
    const existingHitboxList = getHitboxList(move);
    setMoveForm({
      CHAR_MOVE: move.CHAR_MOVE || '',
      move_type: move.move_type || 'normal',
      guard: move.guard || 'Mid',
      version: move.version || '',
      DAMAGE: move.DAMAGE ?? 500,
      START_UP: move.START_UP ?? 6,
      ACTIVE: move.ACTIVE ?? 3,
      RECOVERY: move.RECOVERY ?? 10,
      ADV_ON_BLOCK: move.ADV_ON_BLOCK ?? -2,
      ADV_ON_HIT: move.ADV_ON_HIT != null ? String(move.ADV_ON_HIT) : '+2',
      INVULNERABILITY: move.INVULNERABILITY || 'None',
      hitbox_url: move.hitbox_url || '',
      hitbox_urls: move.hitbox_urls || '',
      hitbox_urls_text: existingHitboxList.join(', '),
      hitbox_caption: move.hitbox_caption || '',
      properties: move.properties || '',
      description: move.description || ''
    });
    setIsMoveModalOpen(true);
  };

  // Lưu đòn đánh (Thêm mới hoặc Cập nhật)
  const handleSaveMove = async (e) => {
    e.preventDefault();
    if (!moveForm.CHAR_MOVE.trim()) {
      alert('Vui lòng nhập tên đòn đánh.');
      return;
    }

    const rawHitboxUrls = moveForm.hitbox_urls_text !== undefined 
      ? moveForm.hitbox_urls_text 
      : (moveForm.hitbox_urls ? (Array.isArray(moveForm.hitbox_urls) ? moveForm.hitbox_urls.join(', ') : moveForm.hitbox_urls) : (moveForm.hitbox_url || ''));
    const parsedUrlsArray = String(rawHitboxUrls)
      .split(/[\n,]/)
      .map((u) => u.trim())
      .filter(Boolean);
    const finalPrimaryHitbox = parsedUrlsArray[0] || moveForm.hitbox_url || '';
    const finalHitboxUrlsJson = parsedUrlsArray.length > 0 ? JSON.stringify(parsedUrlsArray) : null;

    const payload = {
      ...moveForm,
      CHAR_NAME: character?.name || 'Fighter',
      DAMAGE: parseInt(moveForm.DAMAGE) || 0,
      START_UP: parseInt(moveForm.START_UP) || 0,
      ACTIVE: parseInt(moveForm.ACTIVE) || 0,
      RECOVERY: parseInt(moveForm.RECOVERY) || 0,
      ADV_ON_BLOCK: parseInt(moveForm.ADV_ON_BLOCK) || 0,
      ADV_ON_HIT: moveForm.ADV_ON_HIT !== undefined && moveForm.ADV_ON_HIT !== null && String(moveForm.ADV_ON_HIT).trim() !== ''
        ? String(moveForm.ADV_ON_HIT).trim()
        : null,
      hitbox_url: finalPrimaryHitbox,
      hitbox_urls: finalHitboxUrlsJson,
    };
    delete payload.hitbox_urls_text;

    try {
      if (character?.id && typeof character.id === 'number') {
        if (hitboxFile) {
          const formData = new FormData();
          Object.entries(payload).forEach(([k, v]) => {
            if (v !== undefined && v !== null) {
              formData.append(k, String(v));
            }
          });
          formData.append('hitbox', hitboxFile);
          if (editingMove) {
            await characterApi.updateMove(character.id, editingMove.id, formData);
          } else {
            await characterApi.createMove(character.id, formData);
          }
        } else {
          if (editingMove) {
            await characterApi.updateMove(character.id, editingMove.id, payload);
          } else {
            await characterApi.createMove(character.id, payload);
          }
        }
        await loadDataFromApi(character.id);
      } else {
        // Local fallback
        const savedHitboxUrl = hitboxPreview || moveForm.hitbox_url || '';
        const localData = { ...payload, hitbox_url: savedHitboxUrl };
        if (editingMove) {
          setMoves(moves.map((m) => (m.id === editingMove.id ? { ...m, ...localData } : m)));
        } else {
          setMoves([...moves, { ...localData, id: Date.now() }]);
        }
      }
      setIsMoveModalOpen(false);
      setEditingMove(null);
      setHitboxFile(null);
      setHitboxPreview('');
    } catch (err) {
      alert('Không thể lưu đòn đánh: ' + err.message);
    }
  };

  const handleImportSuccess = async (savedMoves) => {
    try {
      if (character?.id && typeof character.id === 'number') {
        await loadDataFromApi(character.id);
      } else {
        setMoves((prev) => {
          const moveMap = new Map();
          prev.forEach((m) => moveMap.set(m.CHAR_MOVE.toLowerCase(), m));
          savedMoves.forEach((m) => {
            const existing = moveMap.get(m.CHAR_MOVE.toLowerCase());
            if (existing) {
              Object.assign(existing, m);
            } else {
              moveMap.set(m.CHAR_MOVE.toLowerCase(), { ...m, id: Date.now() + Math.random() });
            }
          });
          return Array.from(moveMap.values());
        });
      }
      alert(`Đã lưu thành công ${savedMoves.length} đòn đánh cho nhân vật ${character?.name}!`);
    } catch (err) {
      console.error('Lỗi sau khi import:', err);
    }
  };

  // Xóa đòn đánh (Admin)
  const handleDeleteMove = async (moveId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đòn đánh này?')) return;
    try {
      if (character?.id && typeof character.id === 'number') {
        await characterApi.removeMove(character.id, moveId);
        setMoves((prev) => prev.filter((m) => m.id !== moveId));
        await loadDataFromApi(character.id);
      } else {
        setMoves((prev) => prev.filter((m) => m.id !== moveId));
      }
    } catch (err) {
      if (err.message && err.message.includes('not found')) {
        setMoves((prev) => prev.filter((m) => m.id !== moveId));
      } else {
        alert('Không thể xóa đòn đánh: ' + err.message);
      }
    }
  };

  // Đóng/mở dòng chi tiết trong chế độ Bảng
  const toggleRowExpand = (id) => {
    setExpandedMoveIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Lọc danh sách đòn đánh
  const filteredMoves = moves.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    const nameMatch =
      m.CHAR_MOVE.toLowerCase().includes(q) ||
      (m.version && m.version.toLowerCase().includes(q)) ||
      (m.description && m.description.toLowerCase().includes(q));

    if (!nameMatch) return false;
    if (categoryFilter === 'ALL') return true;

    if (categoryFilter === 'NORMAL') {
      return (
        m.move_type === 'normal' ||
        m.move_type === 'command_normal' ||
        /^[2456]?[LMH]|j\.[2456]?[LMH]/i.test(m.CHAR_MOVE)
      );
    }
    if (categoryFilter === 'THROW') {
      return (
        m.move_type === 'throw' ||
        /throw|grab|vật/i.test(m.CHAR_MOVE) ||
        m.guard === 'Throw'
      );
    }
    if (categoryFilter === 'SPECIAL') {
      return (
        m.move_type === 'special' ||
        (/236|214|623|22|41236|632146/i.test(m.CHAR_MOVE) && !/super|star/i.test(m.CHAR_MOVE))
      );
    }
    if (categoryFilter === 'SUPER') {
      return (
        m.move_type === 'super' ||
        /super|star|say fan/i.test(m.CHAR_MOVE)
      );
    }
    return true;
  });

  const charAvatar = getCharacterArt(character?.name);
  const charCutout = getCharacterCutout(character?.name);

  const formatAdv = (val) => {
    if (val === undefined || val === null || val === '') return '-';
    const str = String(val).trim();
    const num = Number(str);
    if (!isNaN(num)) {
      if (num > 0) return `+${num}`;
      return String(num);
    }
    return str;
  };

  const getAdvClass = (val) => {
    if (val === undefined || val === null || val === '') return 'adv-zero';
    const str = String(val).trim();
    const num = Number(str);
    if (!isNaN(num)) {
      if (num > 0) return 'adv-pos';
      if (num < 0) return 'adv-neg';
      return 'adv-zero';
    }
    const upper = str.toUpperCase();
    if (upper.includes('HKD') || upper.includes('HARD')) return 'adv-hkd';
    if (upper.includes('SKD') || upper.includes('SOFT') || upper.includes('KD') || upper.includes('KNOCKDOWN')) return 'adv-skd';
    if (upper.includes('LAUNCH') || upper.includes('BOUNCE') || upper.includes('CRUMPLE')) return 'adv-launch';
    return 'adv-special';
  };

  const getHitboxList = (m) => {
    if (!m) return [];
    if (Array.isArray(m.hitbox_urls) && m.hitbox_urls.length > 0) {
      return m.hitbox_urls;
    }
    if (typeof m.hitbox_urls === 'string' && m.hitbox_urls.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(m.hitbox_urls);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // ignore
      }
    }
    if (m.hitbox_url) return [m.hitbox_url];
    return [];
  };

  const getGuardClass = (guardVal) => {
    switch (guardVal?.toLowerCase()) {
      case 'low':
        return 'guard-badge guard-low';
      case 'overhead':
        return 'guard-badge guard-overhead';
      case 'throw':
        return 'guard-badge guard-throw';
      case 'all':
        return 'guard-badge guard-all';
      default:
        return 'guard-badge guard-mid';
    }
  };

  // Tính phần trăm thanh HP (tối đa mốc 1200)
  const hpPercent = Math.min(Math.max(((stats.HP || 1000) / 1200) * 100, 20), 100);

  return (
    <main className="figma-detail-screen" aria-label="Màn hình tra cứu Frame Data và Thông số nhân vật">
      {/* Khung tổng thể kính mờ */}
      <section className="figma-detail-container">
        {/* Header thông tin nhân vật */}
        <header className="figma-detail-header">
          <div className="figma-detail-header-left">
            {/* Nút Back quay lại màn hình Showcase */}
            <button
              type="button"
              className="figma-detail-back-btn"
              onClick={onBack}
              aria-label="Quay lại màn hình xem tướng"
              title="Quay lại"
            >
              <span aria-hidden="true">&larr;</span>
              <span>Back</span>
            </button>

            {charAvatar && (
              <img src={charAvatar} alt={character?.name} className="figma-detail-char-avatar" />
            )}
            <div>
              <h1 className="figma-detail-char-name">{character?.name}</h1>
              <div className="figma-detail-header-meta">
                <span>Phong cách: <strong>{characterType}</strong></span>
                {isAuthenticated && !isEditingStyle && (
                  <button
                    type="button"
                    className="figma-detail-edit-style-inline-btn"
                    onClick={() => setIsEditingStyle(true)}
                    title="Sửa Phong cách (Admin)"
                  >
                    ✎ Sửa Style
                  </button>
                )}
                <span>•</span>
                <span>Độ khó: <strong>{character?.difficulty || 3}/6</strong></span>
              </div>
            </div>
          </div>

          <div className="figma-detail-badge">
            Frame Data & Combat Profile
          </div>
        </header>

        {/* Bố cục 2 cột chính */}
        <div className="figma-detail-main-layout">
          {/* CỘT TRÁI: COMBAT PROFILE & BASE STATS (PHONG CÁCH FIGMA NODE 466:1052) */}
          <aside className="figma-detail-stats-panel figma-teal-card" aria-label="Thông số cơ bản chiến đấu">
            {/* Họa tiết đa giác chìm ở góc */}
            <img
              src={selectionPolygon}
              alt=""
              className="figma-teal-polygon-decor"
              aria-hidden="true"
            />

            {/* Banner chân dung nhân vật (sử dụng Cutout PNG theo yêu cầu) */}
            <div className="figma-teal-portrait-box">
              {charCutout || charAvatar ? (
                <img
                  src={charCutout || charAvatar}
                  alt={character?.name}
                  className="figma-teal-portrait-img figma-teal-portrait-cutout"
                />
              ) : (
                <div className="figma-teal-portrait-placeholder">NO ART</div>
              )}
              <div className="figma-teal-portrait-overlay">
                <div className="figma-teal-tag-row">
                  <span className="figma-teal-tag-arch">{characterType}</span>
                  {isAuthenticated && !isEditingStyle && (
                    <button
                      type="button"
                      className="figma-teal-edit-style-btn"
                      onClick={() => setIsEditingStyle(true)}
                      title="Sửa Style (Admin)"
                    >
                      ✎ Sửa Style
                    </button>
                  )}
                </div>
                <span className="figma-teal-char-title">{character?.name}</span>
              </div>
            </div>

            {/* Form sửa Phong cách / Style (Admin) */}
            {isEditingStyle && (
              <form className="figma-detail-style-edit-form" onSubmit={handleSaveStyle}>
                <div className="figma-style-edit-title-row">
                  <strong>Chỉnh sửa Phong cách (Style)</strong>
                  <button
                    type="button"
                    className="figma-style-close-btn"
                    onClick={() => setIsEditingStyle(false)}
                    title="Đóng"
                  >
                    ✕
                  </button>
                </div>
                <div className="figma-detail-edit-field">
                  <input
                    type="text"
                    value={styleInput}
                    onChange={(e) => setStyleInput(e.target.value)}
                    placeholder="ví dụ: Zoner / Chemist, Rushdown / Shoto..."
                    required
                  />
                </div>
                <div className="figma-style-presets">
                  <span>Gợi ý:</span>
                  {['Zoner', 'Rushdown', 'Grappler', 'Shoto', 'Balanced', 'Mixup', 'Trapper', 'Duelist'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      className="preset-pill-btn"
                      onClick={() => setStyleInput(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <div className="figma-detail-stats-edit-actions">
                  <button type="submit" className="btn-save-action">Lưu Style</button>
                  <button type="button" className="btn-cancel-action" onClick={() => setIsEditingStyle(false)}>Hủy</button>
                </div>
              </form>
            )}

            {/* Tiêu đề & nút Sửa */}
            <div className="figma-detail-stats-title-row">
              <h2 className="figma-detail-section-title">Stats</h2>
              {isAuthenticated && !isEditingStats && (
                <button
                  type="button"
                  className="figma-detail-btn-small"
                  onClick={() => setIsEditingStats(true)}
                  title="Chỉnh sửa thông số cơ bản"
                >
                  Sửa
                </button>
              )}
            </div>

            {isEditingStats ? (
              <form className="figma-detail-stats-edit-form" onSubmit={handleSaveStats}>
                <div className="figma-detail-edit-field">
                  <label htmlFor="stat-hp">HP</label>
                  <input
                    id="stat-hp"
                    type="number"
                    value={statsForm.HP}
                    onChange={(e) => setStatsForm({ ...statsForm, HP: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="figma-detail-edit-field">
                  <label htmlFor="stat-jump">Jump Startup (F)</label>
                  <input
                    id="stat-jump"
                    type="number"
                    value={statsForm.JUMP_START_UP}
                    onChange={(e) => setStatsForm({ ...statsForm, JUMP_START_UP: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="figma-detail-edit-field">
                  <label htmlFor="stat-dash">Dash Startup (F)</label>
                  <input
                    id="stat-dash"
                    type="number"
                    value={statsForm.DASH_START_UP}
                    onChange={(e) => setStatsForm({ ...statsForm, DASH_START_UP: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="figma-detail-edit-field">
                  <label htmlFor="stat-backdash">Backdash (F)</label>
                  <input
                    id="stat-backdash"
                    type="number"
                    value={statsForm.BACKDASH}
                    onChange={(e) => setStatsForm({ ...statsForm, BACKDASH: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="figma-detail-edit-field">
                  <label htmlFor="stat-backdash-note">Backdash Invuln Note</label>
                  <input
                    id="stat-backdash-note"
                    type="text"
                    placeholder="(1-5F Full Invuln, 1-19F Grab Invuln)"
                    value={statsForm.BACKDASH_NOTE || ''}
                    onChange={(e) => setStatsForm({ ...statsForm, BACKDASH_NOTE: e.target.value })}
                  />
                </div>

                <div className="figma-detail-edit-field">
                  <label htmlFor="stat-walk">Walk Speed</label>
                  <input
                    id="stat-walk"
                    type="text"
                    value={statsForm.WALKSPEED ?? ''}
                    onChange={(e) => setStatsForm({ ...statsForm, WALKSPEED: e.target.value })}
                  />
                </div>

                <div className="figma-detail-edit-field">
                  <label htmlFor="stat-reversal">Reversals</label>
                  <input
                    id="stat-reversal"
                    type="text"
                    placeholder="236H (13F)"
                    value={statsForm.REVERSAL || ''}
                    onChange={(e) => setStatsForm({ ...statsForm, REVERSAL: e.target.value })}
                  />
                </div>

                <div className="figma-detail-stats-edit-actions">
                  <button type="submit" className="btn-save-action">Lưu</button>
                  <button type="button" className="btn-cancel-action" onClick={() => setIsEditingStats(false)}>Hủy</button>
                </div>
              </form>
            ) : (
              /* CẤU TRÚC Ô STATS CHUẨN 100% THEO MIZUUMI WIKI */
              <div className="figma-wiki-stats-box">
                <div className="figma-wiki-stats-header">
                  Stats
                </div>
                <div className="figma-wiki-stats-body">
                  <div className="figma-wiki-stat-row">
                    <span className="figma-wiki-stat-label">HP:</span>
                    <span className="figma-wiki-stat-value">{stats.HP ?? 1000}</span>
                  </div>

                  <div className="figma-wiki-stat-row">
                    <span className="figma-wiki-stat-label">Jump Startup:</span>
                    <span className="figma-wiki-stat-value">{stats.JUMP_START_UP ? `${stats.JUMP_START_UP}F` : '5F'}</span>
                  </div>

                  <div className="figma-wiki-stat-row">
                    <span className="figma-wiki-stat-label">Dash Startup:</span>
                    <span className="figma-wiki-stat-value">{stats.DASH_START_UP ? `${stats.DASH_START_UP}F` : '7F'}</span>
                  </div>

                  <div className="figma-wiki-stat-group">
                    <div className="figma-wiki-stat-row">
                      <span className="figma-wiki-stat-label">Backdash:</span>
                      <span className="figma-wiki-stat-value">{stats.BACKDASH ? `${stats.BACKDASH}F` : '28F'}</span>
                    </div>
                    <div className="figma-wiki-stat-subnote">
                      {stats.BACKDASH_NOTE || '(1-5F Full Invuln, 1-19F Grab Invuln)'}
                    </div>
                  </div>

                  <div className="figma-wiki-stat-row">
                    <span className="figma-wiki-stat-label">Walk Speed:</span>
                    <span className="figma-wiki-stat-value">{stats.WALKSPEED ?? 'Average'}</span>
                  </div>

                  <div className="figma-wiki-stat-group figma-wiki-reversal-group">
                    <span className="figma-wiki-stat-label">Reversals:</span>
                    <div className="figma-wiki-reversal-value">
                      {stats.REVERSAL || '236H (13F)'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </aside>

          {/* CỘT PHẢI: BẢNG FRAME DATA & HỆ THỐNG MOVES (CHUẨN MIZUUMI WIKI) */}
          <article className="figma-detail-framedata-panel" aria-label="Bảng tra cứu Frame Data">
            {/* Thanh điều khiển trên cùng: Tìm kiếm, Bộ lọc phân loại, Chuyển chế độ xem */}
            <div className="figma-detail-controls-bar">
              <input
                type="text"
                className="figma-detail-search-input"
                placeholder="Tìm kiếm đòn đánh (VD: 5L, 236H, Potion)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {/* Bộ lọc 5 nhóm đòn chuẩn FGC */}
              <div className="figma-detail-filter-group" role="tablist">
                <button
                  type="button"
                  className={`figma-detail-filter-btn ${categoryFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setCategoryFilter('ALL')}
                >
                  Tất cả ({moves.length})
                </button>
                <button
                  type="button"
                  className={`figma-detail-filter-btn ${categoryFilter === 'NORMAL' ? 'active' : ''}`}
                  onClick={() => setCategoryFilter('NORMAL')}
                >
                  Đòn thường
                </button>
                <button
                  type="button"
                  className={`figma-detail-filter-btn ${categoryFilter === 'THROW' ? 'active' : ''}`}
                  onClick={() => setCategoryFilter('THROW')}
                >
                  Vật & Cơ chế
                </button>
                <button
                  type="button"
                  className={`figma-detail-filter-btn ${categoryFilter === 'SPECIAL' ? 'active' : ''}`}
                  onClick={() => setCategoryFilter('SPECIAL')}
                >
                  Đòn đặc biệt
                </button>
                <button
                  type="button"
                  className={`figma-detail-filter-btn ${categoryFilter === 'SUPER' ? 'active' : ''}`}
                  onClick={() => setCategoryFilter('SUPER')}
                >
                  Tuyệt kỹ
                </button>
              </div>

              {/* Bộ chuyển đổi chế độ xem: Bảng tra cứu vs Thẻ Mizuumi */}
              <div className="figma-view-mode-group">
                <button
                  type="button"
                  className={`figma-view-mode-btn ${viewMode === 'TABLE' ? 'active' : ''}`}
                  onClick={() => setViewMode('TABLE')}
                  title="Chế độ xem Bảng tra cứu nhanh"
                >
                  Bảng
                </button>
                <button
                  type="button"
                  className={`figma-view-mode-btn ${viewMode === 'CARDS' ? 'active' : ''}`}
                  onClick={() => setViewMode('CARDS')}
                  title="Chế độ xem Thẻ Mizuumi Wiki"
                >
                  Thẻ Wiki
                </button>
              </div>

              {isAuthenticated && (
                <div className="figma-detail-admin-moves-btn-group">
                  <button
                    type="button"
                    className="figma-detail-btn-import"
                    onClick={() => setIsImportModalOpen(true)}
                    title="Nhập đòn đánh từ mã nguồn Mizuumi Wiki"
                  >
                    📥 Nhập từ Wiki
                  </button>
                  <button
                    type="button"
                    className="figma-detail-btn-add"
                    onClick={handleOpenAddMove}
                    title="Thêm đòn đánh mới"
                  >
                    + Thêm Đòn
                  </button>
                </div>
              )}
            </div>

            {/* CHẾ ĐỘ 1: BẢNG TRA CỨU NHANH (TABLE VIEW) */}
            {viewMode === 'TABLE' && (
              <div className="figma-detail-table-scroll">
                <table className="figma-framedata-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', paddingLeft: '16px' }}>Tên Đòn</th>
                      <th>Kiểu Đỡ</th>
                      <th>Sát Thương</th>
                      <th>Startup</th>
                      <th>Active</th>
                      <th>Recovery</th>
                      <th>On Block</th>
                      <th>On Hit</th>
                      <th>Kháng Đòn</th>
                      <th>Chi Tiết</th>
                      {isAuthenticated && <th>Thao Tác</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMoves.map((m) => {
                      const isExpanded = expandedMoveIds.has(m.id || m.CHAR_MOVE);
                      const hasDetails = Boolean(m.properties || m.description || m.stances || m.hitbox_url);

                      return (
                        <tr key={m.id || m.CHAR_MOVE} className={isExpanded ? 'row-expanded' : ''}>
                          <td className="col-move-name">
                            <div className="col-move-title-wrap">
                              <span className="col-move-title">{m.CHAR_MOVE}</span>
                              {m.hitbox_url && (
                                <button
                                  type="button"
                                  className="figma-hitbox-indicator-badge"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveHitboxModal({
                                      url: m.hitbox_url,
                                      name: m.CHAR_MOVE,
                                      caption: m.hitbox_caption,
                                      version: m.version
                                    });
                                  }}
                                  title="Bấm để xem khung Hitbox của đòn đánh"
                                >
                                  Hitbox
                                </button>
                              )}
                            </div>
                            {m.version && <span className="col-move-version">({m.version})</span>}
                          </td>
                          <td>
                            <span className={getGuardClass(m.guard)}>{m.guard || 'Mid'}</span>
                          </td>
                          <td>{m.DAMAGE ?? '-'}</td>
                          <td>{m.START_UP ? `${m.START_UP}f` : '-'}</td>
                          <td>{m.ACTIVE ? `${m.ACTIVE}f` : '-'}</td>
                          <td>{m.RECOVERY ? `${m.RECOVERY}f` : '-'}</td>
                          <td className={getAdvClass(m.ADV_ON_BLOCK)}>{formatAdv(m.ADV_ON_BLOCK)}</td>
                          <td className={getAdvClass(m.ADV_ON_HIT)}>{formatAdv(m.ADV_ON_HIT)}</td>
                          <td>{m.INVULNERABILITY || 'None'}</td>
                          <td>
                            {hasDetails ? (
                              <button
                                type="button"
                                className="figma-expand-btn"
                                onClick={() => toggleRowExpand(m.id || m.CHAR_MOVE)}
                                title={isExpanded ? 'Thu gọn' : 'Xem đặc tính và stances'}
                              >
                                {isExpanded ? 'Thu Gọn' : 'Xem Thêm'}
                              </button>
                            ) : (
                              <span style={{ color: '#64748b' }}>-</span>
                            )}
                          </td>
                          {isAuthenticated && (
                            <td>
                              <div className="figma-detail-row-actions">
                                <button
                                  type="button"
                                  className="btn-table-edit"
                                  onClick={() => handleOpenEditMove(m)}
                                  title="Sửa đòn đánh"
                                >
                                  Sửa
                                </button>
                                <button
                                  type="button"
                                  className="btn-table-delete"
                                  onClick={() => handleDeleteMove(m.id)}
                                  title="Xóa đòn đánh"
                                >
                                  Xóa
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}

                    {filteredMoves.length === 0 && (
                      <tr>
                        <td colSpan={isAuthenticated ? 11 : 10} style={{ padding: '36px', color: '#94a3b8' }}>
                          Không tìm thấy đòn đánh nào phù hợp với bộ lọc.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Sub-panels cho các hàng mở rộng */}
                {filteredMoves.map((m) => {
                  const isExpanded = expandedMoveIds.has(m.id || m.CHAR_MOVE);
                  if (!isExpanded) return null;

                  return (
                    <div key={`exp-${m.id || m.CHAR_MOVE}`} className="figma-table-expanded-drawer">
                      <div className="figma-drawer-header">
                        <strong>Ghi chú chiêu thức: {m.CHAR_MOVE}</strong>
                        {m.version && <span className="figma-drawer-version-tag">Phiên bản: {m.version}</span>}
                      </div>

                      {/* Bảng stances nếu có */}
                      {Array.isArray(m.stances) && m.stances.length > 0 && (
                        <div className="figma-drawer-stances-wrap">
                          <span className="figma-drawer-subheading">Các biến thể Stance:</span>
                          <table className="figma-substance-table">
                            <thead>
                              <tr>
                                <th>Stance</th>
                                <th>Damage</th>
                                <th>Guard</th>
                                <th>Startup</th>
                                <th>Active</th>
                                <th>Recovery</th>
                                <th>On Block</th>
                                <th>On Hit</th>
                              </tr>
                            </thead>
                            <tbody>
                              {m.stances.map((st, idx) => (
                                <tr key={idx}>
                                  <td style={{ fontWeight: 'bold', color: '#7dd3fc' }}>{st.name}</td>
                                  <td>{st.damage}</td>
                                  <td><span className={getGuardClass(st.guard)}>{st.guard || 'Mid'}</span></td>
                                  <td>{st.startup}f</td>
                                  <td>{st.active}f</td>
                                  <td>{st.recovery}f</td>
                                  <td className={getAdvClass(st.onBlock)}>{formatAdv(st.onBlock)}</td>
                                  <td className={getAdvClass(st.onHit)}>{formatAdv(st.onHit)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Khung va chạm Hitbox trong Drawer */}
                      {getHitboxList(m).length > 0 && (
                        <div className="figma-drawer-hitbox-section">
                          <span className="figma-drawer-subheading">Khung Va Chạm (Hitbox Frame):</span>
                          <div className="figma-hitbox-thumbnails-grid" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {getHitboxList(m).map((hUrl, hIdx) => (
                              <div
                                key={hIdx}
                                className="figma-drawer-hitbox-preview"
                                onClick={() =>
                                  setActiveHitboxModal({
                                    url: hUrl,
                                    name: `${m.CHAR_MOVE} (Frame ${hIdx + 1})`,
                                    caption: m.hitbox_caption,
                                    version: m.version
                                  })
                                }
                                title="Bấm vào để phóng to toàn màn hình"
                                style={{ position: 'relative' }}
                              >
                                <img src={hUrl} alt={`Hitbox ${m.CHAR_MOVE} frame ${hIdx + 1}`} className="figma-drawer-hitbox-img" />
                                {getHitboxList(m).length > 1 && (
                                  <span style={{
                                    position: 'absolute',
                                    top: '4px',
                                    left: '4px',
                                    background: 'rgba(0,0,0,0.75)',
                                    color: '#38bdf8',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    padding: '2px 6px',
                                    borderRadius: '4px'
                                  }}>F{hIdx + 1}</span>
                                )}
                                <div className="figma-drawer-hitbox-overlay">
                                  <span>🔍 Xem Frame {hIdx + 1}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          {m.hitbox_caption && (
                            <span className="figma-drawer-hitbox-caption">💡 {m.hitbox_caption}</span>
                          )}
                        </div>
                      )}

                      {m.properties && (
                        <div className="figma-drawer-properties">
                          <span className="figma-drawer-prop-title">Thuộc tính / Properties:</span>
                          <p className="figma-drawer-prop-text">• {m.properties}</p>
                        </div>
                      )}

                      {m.description && (
                        <div className="figma-drawer-description">
                          <span className="figma-drawer-prop-title">Chiến thuật sử dụng:</span>
                          <p className="figma-drawer-desc-text">{m.description}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* CHẾ ĐỘ 2: DANH SÁCH THẺ MIZUUMI WIKI (CARDS VIEW) */}
            {viewMode === 'CARDS' && (
              <div className="figma-detail-cards-scroll">
                {filteredMoves.map((m) => (
                  <div key={m.id || m.CHAR_MOVE} className="figma-mizuumi-card">
                    {/* Header của thẻ */}
                    <div className="figma-mizuumi-card-header">
                      <div className="figma-mizuumi-card-title-group">
                        <span className="figma-mizuumi-notation">{m.CHAR_MOVE}</span>
                        {m.version && <span className="figma-mizuumi-version-badge">{m.version}</span>}
                        <span className={getGuardClass(m.guard)}>{m.guard || 'Mid'}</span>
                      </div>

                      {isAuthenticated && (
                        <div className="figma-detail-row-actions">
                          <button
                            type="button"
                            className="btn-table-edit"
                            onClick={() => handleOpenEditMove(m)}
                            title="Sửa đòn đánh"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            className="btn-table-delete"
                            onClick={() => handleDeleteMove(m.id)}
                            title="Xóa đòn đánh"
                          >
                            Xóa
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Bố cục nội dung thẻ chuẩn FGC Wiki: Hitbox bên trái & Số liệu bên phải */}
                    <div className="figma-mizuumi-card-content-grid">
                      {/* Cột Trái: Khung hiển thị ảnh Hitbox */}
                      <div className="figma-mizuumi-hitbox-pane">
                        {(() => {
                          const hitboxes = getHitboxList(m);
                          const hasImages = hitboxes.length > 0;
                          return (
                            <div
                              className={`figma-mizuumi-hitbox-frame ${hasImages ? 'has-image' : 'no-image'}`}
                              onClick={() => {
                                if (hasImages) {
                                  setActiveHitboxModal({
                                    url: hitboxes[0],
                                    name: m.CHAR_MOVE,
                                    caption: m.hitbox_caption,
                                    version: m.version
                                  });
                                }
                              }}
                              title={hasImages ? 'Bấm để phóng to khung va chạm' : 'Chưa có ảnh Hitbox'}
                            >
                              {hasImages ? (
                                <>
                                  <div className="figma-hitbox-badge-tag">
                                    HITBOX {hitboxes.length > 1 ? `(${hitboxes.length})` : ''}
                                  </div>
                                  <img
                                    src={hitboxes[0]}
                                    alt={`Hitbox ${m.CHAR_MOVE}`}
                                    className="figma-mizuumi-hitbox-thumb"
                                  />
                                  <div className="figma-hitbox-zoom-hint">
                                    <span>🔍 Phóng to</span>
                                  </div>
                                  {hitboxes.length > 1 && (
                                    <div
                                      style={{
                                        position: 'absolute',
                                        bottom: '8px',
                                        left: '8px',
                                        right: '8px',
                                        display: 'flex',
                                        gap: '6px',
                                        zIndex: 3,
                                        justifyContent: 'center',
                                        flexWrap: 'wrap'
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {hitboxes.map((hUrl, hIdx) => (
                                        <button
                                          key={hIdx}
                                          type="button"
                                          onClick={() =>
                                            setActiveHitboxModal({
                                              url: hUrl,
                                              name: `${m.CHAR_MOVE} (Frame ${hIdx + 1})`,
                                              caption: m.hitbox_caption,
                                              version: m.version
                                            })
                                          }
                                          style={{
                                            padding: '2px 8px',
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            background: 'rgba(15, 23, 42, 0.85)',
                                            color: '#38bdf8',
                                            border: '1px solid rgba(56, 189, 248, 0.5)',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                          }}
                                        >
                                          F{hIdx + 1}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="figma-hitbox-empty-placeholder">
                                  <span className="figma-hitbox-empty-icon">🎯</span>
                                  <span className="figma-hitbox-empty-text">Chưa có ảnh Hitbox</span>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                        {m.hitbox_caption && (
                          <div className="figma-mizuumi-hitbox-subnote">
                            <span>{m.hitbox_caption}</span>
                          </div>
                        )}
                      </div>

                      {/* Cột Phải: Bảng thông số và Ghi chú chiêu thức */}
                      <div className="figma-mizuumi-details-pane">
                        {/* Bảng thông số (Sub-tables cho Stance hoặc đơn) */}
                        <div className="figma-mizuumi-card-table-wrap">
                          <table className="figma-framedata-table figma-mizuumi-subtable">
                            <thead>
                              <tr>
                                <th>Phiên Bản</th>
                                <th>Sát Thương</th>
                                <th>Guard</th>
                                <th>Startup</th>
                                <th>Active</th>
                                <th>Recovery</th>
                                <th>On Block</th>
                                <th>On Hit</th>
                                <th>Kháng Đòn</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Array.isArray(m.stances) && m.stances.length > 0 ? (
                                m.stances.map((st, sIdx) => (
                                  <tr key={sIdx}>
                                    <td style={{ fontWeight: 700, color: '#38bdf8' }}>{st.name}</td>
                                    <td>{st.damage}</td>
                                    <td><span className={getGuardClass(st.guard)}>{st.guard || 'Mid'}</span></td>
                                    <td>{st.startup}f</td>
                                    <td>{st.active}f</td>
                                    <td>{st.recovery}f</td>
                                    <td className={getAdvClass(st.onBlock)}>{formatAdv(st.onBlock)}</td>
                                    <td className={getAdvClass(st.onHit)}>{formatAdv(st.onHit)}</td>
                                    <td>{m.INVULNERABILITY || 'None'}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td style={{ fontWeight: 700, color: '#38bdf8' }}>{m.version || 'Tiêu Chuẩn'}</td>
                                  <td>{m.DAMAGE ?? '-'}</td>
                                  <td><span className={getGuardClass(m.guard)}>{m.guard || 'Mid'}</span></td>
                                  <td>{m.START_UP ? `${m.START_UP}f` : '-'}</td>
                                  <td>{m.ACTIVE ? `${m.ACTIVE}f` : '-'}</td>
                                  <td>{m.RECOVERY ? `${m.RECOVERY}f` : '-'}</td>
                                  <td className={getAdvClass(m.ADV_ON_BLOCK)}>{formatAdv(m.ADV_ON_BLOCK)}</td>
                                  <td className={getAdvClass(m.ADV_ON_HIT)}>{formatAdv(m.ADV_ON_HIT)}</td>
                                  <td>{m.INVULNERABILITY || 'None'}</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Properties & Ghi chú đòn đánh */}
                        {m.properties && (
                          <div className="figma-mizuumi-card-properties">
                            <span className="figma-mizuumi-prop-label">Properties:</span>
                            <span className="figma-mizuumi-prop-content">• {m.properties}</span>
                          </div>
                        )}

                        {/* Mô tả chiến thuật */}
                        {m.description && (
                          <div className="figma-mizuumi-card-desc">
                            {m.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredMoves.length === 0 && (
                  <div className="figma-empty-notice">
                    Không tìm thấy đòn đánh nào phù hợp với điều kiện tìm kiếm.
                  </div>
                )}
              </div>
            )}
          </article>
        </div>
      </section>

      {/* Modal Form Thêm / Sửa Đòn Đánh (Admin) */}
      {isMoveModalOpen && (
        <div className="figma-detail-modal-overlay" onClick={() => setIsMoveModalOpen(false)}>
          <div className="figma-detail-modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="figma-detail-modal-title">
              {editingMove ? 'Chỉnh Sửa Đòn Đánh' : 'Thêm Đòn Đánh Mới'}
            </h3>

            <form onSubmit={handleSaveMove} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="figma-detail-edit-field">
                <label htmlFor="move-input-name">Tên đòn đánh / Ký hiệu (VD: 5L, 236H)</label>
                <input
                  id="move-input-name"
                  type="text"
                  value={moveForm.CHAR_MOVE}
                  onChange={(e) => setMoveForm({ ...moveForm, CHAR_MOVE: e.target.value })}
                  required
                />
              </div>

              <div className="figma-detail-move-grid-3">
                <div className="figma-detail-edit-field">
                  <label htmlFor="move-input-type">Phân loại đòn</label>
                  <select
                    id="move-input-type"
                    value={moveForm.move_type}
                    onChange={(e) => setMoveForm({ ...moveForm, move_type: e.target.value })}
                  >
                    <option value="normal">Đòn thường (Normal)</option>
                    <option value="command_normal">Command Normal</option>
                    <option value="throw">Đòn vật (Throw)</option>
                    <option value="special">Đòn đặc biệt (Special)</option>
                    <option value="super">Tuyệt kỹ (Super)</option>
                  </select>
                </div>

                <div className="figma-detail-edit-field">
                  <label htmlFor="move-input-guard">Kiểu đỡ (Guard)</label>
                  <select
                    id="move-input-guard"
                    value={moveForm.guard}
                    onChange={(e) => setMoveForm({ ...moveForm, guard: e.target.value })}
                  >
                    <option value="Mid">Mid (Đỡ đứng hoặc ngồi)</option>
                    <option value="Low">Low (Bắt buộc đỡ ngồi)</option>
                    <option value="Overhead">Overhead (Bắt buộc đỡ đứng)</option>
                    <option value="Throw">Throw (Không thể đỡ)</option>
                    <option value="All">All (Đỡ hướng nào cũng được)</option>
                  </select>
                </div>

                <div className="figma-detail-edit-field">
                  <label htmlFor="move-input-version">Stance / Phiên bản</label>
                  <input
                    id="move-input-version"
                    type="text"
                    placeholder="VD: Chemistry / Gadget"
                    value={moveForm.version}
                    onChange={(e) => setMoveForm({ ...moveForm, version: e.target.value })}
                  />
                </div>
              </div>

              <div className="figma-detail-move-grid">
                <div className="figma-detail-edit-field">
                  <label htmlFor="move-input-dmg">Sát thương (Damage)</label>
                  <input
                    id="move-input-dmg"
                    type="number"
                    value={moveForm.DAMAGE}
                    onChange={(e) => setMoveForm({ ...moveForm, DAMAGE: e.target.value })}
                  />
                </div>
                <div className="figma-detail-edit-field">
                  <label htmlFor="move-input-startup">Startup (Frame)</label>
                  <input
                    id="move-input-startup"
                    type="number"
                    value={moveForm.START_UP}
                    onChange={(e) => setMoveForm({ ...moveForm, START_UP: e.target.value })}
                  />
                </div>
                <div className="figma-detail-edit-field">
                  <label htmlFor="move-input-active">Active (Frame)</label>
                  <input
                    id="move-input-active"
                    type="number"
                    value={moveForm.ACTIVE}
                    onChange={(e) => setMoveForm({ ...moveForm, ACTIVE: e.target.value })}
                  />
                </div>
                <div className="figma-detail-edit-field">
                  <label htmlFor="move-input-rec">Recovery (Frame)</label>
                  <input
                    id="move-input-rec"
                    type="number"
                    value={moveForm.RECOVERY}
                    onChange={(e) => setMoveForm({ ...moveForm, RECOVERY: e.target.value })}
                  />
                </div>
                <div className="figma-detail-edit-field">
                  <label htmlFor="move-input-block">Adv on Block</label>
                  <input
                    id="move-input-block"
                    type="number"
                    value={moveForm.ADV_ON_BLOCK}
                    onChange={(e) => setMoveForm({ ...moveForm, ADV_ON_BLOCK: e.target.value })}
                  />
                </div>
                <div className="figma-detail-edit-field">
                  <label htmlFor="move-input-hit">Adv on Hit (Số hoặc Chữ: HKD, SKD, Launch...)</label>
                  <input
                    id="move-input-hit"
                    type="text"
                    placeholder="VD: +2, -4, HKD, SKD, Launch..."
                    value={moveForm.ADV_ON_HIT}
                    onChange={(e) => setMoveForm({ ...moveForm, ADV_ON_HIT: e.target.value })}
                  />
                </div>
              </div>

              <div className="figma-detail-edit-field">
                <label htmlFor="move-input-invul">Trạng thái kháng đòn (Invulnerability)</label>
                <input
                  id="move-input-invul"
                  type="text"
                  placeholder="None, Full invul, Anti-Air..."
                  value={moveForm.INVULNERABILITY}
                  onChange={(e) => setMoveForm({ ...moveForm, INVULNERABILITY: e.target.value })}
                />
              </div>

              <div className="figma-detail-edit-field">
                <label htmlFor="move-input-properties">Thuộc tính đòn / Properties (Cancel, Gatling...)</label>
                <input
                  id="move-input-properties"
                  type="text"
                  placeholder="VD: Self-Gatling Count: 3. -4 on block khi cancel sang 5S"
                  value={moveForm.properties}
                  onChange={(e) => setMoveForm({ ...moveForm, properties: e.target.value })}
                />
              </div>

              <div className="figma-detail-edit-field">
                <label htmlFor="move-input-desc">Mô tả chiến thuật (Description)</label>
                <textarea
                  id="move-input-desc"
                  rows={3}
                  placeholder="Mô tả công dụng và thời điểm dùng chiêu..."
                  value={moveForm.description}
                  onChange={(e) => setMoveForm({ ...moveForm, description: e.target.value })}
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#fff',
                    padding: '8px 12px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* PHẦN QUẢN LÝ HÌNH ẢNH HITBOX (ADMIN) */}
              <div className="figma-detail-hitbox-admin-section">
                <span className="figma-detail-section-title">🖼️ Hình Ảnh Khung Va Chạm (Hitbox Frame)</span>
                
                <div className="figma-detail-move-grid-2">
                  <div className="figma-detail-edit-field">
                    <label htmlFor="move-input-hitbox-file">Tải tệp ảnh từ máy (.png, .jpg, .webp, .svg, .gif)</label>
                    <input
                      id="move-input-hitbox-file"
                      type="file"
                      accept="image/*"
                      onChange={handleHitboxFileChange}
                      className="figma-file-input"
                    />
                  </div>

                  <div className="figma-detail-edit-field">
                    <label htmlFor="move-input-hitbox-url">Hoặc nhập URL ảnh ngoài (nhiều ảnh, cách nhau bằng dấu phẩy)</label>
                    <input
                      id="move-input-hitbox-url"
                      type="text"
                      placeholder="https://...frame1.png, https://...frame2.png"
                      value={moveForm.hitbox_urls_text !== undefined ? moveForm.hitbox_urls_text : (moveForm.hitbox_url || '')}
                      onChange={(e) => {
                        const val = e.target.value;
                        const first = val.split(/[\n,]/)[0]?.trim() || '';
                        setMoveForm({ ...moveForm, hitbox_urls_text: val, hitbox_url: first });
                        if (!hitboxFile) {
                          setHitboxPreview(first);
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="figma-detail-edit-field">
                  <label htmlFor="move-input-hitbox-caption">Ghi chú khung va chạm (Caption)</label>
                  <input
                    id="move-input-hitbox-caption"
                    type="text"
                    placeholder="VD: Active Frame 5-7, Hitbox phủ vùng chân, Disjoint..."
                    value={moveForm.hitbox_caption}
                    onChange={(e) => setMoveForm({ ...moveForm, hitbox_caption: e.target.value })}
                  />
                </div>

                {/* Vùng xem trước ảnh (Preview) */}
                {hitboxPreview && (
                  <div className="figma-admin-hitbox-preview-wrap">
                    <span className="figma-preview-label">Xem trước ảnh Hitbox:</span>
                    <div className="figma-admin-hitbox-preview-box">
                      <img src={hitboxPreview} alt="Hitbox Preview" className="figma-admin-hitbox-preview-img" />
                      <button
                        type="button"
                        className="figma-btn-remove-preview"
                        onClick={handleClearHitboxImage}
                        title="Xóa ảnh này"
                      >
                        ✕ Xóa ảnh
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="figma-detail-modal-actions">
                <button type="button" className="btn-cancel-action" onClick={() => setIsMoveModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-save-action">
                  Lưu Đòn Đánh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HITBOX LIGHTBOX MODAL (SO LAI HITBOX PHÓNG TO SẮC NÉT) */}
      {activeHitboxModal && (
        <div className="figma-lightbox-overlay" onClick={() => setActiveHitboxModal(null)}>
          <div className="figma-lightbox-box" onClick={(e) => e.stopPropagation()}>
            <div className="figma-lightbox-header">
              <div className="figma-lightbox-title-group">
                <span className="figma-lightbox-badge">HITBOX VIEWER</span>
                <h3 className="figma-lightbox-title">{activeHitboxModal.name}</h3>
                {activeHitboxModal.version && (
                  <span className="figma-lightbox-version">({activeHitboxModal.version})</span>
                )}
              </div>
              <button
                type="button"
                className="figma-lightbox-close-btn"
                onClick={() => setActiveHitboxModal(null)}
                aria-label="Đóng"
                title="Đóng (Esc)"
              >
                ✕
              </button>
            </div>

            <div className="figma-lightbox-img-wrap">
              <img
                src={activeHitboxModal.url}
                alt={`Hitbox ${activeHitboxModal.name}`}
                className="figma-lightbox-img"
              />
            </div>

            {activeHitboxModal.caption && (
              <div className="figma-lightbox-footer">
                <span className="figma-lightbox-caption">💡 {activeHitboxModal.caption}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Nhập dữ liệu Frame Data từ Mizuumi Wiki */}
      <MizuumiImportModal
        isOpen={isImportModalOpen}
        character={character}
        existingMoves={moves}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={handleImportSuccess}
      />
    </main>
  );
}
