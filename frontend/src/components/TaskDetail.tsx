import { useEffect, useRef } from 'react'
import { useStore } from '../store'
import type { Task } from '../types'
import {
  ArrowLeft,
  RotateCcw,
  Trash2,
  Clock,
  CheckCircle2,
  Loader,
  XCircle,
  Bot,
  GitBranch,
  GitCommitHorizontal,
  FolderGit2,
  Timer,
  Calendar,
  Terminal,
  AlertTriangle,
} from 'lucide-react'

interface Props {
  task: Task
  onClose: () => void
}

const statusConfig: Record<string, { cls: string; icon: typeof Clock; label: string }> = {
  pending: { cls: 'badge-pending',  icon: Clock,        label: 'Pending' },
  running: { cls: 'badge-running',  icon: Loader,       label: 'In Progress' },
  done:    { cls: 'badge-done',     icon: CheckCircle2, label: 'Done' },
  failed:  { cls: 'badge-failed',   icon: XCircle,      label: 'Failed' },
}

function elapsed(task: Task) {
  if (!task.started_at) return null
  const end = task.finished_at ? new Date(task.finished_at) : new Date()
  const s = Math.max(0, Math.floor((end.getTime() - new Date(task.started_at).getTime()) / 1000))
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function TaskDetail({ task, onClose }: Props) {
  const { deleteTask, retryTask } = useStore()
  const status = statusConfig[task.status]
  const StatusIcon = status.icon
  const outputRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    if (outputRef.current && task.status === 'running') {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [task.output, task.status])

  return (
    <div className="task-page">
      <div className="task-page-header">
        <button className="btn btn-ghost task-back-btn" onClick={onClose}>
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="task-page-header-space" />
        <div className="task-page-actions">
          {task.status === 'failed' && (
            <button className="btn btn-secondary" onClick={() => retryTask(task.id)}>
              <RotateCcw size={14} /> Retry
            </button>
          )}
          <button
            className="btn btn-danger"
            onClick={async () => { await deleteTask(task.id); onClose() }}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      <div className="task-page-body">
        <div className="task-page-content">
          {/* Title + Status */}
          <div className="task-page-title-row">
            <span className={`badge ${status.cls}`}>
              <StatusIcon size={12} />
              {status.label}
            </span>
            <h1 className="task-page-title">{task.title}</h1>
            {task.description && (
              <p className="task-page-desc">{task.description}</p>
            )}
          </div>

          {/* Properties */}
          <div className="task-props">
            <div className="task-prop">
              <span className="task-prop-label">
                <FolderGit2 size={14} />
                Repository
              </span>
              <code className="task-prop-value mono">{task.repo_path}</code>
            </div>
            <div className="task-prop">
              <span className="task-prop-label">
                <Bot size={14} />
                Agent
              </span>
              <span className="task-prop-value">{task.agent === 'claude' ? 'Claude Code' : 'Codex'}</span>
            </div>
            <div className="task-prop">
              <span className="task-prop-label">
                {task.mode === 'pr' ? <GitBranch size={14} /> : <GitCommitHorizontal size={14} />}
                Mode
              </span>
              <span className="task-prop-value">{task.mode === 'pr' ? 'Pull Request' : 'Auto commit'}</span>
            </div>
            <div className="task-prop">
              <span className="task-prop-label">
                <Calendar size={14} />
                Created
              </span>
              <span className="task-prop-value">{formatDate(task.created_at)}</span>
            </div>
            {elapsed(task) && (
              <div className="task-prop">
                <span className="task-prop-label">
                  <Timer size={14} />
                  Duration
                </span>
                <span className="task-prop-value">{elapsed(task)}</span>
              </div>
            )}
          </div>

          {/* Output */}
          <div className="task-output-section">
            <div className="task-output-header">
              <Terminal size={14} />
              <span>Output</span>
              {task.status === 'running' && (
                <span className="task-output-live">Live</span>
              )}
            </div>
            <pre
              ref={outputRef}
              className={`task-output-pre ${!task.output ? 'empty' : ''}`}
            >
              {task.output || (task.status === 'pending' ? 'Waiting to start...' : 'No output yet.')}
            </pre>
          </div>

          {/* Error */}
          {task.error && (
            <div className="task-output-section">
              <div className="task-output-header error">
                <AlertTriangle size={14} />
                <span>Error</span>
              </div>
              <pre className="task-output-pre error">{task.error}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
