import { useState } from 'react'
import { useStore } from '../store'
import { TaskCard } from './TaskCard'
import { TaskDetail } from './TaskDetail'
import { NewTaskModal } from './NewTaskModal'
import type { TaskStatus } from '../types'

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'pending', label: 'Pending' },
  { status: 'running', label: 'Running' },
  { status: 'done',    label: 'Done'    },
  { status: 'failed',  label: 'Failed'  },
]

export function Dashboard() {
  const { tasks, connected, selectedTaskId, selectTask } = useStore()
  const [showModal, setShowModal] = useState(false)

  const selectedTask = tasks.find(t => t.id === selectedTaskId) ?? null
  const drawerOpen = selectedTask !== null

  const byStatus = (status: TaskStatus) => tasks.filter(t => t.status === status)
  const counts = {
    pending: byStatus('pending').length,
    running: byStatus('running').length,
    done:    byStatus('done').length,
    failed:  byStatus('failed').length,
  }

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-logo">
          <div className="nav-logo-mark">R</div>
          Relay
        </div>
        <div className="nav-divider" />
        <div className={`nav-status ${connected ? 'live' : ''}`}>
          <div className="nav-status-dot" />
          {connected ? 'Connected' : 'Offline'}
        </div>
        <div className="nav-space" />
        <div className="nav-pill">
          <div className="nav-counts">
            <span className="nav-count nc-pending">
              <span className="nc-dot" />{counts.pending}
            </span>
            <span className="nav-count nc-running">
              <span className="nc-dot" />{counts.running}
            </span>
            <span className="nav-count nc-done">
              <span className="nc-dot" />{counts.done}
            </span>
            <span className="nav-count nc-failed">
              <span className="nc-dot" />{counts.failed}
            </span>
          </div>
          <button className="btn-new" onClick={() => setShowModal(true)}>
            + New Task
          </button>
        </div>
      </nav>

      {/* Board */}
      <div className="board-wrap">
        <div className={`board ${drawerOpen ? 'drawer-open' : ''}`}>
          {tasks.length === 0 ? (
            <div className="board-empty">
              <div className="board-empty-inner">
                <div className="board-empty-icon">⟳</div>
                <h3>No tasks yet</h3>
                <p>Create a task and let the agent handle it — commit or PR, your call.</p>
                <button className="btn-new" onClick={() => setShowModal(true)}>
                  + New Task
                </button>
              </div>
            </div>
          ) : (
            COLUMNS.map(col => {
              const colTasks = byStatus(col.status)
              return (
                <div key={col.status} className={`col col-${col.status}`}>
                  <div className="col-header">
                    <span className="col-title">{col.label}</span>
                    <span className="col-count">{colTasks.length}</span>
                    <div className="col-strip" />
                  </div>
                  <div className="col-body">
                    {colTasks.length === 0 ? (
                      <div className="col-empty">
                        <span className="col-empty-text">Empty</span>
                      </div>
                    ) : (
                      colTasks.map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          selected={task.id === selectedTaskId}
                          onClick={() => selectTask(task.id === selectedTaskId ? null : task.id)}
                        />
                      ))
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Drawer */}
        <div className={`drawer ${drawerOpen ? 'open' : ''}`}>
          {selectedTask && (
            <TaskDetail task={selectedTask} onClose={() => selectTask(null)} />
          )}
        </div>
      </div>

      {showModal && <NewTaskModal onClose={() => setShowModal(false)} />}
    </>
  )
}
