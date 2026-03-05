import type { Task } from '../types'
import { clsx } from 'clsx'

interface Props {
  task: Task
  selected: boolean
  onClick: () => void
}

export function TaskCard({ task, selected, onClick }: Props) {
  return (
    <div className={clsx('task-card', selected && 'selected')} onClick={onClick}>
      <div className="card-title">{task.title}</div>

      <div className="card-badges">
        <span className="badge badge-agent">{task.agent}</span>
        <span className={clsx('badge', task.mode === 'pr' ? 'badge-pr' : 'badge-auto')}>
          {task.mode === 'pr' ? 'PR' : 'Auto'}
        </span>
      </div>

      <div className="card-repo">{task.repo_path}</div>

      {task.status === 'running' && (
        <div className="card-running-indicator">
          <span>Working</span>
          <div className="card-running-bar">
            <div className="card-running-bar-fill" />
          </div>
        </div>
      )}
    </div>
  )
}
