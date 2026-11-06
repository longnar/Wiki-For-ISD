import { useState, useMemo, useEffect } from 'react';
import { characterApi } from '../../api/character.api';
import brandIcon from '../../assets/branding/IdolShowdownIcon.png';
import selectionFrame from '../../assets/decorative/selection-frame.svg';
import selectionPolygon from '../../assets/decorative/selection-polygon.svg';
import { getCharacterArt, getCharacterTpArt, preloadCharacterAssets } from '../../utils/characterAssets';
import { CHARACTER_SELECT_BUTTONS, FIGMA_BUTTON_CLUSTER } from '../../utils/characterButtons';
import CharacterDetailView from './CharacterDetailView';

// Thông tin mặc định cho 13 nhân vật chuẩn bị sẵn trường hợp database chưa có đủ
const DEFAULT_CHARACTERS_INFO = {
  fubuki: {
    id: 1,
    name: 'Shirakami Fubuki',
    type: 'Rushdown / Shoto',
    difficulty: 2,
    debut_date: '2018-06-01',
    description: 'Cáo tuyết tốc độ cao với các cú đá xoay, phi tiêu băng và khả năng combo trên không mượt mà.'
  },
  korone: {
    id: 2,
    name: 'Inugami Korone',
    type: 'Brawler / Pressure',
    difficulty: 3,
    debut_date: '2019-04-13',
    description: 'Chú chó võ sĩ với chuỗi đòn đấm liên hoàn uy lực và khả năng áp sát dồn ép đối thủ.'
  },
  sora: {
    id: 3,
    name: 'Tokino Sora',
    type: 'Balanced / Shoto',
    difficulty: 1,
    debut_date: '2017-09-07',
    description: 'Đại tiền bối Hololive với bộ kỹ năng công thủ toàn diện, lý tưởng cho người mới bắt đầu.'
  },
  ayame: {
    id: 4,
    name: 'Nakiri Ayame',
    type: 'Rushdown / Duelist',
    difficulty: 2,
    debut_date: '2018-09-03',
    description: 'Quỷ Oni song kiếm với những pha lướt chém thần tốc, công kích dồn dập khiến đối thủ choáng ngợp.'
  },
  suisei: {
    id: 5,
    name: 'Hoshimachi Suisei',
    type: 'Mixup / Duelist',
    difficulty: 4,
    debut_date: '2018-03-22',
    description: 'Idol sát thủ trang bị búa rìu sao băng, sở hữu những chuỗi combo biến hóa và đòn trừng phạt chí mạng.'
  },
  coco: {
    id: 6,
    name: 'Kiryu Coco',
    type: 'Grappler / Power',
    difficulty: 4,
    debut_date: '2019-12-28',
    description: 'Chủ tịch Rồng huyền thoại với các đòn vật uy lực khổng lồ và áp lực tầm gần đáng sợ.'
  },
  botan: {
    id: 7,
    name: 'Shishiro Botan',
    type: 'Zoner / Tactical',
    difficulty: 3,
    debut_date: '2020-08-14',
    description: 'Sư tử bắn tỉa thiện chiến áp đảo đối phương bằng súng trường, lựu đạn và chiến thuật cự ly xa.'
  },
  aki: {
    id: 8,
    name: 'Aki Rosenthal',
    type: 'Stance / Magic',
    difficulty: 4,
    debut_date: '2018-06-01',
    description: 'Thiếu nữ Siren uyển chuyển với vũ điệu thôi miên và phép thuật điều khiển bím tóc ma thuật.'
  },
  pekora: {
    id: 9,
    name: 'Usada Pekora',
    type: 'Trapper / Gimmick',
    difficulty: 4,
    debut_date: '2019-07-17',
    description: 'Thỏ điên mang theo kho vũ khí rocket và bẫy thuốc nổ TNT tạo nên thế trận bất ngờ.'
  },
  ina: {
    id: 10,
    name: "Ninomae Ina'nis",
    type: 'Zoner / Spacing',
    difficulty: 3,
    debut_date: '2020-09-13',
    description: 'Tư tế Cthulhu triệu hồi các xúc tu cổ đại để kiểm soát không gian võ đài từ xa.'
  },
  ollie: {
    id: 11,
    name: 'Kureiji Ollie',
    type: 'Rushdown / Berserker',
    difficulty: 3,
    debut_date: '2020-12-04',
    description: 'Nữ thần zombie siêu tốc với lối đánh cuồng loạn khó đoán và khả năng truy đuổi liên tục.'
  },
  koyori: {
    id: 12,
    name: 'Hakui Koyori',
    type: 'Zoner / Chemist',
    difficulty: 3,
    debut_date: '2021-11-28',
    description: 'Nhà nghiên cứu chó sói thông minh tạo hỗn loạn bằng các bình độc dược và vụ nổ hoá học.'
  },
  biboo: {
    id: 13,
    name: 'Koseki Bijou (Biboo)',
    type: 'Heavy / Counter',
    difficulty: 3,
    debut_date: '2023-07-30',
    description: 'Viên ngọc kiên cố với sức chống chịu phi thường cùng các đòn giáng đá sấm sét nặng trịch.'
  }
};

