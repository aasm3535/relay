import { useStore } from '../store'
import type { Task } from '../types'

interface Props {
  task: Task
  onClose: () => void
}

const statusClass: Record<string, string> = {
  pending: 'sb-pending',
  running: 'sb-running',
  done:    'sb-done',
  failed:  'sb-failed',
}

function duration(task: Task): string | null {
  if (!task.started_at) return null
  const end = task.finished_at ? new Date(task.finished_at) : new Date()
  const s = Math.max(0, Math.floor((end.getTime() - new Date(task.started_at).getTime()) / 1000))
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

export function TaskDetail({ task, onClose }: Props) {
  const { deleteTask, retryTask } = useStore()

  const handleDelete = async () => {
    await deleteTask(task.id)
    onClose()
  }

  const dur = duration(task)

  return (
    <>
      <div className="drawer-header">
        <div className="drawer-title-row">
          <h2 className="drawer-title">{task.title}</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="drawer-meta">
          <span className={`status-badge ${statusClass[task.status]}`}>{task.status}</span>
          <span className="badge badge-agent">{task.agent}</span>
          <span className={`badge ${task.mode === 'pr' ? 'badge-pr' : 'badge-auto'}`}>
            {task.mode === 'pr' ? 'Pull Request' : 'Auto commit'}
          </span>
          {dur && <span className="duration-chip">{dur}</span>}
        </div>
      </div>

      <div className="drawer-body">
        <div>
          <div className="section-label">Repository</div>
          <code className="repo-code">{task.repo_path}</code>
        </div>

        {task.description && (
          <div>
            <div className="section-label">Description</div>
            <p className="detail-desc">{task.description}</p>
          </div>
        )}

        <div>
          <div className="section-label">Output</div>
          <pre className="output-panel">
            {task.output
              ? task.output
              : <span className="output-empty">{task.status === 'pending' ? 'Waiting to start…' : 'No output yet.'}</span>}
          </pre>
        </div>

        {task.error && (
          <div>
            <div className="section-label section-label-error">Error</div>
            <pre className="output-panel output-panel-error">{task.error}</pre>
          </div>
        )}
      </div>

      <div className="drawer-actions">
        {task.status === 'failed' && (
          <button className="btn btn-primary" onClick={() => retryTask(task.id)}>
            Retry
          </button>
        )}
        <button className="btn btn-ghost btn-danger" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </>
  )
}
