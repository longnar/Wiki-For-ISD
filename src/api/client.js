const tokenKey = 'idol-showdown-token'

// Đọc thời điểm hết hạn (ms) từ payload JWT, trả null nếu token hỏng hoặc không có exp
export function getTokenExpiry(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(window.atob(base64))
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

// Lấy token còn hạn; token hết hạn/hỏng sẽ bị xóa luôn khỏi localStorage
export function getValidToken() {
  const token = window.localStorage.getItem(tokenKey)
  if (!token) return null
  const expiry = getTokenExpiry(token)
  if (!expiry || expiry <= Date.now()) {
    window.localStorage.removeItem(tokenKey)
    return null
  }
  return token
}

export async function apiRequest(url, options = {}) {
  const headers = new Headers(options.headers || {})
  const token = window.localStorage.getItem(tokenKey)

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (!(options.body instanceof FormData) && options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, { ...options, headers })
  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      window.localStorage.removeItem(tokenKey)
      window.dispatchEvent(new CustomEvent('auth-expired'))
    }
    throw new Error(payload?.message || 'Yêu cầu tới máy chủ thất bại.')
  }

  return payload
}

export const api = {
  getMe: () => apiRequest('/api/auth/me'),
  getCharacters: () => apiRequest('/api/characters'),
  getCharacter: (id) => apiRequest(`/api/characters/${id}`),
  getGlossaries: () => apiRequest('/api/glossaries'),
  createCharacter: (body) => apiRequest('/api/admin/characters', { method: 'POST', body }),
  updateCharacter: (id, body) => apiRequest(`/api/admin/characters/${id}`, { method: 'PUT', body }),
  deleteCharacter: (id) => apiRequest(`/api/admin/characters/${id}`, { method: 'DELETE' }),
  createGlossary: (body) => apiRequest('/api/admin/glossaries', { method: 'POST', body }),
  updateGlossary: (id, body) => apiRequest(`/api/admin/glossaries/${id}`, { method: 'PUT', body }),
  deleteGlossary: (id) => apiRequest(`/api/admin/glossaries/${id}`, { method: 'DELETE' }),
  getNews: () => apiRequest('/api/news'),
  getNewsItem: (id) => apiRequest(`/api/news/${id}`),
  createNews: (body) => apiRequest('/api/admin/news', { method: 'POST', body }),
  updateNews: (id, body) => apiRequest(`/api/admin/news/${id}`, { method: 'PUT', body }),
  deleteNews: (id) => apiRequest(`/api/admin/news/${id}`, { method: 'DELETE' }),
}
