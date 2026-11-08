import { useState, useEffect, useMemo } from 'react';
import { api } from '../../api/client';
import { INITIAL_GLOSSARY_TERMS } from '../../data/glossaryData';
import { parseDefinitionWithLinks } from './glossaryParser';
import './GlossaryStyles.css';

function getYouTubeEmbedUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null;
}

function isDirectVideoUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return /\.(mp4|webm|ogg)($|\?)/i.test(url);
}

export default function GlossaryScreen({
  level = 'basic', // 'basic' | 'advanced'
  isAuthenticated = false,
  initialTermId = null,
  onBackHome,
  onSwitchPage,
}) {
  const isAdvanced = level === 'advanced';
  const pageTitle = isAdvanced ? 'Advanced Glossary' : 'Basic Glossary';

  const [glossaries, setGlossaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTermId, setActiveTermId] = useState(initialTermId);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedParentIds, setExpandedParentIds] = useState(new Set());

  // Form state cho Admin
  const [formData, setFormData] = useState({
    id: null,
    term: '',
    definition: '',
    level: level,
    parent_id: null,
    video_url: '',
    image: null,
    image_preview: '',
    remove_image: false,
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

  // Cập nhật khi initialTermId từ ngoài truyền vào
  useEffect(() => {
    if (initialTermId) {
      setActiveTermId(initialTermId);
      // Tìm xem term này có parent không để tự động mở accordion
      const found = glossaries.find((g) => g.id === initialTermId);
      if (found && found.parent_id) {
        setExpandedParentIds((prev) => new Set([...prev, found.parent_id]));
      }
    }
  }, [initialTermId, glossaries]);

  // Reset form & active khi chuyển level
  useEffect(() => {
    setIsEditing(false);
    setIsCreating(false);
    if (!initialTermId) {
      setActiveTermId(null);
    }
  }, [level]);

  // Lọc danh sách thuật ngữ theo trang hiện tại và từ khóa tìm kiếm
  const currentLevelTerms = useMemo(() => {
    return glossaries.filter((g) => {
      const itemLevel = (g.level || 'basic').toLowerCase();
      if (isAdvanced) {
        return itemLevel === 'advanced' || itemLevel === 'advance';
      }
      return itemLevel === 'basic';
    });
  }, [glossaries, isAdvanced]);

  // Cấu trúc phân cấp cha - con (Smart Accordion)
  const { rootTerms, childrenMap } = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const childrenMap = new Map();
    const termMap = new Map();

    for (const term of currentLevelTerms) {
      termMap.set(term.id, term);
    }

    // Nhóm các con theo parent_id
    for (const term of currentLevelTerms) {
      if (term.parent_id && termMap.has(term.parent_id)) {
        if (!childrenMap.has(term.parent_id)) {
          childrenMap.set(term.parent_id, []);
        }
        childrenMap.get(term.parent_id).push(term);
      }
    }

    // Lọc danh sách gốc (Root terms)
    let roots = currentLevelTerms.filter((term) => !term.parent_id || !termMap.has(term.parent_id));

    // Nếu có tìm kiếm: lọc các root khớp tìm kiếm HOẶC có con khớp tìm kiếm
    if (q) {
      roots = roots.filter((r) => {
        const rootMatch =
          (r.term && r.term.toLowerCase().includes(q)) ||
          (r.definition && r.definition.toLowerCase().includes(q));
        const children = childrenMap.get(r.id) || [];
        const hasChildMatch = children.some(
          (c) =>
            (c.term && c.term.toLowerCase().includes(q)) ||
            (c.definition && c.definition.toLowerCase().includes(q))
        );
        return rootMatch || hasChildMatch;
      });
    }

    return { rootTerms: roots, childrenMap };
  }, [currentLevelTerms, searchQuery]);

  // Tự động mở rộng accordion khi có từ khóa tìm kiếm
  useEffect(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const newExpanded = new Set();
      for (const [parentId, children] of childrenMap.entries()) {
        const hasMatch = children.some(
          (c) =>
            (c.term && c.term.toLowerCase().includes(q)) ||
            (c.definition && c.definition.toLowerCase().includes(q))
        );
        if (hasMatch) {
          newExpanded.add(parentId);
        }
      }
      if (newExpanded.size > 0) {
        setExpandedParentIds((prev) => new Set([...prev, ...newExpanded]));
      }
    }
  }, [searchQuery, childrenMap]);

  // Thuật ngữ đang được chọn
  const activeTerm = useMemo(() => {
    if (activeTermId) {
      const found = currentLevelTerms.find((t) => t.id === activeTermId);
      if (found) return found;
    }
    // Mặc định chọn root đầu tiên
    return rootTerms[0] || currentLevelTerms[0] || null;
  }, [currentLevelTerms, rootTerms, activeTermId]);

  // Thuật ngữ cha của activeTerm (nếu activeTerm là con)
  const activeParentTerm = useMemo(() => {
    if (!activeTerm || !activeTerm.parent_id) return null;
    return glossaries.find((g) => g.id === activeTerm.parent_id) || null;
  }, [activeTerm, glossaries]);

  // Danh sách các con của activeTerm (nếu activeTerm là cha)
  const activeTermChildren = useMemo(() => {
    if (!activeTerm) return [];
    return glossaries.filter((g) => g.parent_id === activeTerm.id);
  }, [activeTerm, glossaries]);

  // Danh sách ứng viên có thể làm cha trong Form
  const potentialParents = useMemo(() => {
    return glossaries.filter((g) => {
      if (formData.id && g.id === formData.id) return false;
      // Không cho chọn một thuật ngữ con của chính nó làm cha
      if (formData.id && g.parent_id === formData.id) return false;
      return true;
    });
  }, [glossaries, formData.id]);

  // Đổi mục chọn
  const handleSelectTerm = (term) => {
    setActiveTermId(term.id);
    setIsEditing(false);
    setIsCreating(false);

    // Nếu chọn con, tự động mở cha
    if (term.parent_id) {
      setExpandedParentIds((prev) => new Set([...prev, term.parent_id]));
    }
  };

  // Toggle mở / đóng accordion
  const handleToggleAccordion = (parentId, e) => {
    if (e) e.stopPropagation();
    setExpandedParentIds((prev) => {
      const next = new Set(prev);
      if (next.has(parentId)) {
        next.delete(parentId);
      } else {
        next.add(parentId);
      }
      return next;
    });
  };

  // Điều hướng khi click vào cross-link trong bài viết
  const handleSelectCrossLink = (targetTerm) => {
    if (!targetTerm) return;
    const targetIsAdvanced = (targetTerm.level || 'basic').toLowerCase() === 'advanced';

    if (targetIsAdvanced !== isAdvanced) {
      if (onSwitchPage) {
        onSwitchPage(targetTerm.id);
      }
    } else {
      handleSelectTerm(targetTerm);
      const el = document.getElementById(`glossary-item-${targetTerm.id}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Mở form chỉnh sửa (Admin)
  const handleStartEdit = () => {
    if (!activeTerm) return;
    setFormData({
      id: activeTerm.id,
      term: activeTerm.term || '',
      definition: activeTerm.definition || '',
      level: activeTerm.level || level,
      parent_id: activeTerm.parent_id || null,
      video_url: activeTerm.video_url || '',
      image: null,
      image_preview: activeTerm.image_url || '',
      remove_image: false,
    });
    setIsEditing(true);
    setIsCreating(false);
  };

  // Mở form tạo mới (Admin)
  const handleStartCreate = (defaultParentId = null) => {
    setFormData({
      id: null,
      term: '',
      definition: '',
      level: level,
      parent_id: defaultParentId || null,
      video_url: '',
      image: null,
      image_preview: '',
      remove_image: false,
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
      form.append('term', formData.term.trim());
      form.append('definition', formData.definition.trim());
      form.append('level', level);
      form.append('parent_id', formData.parent_id ? String(formData.parent_id) : '');
      // Luôn gửi video_url (kể cả rỗng) để server và database xóa sạch liên kết cũ
      form.append('video_url', formData.video_url ? formData.video_url.trim() : '');
      if (formData.remove_image) {
        form.append('remove_image', 'true');
      }
      if (formData.image) {
        form.append('image', formData.image);
      }

      let savedId = formData.id;
      if (isCreating) {
        const res = await api.createGlossary(form);
        savedId = res?.glossary?.id || savedId;
      } else if (isEditing && formData.id) {
        await api.updateGlossary(formData.id, form);
      }

      await fetchGlossaries();
      if (savedId) setActiveTermId(savedId);
      setIsEditing(false);
      setIsCreating(false);
    } catch {
      // Fallback offline: Cập nhật state cục bộ để UI phản hồi ngay lập tức
      const updatedItem = {
        id: formData.id || Date.now(),
        term: formData.term.trim(),
        definition: formData.definition.trim(),
        level: level,
        parent_id: formData.parent_id || null,
        video_url: formData.video_url ? formData.video_url.trim() : '',
        image_url: formData.remove_image ? '' : (formData.image_preview || ''),
      };

      setGlossaries((prev) => {
        if (isCreating) {
          return [...prev, updatedItem];
        }
        return prev.map((t) => (t.id === formData.id ? { ...t, ...updatedItem } : t));
      });

      setActiveTermId(updatedItem.id);
      setIsEditing(false);
      setIsCreating(false);
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
    } catch {
      // Fallback offline xóa cục bộ
      setGlossaries((prev) => prev.filter((t) => t.id !== activeTerm.id));
      setActiveTermId(null);
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
        {/* CỘT TRÁI: DANH SÁCH THUẬT NGỮ (SMART ACCORDION - PHƯƠNG ÁN A) */}
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
                onClick={() => handleStartCreate()}
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
              onClick={() => onSwitchPage()}
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

          {/* Danh sách cuộn dạng Smart Accordion */}
          <div className="figma-glossary-list" role="list">
            {isLoading ? (
              <div className="figma-glossary-empty">Đang tải thuật ngữ...</div>
            ) : rootTerms.length === 0 ? (
              <div className="figma-glossary-empty">
                {searchQuery ? 'Không tìm thấy thuật ngữ phù hợp' : 'Chưa có thuật ngữ nào ở mục này'}
              </div>
            ) : (
              rootTerms.map((root) => {
                const children = childrenMap.get(root.id) || [];
                const hasChildren = children.length > 0;
                const isExpanded = expandedParentIds.has(root.id);
                const isSelected = activeTerm?.id === root.id;

                return (
                  <div key={root.id} className="figma-glossary-accordion-group">
                    {/* Thẻ cha (Root Term Card) */}
                    <button
                      id={`glossary-item-${root.id}`}
                      type="button"
                      role="listitem"
                      className={`figma-glossary-card ${isSelected ? 'active' : ''} ${hasChildren ? 'is-parent' : ''}`}
                      onClick={() => {
                        handleSelectTerm(root);
                        if (hasChildren && !isExpanded) {
                          handleToggleAccordion(root.id);
                        }
                      }}
                    >
                      <div className="figma-glossary-card-header">
                        <span className="figma-glossary-card-title">{root.term}</span>
                        {hasChildren && (
                          <div className="figma-glossary-accordion-meta">
                            <span className="figma-glossary-child-count">({children.length})</span>
                            <button
                              type="button"
                              className={`figma-glossary-arrow-toggle ${isExpanded ? 'open' : ''}`}
                              onClick={(e) => handleToggleAccordion(root.id, e)}
                              title={isExpanded ? 'Thu gọn' : 'Mở rộng'}
                              aria-label={isExpanded ? 'Thu gọn' : 'Mở rộng'}
                            >
                              ▾
                            </button>
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Danh sách các con (Children Sub-List) */}
                    {hasChildren && isExpanded && (
                      <div className="figma-glossary-children-container">
                        {children.map((child) => {
                          const isChildSelected = activeTerm?.id === child.id;
                          return (
                            <button
                              key={child.id}
                              id={`glossary-item-${child.id}`}
                              type="button"
                              role="listitem"
                              className={`figma-glossary-card figma-glossary-child-card ${isChildSelected ? 'active' : ''}`}
                              onClick={() => handleSelectTerm(child)}
                            >
                              <div className="figma-glossary-card-header">
                                <span className="figma-glossary-child-bullet">↳</span>
                                <span className="figma-glossary-card-title">{child.term}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
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
                  <label className="figma-glossary-label" htmlFor="glossary-parent-select">
                    Thuật ngữ cha (Thuộc nhóm nào)
                  </label>
                  <select
                    id="glossary-parent-select"
                    className="figma-glossary-input"
                    value={formData.parent_id || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        parent_id: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                  >
                    <option value="">-- Không có (Thuật ngữ độc lập / Gốc) --</option>
                    {potentialParents.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.term} ({p.level === 'advanced' ? 'Advanced' : 'Basic'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="figma-glossary-form-grid">
                <div className="figma-glossary-field">
                  <div className="figma-glossary-field-title-wrap">
                    <label className="figma-glossary-label" htmlFor="glossary-video-input">
                      Video URL minh họa (YouTube / MP4)
                    </label>
                    {formData.video_url && (
                      <button
                        type="button"
                        className="figma-glossary-clear-link-btn"
                        onClick={() => setFormData({ ...formData, video_url: '' })}
                        title="Xóa link video này"
                      >
                        ✕ Xóa link video
                      </button>
                    )}
                  </div>
                  <input
                    id="glossary-video-input"
                    type="url"
                    className="figma-glossary-input"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://youtube.com/watch?v=... hoặc .mp4"
                  />
                </div>

                <div className="figma-glossary-field">
                  <div className="figma-glossary-field-title-wrap">
                    <label className="figma-glossary-label" htmlFor="glossary-image-file">
                      Hình ảnh minh họa
                    </label>
                    {(formData.image_preview || formData.image) && (
                      <button
                        type="button"
                        className="figma-glossary-clear-link-btn"
                        onClick={() =>
                          setFormData({ ...formData, image: null, image_preview: '', remove_image: true })
                        }
                        title="Xóa ảnh này"
                      >
                        ✕ Xóa hình ảnh
                      </button>
                    )}
                  </div>
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
                          remove_image: false,
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
                  rows={8}
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
                    {/* Breadcrumb phân cấp game đối kháng khi đang xem thuật ngữ con */}
                    {activeParentTerm && (
                      <nav className="figma-glossary-hierarchy-nav" aria-label="Đường dẫn phân cấp thuật ngữ">
                        <button
                          type="button"
                          className="figma-glossary-breadcrumb-item parent"
                          onClick={() => handleSelectCrossLink(activeParentTerm)}
                          title={`Xem thuật ngữ cha: ${activeParentTerm.term}`}
                        >
                          <span className="figma-glossary-breadcrumb-icon">📁</span>
                          <span className="figma-glossary-breadcrumb-parent-label">Thuộc nhóm:</span>
                          <strong className="figma-glossary-breadcrumb-parent-name">{activeParentTerm.term}</strong>
                        </button>
                        <span className="figma-glossary-breadcrumb-separator" aria-hidden="true">➔</span>
                        <span className="figma-glossary-breadcrumb-current" title="Thuật ngữ đang xem">
                          {activeTerm.term}
                        </span>
                      </nav>
                    )}

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
                  {/* Nội dung định nghĩa tích hợp Term Cross-linking & Hover Tooltip */}
                  <div className="figma-glossary-body-text">
                    {parseDefinitionWithLinks(
                      activeTerm.definition,
                      glossaries,
                      activeTerm.id,
                      handleSelectCrossLink
                    )}
                  </div>

                  {/* Khối hiển thị các thuật ngữ con dạng Mini Cards Grid */}
                  {activeTermChildren.length > 0 && (
                    <div className="figma-glossary-children-box">
                      <div className="figma-glossary-children-header">
                        <div className="figma-glossary-children-title-wrap">
                          <span className="figma-glossary-children-icon">📂</span>
                          <h3 className="figma-glossary-media-title">
                            Các thuật ngữ con liên quan ({activeTermChildren.length}):
                          </h3>
                        </div>
                        <span className="figma-glossary-children-hint">Bấm vào thẻ để đọc chi tiết</span>
                      </div>

                      <div className="figma-glossary-subterms-grid">
                        {activeTermChildren.map((child) => {
                          const childIsAdvanced = (child.level || 'basic').toLowerCase() === 'advanced';
                          const excerpt = child.definition
                            ? child.definition.replace(/\s+/g, ' ').slice(0, 110) +
                              (child.definition.length > 110 ? '...' : '')
                            : 'Chưa có định nghĩa chi tiết.';
                          return (
                            <button
                              key={child.id}
                              type="button"
                              className="figma-glossary-subterm-mini-card"
                              onClick={() => handleSelectCrossLink(child)}
                              title={`Xem chi tiết thuật ngữ: ${child.term}`}
                            >
                              <div className="figma-glossary-subterm-card-header">
                                <div className="figma-glossary-subterm-card-title-wrap">
                                  <span className="figma-glossary-subterm-bullet">↳</span>
                                  <strong className="figma-glossary-subterm-card-title">{child.term}</strong>
                                </div>
                                <span className={`figma-glossary-badge-mini ${childIsAdvanced ? 'advanced' : 'basic'}`}>
                                  {childIsAdvanced ? 'Nâng cao' : 'Cơ bản'}
                                </span>
                              </div>
                              <p className="figma-glossary-subterm-card-desc">{excerpt}</p>
                              <div className="figma-glossary-subterm-card-footer">
                                <span>Xem chi tiết ➔</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Video URL minh họa (Embedded Player) */}
                  {activeTerm.video_url && (
                    <div className="figma-glossary-media-box">
                      <div className="figma-glossary-media-header">
                        <h3 className="figma-glossary-media-title">Video minh họa:</h3>
                        <a
                          href={activeTerm.video_url}
                          target="_blank"
                          rel="noreferrer"
                          className="figma-glossary-video-link"
                          title="Mở video trong tab mới"
                        >
                          <span>Mở liên kết ↗</span>
                        </a>
                      </div>

                      {getYouTubeEmbedUrl(activeTerm.video_url) ? (
                        <div className="figma-glossary-video-embed-wrap">
                          <iframe
                            src={getYouTubeEmbedUrl(activeTerm.video_url)}
                            title={`Video minh họa ${activeTerm.term}`}
                            className="figma-glossary-video-iframe"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : isDirectVideoUrl(activeTerm.video_url) ? (
                        <div className="figma-glossary-video-embed-wrap">
                          <video
                            src={activeTerm.video_url}
                            controls
                            className="figma-glossary-video-tag"
                            preload="metadata"
                          />
                        </div>
                      ) : (
                        <div className="figma-glossary-video-fallback">
                          <a
                            href={activeTerm.video_url}
                            target="_blank"
                            rel="noreferrer"
                            className="figma-glossary-video-fallback-btn"
                          >
                            ▶ Xem video tại: {activeTerm.video_url}
                          </a>
                        </div>
                      )}
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
