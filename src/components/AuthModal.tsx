import { useState } from 'react'
import { api } from '../api'

interface Props {
  onLogin: (token: string) => void
  onClose: () => void
}

export default function AuthModal({ onLogin, onClose }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password) {
      setError('请填写用户名和密码')
      return
    }
    setBusy(true)
    try {
      const res =
        mode === 'login'
          ? await api.login(username.trim(), password)
          : await api.register(username.trim(), password)
      onLogin(res.access_token)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'))
    setError('')
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{mode === 'login' ? '登录' : '注册'}</h2>
        <p className="muted subtitle">
          {mode === 'login' ? '登录后可查看并管理你的私有备忘' : '创建账号，开始记录你的备忘'}
        </p>
        <form onSubmit={submit}>
          <label className="field">
            <span>用户名</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="至少 3 个字符"
              autoFocus
            />
          </label>
          <label className="field">
            <span>密码</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 个字符"
            />
          </label>
          {error && <div className="error">{error}</div>}
          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? '处理中…' : mode === 'login' ? '登录' : '注册'}
          </button>
        </form>
        <div className="modal-footer">
          <button className="link" onClick={switchMode}>
            {mode === 'login' ? '没有账号？去注册' : '已有账号？去登录'}
          </button>
        </div>
      </div>
    </div>
  )
}
