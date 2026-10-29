import { useCallback, useEffect, useState } from 'react'
import { api, clearToken, getToken, setToken } from './api'
import type { User } from './types'
import AuthModal from './components/AuthModal'
import MemoBoard from './components/MemoBoard'
import AgentChat from './components/AgentChat'

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    api
      .me()
      .then((u) => setUser(u))
      .catch(() => clearToken())
      .finally(() => setLoading(false))
  }, [])

  const handleLogin = useCallback((token: string) => {
    setToken(token)
    api
      .me()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
    setShowAuth(false)
  }, [])

  const handleLogout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  if (loading) {
    return <div className="center-screen muted">加载中…</div>
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="brand-icon">📝</span>
            <span className="brand-name">备忘录平台</span>
          </div>
          <div className="topbar-right">
            {user ? (
              <>
                <span className="hello">你好，{user.username}</span>
                <button className="btn btn-ghost" onClick={handleLogout}>
                  退出登录
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={() => setShowAuth(true)}>
                登录 / 注册
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="main">
        <MemoBoard user={user} onRequireAuth={() => setShowAuth(true)} />
      </main>

      {/* 备忘 Agent：仅在登录后渲染（后端鉴权兜底，未登录无法调用 /agent） */}
      {user && <AgentChat />}

      {showAuth && (
        <AuthModal onLogin={handleLogin} onClose={() => setShowAuth(false)} />
      )}
    </div>
  )
}
