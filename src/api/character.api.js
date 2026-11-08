import { apiRequest } from './client'

export const characterApi = {
  list: () => apiRequest('/api/characters'),
  get: (id) => apiRequest(`/api/characters/${id}`),
  create: (body) =>
    apiRequest('/api/admin/characters', {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  update: (id, body) =>
    apiRequest(`/api/admin/characters/${id}`, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  remove: (id) => apiRequest(`/api/admin/characters/${id}`, { method: 'DELETE' }),
  createMove: (id, body) =>
    apiRequest(`/api/admin/characters/${id}/moves`, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  updateMove: (id, moveId, body) =>
    apiRequest(`/api/admin/characters/${id}/moves/${moveId}`, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  removeMove: (id, moveId) => apiRequest(`/api/admin/characters/${id}/moves/${moveId}`, { method: 'DELETE' }),
  saveBaseStats: (id, body) => apiRequest(`/api/admin/characters/${id}/base-stats`, { method: 'PUT', body: JSON.stringify(body) }),
  parseMizuumi: (id, wikitext) =>
    apiRequest(`/api/admin/characters/${id}/parse-mizuumi`, {
      method: 'POST',
      body: JSON.stringify({ wikitext }),
    }),
  batchSaveMoves: (id, moves) =>
    apiRequest(`/api/admin/characters/${id}/batch-moves`, {
      method: 'POST',
      body: JSON.stringify({ moves }),
    }),
}
