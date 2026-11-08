import GlossaryCrossLink from './GlossaryCrossLink';

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Bóc tách nội dung định nghĩa và thay thế các từ khóa thuật ngữ bằng component liên kết
 */
export function parseDefinitionWithLinks(text, allGlossaries = [], currentTermId = null, onSelectTerm) {
  if (!text || typeof text !== 'string') return text;
  if (!allGlossaries || allGlossaries.length === 0) return text;

  // Lấy các thuật ngữ ứng viên (loại trừ chính thuật ngữ đang xem)
  const candidates = allGlossaries.filter(
    (g) => g && g.id !== currentTermId && g.term && typeof g.term === 'string'
  );
  if (candidates.length === 0) return text;

  // Tạo map từ từ khóa -> đối tượng thuật ngữ
  const patternMap = [];

  for (const item of candidates) {
    const rawTerm = item.term.trim();
    const keywords = new Set();

    // 1. Thêm từ gốc đầy đủ
    keywords.add(rawTerm);

    // 2. Tách từ khóa chính tiếng Anh (trước dấu ngoặc đơn hoặc dấu gạch chéo)
    const englishMatch = rawTerm.match(/^([a-zA-Z0-9\s+-]+)/);
    if (englishMatch) {
      const en = englishMatch[1].trim();
      if (en.length >= 3) keywords.add(en);
    }

    // 3. Tách từ khóa tiếng Việt trong ngoặc đơn nếu có
    const parenMatch = rawTerm.match(/\(([^)]+)\)/);
    if (parenMatch) {
      const insideParen = parenMatch[1].trim();
      // Nếu có dấu gạch chéo phân cách nhiều nghĩa, ví dụ: (Hồi chiêu / Thu chiêu)
      insideParen.split('/').forEach((part) => {
        const p = part.trim();
        if (p.length >= 3) keywords.add(p);
      });
    }

    for (const kw of keywords) {
      patternMap.push({
        keyword: kw,
        term: item,
      });
    }
  }

  // Sắp xếp các từ khóa theo độ dài giảm dần để ưu tiên cụm từ dài nhất trước
  patternMap.sort((a, b) => b.keyword.length - a.keyword.length);

  // Tạo Regex tổng hợp
  const escapedKeywords = patternMap.map((p) => escapeRegex(p.keyword));
  // Ghép lại thành Regex có ranh giới từ hoặc ký tự phân cách
  const combinedRegex = new RegExp(`(${escapedKeywords.join('|')})`, 'gi');

  // Cắt text thành các mẩu
  const parts = text.split(combinedRegex);
  if (parts.length <= 1) return text;

  return parts.map((part, index) => {
    if (!part) return null;
    const lower = part.toLowerCase();

    // Tìm thuật ngữ tương ứng
    const match = patternMap.find((p) => p.keyword.toLowerCase() === lower);
    if (match) {
      return (
        <GlossaryCrossLink
          key={`cross-${match.term.id}-${index}`}
          term={match.term}
          displayText={part}
          onSelect={onSelectTerm}
        />
      );
    }

    return part;
  });
}

