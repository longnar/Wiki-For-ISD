import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function GlossaryCrossLink({ term, displayText, onSelect }) {
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, placement: 'top', width: 300 });
  const triggerRef = useRef(null);

  const isAdvanced = (term.level || 'basic').toLowerCase() === 'advanced';
  const cleanExcerpt = term.definition
    ? term.definition.replace(/\s+/g, ' ').slice(0, 140) + (term.definition.length > 140 ? '...' : '')
    : 'Chưa có định nghĩa chi tiết.';

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverWidth = Math.min(320, window.innerWidth - 32);
    const estimatedHeight = 135;

    // Căn giữa theo từ khóa và giới hạn trong màn hình (Clamping)
    let left = rect.left + rect.width / 2 - popoverWidth / 2;
    if (left < 16) left = 16;
    if (left + popoverWidth > window.innerWidth - 16) {
      left = window.innerWidth - 16 - popoverWidth;
    }

    // Tự động lật lên trên hoặc xuống dưới (Smart Flip)
    let top = rect.top - estimatedHeight - 12;
    let placement = 'top';
    if (top < 16) {
      top = rect.bottom + 10;
      placement = 'bottom';
    }

    const arrowLeft = Math.max(16, Math.min(popoverWidth - 16, rect.left + rect.width / 2 - left));

    setCoords({
      top: Math.round(top),
      left: Math.round(left),
      placement,
      width: popoverWidth,
      arrowLeft: Math.round(arrowLeft),
    });
  };

  const handleMouseEnter = () => {
    updatePosition();
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  useEffect(() => {
    if (isHovered) {
      const handleScrollOrResize = () => updatePosition();
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
      return () => {
        window.removeEventListener('scroll', handleScrollOrResize, true);
        window.removeEventListener('resize', handleScrollOrResize);
      };
    }
  }, [isHovered]);

  return (
    <>
      <span
        ref={triggerRef}
        className="figma-glossary-cross-link-wrap"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          type="button"
          className="figma-glossary-cross-link"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onSelect) onSelect(term);
          }}
          title={`Xem chi tiết: ${term.term}`}
        >
          {displayText}
        </button>
      </span>

      {isHovered &&
        createPortal(
          <div
            className={`figma-glossary-popover portal placement-${coords.placement}`}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              '--popover-arrow-left': `${coords.arrowLeft || coords.width / 2}px`,
              zIndex: 999999,
              pointerEvents: 'none',
            }}
            role="tooltip"
          >
            <div className="figma-glossary-popover-header">
              <strong className="figma-glossary-popover-title">{term.term}</strong>
              <span className={`figma-glossary-badge ${isAdvanced ? 'advanced' : 'basic'}`}>
                {isAdvanced ? 'Nâng cao' : 'Cơ bản'}
              </span>
            </div>
            <div className="figma-glossary-popover-desc">{cleanExcerpt}</div>
            <div className="figma-glossary-popover-hint">
              <span>Bấm để nhảy tới thuật ngữ ➔</span>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