export default function CharacterSelectGrid({
  characters = [],
  selectedCharacter,
  onSelectCharacter,
  onOpenDetails,
  onAddNewCharacter,
  onCharacterUpdated,
  isAuthenticated,
  onBackHome
}) {
  // viewMode: 'diamond' (Màn hình chọn nhân vật Figma node 782:887) | 'showcase' (Màn hình chi tiết tướng Figma node 112:109)
  const [viewMode, setViewMode] = useState('diamond');
  const [hoveredButtonKey, setHoveredButtonKey] = useState(null);
  const [activeChar, setActiveChar] = useState(null);

  // Quản lý danh sách nhân vật có state nội bộ để cập nhật tức thì ngay sau khi lưu
  const [charList, setCharList] = useState(characters);

  useEffect(() => {
    if (Array.isArray(characters) && characters.length > 0) {
      setCharList(characters);
    }
  }, [characters]);

  useEffect(() => {
    preloadCharacterAssets();
  }, []);

  // Ánh xạ key nút bấm với ID chuẩn trong Database
  const KEY_TO_ID_MAP = {
    fubuki: 1,
    korone: 2,
    sora: 3,
    ayame: 4,
    suisei: 5,
    coco: 6,
    botan: 7,
    aki: 8,
    pekora: 9,
    ina: 10,
    ollie: 11,
    koyori: 12,
    biboo: 13
  };

  // State chỉnh sửa thông tin nhân vật (Admin) ở màn hình Showcase
  const [isEditingChar, setIsEditingChar] = useState(false);
  const [charForm, setCharForm] = useState({
    name: '',
    type: '',
    difficulty: 3,
    debut_date: '',
    description: '',
  });
  const [isSavingChar, setIsSavingChar] = useState(false);

  // Tìm kiếm thông tin character tương ứng từ danh sách prop characters (DB) hoặc fallback
  const resolveCharacter = (btnConfig) => {
    if (!btnConfig) return null;
    const targetId = KEY_TO_ID_MAP[btnConfig.key];
    const sourceList = charList.length > 0 ? charList : characters;

    // 1. Khớp ưu tiên theo ID chuẩn
    if (targetId) {
      const byId = sourceList.find((c) => Number(c.id) === targetId);
      if (byId) return byId;
    }

    // 2. Khớp phụ theo tên hoặc shortName
    const fromProps = sourceList.find(
      (c) =>
        (btnConfig.shortName && c.name?.toLowerCase().includes(btnConfig.shortName.toLowerCase())) ||
        (btnConfig.name && btnConfig.name.toLowerCase().includes(c.name?.toLowerCase()))
    );
    if (fromProps) return fromProps;

    return DEFAULT_CHARACTERS_INFO[btnConfig.key] || {
      id: targetId || btnConfig.key,
      name: btnConfig.name,
      type: 'Fighter',
      difficulty: 3,
      description: 'Nhân vật võ đài Idol Showdown'
    };
  };

  const currentChar = activeChar || selectedCharacter || resolveCharacter(CHARACTER_SELECT_BUTTONS[8]); // Default Fubuki
  const currentArt = currentChar ? (getCharacterTpArt(currentChar.name) || getCharacterArt(currentChar.name)) : null;

  const handleSlotClick = (btnConfig) => {
    const char = resolveCharacter(btnConfig);
    setActiveChar(char);
    if (onSelectCharacter) onSelectCharacter(char);
    setViewMode('showcase');
  };

  const handleSlotMouseEnter = (btnConfig) => {
    setHoveredButtonKey(btnConfig.key);
  };

  const handleSlotMouseLeave = () => {
    setHoveredButtonKey(null);
  };

  // Mở modal sửa thông tin nhân vật (Admin)
  const handleOpenEditChar = () => {
    if (!currentChar) return;
    setCharForm({
      name: currentChar.name || '',
      type: currentChar.type || 'Fighter',
      difficulty: currentChar.difficulty ?? 3,
      debut_date: currentChar.debut_date ? currentChar.debut_date.slice(0, 10) : '',
      description: currentChar.description || '',
    });
    setIsEditingChar(true);
  };

  // Lưu thông tin nhân vật đã sửa (Admin)
  const handleSaveChar = async (e) => {
    e.preventDefault();
    setIsSavingChar(true);
    try {
      const form = new FormData();
      Object.entries(charForm).forEach(([key, val]) => {
        if (val !== undefined && val !== null) form.append(key, val);
      });

      let updated = null;
      if (currentChar?.id && typeof currentChar.id === 'number') {
        const res = await characterApi.update(currentChar.id, form);
        updated = res.character || { ...currentChar, ...charForm };
      } else {
        updated = { ...currentChar, ...charForm };
      }

      // Cập nhật ngay vào activeChar và danh sách cục bộ charList
      setActiveChar(updated);
      setCharList((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      if (onSelectCharacter) onSelectCharacter(updated);
      if (onCharacterUpdated) onCharacterUpdated();
      setIsEditingChar(false);
    } catch (err) {
      alert('Không thể lưu thông tin nhân vật: ' + err.message);
    } finally {
      setIsSavingChar(false);
    }
  };

  // Nếu đang ở chế độ xem chi tiết Frame Data toàn cảnh (Phương án A)
  if (viewMode === 'detail') {
    return (
      <CharacterDetailView
        character={currentChar}
        isAuthenticated={isAuthenticated}
        onBack={() => setViewMode('showcase')}
        onCharacterUpdated={(updatedChar) => {
          if (updatedChar) {
            setActiveChar(updatedChar);
            setCharList((prev) => prev.map((c) => (c.id === updatedChar.id ? updatedChar : c)));
            if (onSelectCharacter) onSelectCharacter(updatedChar);
          }
          if (onCharacterUpdated) onCharacterUpdated();
        }}
      />
    );
  }

  return (
    <main className="figma-selection-screen" aria-label="Màn hình chọn nhân vật Idol Showdown">
      {viewMode === 'diamond' ? (
        /* =========================================================
           FIGMA NODE 782:887: SELECTION SCREEN
           ========================================================= */
        <div className="figma-selection-stage">
          {/* Vùng chứa thiết kế chuẩn Figma (814.18px x 960.18px) */}
          <div className="figma-selection-box">
            {/* Hình thoi nền mờ khổng lồ trung tâm (Node 782:890: 814.18 x 814.18px xoay 45 độ, r: 25px) */}
            <div className="figma-central-diamond" aria-hidden="true" />

            {/* Logo Idol Showdown đỉnh trên (Node 782:891) - Click để về trang chủ */}
            <button
              type="button"
              className="figma-selection-logo-btn"
              onClick={onBackHome}
              aria-label="Quay lại trang chính"
              title="Quay lại Trang Chủ Idol Showdown"
            >
              <img src={brandIcon} alt="Idol Showdown" className="figma-selection-logo-img" />
            </button>

            {/* Cụm 13 nút bấm nhân vật (Node 782:892: Group 'Hovering Button' 528 x 597px) */}
            <div className="figma-button-cluster" aria-label="Lưới chọn nhân vật">
              {CHARACTER_SELECT_BUTTONS.map((btn) => {
                const isHovered = hoveredButtonKey === btn.key;
                // Tính toạ độ phần trăm chính xác theo kích thước cụm 528.06 x 597.05px
                const leftPercent = (btn.x / FIGMA_BUTTON_CLUSTER.width) * 100;
                const topPercent = (btn.y / FIGMA_BUTTON_CLUSTER.height) * 100;
                const widthPercent = (FIGMA_BUTTON_CLUSTER.buttonWidth / FIGMA_BUTTON_CLUSTER.width) * 100;

                return (
                  <button
                    type="button"
                    key={btn.key}
                    id={`btn-char-${btn.key}`}
                    className={`figma-char-slot ${isHovered ? 'is-hovered' : ''}`}
                    style={{
                      left: `${leftPercent}%`,
                      top: `${topPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                    onClick={() => handleSlotClick(btn)}
                    onMouseEnter={() => handleSlotMouseEnter(btn)}
                    onMouseLeave={handleSlotMouseLeave}
                    onFocus={() => handleSlotMouseEnter(btn)}
                    onBlur={handleSlotMouseLeave}
                    aria-label={`Chọn nhân vật ${btn.name}`}
                    title={btn.name}
                  >
                    {/* Ảnh nút: Trạng thái Default & Hover với viền stroke 5px sắc nét từ asset */}
                    <img
                      src={isHovered ? btn.hoverImg : btn.defaultImg}
                      alt={btn.name}
                      className="figma-char-slot-img"
                      loading="eager"
                      draggable={false}
                    />
                  </button>
                );
              })}
            </div>

            {/* Nút Admin Thêm nhân vật (+) ở góc phải (Figma Node 672:891) */}
            {isAuthenticated && (
              <button
                type="button"
                className="figma-admin-add-btn"
                onClick={onAddNewCharacter}
                aria-label="Thêm nhân vật mới"
                title="Thêm Slot Nhân Vật Mới (Admin)"
              >
                +
              </button>
            )}
          </div>
        </div>
      ) : (
        /* =========================================================
           FIGMA NODE 112:109: CHARACTER SCREEN (e.g. Fubuki Screen)
           ========================================================= */
        <div className="figma-showcase-screen">
          {/* Nút quay lại màn hình chọn tướng */}
          <button
            type="button"
            className="figma-showcase-back-btn"
            onClick={() => setViewMode('diamond')}
            aria-label="Quay lại màn hình chọn tướng"
            title="Quay lại lưới chọn tướng"
          >
            ← Back
          </button>

          {/* Bố cục Showcase chi tiết */}
          <div className="figma-showcase-layout">
            {/* Khung bên trái: Thông tin cơ bản (Figma Node 112:111) */}
            <section className="figma-showcase-info-card">
              <div className="figma-showcase-decor" aria-hidden="true">
                <img className="figma-showcase-frame" src={selectionFrame} alt="" />
                <img className="figma-showcase-polygon" src={selectionPolygon} alt="" />
              </div>

              <div className="figma-showcase-text-content">
                <div className="figma-showcase-header-row">
                  <h2 className="figma-showcase-title">Thông tin cơ bản:</h2>
                  {isAuthenticated && (
                    <button
                      type="button"
                      className="figma-showcase-edit-btn"
                      onClick={handleOpenEditChar}
                      title="Sửa thông tin nhân vật (Admin)"
                    >
                      ✎ Sửa thông tin
                    </button>
                  )}
                </div>
                <h3 className="figma-showcase-char-name">{currentChar?.name}</h3>

                <div className="figma-showcase-props">
                  <p>
                    <strong>Ngày debut :</strong>{' '}
                    {currentChar?.debut_date
                      ? new Date(currentChar.debut_date).toLocaleDateString('vi-VN')
                      : '05/05/2023'}
                  </p>
                  <p>
                    <strong>Mô tả :</strong>{' '}
                    {currentChar?.description || 'Bậc thầy chiến đấu của Hololive!'}
                  </p>
                  <p>
                    <strong>Phân loại :</strong> {currentChar?.type || 'well-rounded (shoto)'}
                  </p>
                  <p className="figma-showcase-difficulty">
                    <strong>Độ khó :</strong>{' '}
                    {'★'.repeat(currentChar?.difficulty || 1)}
                    {'☆'.repeat(Math.max(0, 5 - (currentChar?.difficulty || 1)))}
                  </p>
                </div>

                {/* Nút Chi Tiết mở Màn hình Frame Data toàn cảnh (Phương án A) */}
                <button
                  type="button"
                  className="figma-more-info-btn"
                  onClick={() => setViewMode('detail')}
                  aria-label="Xem chi tiết Frame Data"
                >
                  Chi Tiết
                </button>
              </div>
            </section>

            {/* Khung giữa: Tranh vẽ nhân vật kích thước lớn (Figma Node 122:13) */}
            <div className="figma-showcase-art-panel">
              {currentArt ? (
                <img
                  src={currentArt}
                  alt={currentChar?.name}
                  className="figma-showcase-big-art"
                  loading="eager"
                  decoding="async"
                />
              ) : (
                <div className="figma-showcase-art-placeholder">{currentChar?.name}</div>
              )}
            </div>

            {/* Khung bên phải: Danh sách chuyển nhanh giữa các nhân vật */}
            <aside className="figma-showcase-sidebar-roster" aria-label="Danh sách nhân vật khác">
              {CHARACTER_SELECT_BUTTONS.map((btn) => {
                const char = resolveCharacter(btn);
                const isCur = currentChar && currentChar.name === char.name;
                return (
                  <button
                    type="button"
                    key={btn.key}
                    className={`figma-mini-slot ${isCur ? 'active' : ''}`}
                    onClick={() => {
                      setActiveChar(char);
                      if (onSelectCharacter) onSelectCharacter(char);
                    }}
                    title={btn.name}
                  >
                    <img src={btn.defaultImg} alt={btn.name} />
                  </button>
                );
              })}
            </aside>
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa thông tin nhân vật (Admin) */}
      {isEditingChar && (
        <div className="figma-char-edit-backdrop" onClick={() => setIsEditingChar(false)}>
          <div className="figma-char-edit-card" onClick={(e) => e.stopPropagation()}>
            <div className="figma-char-edit-header">
              <h3>Sửa thông tin: {currentChar?.name}</h3>
              <button
                type="button"
                className="figma-char-edit-close-btn"
                onClick={() => setIsEditingChar(false)}
                title="Đóng"
              >
                ✕
              </button>
            </div>

            <form className="figma-char-edit-form" onSubmit={handleSaveChar}>
              <div className="figma-char-edit-field">
                <label htmlFor="edit-char-name">Tên nhân vật:</label>
                <input
                  id="edit-char-name"
                  type="text"
                  value={charForm.name}
                  onChange={(e) => setCharForm({ ...charForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="figma-char-edit-field">
                <label htmlFor="edit-char-type">Phong cách / Phân loại (Style):</label>
                <input
                  id="edit-char-type"
                  type="text"
                  value={charForm.type}
                  onChange={(e) => setCharForm({ ...charForm, type: e.target.value })}
                  placeholder="ví dụ: Zoner / Chemist, Rushdown / Shoto..."
                  required
                />
                <div className="figma-char-edit-presets">
                  <span>Gợi ý:</span>
                  {['Zoner', 'Rushdown', 'Grappler', 'Shoto', 'Balanced', 'Mixup', 'Trapper', 'Duelist'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      className="preset-tag-btn"
                      onClick={() => setCharForm({ ...charForm, type: p })}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="figma-char-edit-row">
                <div className="figma-char-edit-field">
                  <label htmlFor="edit-char-difficulty">Độ khó (1 - 5):</label>
                  <select
                    id="edit-char-difficulty"
                    value={charForm.difficulty}
                    onChange={(e) => setCharForm({ ...charForm, difficulty: Number(e.target.value) })}
                  >
                    <option value={1}>★☆☆☆☆ (1/5 - Dễ / Căn bản)</option>
                    <option value={2}>★★☆☆☆ (2/5 - Khá dễ)</option>
                    <option value={3}>★★★☆☆ (3/5 - Trung bình)</option>
                    <option value={4}>★★★★☆ (4/5 - Khó)</option>
                    <option value={5}>★★★★★ (5/5 - Rất khó / Chuyên sâu)</option>
                  </select>
                </div>

                <div className="figma-char-edit-field">
                  <label htmlFor="edit-char-debut">Ngày Debut:</label>
                  <input
                    id="edit-char-debut"
                    type="date"
                    value={charForm.debut_date}
                    onChange={(e) => setCharForm({ ...charForm, debut_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="figma-char-edit-field">
                <label htmlFor="edit-char-description">Mô tả nhân vật:</label>
                <textarea
                  id="edit-char-description"
                  rows={3}
                  value={charForm.description}
                  onChange={(e) => setCharForm({ ...charForm, description: e.target.value })}
                  placeholder="Mô tả phong cách, nét đặc trưng chiến đấu..."
                />
              </div>

              <div className="figma-char-edit-actions">
                <button type="submit" className="figma-btn-save-char" disabled={isSavingChar}>
                  {isSavingChar ? 'Đang lưu...' : 'Lưu thông tin'}
                </button>
                <button
                  type="button"
                  className="figma-btn-cancel-char"
                  onClick={() => setIsEditingChar(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
