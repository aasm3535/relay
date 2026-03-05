import type { Task } from '../types'
import { clsx } from 'clsx'

interface Props {
  task: Task
  selected: boolean
  onClick: () => void
}

const statusLabel: Record<string, string> = {
  pending: 'Pending',
  running: 'Running',
  done: 'Done',
  failed: 'Failed',
}

export function TaskCard({ task, selected, onClick }: Props) {
  return (
    <div
      className={clsx('task-card', selected && 'task-card-selected')}
      onClick={onClick}
    >
      <div className="task-card-header">
        <span className="task-title">{task.title}</span>
        <span className={clsx('status-dot', `status-dot-${task.status}`)} />
      </div>
      <div className="task-card-meta">
        <span className={clsx('badge', `badge-${task.status}`)}>
          {statusLabel[task.status]}
        </span>
        <span className="badge badge-agent">{task.agent}</span>
        <span className="badge badge-mode">{task.mode}</span>
      </div>
      <div className="task-repo">{task.repo_path}</div>
    </div>
  )
}
