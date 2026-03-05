import { clsx } from 'clsx'
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

      <div className="card-tags">
        <span className="tag tag-agent">{task.agent}</span>
        <span className={clsx('tag', task.mode === 'pr' && 'tag-pr')}>
          {task.mode === 'pr' ? 'PR' : 'Auto'}
        </span>
      </div>

      <div className="card-repo">{task.repo_path}</div>

      {task.status === 'running' && (
        <div className="card-progress">
          <span>Working…</span>
          <div className="progress-bar">
            <div className="progress-fill" />
          </div>
        </div>
      )}
    </div>
  )
}
