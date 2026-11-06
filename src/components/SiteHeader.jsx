import HeaderSearchBar from './HeaderSearchBar'
import gameLogo from '../assets/branding/IdolShowdownNF_logo.png'

export default function SiteHeader({
  onNavigateHome,
  onNavigateNews,
  onNavigateContacts,
  dbCharacters = [],
  searchGlossaries = [],
  searchNews = [],
  onSelectCharacter,
  onSelectGlossary,
  onSelectNews,
  isAuthenticated = false,
  onLogin,
  onLogout,
}) {
  return (
    <header className="site-header">
      {/* Brand logo ở góc trái */}
      <button
        type="button"
        className="header-brand-btn"
        onClick={onNavigateHome}
        aria-label="Về trang chủ"
      >
        <img src={gameLogo} alt="Idol Showdown Next Fest" className="header-brand-logo" />
      </button>

      {/* Cụm menu điều hướng bên phải */}
      <nav className="main-nav" aria-label="Điều hướng chính">
        <a
          className="nav-link"
          href="https://www.idolshowdownreplay.games"
          target="_blank"
          rel="noopener noreferrer"
        >
          Replay
        </a>
        <button type="button" className="nav-link" onClick={onNavigateNews}>
          News
        </button>
        <button type="button" className="nav-link" onClick={onNavigateContacts}>
          Contacts
        </button>
        <HeaderSearchBar
          characters={dbCharacters}
          glossaries={searchGlossaries}
          news={searchNews}
          onSelectCharacter={onSelectCharacter}
          onSelectGlossary={onSelectGlossary}
          onSelectNews={onSelectNews}
        />
        <button
          type="button"
          className="login-trigger"
          onClick={isAuthenticated ? onLogout : onLogin}
        >
          {isAuthenticated ? 'Logout' : 'Login'}
        </button>
      </nav>
    </header>
  )
}

