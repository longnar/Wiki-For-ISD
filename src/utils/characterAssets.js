// Anh the Card day du khung nen (WebP toi uu - giam 60-90% dung luong)
import akiArt from '../assets/cards/Aki Promo Art Big.webp';
import ayameArt from '../assets/cards/Ayame Promo Art Big.webp';
import bibooArt from '../assets/cards/Biboo Promo Art Big.webp';
import botanArt from '../assets/cards/Botan Promo Art Big.webp';
import cocoArt from '../assets/cards/Coco Promo Art Big.webp';
import fubukiArt from '../assets/cards/Fubuki Promo Art Big.webp';
import inaArt from '../assets/cards/Ina Promo Art Big.webp';
import koroneArt from '../assets/cards/Korone Promo Art Big.webp';
import koyoriArt from '../assets/cards/Koyori Promo Art Big.webp';
import ollieArt from '../assets/cards/Ollie Promo Art Big.webp';
import pekoraArt from '../assets/cards/Pekora Promo Art Big 2.webp';
import soraArt from '../assets/cards/Sora Promo Art Big.webp';
import suiseiArt from '../assets/cards/Suisei Promo Art Big.webp';

// Hinh nhan vat trong suot (Promo Art TP - Transparent WebP)
import akiTp from '../../asset/Aki Promo Art TP.webp';
import ayameTp from '../../asset/Ayame Promo Art TP.webp';
import bibooTp from '../../asset/Biboo Promo Art TP.webp';
import botanTp from '../../asset/Botan Promo Art TP.webp';
import cocoTp from '../../asset/Coco Promo Art TP.webp';
import fubukiTp from '../../asset/Fubuki Promo Art TP.webp';
import inaTp from '../../asset/Ina Promo Art TP.webp';
import koroneTp from '../../asset/Korone Promo Art TP.webp';
import koyoriTp from '../../asset/Koyori Promo Art TP.webp';
import ollieTp from '../../asset/Ollie Promo Art TP.webp';
import pekoraTp from '../../asset/Pekora Promo Art TP.webp';
import soraTp from '../../asset/Sora Promo Art TP.webp';
import suiseiTp from '../../asset/Suisei Promo Art TP.webp';

// Hinh nhan vat cat canh (Cutout WebP)
import akiCutout from '../../asset/Aki_Cutout.webp';
import ayameCutout from '../../asset/Ayame_Cutout.webp';
import bibooCutout from '../../asset/Biboo_Cutout.webp';
import botanCutout from '../../asset/Botan_Cutout.webp';
import cocoCutout from '../../asset/Coco_Cutout.webp';
import fubukiCutout from '../../asset/Fubuki_Cutout.webp';
import inaCutout from '../../asset/Ina_Cutout.webp';
import koroneCutout from '../../asset/Korone_Cutout.webp';
import koyoriCutout from '../../asset/Koyori_Cutout.webp';
import ollieCutout from '../../asset/Ollie_Cutout.webp';
import pekoraCutout from '../../asset/Pekora_Cutout.webp';
import soraCutout from '../../asset/Sora_Cutout.webp';
import suiseiCutout from '../../asset/Suisei_Cutout.webp';

export const characterArtMap = {
  'Aki': akiArt,
  'Aki Rosenthal': akiArt,
  'Ayame': ayameArt,
  'Nakiri Ayame': ayameArt,
  'Biboo': bibooArt,
  'Koseki Bijou': bibooArt,
  'Koseki Bijou (Biboo)': bibooArt,
  'Botan': botanArt,
  'Shishiro Botan': botanArt,
  'Coco': cocoArt,
  'Kiryu Coco': cocoArt,
  'Fubuki': fubukiArt,
  'Shirakami Fubuki': fubukiArt,
  'Ina': inaArt,
  "Ninomae Ina'nis": inaArt,
  'Korone': koroneArt,
  'Inugami Korone': koroneArt,
  'Koyori': koyoriArt,
  'Hakui Koyori': koyoriArt,
  'Ollie': ollieArt,
  'Kureiji Ollie': ollieArt,
  'Pekora': pekoraArt,
  'Usada Pekora': pekoraArt,
  'Sora': soraArt,
  'Tokino Sora': soraArt,
  'Suisei': suiseiArt,
  'Hoshimachi Suisei': suiseiArt,
};

