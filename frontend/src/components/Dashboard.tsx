import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { TaskCard } from './TaskCard'
import { TaskDetail } from './TaskDetail'
import { NewTaskModal } from './NewTaskModal'
import type { TaskStatus } from '../types'

function RelayLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 7h9M3 7l3-3M3 7l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 13H8M17 13l-3-3M17 13l-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'pending', label: 'Pending' },
  { status: 'running', label: 'Running' },
  { status: 'done',    label: 'Done'    },
  { status: 'failed',  label: 'Failed'  },
]

export function Dashboard() {
  const { tasks, connected, selectedTaskId, selectTask } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('relay-theme') as 'dark' | 'light') ?? 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('relay-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

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
          <RelayLogo />
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
        <button className="btn-theme" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
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
                    <div className="col-accent" />
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
