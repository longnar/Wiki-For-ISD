import { useEffect, useRef, useState } from 'react'
import heroArtImage from './assets/characters/IdolShowdownNextFesBiboo_1.png'
import contactCharacterImage from './assets/characters/fbk-eating.gif'
import gameLogo from './assets/branding/IdolShowdownNF_logo.png'
import brandIcon from './assets/branding/IdolShowdownIcon.png'
import pixelFubuki from './assets/characters/Pixel Fubuki.png'
import pixelKoyori from './assets/characters/Pixel Koyori.png'
import selectionFrame from './assets/decorative/selection-frame.svg'
import selectionPolygon from './assets/decorative/selection-polygon.svg'
import { decodeBase64Image } from './utils/decodeImage'
import { api, getValidToken } from './api/client'
import GlossaryBasicScreen from './components/glossary/GlossaryBasicScreen'
import GlossaryAdvancedScreen from './components/glossary/GlossaryAdvancedScreen'
import CharacterSelectGrid from './components/character/CharacterSelectGrid'
import NewsScreen from './components/news/NewsScreen'
import Footer from './components/Footer'
import HeaderSearchBar from './components/HeaderSearchBar'
import SiteHeader from './components/SiteHeader'
import { INITIAL_GLOSSARY_TERMS } from './data/glossaryData'
import { INITIAL_NEWS_PATCHES } from './data/newsData'
import './components/character/CharacterStyles.css'
import './App.css'

