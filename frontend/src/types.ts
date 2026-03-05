export type TaskStatus = 'pending' | 'running' | 'done' | 'failed'
export type TaskAgent = 'claude' | 'codex'
export type TaskMode = 'auto' | 'pr'

export interface Task {
  id: string
  title: string
  description: string
  repo_path: string
  agent: TaskAgent
  mode: TaskMode
  status: TaskStatus
  output: string
  error: string
  created_at: string
  updated_at: string
  started_at: string | null
  finished_at: string | null
}

export interface WSMessage {
  event: 'task:created' | 'task:updated' | 'task:deleted' | 'task:output'
  payload: any
}
