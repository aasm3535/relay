import { clsx } from 'clsx'
import { GitBranch, Bot } from 'lucide-react'
import type { Task } from '../types'

interface Props {
  task: Task
  selected: boolean
  onClick: () => void
}

export function TaskCard({ task, selected, onClick }: Props) {
  return (
    <div className={clsx('task-card', selected && 'selected')} onClick={onClick}>
      <div className="card-title">{task.title}</div>

      <div className="card-meta">
        <span className="card-tag">
          <Bot size={12} />
          {task.agent}
        </span>
        <span className="card-dot" />
        <span className="card-tag">
          {task.mode === 'pr' ? <GitBranch size={12} /> : null}
          {task.mode === 'pr' ? 'PR' : 'Auto'}
        </span>
      </div>

      {task.status === 'running' && (
        <div className="card-progress">
          <span className="card-progress-label">Running</span>
          <div className="progress-track">
            <div className="progress-bar" />
          </div>
        </div>
      )}
    </div>
  )
}
