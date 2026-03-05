import { useState } from 'react'
import { useStore } from '../store'
import type { TaskAgent, TaskMode } from '../types'

interface Props {
  onClose: () => void
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
    try {
      await createTask(form)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Task</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Title *</span>
            <input
              className="input"
              placeholder="Fix the login bug"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              autoFocus
            />
          </label>

          <label className="field">
            <span className="field-label">Description</span>
            <textarea
              className="input input-textarea"
              placeholder="Optional details for the agent..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={3}
            />
          </label>

          <label className="field">
            <span className="field-label">Repository path *</span>
            <input
              className="input input-mono"
              placeholder="/Users/you/projects/my-app"
              value={form.repo_path}
              onChange={e => set('repo_path', e.target.value)}
            />
          </label>

          <div className="field-row">
            <label className="field field-half">
              <span className="field-label">Agent</span>
              <select className="input" value={form.agent} onChange={e => set('agent', e.target.value)}>
                <option value="claude">Claude Code</option>
                <option value="codex">Codex</option>
              </select>
            </label>

            <label className="field field-half">
              <span className="field-label">Mode</span>
              <select className="input" value={form.mode} onChange={e => set('mode', e.target.value)}>
                <option value="auto">Auto commit + push</option>
                <option value="pr">Pull Request</option>
              </select>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
