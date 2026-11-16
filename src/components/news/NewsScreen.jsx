import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { INITIAL_NEWS_PATCHES } from '../../data/newsData';
import './NewsStyles.css';

export default function NewsScreen({ isAuthenticated = false, onBackHome }) {
  const [patches, setPatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePatchId, setActivePatchId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form state cho Admin
  const [formData, setFormData] = useState({
    title: '',
    version: '',
    release_date: '',
    content: ''
  });

  // Tải danh sách bản cập nhật từ Database (hoặc fallback nếu DB offline)
  const fetchPatches = async () => {
    setIsLoading(true);
    try {
      const data = await api.getNews();
      if (Array.isArray(data) && data.length > 0) {
        setPatches(data);
        if (!activePatchId || !data.some((p) => p.id === activePatchId)) {
          setActivePatchId(data[0].id);
        }
      } else {
        // Fallback local data
        setPatches(INITIAL_NEWS_PATCHES);
        if (!activePatchId) setActivePatchId(INITIAL_NEWS_PATCHES[0].id);
      }
    } catch {
      // Backend hoặc DB chưa kết nối -> Dùng dữ liệu khởi tạo
      setPatches(INITIAL_NEWS_PATCHES);
      if (!activePatchId) setActivePatchId(INITIAL_NEWS_PATCHES[0].id);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatches();
  }, []);

  const activePatch = patches.find((p) => p.id === activePatchId) || patches[0];

  const handleSelectPatch = (patch) => {
    setActivePatchId(patch.id);
    setIsEditing(false);
    setIsCreating(false);
  };

  // Mở form chỉnh sửa (Admin)
  const handleStartEdit = () => {
    if (!activePatch) return;
    setFormData({
      title: activePatch.title || '',
      version: activePatch.version || '',
      release_date: activePatch.release_date
        ? String(activePatch.release_date).substring(0, 10)
        : '',
      content: activePatch.content || ''
    });
    setIsEditing(true);
    setIsCreating(false);
  };

  // Mở form tạo mới (Admin)
  const handleStartCreate = () => {
    const today = new Date().toISOString().substring(0, 10);
    setFormData({
      title: 'Balance Patch v...',
      version: 'v5.x.x',
      release_date: today,
      content: 'He thong (System)\n  - ...\n\nNhan vat (Characters)\n  - ...'
    });
    setIsCreating(true);
    setIsEditing(false);
  };

  // Xóa bản Patch (Admin)
  const handleDeletePatch = async () => {
    if (!activePatch) return;
    const confirmDelete = window.confirm(`Ban co chac chan muon xoa ban cap nhat "${activePatch.title}"?`);
    if (!confirmDelete) return;

    try {
      await api.deleteNews(activePatch.id);
    } catch {
      // Nếu API lỗi (offline), cập nhật state local
      setPatches((prev) => prev.filter((p) => p.id !== activePatch.id));
    }
    await fetchPatches();
    setIsEditing(false);
    setIsCreating(false);
  };

  // Lưu form (Thêm mới hoặc Cập nhật) vào Database
  const handleSaveForm = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Vui long nhap tieu de ban cap nhat.');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      version: formData.version.trim() || 'v5.x',
      release_date: formData.release_date || new Date().toISOString().substring(0, 10),
      content: formData.content
    };

    try {
      if (isCreating) {
        const res = await api.createNews(payload);
        await fetchPatches();
        if (res?.patch?.id) setActivePatchId(res.patch.id);
      } else if (isEditing && activePatch) {
        await api.updateNews(activePatch.id, payload);
        await fetchPatches();
      }
    } catch (err) {
      // Fallback local update nếu DB offline
      if (isCreating) {
        const newPatch = { ...payload, id: Date.now() };
        setPatches([newPatch, ...patches]);
        setActivePatchId(newPatch.id);
      } else {
        setPatches(patches.map((p) => (p.id === activePatch.id ? { ...p, ...payload } : p)));
      }
      console.warn('Luu cuc bo do backend chua san sang:', err.message);
    }

    setIsEditing(false);
    setIsCreating(false);
  };

  const handleCancelForm = () => {
    setIsEditing(false);
    setIsCreating(false);
  };

  return (
    <main className="figma-news-screen" aria-label="Man hinh tin tuc cap nhat">
      {/* Khung tong the (Figma Node 396:263) */}
      <section className="figma-news-container">
        {/* COT TRAI: DANH SACH BAN PATCH */}
        <aside className="figma-news-sidebar" aria-label="Danh sach cac ban cap nhat">
          <div className="figma-news-sidebar-header">
            <div className="figma-news-header-actions">
              {/* Nut Back quay lai trang chu */}
              <button
                type="button"
                className="figma-news-back-btn"
                onClick={() => {
                  if (onBackHome) onBackHome();
                }}
                aria-label="Quay lai trang chinh"
                title="Quay lai Trang Chu"
              >
                <span aria-hidden="true">&larr;</span>
                <span>Back</span>
              </button>
              <h2 className="figma-news-sidebar-title">
                <span>Patch Notes</span>
              </h2>
            </div>

            {/* Nut them moi danh cho Admin */}
            {isAuthenticated && (
              <button
                type="button"
                className="figma-news-add-btn"
                onClick={handleStartCreate}
                title="Them ban cap nhat moi"
              >
                + Them
              </button>
            )}
          </div>

          <div className="figma-news-list" role="tablist">
            {isLoading && patches.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                Dang tai...
              </div>
            ) : (
              patches.map((patch) => {
                const isActive = activePatch?.id === patch.id;
                const dateStr = patch.release_date
                  ? String(patch.release_date).substring(0, 10)
                  : '';
                return (
                  <button
                    type="button"
                    key={patch.id}
                    role="tab"
                    aria-selected={isActive}
                    className={`figma-news-patch-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectPatch(patch)}
                  >
                    <div className="figma-news-patch-name">
                      <span>{patch.title}</span>
                    </div>
                    {dateStr && <div className="figma-news-patch-date">{dateStr}</div>}
                  </button>
                );
              })
            )}

            {!isLoading && patches.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                Chua co ban cap nhat nao.
              </div>
            )}
          </div>
        </aside>

        {/* COT PHAI: CHI TIET NOI DUNG HOAC FORM SOAN THAO */}
        <article className="figma-news-content-panel">
          {isEditing || isCreating ? (
            /* Che do soan thao Admin */
            <form className="figma-news-form" onSubmit={handleSaveForm}>
              <div className="figma-news-form-grid">
                <div className="figma-news-field">
                  <label className="figma-news-label" htmlFor="patch-title-input">
                    Tieu de ban cap nhat
                  </label>
                  <input
                    id="patch-title-input"
                    type="text"
                    className="figma-news-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="VD: Balance Patch v5.2.0"
                    required
                  />
                </div>

                <div className="figma-news-field">
                  <label className="figma-news-label" htmlFor="patch-version-input">
                    Phien ban
                  </label>
                  <input
                    id="patch-version-input"
                    type="text"
                    className="figma-news-input"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="VD: v5.2.0"
                  />
                </div>
              </div>

              <div className="figma-news-field" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label className="figma-news-label" htmlFor="patch-content-textarea">
                  Noi dung chi tiet (Patch Notes)
                </label>
                <textarea
                  id="patch-content-textarea"
                  className="figma-news-textarea"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Nhap noi dung cac muc can bang he thong, nhan vat, tro thu..."
                  rows={14}
                  required
                />
              </div>

              <div className="figma-news-form-actions">
                <button type="button" className="figma-news-btn-cancel" onClick={handleCancelForm}>
                  Huy
                </button>
                <button type="submit" className="figma-news-btn-save">
                  {isCreating ? 'Dang' : 'Luu'}
                </button>
              </div>
            </form>
          ) : (
            /* Che do xem thong thuong */
            activePatch && (
              <>
                <header className="figma-news-article-header">
                  <div className="figma-news-article-title-wrap">
                    <h1 className="figma-news-article-title">{activePatch.title}</h1>
                    <div className="figma-news-article-meta">
                      {activePatch.version && <span>Phien ban: {activePatch.version}</span>}
                      {activePatch.release_date && (
                        <>
                          <span>-</span>
                          <span>Ngay phat hanh: {String(activePatch.release_date).substring(0, 10)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Thanh cong cu Admin (Khong dung emoji/icon) */}
                  {isAuthenticated && (
                    <div className="figma-news-admin-actions">
                      <button
                        type="button"
                        className="figma-news-btn-edit"
                        onClick={handleStartEdit}
                        title="Chinh sua ban cap nhat"
                      >
                        Sua
                      </button>
                      <button
                        type="button"
                        className="figma-news-btn-delete"
                        onClick={handleDeletePatch}
                        title="Xoa ban cap nhat"
                      >
                        Xoa
                      </button>
                    </div>
                  )}
                </header>

                <div className="figma-news-body-scroll">
                  <pre className="figma-news-body-text">{activePatch.content}</pre>
                </div>
              </>
            )
          )}
        </article>
      </section>
    </main>
  );
}