function App() {
  const [activePage, setActivePage] = useState('home')
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  // Chỉ coi là đã đăng nhập khi token còn hạn (token hết hạn bị xóa ngay khi tải trang)
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getValidToken()))
  const [loginError, setLoginError] = useState('')
  // true khi modal login được mở do phiên hết hạn (đăng nhập lại), false khi bấm nút Login
  const isReloginRef = useRef(false)
  const [activeCard, setActiveCard] = useState(0)
  const [isCardSliding, setIsCardSliding] = useState(false)
  const [isCardResetting, setIsCardResetting] = useState(false)
  const [selectionAddImage, setSelectionAddImage] = useState('')
  const [selectionAddImagePosition, setSelectionAddImagePosition] = useState({ x: 0, y: 0 })
  const [selectionAddImageScale, setSelectionAddImageScale] = useState(1)
  const [mainCharacterImagePreview, setMainCharacterImagePreview] = useState('')
  const logoFileInputRef = useRef(null)
  const selectionAddDragRef = useRef(null)
  const [characterCards, setCharacterCards] = useState([])
  const [cardUrls, setCardUrls] = useState({})
  const cardUrlsRef = useRef({})
  const [characterForm, setCharacterForm] = useState({
    name: '', debut_date: '', description: '', difficulty: 1, type: '', image: null
  })
  const [dbCharacters, setDbCharacters] = useState([])
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [searchGlossaries, setSearchGlossaries] = useState(INITIAL_GLOSSARY_TERMS)
  const [searchNews, setSearchNews] = useState(INITIAL_NEWS_PATCHES)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsLoginOpen(false)
      }
    }

    document.body.classList.toggle('modal-open', isLoginOpen)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.classList.remove('modal-open')
    }
  }, [isLoginOpen])

  useEffect(() => {
    let isMounted = true

    fetch('/cards/manifest.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load card manifest: ${response.status}`)
        }
        return response.json()
      })
      .then((manifest) => {
        if (isMounted) {
          setCharacterCards(manifest)
        }
      })
      .catch((error) => {
        console.error('Unable to load encoded character cards.', error)
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (characterCards.length === 0) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      setIsCardSliding(true)

      window.setTimeout(() => {
        setActiveCard((current) => (current + 1) % characterCards.length)
        setIsCardResetting(true)
        setIsCardSliding(false)
        window.requestAnimationFrame(() => {
          setIsCardResetting(false)
        })
      }, 650)
    }, 4000)

    return () => window.clearInterval(intervalId)
  }, [characterCards.length])

  useEffect(() => {
    if (characterCards.length === 0) {
      return undefined
    }

    let isMounted = true
    const indicesToLoad = [activeCard, (activeCard + 1) % characterCards.length]

    Promise.all(indicesToLoad.map(async (index) => {
      const card = characterCards[index]
      if (cardUrlsRef.current[card.name]) {
        return [card.name, cardUrlsRef.current[card.name]]
      }

      const response = await fetch(`/cards/${encodeURIComponent(card.file)}`)
      if (!response.ok) {
        throw new Error(`Unable to load encoded card: ${card.file}`)
      }
      const encodedText = await response.text()
      const objectUrl = decodeBase64Image(encodedText, card.mimeType)
      cardUrlsRef.current[card.name] = objectUrl
      return [card.name, objectUrl]
    }))
      .then((loadedCards) => {
        if (isMounted) {
          setCardUrls((current) => Object.fromEntries([...Object.entries(current), ...loadedCards]))
        }
      })
      .catch((error) => {
        console.error('Unable to decode character card.', error)
      })

    return () => {
      isMounted = false
    }
  }, [activeCard, characterCards])

  useEffect(() => () => {
    Object.values(cardUrlsRef.current).forEach((objectUrl) => URL.revokeObjectURL(objectUrl))
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoginError('')

    const formData = new FormData(event.currentTarget)
    const username = formData.get('username')
    const password = formData.get('password')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.message || 'Đăng nhập thất bại.')
      }

      window.localStorage.setItem('idol-showdown-token', payload.token)
      setIsLoginOpen(false)
      setIsAuthenticated(true)
      // Đăng nhập lại sau khi hết phiên thì ở nguyên trang đang xem, không đá về trang chọn nhân vật
      if (!isReloginRef.current) setActivePage('selection')
      isReloginRef.current = false
    } catch (error) {
      console.error('Unable to log in.', error)
      setLoginError(error.message || 'Không thể kết nối tới máy chủ.')
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('idol-showdown-token')
    setIsAuthenticated(false)
    setActivePage('home')
  }

  const handleCharacterSubmit = async (event) => {
    event.preventDefault()
    const form = new FormData()
    Object.entries(characterForm).forEach(([key, value]) => {
      if (value !== null && value !== '') form.append(key, value)
    })
    try {
      await api.createCharacter(form)
      setCharacterForm({ name: '', debut_date: '', description: '', difficulty: 1, type: '', image: null })
      setMainCharacterImagePreview('')
      await loadCharacters()
      setActivePage('selection')
    } catch (error) {
      console.error('Unable to create character.', error)
      setDataError(error.message)
    }
  }

  const handleGlossarySubmit = async (event) => {
    event.preventDefault()
    const form = new FormData()
    Object.entries(glossaryForm).forEach(([key, value]) => {
      if (key !== 'id' && value !== null && value !== '') form.append(key, value)
    })
    try {
      if (glossaryForm.id) await api.updateGlossary(glossaryForm.id, form)
      else await api.createGlossary(form)
      setGlossaryForm({ id: null, term: '', definition: '', level: 'basic', video_url: '', image: null })
      await loadGlossaries()
    } catch (error) {
      console.error('Unable to save glossary.', error)
      setDataError(error.message)
    }
  }

  const handleDeleteGlossary = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa thuật ngữ này?')) return
    try {
      await api.deleteGlossary(id)
      await loadGlossaries()
    } catch (error) {
      console.error('Unable to delete glossary.', error)
      setDataError(error.message)
    }
  }

  const handleMainCharacterImageChange = (event) => {
    const file = event.target.files[0] || null
    setCharacterForm((prev) => ({ ...prev, image: file }))
    if (file) {
      const previewUrl = URL.createObjectURL(file)
      setMainCharacterImagePreview((current) => {
        if (current) URL.revokeObjectURL(current)
        return previewUrl
      })
    } else {
      setMainCharacterImagePreview((current) => {
        if (current) URL.revokeObjectURL(current)
        return ''
      })
    }
  }

  const handleSelectionAddImage = (event) => {
    const [file] = event.target.files
    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      console.error('The selected file is not an image.')
      event.target.value = ''
      return
    }

    const imageUrl = URL.createObjectURL(file)
    setSelectionAddImagePosition({ x: 0, y: 0 })
    setSelectionAddImageScale(1)
    setSelectionAddImage((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl)
      }
      return imageUrl
    })
    event.target.value = ''
  }

  const resetSelectionAddImage = () => {
    setSelectionAddImagePosition({ x: 0, y: 0 })
    setSelectionAddImageScale(1)
  }

  const handleSelectionAddImagePointerDown = (event) => {
    if (!selectionAddImage) {
      return
    }

    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    selectionAddDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: selectionAddImagePosition.x,
      originY: selectionAddImagePosition.y,
    }
  }

  const handleSelectionAddImagePointerMove = (event) => {
    const drag = selectionAddDragRef.current
    if (!drag || drag.pointerId !== event.pointerId) {
      return
    }

    setSelectionAddImagePosition({
      x: drag.originX + event.clientX - drag.startX,
      y: drag.originY + event.clientY - drag.startY,
    })
  }

  const handleSelectionAddImagePointerUp = (event) => {
    if (selectionAddDragRef.current?.pointerId === event.pointerId) {
      selectionAddDragRef.current = null
    }
  }

  useEffect(() => () => {
    if (selectionAddImage) {
      URL.revokeObjectURL(selectionAddImage)
    }
    if (mainCharacterImagePreview) {
      URL.revokeObjectURL(mainCharacterImagePreview)
    }
  }, [selectionAddImage, mainCharacterImagePreview])

  useEffect(() => {
    const handleAuthExpired = () => {
      isReloginRef.current = true
      setIsAuthenticated(false)
      setIsLoginOpen(true)
      setLoginError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
    }
    window.addEventListener('auth-expired', handleAuthExpired)
    return () => window.removeEventListener('auth-expired', handleAuthExpired)
  }, [])

  // Xác thực token với server khi tải trang (token ký bằng secret khác, user bị xóa...).
  // Lỗi ở bước này chỉ đăng xuất im lặng, không bật modal làm phiền khách.
  useEffect(() => {
    const token = getValidToken()
    if (!token) return
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        if (response.status === 401 || response.status === 403) {
          window.localStorage.removeItem('idol-showdown-token')
          setIsAuthenticated(false)
        }
      })
      .catch(() => {})
  }, [])

  // Tự đăng xuất khi token hết hạn lúc đang mở trang.
  // Không dùng một setTimeout dài vì timer bị treo khi máy sleep / bị trình duyệt hãm ở tab nền:
  // kiểm tra định kỳ mỗi 30 giây và kiểm tra ngay khi người dùng quay lại tab.
  useEffect(() => {
    if (!isAuthenticated) return
    const checkExpiry = () => {
      if (getValidToken()) return
      window.dispatchEvent(new CustomEvent('auth-expired'))
    }
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') checkExpiry()
    }
    checkExpiry()
    const interval = window.setInterval(checkExpiry, 30 * 1000)
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('focus', checkExpiry)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('focus', checkExpiry)
    }
  }, [isAuthenticated])

  // Đồng bộ trạng thái đăng nhập giữa các tab (đăng xuất/đăng nhập ở tab khác)
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== 'idol-showdown-token' && event.key !== null) return
      setIsAuthenticated(Boolean(getValidToken()))
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const loadCharacters = async () => {
    try {
      const list = await api.getCharacters()
      if (Array.isArray(list) && list.length > 0) {
        setDbCharacters(list)
        setSelectedCharacter((prev) => prev ? list.find(c => c.id === prev.id) || list[0] : list[0])
      }
    } catch (error) {
      console.error('Unable to load characters.', error)
    }
  }

  // Tải dữ liệu tổng hợp cho thanh Quick Search khi khởi động
  useEffect(() => {
    loadCharacters()
    api.getGlossaries()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSearchGlossaries(data)
        }
      })
      .catch((err) => console.warn('Using fallback glossaries for search.', err))

    api.getNews()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSearchNews(data)
        }
      })
      .catch((err) => console.warn('Using fallback news for search.', err))
  }, [])

  useEffect(() => {
    if (activePage === 'selection' || activePage === 'selection-add') {
      loadCharacters()
    }
  }, [activePage])


  const renderSharedHeader = () => (
    <SiteHeader
      onNavigateHome={() => setActivePage('home')}
      onNavigateNews={() => setActivePage('news')}
      onNavigateContacts={() => setActivePage('contacts')}
      dbCharacters={dbCharacters}
      searchGlossaries={searchGlossaries}
      searchNews={searchNews}
      onSelectCharacter={(char) => {
        setSelectedCharacter(char)
        setActivePage('selection')
      }}
      onSelectGlossary={(item) => {
        setActivePage(item.level === 'advanced' ? 'glossary-advanced' : 'glossary-basic')
      }}
      onSelectNews={() => {
        setActivePage('news')
      }}
      isAuthenticated={isAuthenticated}
      onLogin={() => {
        isReloginRef.current = false
        setIsLoginOpen(true)
      }}
      onLogout={handleLogout}
    />
  )

  const renderHome = () => (
    <>
      {renderSharedHeader()}

      <main>
        <section className="hero" id="hero">
          <div className="hero-art" aria-hidden="true" style={{ backgroundImage: `url(${heroArtImage})` }} />
          <div className="hero-overlay" aria-hidden="true"> 
          <div className="hero-content">
            <img className="game-logo" src={gameLogo} alt="Idol Showdown Next Fest" />
            <p className="game-meta">
              Date Release : 6 May, 2023
              <br />
              Last update : 7 June,2026
              <br />
              Developer : Besto Game Team
            </p>
            <a
              className="download-button"
              href="https://store.steampowered.com/app/1742020/Idol_Showdown/"
              target="_blank"
              rel="noreferrer"
            >
              Download
            </a>
          </div>
        </div>
      </section>

        <section className="home-lower">
          <div className="home-copy">
            <section className="intro" id="about">
              <p>
                Được phát triển bởi Besto Games - 1 đội ngũ indie, với niềm đam mê game đối kháng
                và Idol của mình họ đã dành trọn 2 năm để phát triển tựa game Idol Showdown này.
              </p>
            </section>

            <section className="welcome">
              <p>
                Đây là một tựa game đối kháng (Fighting Game) sở hữu lối chơi vô cùng mượt mà, nhưng
                lại cực kỳ thân thiện và dễ dàng tiếp cận ngay cả khi bạn là người mới bắt đầu bước
                chân vào thể loại này.
              </p>
              <p>
                Để bắt đầu trải nghiệm, bạn muốn khám phá danh sách Nhân vật trước hay tìm hiểu về các
                Định nghĩa/Thuật ngữ trong game trước?
              </p>
            </section>
          </div>

          <aside className="character-carousel" aria-label="Thẻ nhân vật">
            <div className="carousel-frame">
              <div className={`carousel-track ${isCardSliding ? 'is-sliding' : ''} ${isCardResetting ? 'is-resetting' : ''}`}>
                {characterCards.length > 0 && cardUrls[characterCards[activeCard].name] && (
                  <img
                    className="carousel-card carousel-card-current"
                    src={cardUrls[characterCards[activeCard].name]}
                    alt={`${characterCards[activeCard].name} character card`}
                  />
                )}
                {characterCards.length > 0 && cardUrls[characterCards[(activeCard + 1) % characterCards.length].name] && (
                  <img
                    className="carousel-card carousel-card-next"
                    src={cardUrls[characterCards[(activeCard + 1) % characterCards.length].name]}
                    alt=""
                    aria-hidden="true"
                  />
                )}
              </div>
            </div>
            <p className="carousel-caption">{characterCards.length > 0 ? characterCards[activeCard].name : 'Loading...'}</p>
          </aside>
        </section>

        <section className="directory" aria-label="Khám phá nội dung">
          <button type="button" className="directory-card" onClick={() => setActivePage('selection')}>
            Character
          </button>
          <button type="button" className="directory-card" onClick={() => setActivePage('glossary')}>
            Glossary
          </button>
        </section>
      </main>

      <Footer onNavigate={(page) => setActivePage(page)} />
    </>
  )

  const renderContacts = () => (
    <main className="contacts-screen">
      <button type="button" className="back-button" aria-label="Quay lại trang chính" onClick={() => setActivePage('home')}>
        <img src={brandIcon} alt="" />
      </button>

      <img className="contacts-logo" src={gameLogo} alt="Idol Showdown Next Fest" />

      <section className="contacts-panel" aria-labelledby="contacts-title">
        <h1 id="contacts-title">Các trang liên hệ chính thức:</h1>
        <div className="contact-group">
          <p>X:</p>
          <a href="https://x.com/IdolShowdown" target="_blank" rel="noreferrer">
            Idol Showdown: hololive Fighting Game
          </a>
        </div>
        <div className="contact-group">
          <p>Youtube:</p>
          <a href="https://www.youtube.com/@IdolShowdown" target="_blank" rel="noreferrer">
            Idol Showdown | Besto Game Team
          </a>
        </div>
        <h2>Cộng đồng nước ngoài:</h2>
        <div className="contact-group">
          <p>Discord:</p>
          <a href="https://discord.gg/Kubkah7Ut" target="_blank" rel="noreferrer">
            Idol Showdown
          </a>
        </div>
        <h2>Cộng đồng Việt Nam:</h2>
        <p className="unavailable">Facebook: Đang cập nhật</p>
        <p className="unavailable">Discord: Đang cập nhật</p>
      </section>

      <img className="contacts-character" src={contactCharacterImage} alt="" />
    </main>
  )

  const renderGlossary = () => (
    <main className="glossary-screen">
      <button type="button" className="glossary-center-mark" onClick={() => setActivePage('home')} aria-label="Quay lại trang trước">
        <img src={brandIcon} alt="Quay lại" />
      </button>

      <button type="button" className="glossary-panel basic" onClick={() => setActivePage('glossary-basic')} aria-label="Mở phần Basic glossary">
        <div className="panel-visual" />
        <img className="panel-character" src={pixelFubuki} alt="" />
        <div className="panel-content">
          <h1>BASIC</h1>
          <p>Những thứ cơ bản nhất về Fighting game mà bạn muốn biết để làm quen với mọi Fighting game</p>
        </div>
      </button>

      <button type="button" className="glossary-panel advanced" onClick={() => setActivePage('glossary-advanced')} aria-label="Mở phần Advanced glossary">
        <div className="panel-visual" />
        <img className="panel-character" src={pixelKoyori} alt="" />
        <div className="panel-content">
          <h2>ADVANCED</h2>
          <p>Những thứ nâng cao hơn nếu bạn muốn cải thiện trình độ hoặc muốn hiểu sâu hơn về Fighting game</p>
        </div>
      </button>
    </main>
  )

  const renderGlossaryBasic = () => (
    <GlossaryBasicScreen
      isAuthenticated={isAuthenticated}
      onBackHome={() => setActivePage('glossary')}
      onNavigateToAdvanced={() => setActivePage('glossary-advanced')}
    />
  )

  const renderGlossaryAdvanced = () => (
    <GlossaryAdvancedScreen
      isAuthenticated={isAuthenticated}
      onBackHome={() => setActivePage('glossary')}
      onNavigateToBasic={() => setActivePage('glossary-basic')}
    />
  )

  const renderSelection = () => (
    <>
      {renderSharedHeader()}
      <CharacterSelectGrid
      characters={dbCharacters}
      selectedCharacter={selectedCharacter || dbCharacters[0]}
      onSelectCharacter={(char) => setSelectedCharacter(char)}
      onCharacterUpdated={loadCharacters}
      onAddNewCharacter={() => {
        setCharacterForm({ name: '', debut_date: '', description: '', difficulty: 1, type: '', image: null })
        setMainCharacterImagePreview('')
        setActivePage('selection-add')
      }}
      isAuthenticated={isAuthenticated}
      onBackHome={() => setActivePage('home')}
    />
    </>
  )

  const renderNews = () => (
    <NewsScreen
      isAuthenticated={isAuthenticated}
      onBackHome={() => setActivePage('home')}
    />
  )

  const renderSelectionAdd = () => (
    <main className="selection-add-screen" aria-label="Màn hình thêm nhân vật">
      <div className="selection-add-decor" aria-hidden="true">
        <img className="selection-add-frame" src={selectionFrame} alt="" />
        <img className="selection-add-polygon" src={selectionPolygon} alt="" />
      </div>

      <button type="button" className="selection-add-back" onClick={() => setActivePage('selection')} aria-label="Quay lại màn hình selection">
        <span aria-hidden="true">←</span>
      </button>

      <section className="selection-add-image-panel" aria-label="Khu vực thêm ảnh nhân vật">
        {mainCharacterImagePreview ? (
          <div className="selection-add-main-preview-container">
            <img src={mainCharacterImagePreview} alt="Ảnh nhân vật chính" className="selection-add-main-preview" />
            <label className="selection-add-change-btn">
              Thay đổi ảnh
              <input type="file" accept="image/*" onChange={handleMainCharacterImageChange} />
            </label>
          </div>
        ) : (
          <label className="selection-add-upload" aria-label="Thêm ảnh nhân vật">
            <span aria-hidden="true">+</span>
            <span className="upload-label-text">Tải lên ảnh nhân vật</span>
            <input type="file" accept="image/*" onChange={handleMainCharacterImageChange} />
          </label>
        )}
      </section>

      <section className="selection-add-details" aria-label="Thông tin nhân vật">
        <div className={`selection-add-logo-slot ${selectionAddImage ? 'has-image' : ''}`}>
          {selectionAddImage ? (
            <>
              <div className="selection-add-logo-viewport">
                <img
                  src={selectionAddImage}
                  alt="Logo nhân vật đã tải lên"
                  style={{
                    transform: `translate(${selectionAddImagePosition.x}px, ${selectionAddImagePosition.y}px) scale(${selectionAddImageScale})`
                  }}
                  onPointerDown={handleSelectionAddImagePointerDown}
                  onPointerMove={handleSelectionAddImagePointerMove}
                  onPointerUp={handleSelectionAddImagePointerUp}
                  onPointerCancel={handleSelectionAddImagePointerUp}
                />
              </div>
              <div className="logo-controls">
                <button type="button" className="logo-btn" title="Thu nhỏ" onClick={() => setSelectionAddImageScale((s) => Math.max(0.3, +(s - 0.1).toFixed(2)))}>-</button>
                <input
                  type="range"
                  min="0.3"
                  max="3"
                  step="0.05"
                  value={selectionAddImageScale}
                  onChange={(e) => setSelectionAddImageScale(parseFloat(e.target.value))}
                  className="logo-scale-slider"
                  title="Kích thước Logo"
                />
                <button type="button" className="logo-btn" title="Phóng to" onClick={() => setSelectionAddImageScale((s) => Math.min(3, +(s + 0.1).toFixed(2)))}>+</button>
                <button type="button" className="logo-btn text-btn" onClick={resetSelectionAddImage}>Căn giữa</button>
                <button type="button" className="logo-btn text-btn" onClick={() => logoFileInputRef.current?.click()}>Đổi logo</button>
              </div>
            </>
          ) : (
            <label className="selection-add-logo-placeholder">
              <span aria-hidden="true">+</span>
              <span className="placeholder-text">Tải lên logo</span>
              <input ref={logoFileInputRef} type="file" accept="image/*" onChange={handleSelectionAddImage} style={{ display: 'none' }} aria-label="Tải lên logo nhân vật" />
            </label>
          )}
          <input ref={logoFileInputRef} type="file" accept="image/*" onChange={handleSelectionAddImage} style={{ display: 'none' }} aria-label="Tải lên logo nhân vật" />
        </div>
        <form className="selection-add-description data-form" onSubmit={handleCharacterSubmit}>
          <input value={characterForm.name} onChange={(event) => setCharacterForm({ ...characterForm, name: event.target.value })} placeholder="Tên nhân vật" required />
          <input value={characterForm.type} onChange={(event) => setCharacterForm({ ...characterForm, type: event.target.value })} placeholder="Loại nhân vật" />
          <input type="number" min="1" max="5" value={characterForm.difficulty} onChange={(event) => setCharacterForm({ ...characterForm, difficulty: event.target.value })} placeholder="Độ khó" />
          <textarea value={characterForm.description} onChange={(event) => setCharacterForm({ ...characterForm, description: event.target.value })} aria-label="Thông tin mô tả" placeholder="Nhập mô tả nhân vật" />
          <div className="selection-add-actions">
            <button type="submit" className="selection-add-action selection-add-save">Lưu</button>
          </div>
        </form>
        <button type="button" className="selection-add-detail-button" onClick={() => setActivePage('home')}>Chi Tiết</button>
      </section>
    </main>
  )

  const renderPage = () => {
    switch (activePage) {
      case 'contacts':
        return renderContacts()
      case 'glossary':
        return renderGlossary()
      case 'glossary-basic':
      case 'glossary-basic-view':
        return renderGlossaryBasic()
      case 'glossary-advanced':
      case 'glossary-advanced-view':
        return renderGlossaryAdvanced()
      case 'selection-add':
        return isAuthenticated ? renderSelectionAdd() : renderSelection()
      case 'selection':
        return renderSelection()
      case 'news':
        return renderNews()
      default:
        return renderHome()
    }
  }

  return (
    <div className="page-shell">
      {renderPage()}

      <div className={`login-modal ${isLoginOpen ? '' : 'hidden'}`} role="dialog" aria-modal="true" aria-labelledby="login-title">
        <div className="login-modal-backdrop" onClick={() => setIsLoginOpen(false)} aria-hidden="true" />
        <section className="login-modal-panel">
          <button className="login-close" type="button" aria-label="Đóng cửa sổ đăng nhập" onClick={() => setIsLoginOpen(false)}>
            &times;
          </button>
          <img className="login-modal-logo" src={gameLogo} alt="Idol Showdown Next Fest" />
          <form className="login-modal-form" id="login-form" onSubmit={handleSubmit}>
            <h1 id="login-title">Đăng nhập để chỉnh sửa thông tin</h1>
            <label htmlFor="modal-username">Tên đăng nhập</label>
            <input id="modal-username" name="username" type="text" autoComplete="username" required />
            <label htmlFor="modal-password">Mật khẩu</label>
            <input id="modal-password" name="password" type="password" autoComplete="current-password" required />
            {loginError && <p role="alert">{loginError}</p>}
            <button type="submit">Đăng nhập</button>
          </form>
        </section>
      </div>
    </div>
  )
}

export default App

