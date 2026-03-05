import { useState } from 'react'
import { useStore } from '../store'
import { X, Bot, GitBranch, GitCommitHorizontal, FolderGit2 } from 'lucide-react'
import { clsx } from 'clsx'
import type { TaskAgent, TaskMode } from '../types'

interface Props { onClose: () => void }

const agents: { value: TaskAgent; label: string; desc: string }[] = [
  { value: 'claude', label: 'Claude Code', desc: 'Anthropic' },
  { value: 'codex',  label: 'Codex',       desc: 'OpenAI' },
]

const modes: { value: TaskMode; label: string; desc: string; icon: typeof GitBranch }[] = [
  { value: 'auto', label: 'Auto commit', desc: 'Commits and pushes to current branch', icon: GitCommitHorizontal },
  { value: 'pr',   label: 'Pull Request', desc: 'Creates a branch and opens a PR',     icon: GitBranch },
]

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
          <button className="btn btn-ghost" onClick={onClose}><X size={16} /></button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="form-field">
            <input
              className="form-input modal-title-input"
              placeholder="Task title"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-field">
            <textarea
              className="form-input modal-desc-input"
              placeholder="Add description..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="modal-divider" />

          <div className="form-field">
            <label className="form-label">
              <FolderGit2 size={13} />
              Repository
            </label>
            <input
              className="form-input form-input-mono"
              placeholder="C:\Users\you\projects\my-app"
              value={form.repo_path}
              onChange={e => set('repo_path', e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">
              <Bot size={13} />
              Agent
            </label>
            <div className="option-group">
              {agents.map(a => (
                <button
                  key={a.value}
                  type="button"
                  className={clsx('option-card', form.agent === a.value && 'active')}
                  onClick={() => set('agent', a.value)}
                >
                  <span className="option-card-label">{a.label}</span>
                  <span className="option-card-desc">{a.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">
              <GitBranch size={13} />
              Mode
            </label>
            <div className="option-group">
              {modes.map(m => {
                const Icon = m.icon
                return (
                  <button
                    key={m.value}
                    type="button"
                    className={clsx('option-card', form.mode === m.value && 'active')}
                    onClick={() => set('mode', m.value)}
                  >
                    <span className="option-card-label">
                      <Icon size={13} />
                      {m.label}
                    </span>
                    <span className="option-card-desc">{m.desc}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
