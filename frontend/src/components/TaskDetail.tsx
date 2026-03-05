import { useStore } from '../store'
import type { Task } from '../types'
import { clsx } from 'clsx'

interface Props {
  task: Task
  onClose: () => void
}

export function TaskDetail({ task, onClose }: Props) {
  const { deleteTask, retryTask } = useStore()

  const handleDelete = async () => {
    await deleteTask(task.id)
    onClose()
  }

  const handleRetry = async () => {
    await retryTask(task.id)
  }

  const duration = () => {
    if (!task.started_at) return null
    const end = task.finished_at ? new Date(task.finished_at) : new Date()
    const secs = Math.floor((end.getTime() - new Date(task.started_at).getTime()) / 1000)
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}m ${s}s`
  }

  return (
    <div className="detail">
      <div className="detail-header">
        <div className="detail-title-row">
          <h2 className="detail-title">{task.title}</h2>
          <button className="btn-icon" onClick={onClose} title="Close">✕</button>
        </div>
        <div className="detail-meta">
          <span className={clsx('badge', `badge-${task.status}`)}>{task.status}</span>
          <span className="badge badge-agent">{task.agent}</span>
          <span className="badge badge-mode">{task.mode === 'pr' ? 'Pull Request' : 'Auto commit'}</span>
          {duration() && <span className="badge badge-neutral">{duration()}</span>}
        </div>
      </div>

      <div className="detail-body">
        <section className="detail-section">
          <h3 className="section-label">Repository</h3>
          <code className="repo-code">{task.repo_path}</code>
        </section>

        {task.description && (
          <section className="detail-section">
            <h3 className="section-label">Description</h3>
            <p className="detail-desc">{task.description}</p>
          </section>
        )}

        <section className="detail-section">
          <h3 className="section-label">Output</h3>
          <pre className="output-panel">
            {task.output || (task.status === 'pending' ? 'Waiting to start...' : 'No output yet.')}
          </pre>
        </section>

        {task.error && (
          <section className="detail-section">
            <h3 className="section-label section-label-error">Error</h3>
            <pre className="output-panel output-panel-error">{task.error}</pre>
          </section>
        )}
      </div>

      <div className="detail-actions">
        {task.status === 'failed' && (
          <button className="btn btn-primary" onClick={handleRetry}>
            Retry
          </button>
        )}
        <button className="btn btn-danger" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </div>
  )
}
