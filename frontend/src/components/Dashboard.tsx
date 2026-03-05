import { useState } from 'react'
import { useStore } from '../store'
import { TaskCard } from './TaskCard'
import { TaskDetail } from './TaskDetail'
import { NewTaskModal } from './NewTaskModal'

export function Dashboard() {
  const { tasks, connected, selectedTaskId, selectTask } = useStore()
  const [showModal, setShowModal] = useState(false)

  const selectedTask = tasks.find(t => t.id === selectedTaskId) ?? null

  const counts = {
    running: tasks.filter(t => t.status === 'running').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    done: tasks.filter(t => t.status === 'done').length,
    failed: tasks.filter(t => t.status === 'failed').length,
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">⟳</span>
            <span className="logo-text">Relay</span>
          </div>
          <div className={`conn-badge ${connected ? 'conn-live' : 'conn-off'}`}>
            <span className="conn-dot" />
            {connected ? 'Live' : 'Offline'}
          </div>
        </div>

        <div className="metrics">
          <div className="metric">
            <span className="metric-val">{counts.running}</span>
            <span className="metric-lbl">Running</span>
          </div>
          <div className="metric">
            <span className="metric-val">{counts.pending}</span>
            <span className="metric-lbl">Pending</span>
          </div>
          <div className="metric">
            <span className="metric-val">{counts.done}</span>
            <span className="metric-lbl">Done</span>
          </div>
          <div className="metric">
            <span className="metric-val metric-fail">{counts.failed}</span>
            <span className="metric-lbl">Failed</span>
          </div>
        </div>

        <button className="btn-new" onClick={() => setShowModal(true)}>
          + New Task
        </button>

        <div className="task-list">
          {tasks.length === 0 && (
            <div className="empty-state">
              <p>No tasks yet.</p>
              <p>Create one to get started.</p>
            </div>
          )}
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              selected={task.id === selectedTaskId}
              onClick={() => selectTask(task.id === selectedTaskId ? null : task.id)}
            />
          ))}
        </div>
      </aside>

      <main className="main">
        {selectedTask ? (
          <TaskDetail task={selectedTask} onClose={() => selectTask(null)} />
        ) : (
          <div className="main-empty">
            <div className="main-empty-inner">
              <div className="main-empty-icon">⟳</div>
              <h2>Relay</h2>
              <p>Select a task to view details, or create a new one.</p>
              <button className="btn-new" onClick={() => setShowModal(true)}>
                + New Task
              </button>
            </div>
          </div>
        )}
      </main>

      {showModal && <NewTaskModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
