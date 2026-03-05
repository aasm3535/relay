import { useState } from 'react'
import { useStore } from '../store'
import type { TaskAgent, TaskMode } from '../types'

interface Props { onClose: () => void }

function CloseIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}

export function NewTaskModal({ onClose }: Props) {
  const { createTask } = useStore()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    repo_path: '',
    agent: 'claude' as TaskAgent,
    mode: 'auto' as TaskMode,
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.repo_path.trim()) return
    setLoading(true)
    try { await createTask(form); onClose() }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Task</h2>
          <button className="btn-icon-bare" onClick={onClose}><CloseIcon /></button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label">Title</label>
            <input className="form-input" placeholder="Fix the login redirect bug" value={form.title} onChange={e => set('title', e.target.value)} autoFocus />
          </div>

          <div className="form-field">
            <label className="form-label">Description</label>
            <textarea className="form-input" placeholder="Optional context for the agent…" value={form.description} onChange={e => set('description', e.target.value)} rows={3} />
          </div>

          <div className="form-field">
            <label className="form-label">Repository path</label>
            <input className="form-input form-input-mono" placeholder="/Users/you/projects/my-app" value={form.repo_path} onChange={e => set('repo_path', e.target.value)} />
          </div>

          <div className="form-row">
            <div className="form-field form-field-half">
              <label className="form-label">Agent</label>
              <select className="form-input" value={form.agent} onChange={e => set('agent', e.target.value)}>
                <option value="claude">Claude Code</option>
                <option value="codex">Codex</option>
              </select>
            </div>
            <div className="form-field form-field-half">
              <label className="form-label">Mode</label>
              <select className="form-input" value={form.mode} onChange={e => set('mode', e.target.value)}>
                <option value="auto">Auto commit + push</option>
                <option value="pr">Pull Request</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating…' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
