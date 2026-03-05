import { useStore } from '../store'
import type { Task } from '../types'

interface Props {
  task: Task
  onClose: () => void
}

function CloseIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}

const statusCls: Record<string, string> = {
  pending: '',
  running: 'st-running',
  done:    'st-done',
  failed:  'st-failed',
}

function elapsed(task: Task) {
  if (!task.started_at) return null
  const end = task.finished_at ? new Date(task.finished_at) : new Date()
  const s = Math.max(0, Math.floor((end.getTime() - new Date(task.started_at).getTime()) / 1000))
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

export function TaskDetail({ task, onClose }: Props) {
  const { deleteTask, retryTask } = useStore()

  return (
    <>
      <div className="drawer-header">
        <div className="drawer-top">
          <h2 className="drawer-title">{task.title}</h2>
          <button className="btn-icon-bare" onClick={onClose}><CloseIcon /></button>
        </div>
        <div className="drawer-tags">
          <span className={`status-tag ${statusCls[task.status]}`}>{task.status}</span>
          <span className="tag tag-agent">{task.agent}</span>
          <span className={`tag ${task.mode === 'pr' ? 'tag-pr' : ''}`}>
            {task.mode === 'pr' ? 'Pull Request' : 'Auto commit'}
          </span>
          {elapsed(task) && <span className="tag">{elapsed(task)}</span>}
        </div>
      </div>

      <div className="drawer-body">
        <div className="field-group">
          <div className="field-group-label">Repository</div>
          <code className="code-block">{task.repo_path}</code>
        </div>

        {task.description && (
          <div className="field-group">
            <div className="field-group-label">Description</div>
            <p className="desc-text">{task.description}</p>
          </div>
        )}

        <div className="field-group">
          <div className="field-group-label">Output</div>
          <pre className="output-block">
            {task.output
              ? task.output
              : <span className="output-empty">{task.status === 'pending' ? 'Waiting to start…' : 'No output yet.'}</span>
            }
          </pre>
        </div>

        {task.error && (
          <div className="field-group">
            <div className="field-group-label error">Error</div>
            <pre className="output-block error-block">{task.error}</pre>
          </div>
        )}
      </div>

      <div className="drawer-footer">
        {task.status === 'failed' && (
          <button className="btn-primary" onClick={() => retryTask(task.id)}>Retry</button>
        )}
        <button className="btn-danger" onClick={async () => { await deleteTask(task.id); onClose() }}>
          Delete
        </button>
      </div>
    </>
  )
}
