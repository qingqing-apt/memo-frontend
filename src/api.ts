import type { Memo, TokenResponse, User } from './types'

const API_BASE = '/api'
const TOKEN_KEY = 'memo_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (res.status === 204) return undefined as T

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { detail?: string }).detail || `请求失败 (${res.status})`)
  }
  return data as T
}

export const api = {
  register: (username: string, password: string) =>
    request<TokenResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  login: (username: string, password: string) =>
    request<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  me: () => request<User>('/auth/me'),
  listMemos: () => request<Memo[]>('/memos'),
  createMemo: (payload: { title: string; content: string; is_public: boolean }) =>
    request<Memo>('/memos', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateMemo: (
    id: number,
    payload: Partial<{ title: string; content: string; is_public: boolean }>,
  ) =>
    request<Memo>(`/memos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteMemo: (id: number) =>
    request<void>(`/memos/${id}`, { method: 'DELETE' }),
}
