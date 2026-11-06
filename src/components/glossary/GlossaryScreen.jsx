import { useState, useEffect, useMemo } from 'react';
import { api } from '../../api/client';
import { INITIAL_GLOSSARY_TERMS } from '../../data/glossaryData';
import './GlossaryStyles.css';

export default function GlossaryScreen({
  level = 'basic', // 'basic' | 'advanced'
  isAuthenticated = false,
  onBackHome,
  onSwitchPage,
}) {
  const isAdvanced = level === 'advanced';
  const pageTitle = isAdvanced ? 'Advanced Glossary' : 'Basic Glossary';

  const [glossaries, setGlossaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTermId, setActiveTermId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form state cho Admin
  const [formData, setFormData] = useState({
    id: null,
    term: '',
    definition: '',
    level: level,
    video_url: '',
    image: null,
    image_preview: '',
  });

  // Tải danh sách thuật ngữ từ Database (hoặc fallback nếu chưa có)
  const fetchGlossaries = async () => {
    setIsLoading(true);
    try {
      const data = await api.getGlossaries();
      if (Array.isArray(data) && data.length > 0) {
        setGlossaries(data);
      } else {
        setGlossaries(INITIAL_GLOSSARY_TERMS);
      }
    } catch {
      setGlossaries(INITIAL_GLOSSARY_TERMS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGlossaries();
  }, []);

  // Reset form & active khi chuyển level
  useEffect(() => {
    setIsEditing(false);
    setIsCreating(false);
    setActiveTermId(null);
  }, [level]);

  // Lọc danh sách thuật ngữ theo trang hiện tại và từ khóa tìm kiếm
  const filteredTerms = useMemo(() => {
    const list = glossaries.filter((g) => {
      const itemLevel = (g.level || 'basic').toLowerCase();
      if (isAdvanced) {
        return itemLevel === 'advanced' || itemLevel === 'advance';
      }
      return itemLevel === 'basic';
    });

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (g) =>
        (g.term && g.term.toLowerCase().includes(q)) ||
        (g.definition && g.definition.toLowerCase().includes(q))
    );
  }, [glossaries, isAdvanced, searchQuery]);

  // Thuật ngữ đang được chọn
  const activeTerm = useMemo(() => {
    if (activeTermId) {
      const found = filteredTerms.find((t) => t.id === activeTermId);
      if (found) return found;
    }
    return filteredTerms[0] || null;
  }, [filteredTerms, activeTermId]);

  // Đổi mục chọn
  const handleSelectTerm = (term) => {
    setActiveTermId(term.id);
    setIsEditing(false);
    setIsCreating(false);
  };

  // Mở form chỉnh sửa (Admin)
  const handleStartEdit = () => {
    if (!activeTerm) return;
    setFormData({
      id: activeTerm.id,
      term: activeTerm.term || '',
      definition: activeTerm.definition || '',
      level: activeTerm.level || level,
      video_url: activeTerm.video_url || '',
      image: null,
      image_preview: activeTerm.image_url || '',
    });
    setIsEditing(true);
    setIsCreating(false);
  };

  // Mở form tạo mới (Admin)
  const handleStartCreate = () => {
    setFormData({
      id: null,
      term: '',
      definition: '',
      level: level, // Khóa cố định theo trang hiện tại
      video_url: '',
      image: null,
      image_preview: '',
    });
    setIsCreating(true);
    setIsEditing(false);
  };

  // Lưu thuật ngữ (Tạo mới hoặc Cập nhật)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.term.trim() || !formData.definition.trim()) {
      alert('Vui lòng điền đầy đủ Thuật ngữ và Định nghĩa!');
      return;
    }

    try {
      const form = new FormData();
      form.append('term', formData.term);
      form.append('definition', formData.definition);
      form.append('level', level); // Luôn lưu đúng level của trang hiện tại
      // Luôn gửi video_url (kể cả rỗng) để server xóa được video cũ khi admin xóa trống ô này
      form.append('video_url', formData.video_url.trim());
      if (formData.image) form.append('image', formData.image);

      if (isCreating) {
        await api.createGlossary(form);
      } else if (isEditing && formData.id) {
        await api.updateGlossary(formData.id, form);
      }

      await fetchGlossaries();
      setIsEditing(false);
      setIsCreating(false);
    } catch (err) {
      alert('Lỗi khi lưu thuật ngữ: ' + (err.message || 'Vui lòng thử lại'));
    }
  };

  // Xóa thuật ngữ (Admin)
  const handleDeleteTerm = async () => {
    if (!activeTerm) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa thuật ngữ "${activeTerm.term}"?`)) return;

    try {
      await api.deleteGlossary(activeTerm.id);
      await fetchGlossaries();
      setActiveTermId(null);
    } catch (err) {
      alert('Lỗi khi xóa thuật ngữ: ' + (err.message || 'Vui lòng thử lại'));
    }
  };

  const handleCancelForm = () => {
    setIsEditing(false);
    setIsCreating(false);
  };

  return (
    <main className="figma-glossary-screen" aria-label={`Màn hình ${pageTitle}`}>
      {/* Nút Back quay lại trang danh mục Glossary */}
      <button
        type="button"
        className="figma-glossary-back-btn"
        onClick={() => {
          if (onBackHome) onBackHome();
        }}
        aria-label="Quay lại danh mục Glossary"
        title="Quay lại danh mục Glossary"
      >
        <span aria-hidden="true">&larr;</span>
        <span>Back</span>
      </button>

      {/* Khung tổng thể kính mờ */}
      <section className="figma-glossary-container">
        {/* CỘT TRÁI: DANH SÁCH THUẬT NGỮ */}
        <aside className="figma-glossary-sidebar" aria-label={`Danh sách ${pageTitle}`}>
          <div className="figma-glossary-sidebar-header">
            <h2 className="figma-glossary-sidebar-title">
              <span>{pageTitle}</span>
            </h2>

            {/* Nút thêm mới dành cho Admin */}
            {isAuthenticated && (
              <button
                type="button"
                className="figma-glossary-add-btn"
                onClick={handleStartCreate}
                title={`Thêm thuật ngữ ${isAdvanced ? 'nâng cao' : 'cơ bản'} mới`}
              >
                + Thêm
              </button>
            )}
          </div>

          {/* Nút chuyển đổi nhanh giữa 2 trang Basic và Advanced */}
          {onSwitchPage && (
            <button
              type="button"
              className="figma-glossary-switch-page-btn"
              onClick={onSwitchPage}
              title={`Chuyển sang trang ${isAdvanced ? 'Cơ bản (Basic)' : 'Nâng cao (Advanced)'}`}
            >
              <span>{isAdvanced ? '⬅ Sang trang Cơ Bản (Basic)' : 'Sang trang Nâng Cao (Advanced) ➡'}</span>
            </button>
          )}

          {/* Thanh tìm kiếm trực tiếp */}
          <div className="figma-glossary-search-wrap">
            <input
              type="text"
              className="figma-glossary-search-input"
              placeholder={`Tìm kiếm trong ${pageTitle}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Tìm kiếm thuật ngữ"
            />
            {searchQuery && (
              <button
                type="button"
                className="figma-glossary-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Xóa tìm kiếm"
              >
                &times;
              </button>
            )}
          </div>

          {/* Danh sách cuộn các thuật ngữ */}
          <div className="figma-glossary-list" role="list">
            {isLoading ? (
              <div className="figma-glossary-empty">Đang tải thuật ngữ...</div>
            ) : filteredTerms.length === 0 ? (
              <div className="figma-glossary-empty">
                {searchQuery ? 'Không tìm thấy thuật ngữ phù hợp' : 'Chưa có thuật ngữ nào ở mục này'}
              </div>
            ) : (
              filteredTerms.map((term) => {
                const isSelected = activeTerm?.id === term.id;
                return (
                  <button
                    key={term.id}
                    type="button"
                    role="listitem"
                    className={`figma-glossary-card ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelectTerm(term)}
                  >
                    <div className="figma-glossary-card-header">
                      <span className="figma-glossary-card-title">{term.term}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* CỘT PHẢI: CHI TIẾT THUẬT NGỮ HOẶC FORM CRUD */}
        <section className="figma-glossary-content-panel" aria-label="Chi tiết thuật ngữ">
          {isEditing || isCreating ? (
            /* Form thêm / sửa thuật ngữ cho Admin */
            <form className="figma-glossary-form" onSubmit={handleSubmitForm}>
              <h2 className="figma-glossary-form-title">
                {isCreating ? `Thêm thuật ngữ ${pageTitle}` : `Chỉnh sửa: ${formData.term}`}
              </h2>

              <div className="figma-glossary-form-grid">
                <div className="figma-glossary-field">
                  <label className="figma-glossary-label" htmlFor="glossary-term-input">
                    Tên thuật ngữ (*)
                  </label>
                  <input
                    id="glossary-term-input"
                    type="text"
                    className="figma-glossary-input"
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    placeholder="VD: Startup, Blockstun, Okizeme..."
                    required
                  />
                </div>

                <div className="figma-glossary-field">
                  <label className="figma-glossary-label" htmlFor="glossary-level-fixed">
                    Phân loại trang
                  </label>
                  <input
                    id="glossary-level-fixed"
                    type="text"
                    className="figma-glossary-input"
                    value={isAdvanced ? 'Nâng cao (Advanced Glossary)' : 'Cơ bản (Basic Glossary)'}
                    disabled
                    readOnly
                    style={{ opacity: 0.85, cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              <div className="figma-glossary-form-grid">
                <div className="figma-glossary-field">
                  <label className="figma-glossary-label" htmlFor="glossary-video-input">
                    Video URL minh họa (Không bắt buộc)
                  </label>
                  <input
                    id="glossary-video-input"
                    type="url"
                    className="figma-glossary-input"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <div className="figma-glossary-field">
                  <label className="figma-glossary-label" htmlFor="glossary-image-file">
                    Hình ảnh minh họa
                  </label>
                  <input
                    id="glossary-image-file"
                    type="file"
                    accept="image/*"
                    className="figma-glossary-file-input"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData({
                          ...formData,
                          image: file,
                          image_preview: URL.createObjectURL(file),
                        });
                      }
                    }}
                  />
                </div>
              </div>

              <div className="figma-glossary-field" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label className="figma-glossary-label" htmlFor="glossary-def-textarea">
                  Định nghĩa &amp; Hướng dẫn chi tiết (*)
                </label>
                <textarea
                  id="glossary-def-textarea"
                  className="figma-glossary-textarea"
                  value={formData.definition}
                  onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
                  placeholder="Nhập định nghĩa, cách áp dụng trong game, lưu ý khi thi đấu..."
                  rows={10}
                  required
                />
              </div>

              <div className="figma-glossary-form-actions">
                <button type="button" className="figma-glossary-btn-cancel" onClick={handleCancelForm}>
                  Hủy
                </button>
                <button type="submit" className="figma-glossary-btn-save">
                  {isCreating ? 'Đăng' : 'Lưu'}
                </button>
              </div>
            </form>
          ) : (
            /* Chế độ xem chi tiết thuật ngữ */
            activeTerm && (
              <>
                <header className="figma-glossary-article-header">
                  <div className="figma-glossary-article-title-wrap">
                    <h1 className="figma-glossary-article-title">{activeTerm.term}</h1>
                  </div>

                  {/* Thanh công cụ Admin */}
                  {isAuthenticated && (
                    <div className="figma-glossary-admin-actions">
                      <button
                        type="button"
                        className="figma-glossary-btn-edit"
                        onClick={handleStartEdit}
                        title="Chỉnh sửa thuật ngữ"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="figma-glossary-btn-delete"
                        onClick={handleDeleteTerm}
                        title="Xóa thuật ngữ"
                      >
                        Xóa
                      </button>
                    </div>
                  )}
                </header>

                <div className="figma-glossary-body-scroll">
                  <p className="figma-glossary-body-text">{activeTerm.definition}</p>

                  {/* Video URL minh họa */}
                  {activeTerm.video_url && (
                    <div className="figma-glossary-media-box">
                      <h3 className="figma-glossary-media-title">Video minh họa:</h3>
                      <a
                        href={activeTerm.video_url}
                        target="_blank"
                        rel="noreferrer"
                        className="figma-glossary-video-link"
                      >
                        <span>&bull; Mở liên kết video hướng dẫn</span>
                      </a>
                    </div>
                  )}

                  {/* Hình ảnh minh họa */}
                  {activeTerm.image_url && (
                    <div className="figma-glossary-media-box">
                      <h3 className="figma-glossary-media-title">Hình ảnh minh họa:</h3>
                      <img
                        src={activeTerm.image_url}
                        alt={activeTerm.term}
                        className="figma-glossary-img-preview"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
              </>
            )
          )}
        </section>
      </section>
    </main>
  );
}
