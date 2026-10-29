import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import type { Memo, User } from '../types'
import MemoEditor from './MemoEditor'

interface Props {
  user: User | null
  onRequireAuth: () => void
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function MemoBoard({ user, onRequireAuth }: Props) {
  const [memos, setMemos] = useState<Memo[]>([])
  const [editing, setEditing] = useState<Memo | null>(null)
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      setMemos(await api.listMemos())
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load, user])

  const handleCreate = () => {
    if (!user) {
      onRequireAuth()
      return
    }
    setEditing(null)
    setCreating(true)
  }

  const handleDelete = async (memo: Memo) => {
    if (!window.confirm(`确定删除备忘「${memo.title}」吗？`)) return
    try {
      await api.deleteMemo(memo.id)
      await load()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleSaved = async () => {
    setCreating(false)
    setEditing(null)
    await load()
  }

  const ownCount = memos.filter((m) => m.owner_id === user?.id).length
  const publicCount = memos.filter((m) => m.is_public).length

  return (
    <div className="board">
      <div className="board-head">
        <div>
          <h1>我的备忘</h1>
          <p className="muted">
            公开备忘 {publicCount} 条
            {user ? ` · 我的备忘 ${ownCount} 条` : ' · 登录后查看私有备忘'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>
          + 新建备忘
        </button>
      </div>

      {!user && (
        <div className="notice">
          💡 当前为游客模式，仅展示「公开」备忘。登录后可创建并查看你自己的「私有」备忘。
        </div>
      )}

      {error && <div className="error">{error}</div>}

      {(creating || editing) && (
        <MemoEditor
          memo={editing}
          onClose={() => {
            setCreating(false)
            setEditing(null)
          }}
          onSaved={handleSaved}
        />
      )}

      {loading ? (
        <div className="muted center-screen">加载中…</div>
      ) : memos.length === 0 ? (
        <div className="empty">还没有备忘，点击右上角「新建备忘」开始记录。</div>
      ) : (
        <div className="grid">
          {memos.map((memo) => {
            const isOwner = user !== null && memo.owner_id === user.id
            return (
              <article className="memo-card" key={memo.id}>
                <div className="memo-head">
                  <h3>{memo.title}</h3>
                  <span className={`badge ${memo.is_public ? 'badge-public' : 'badge-private'}`}>
                    {memo.is_public ? '公开' : '私有'}
                  </span>
                </div>
                <p className="memo-content">{memo.content || '（无内容）'}</p>
                <div className="memo-meta">
                  <span>{isOwner ? '我' : `用户 #${memo.owner_id}`}</span>
                  <span>{formatTime(memo.updated_at)}</span>
                </div>
                {isOwner && (
                  <div className="memo-actions">
                    <button className="link" onClick={() => setEditing(memo)}>
                      编辑
                    </button>
                    <button className="link danger" onClick={() => handleDelete(memo)}>
                      删除
                    </button>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
