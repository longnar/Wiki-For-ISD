import React from 'react';
import './Footer.css';
import gameLogo from '../assets/branding/IdolShowdownNF_logo.png';

export default function Footer({ onNavigate }) {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="main-footer" aria-label="Chân trang">
      <div className="footer-container">
        {/* Cột 1: Giới thiệu & Nhận diện */}
        <div className="footer-col footer-brand">
          <div className="footer-logo-wrap">
            <img src={gameLogo} alt="Idol Showdown Wiki" className="footer-logo" />
          </div>
          <p className="footer-desc">
            Cẩm nang tra cứu Framedata & Thuật ngữ đối kháng chuyên sâu dành cho cộng đồng người chơi mới và tuyển thủ.
          </p>
          <span className="footer-version-tag">Version v1.0.0-beta</span>
        </div>

        {/* Cột 2: Điều hướng nhanh */}
        <div className="footer-col">
          <h4 className="footer-heading">Điều Hướng Nhanh</h4>
          <ul className="footer-links">
            <li>
              <button type="button" onClick={() => onNavigate?.('selection')}>
                Danh sách Nhân vật
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigate?.('glossary-basic')}>
                Thuật ngữ Cơ bản
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigate?.('glossary-advanced')}>
                Thuật ngữ Nâng cao
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigate?.('news')}>
                Lịch sử Cập nhật (Patch Notes)
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigate?.('contacts')}>
                Liên hệ & Góp ý
              </button>
            </li>
          </ul>
        </div>

        {/* Cột 3: Liên kết cộng đồng */}
        <div className="footer-col">
          <h4 className="footer-heading">Cộng Đồng & Chính Thức</h4>
          <ul className="footer-links">
            <li>
              <a
                href="https://store.steampowered.com/app/1742020/Idol_Showdown/"
                target="_blank"
                rel="noreferrer"
              >
                Tải game trên Steam ↗
              </a>
            </li>
            <li>
              <a
                href="https://x.com/IdolShowdown"
                target="_blank"
                rel="noreferrer"
              >
                X / Twitter (@IdolShowdown) ↗
              </a>
            </li>
            <li>
              <a
                href="https://www.youtube.com/@IdolShowdown"
                target="_blank"
                rel="noreferrer"
              >
                YouTube Besto Game Team ↗
              </a>
            </li>
            <li>
              <a
                href="https://discord.gg/Kubkah7Ut"
                target="_blank"
                rel="noreferrer"
              >
                Discord Quốc Tế ↗
              </a>
            </li>
          </ul>
        </div>

        {/* Cột 4: Dự án mã nguồn mở & Pháp lý */}
        <div className="footer-col">
          <h4 className="footer-heading">Mã Nguồn & Pháp Lý</h4>
          <ul className="footer-links">
            <li>
              <a
                href="https://github.com/longnar/Xay-Dung-ung-dung-tra-cuu-Framedate-va-Glossary-cho-nguoi-moi"
                target="_blank"
                rel="noreferrer"
              >
                GitHub Repository ↗
              </a>
            </li>
            <li>
              <span className="footer-license-text">
                Giấy phép: MIT License (Fan Work)
              </span>
            </li>
          </ul>
          <p className="footer-disclaimer">
            Dự án phi lợi nhuận phục vụ cộng đồng. Toàn bộ tài nguyên, âm thanh và hình ảnh nhân vật thuộc về <strong>Besto Games</strong> và <strong>COVER Corp</strong>.
          </p>
        </div>
      </div>

      {/* Dải chân trang cuối (Bottom Bar) */}
      <div className="footer-bottom-bar">
        <p className="footer-copyright">
          © {new Date().getFullYear()} Idol Showdown Wiki — Fan Project.
        </p>
        <button
          type="button"
          className="footer-back-to-top"
          onClick={scrollToTop}
          aria-label="Cuộn lên đầu trang"
        >
          <span>↑ Lên đầu trang</span>
        </button>
      </div>
    </footer>
  );
}
