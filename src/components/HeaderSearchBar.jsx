import React, { useState, useEffect, useRef, useMemo } from 'react';
import './HeaderSearchBar.css';

export default function HeaderSearchBar({
  characters = [],
  glossaries = [],
  news = [],
  onSelectCharacter,
  onSelectGlossary,
  onSelectNews,
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Bắt phím tắt Ctrl+K / Cmd+K toàn cục và Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lọc dữ liệu tìm kiếm
  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return { characters: [], glossaries: [], news: [], total: 0 };
    }

    const matchedCharacters = characters.filter((c) =>
      c.name?.toLowerCase().includes(trimmed) ||
      c.type?.toLowerCase().includes(trimmed) ||
      c.description?.toLowerCase().includes(trimmed)
    ).slice(0, 5);

    const matchedGlossaries = glossaries.filter((g) =>
      g.term?.toLowerCase().includes(trimmed) ||
      g.definition?.toLowerCase().includes(trimmed)
    ).slice(0, 5);

    const matchedNews = news.filter((n) =>
      n.version?.toLowerCase().includes(trimmed) ||
      n.title?.toLowerCase().includes(trimmed) ||
      n.content?.toLowerCase().includes(trimmed)
    ).slice(0, 4);

    return {
      characters: matchedCharacters,
      glossaries: matchedGlossaries,
      news: matchedNews,
      total: matchedCharacters.length + matchedGlossaries.length + matchedNews.length,
    };
  }, [query, characters, glossaries, news]);

  const handleSelectCharacter = (char) => {
    setIsOpen(false);
    setQuery('');
    onSelectCharacter?.(char);
  };

  const handleSelectGlossary = (item) => {
    setIsOpen(false);
    setQuery('');
    onSelectGlossary?.(item);
  };

  const handleSelectNews = (item) => {
    setIsOpen(false);
    setQuery('');
    onSelectNews?.(item);
  };

  return (
    <div className="header-search-wrap" ref={searchContainerRef}>
      <div className="header-search-input-box">
        <span className="search-icon" aria-hidden="true">🔍</span>
        <input
          ref={inputRef}
          type="text"
          className="header-search-input"
          placeholder="Tìm kiếm... (Ctrl+K)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          aria-label="Tìm kiếm nhanh nhân vật, thuật ngữ, tin tức"
        />
        {query ? (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            aria-label="Xóa nội dung"
          >
            ✕
          </button>
        ) : (
          <kbd className="search-kbd">Ctrl+K</kbd>
        )}
      </div>

      {isOpen && query.trim() !== '' && (
        <div className="header-search-dropdown" role="listbox">
          {results.total === 0 ? (
            <div className="search-empty-state">
              Không tìm thấy kết quả phù hợp cho &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="search-results-list">
              {/* Nhóm Nhân vật */}
              {results.characters.length > 0 && (
                <div className="search-group">
                  <div className="search-group-title">
                    <span className="group-badge badge-char">Nhân vật</span>
                  </div>
                  {results.characters.map((char) => (
                    <button
                      key={`char-${char.id || char.name}`}
                      type="button"
                      className="search-result-item"
                      onClick={() => handleSelectCharacter(char)}
                    >
                      <span className="item-name">{char.name}</span>
                      {char.type && <span className="item-meta">{char.type}</span>}
                    </button>
                  ))}
                </div>
              )}

              {/* Nhóm Thuật ngữ */}
              {results.glossaries.length > 0 && (
                <div className="search-group">
                  <div className="search-group-title">
                    <span className="group-badge badge-glossary">Thuật ngữ</span>
                  </div>
                  {results.glossaries.map((gloss) => (
                    <button
                      key={`gloss-${gloss.id || gloss.term}`}
                      type="button"
                      className="search-result-item"
                      onClick={() => handleSelectGlossary(gloss)}
                    >
                      <span className="item-name">{gloss.term}</span>
                      <span className="item-meta">{gloss.level === 'advanced' ? 'Nâng cao' : 'Cơ bản'}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Nhóm Tin tức */}
              {results.news.length > 0 && (
                <div className="search-group">
                  <div className="search-group-title">
                    <span className="group-badge badge-news">Cập nhật</span>
                  </div>
                  {results.news.map((item) => (
                    <button
                      key={`news-${item.id}`}
                      type="button"
                      className="search-result-item"
                      onClick={() => handleSelectNews(item)}
                    >
                      <span className="item-name">{item.title || item.version}</span>
                      {item.version && <span className="item-meta">{item.version}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