export const characterTpArtMap = {
  'Aki': akiTp,
  'Aki Rosenthal': akiTp,
  'Ayame': ayameTp,
  'Nakiri Ayame': ayameTp,
  'Biboo': bibooTp,
  'Koseki Bijou': bibooTp,
  'Koseki Bijou (Biboo)': bibooTp,
  'Botan': botanTp,
  'Shishiro Botan': botanTp,
  'Coco': cocoTp,
  'Kiryu Coco': cocoTp,
  'Fubuki': fubukiTp,
  'Shirakami Fubuki': fubukiTp,
  'Ina': inaTp,
  "Ninomae Ina'nis": inaTp,
  'Korone': koroneTp,
  'Inugami Korone': koroneTp,
  'Koyori': koyoriTp,
  'Hakui Koyori': koyoriTp,
  'Ollie': ollieTp,
  'Kureiji Ollie': ollieTp,
  'Pekora': pekoraTp,
  'Usada Pekora': pekoraTp,
  'Sora': soraTp,
  'Tokino Sora': soraTp,
  'Suisei': suiseiTp,
  'Hoshimachi Suisei': suiseiTp,
};

function matchAsset(name, assetMap) {
  if (!name) return null;
  const lowerName = name.trim().toLowerCase();

  // 1. Khớp chính xác tuyệt đối theo key (case-insensitive)
  for (const [key, val] of Object.entries(assetMap)) {
    if (key.toLowerCase() === lowerName) {
      return val;
    }
  }

  // 2. Tách từ hoàn chỉnh để tránh 'Aki' khớp nhầm trong 'Nakiri'
  // (ví dụ: 'Nakiri Ayame' có các từ ['nakiri', 'ayame'])
  const nameWords = lowerName.split(/[\s'()_-]+/).filter(Boolean);
  for (const [key, val] of Object.entries(assetMap)) {
    const keyLower = key.toLowerCase();
    if (nameWords.includes(keyLower)) {
      return val;
    }
  }

  // 3. Khớp kiểm tra chuỗi con chứa key hoàn chỉnh (ưu tiên key dài trước)
  const sortedEntries = Object.entries(assetMap).sort((a, b) => b[0].length - a[0].length);
  for (const [key, val] of sortedEntries) {
    const keyLower = key.toLowerCase();
    if (lowerName.includes(keyLower) || keyLower.includes(lowerName)) {
      return val;
    }
  }

  return null;
}

export function getCharacterArt(name) {
  return matchAsset(name, characterArtMap);
}

// Lay hinh nhan vat trong suot Promo Art TP
export function getCharacterTpArt(name) {
  return matchAsset(name, characterTpArtMap);
}

export const characterCutoutMap = {
  'Aki': akiCutout,
  'Aki Rosenthal': akiCutout,
  'Ayame': ayameCutout,
  'Nakiri Ayame': ayameCutout,
  'Biboo': bibooCutout,
  'Koseki Bijou': bibooCutout,
  'Koseki Bijou (Biboo)': bibooCutout,
  'Botan': botanCutout,
  'Shishiro Botan': botanCutout,
  'Coco': cocoCutout,
  'Kiryu Coco': cocoCutout,
  'Fubuki': fubukiCutout,
  'Shirakami Fubuki': fubukiCutout,
  'Ina': inaCutout,
  "Ninomae Ina'nis": inaCutout,
  'Korone': koroneCutout,
  'Inugami Korone': koroneCutout,
  'Koyori': koyoriCutout,
  'Hakui Koyori': koyoriCutout,
  'Ollie': ollieCutout,
  'Kureiji Ollie': ollieCutout,
  'Pekora': pekoraCutout,
  'Usada Pekora': pekoraCutout,
  'Sora': soraCutout,
  'Tokino Sora': soraCutout,
  'Suisei': suiseiCutout,
  'Hoshimachi Suisei': suiseiCutout,
};

// Lay hinh nhan vat cat canh Cutout PNG
export function getCharacterCutout(name) {
  return matchAsset(name, characterCutoutMap);
}

// Ham tai truoc (Preload) toan bo anh nhan vat vao bo nho Cache cua trinh duyet
export function preloadCharacterAssets() {
  if (typeof window === 'undefined') return;
  const allUrls = [
    ...Object.values(characterTpArtMap),
    ...Object.values(characterArtMap),
    ...Object.values(characterCutoutMap),
  ];
  const uniqueUrls = Array.from(new Set(allUrls));
  // Tuan tu hoac song song tai vao cache trinh duyet
  uniqueUrls.forEach((url) => {
    if (url) {
      const img = new Image();
      img.src = url;
    }
  });
}

