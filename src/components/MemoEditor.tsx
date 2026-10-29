import { useState } from 'react'
import { api } from '../api'
import type { Memo } from '../types'

interface Props {
  memo: Memo | null
  onClose: () => void
  onSaved: () => void
}

export default function MemoEditor({ memo, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(memo?.title ?? '')
  const [content, setContent] = useState(memo?.content ?? '')
  const [isPublic, setIsPublic] = useState(memo?.is_public ?? false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!title.trim()) {
      setError('标题不能为空')
      return
    }
    setBusy(true)
    try {
      const payload = { title: title.trim(), content, is_public: isPublic }
      if (memo) {
        await api.updateMemo(memo.id, payload)
      } else {
        await api.createMemo(payload)
      }
      onSaved()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="editor">
      <form onSubmit={submit}>
        <div className="editor-head">
          <h2>{memo ? '编辑备忘' : '新建备忘'}</h2>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            取消
          </button>
        </div>
        <label className="field">
          <span>标题</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="备忘标题"
            autoFocus
          />
        </label>
        <label className="field">
          <span>内容</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下备忘内容…"
            rows={5}
          />
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          <span>
            公开此备忘
            <small>公开后所有访客（无需登录）都能看到</small>
          </span>
        </label>
        {error && <div className="error">{error}</div>}
        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? '保存中…' : '保存'}
        </button>
      </form>
    </div>
  )
}
