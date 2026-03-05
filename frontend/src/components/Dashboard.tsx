import React, { useState, useEffect } from 'react'
import { useStore } from '../store'
import { TaskCard } from './TaskCard'
import { TaskDetail } from './TaskDetail'
import { NewTaskModal } from './NewTaskModal'
import type { TaskStatus } from '../types'

const COLUMNS: { status: TaskStatus; label: string; icon: React.ReactNode }[] = [
  {
    status: 'pending',
    label: 'Pending',
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  },
  {
    status: 'running',
    label: 'Running',
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  },
  {
    status: 'done',
    label: 'Done',
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  },
  {
    status: 'failed',
    label: 'Failed',
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  },
]

function PlusIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
}
function SunIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
}
function MoonIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
}
function RelayIcon() {
  return <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 7h9M3 7l3-3M3 7l3 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 13H8M17 13l-3-3M17 13l-3 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
}

export function Dashboard() {
  const { tasks, connected, selectedTaskId, selectTask } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    (localStorage.getItem('relay-theme') as 'light' | 'dark') ?? 'light'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('relay-theme', theme)
  }, [theme])

  const byStatus = (s: TaskStatus) => tasks.filter(t => t.status === s)
  const counts = { pending: byStatus('pending').length, running: byStatus('running').length, done: byStatus('done').length, failed: byStatus('failed').length }
  const selectedTask = tasks.find(t => t.id === selectedTaskId) ?? null

  return (
    <>
      <nav className="navbar">
        <div className="nav-logo">
          <RelayIcon />
          Relay
        </div>
        <div className="nav-sep" />
        <div className={`nav-status ${connected ? 'live' : ''}`}>
          <div className="nav-status-dot" />
          {connected ? 'Connected' : 'Offline'}
        </div>
        <div className="nav-space" />
        <div className="nav-stats">
          {[
            { key: 'pending', label: counts.pending },
            { key: 'running', label: counts.running, cls: 'running' },
            { key: 'done',    label: counts.done },
            { key: 'failed',  label: counts.failed, cls: 'failed' },
          ].map(s => (
            <div key={s.key} className={`stat-chip ${s.cls ?? ''} ${(s.label ?? 0) > 0 ? 'has-items' : ''}`}>
              {COLUMNS.find(c => c.status === s.key)?.icon}
              {s.label}
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <PlusIcon /> New Task
        </button>
        <button className="btn-theme" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
      </nav>

      <div className="board-wrap">
        <div className={`board ${selectedTask ? 'drawer-open' : ''}`}>
          {tasks.length === 0 ? (
            <div className="board-empty">
              <div className="board-empty-inner">
                <div className="board-empty-icon"><RelayIcon /></div>
                <h3>No tasks yet</h3>
                <p>Create a task and let the agent handle it — commit or PR, your call.</p>
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                  <PlusIcon /> New Task
                </button>
              </div>
            </div>
          ) : (
            COLUMNS.map(col => {
              const colTasks = byStatus(col.status)
              return (
                <div key={col.status} className={`col col-${col.status}`}>
                  <div className="col-header">
                    <span className="col-icon">{col.icon}</span>
                    <span className="col-title">{col.label}</span>
                    <span className="col-badge">{colTasks.length}</span>
                  </div>
                  <div className="col-body">
                    {colTasks.length === 0
                      ? <div className="col-empty">No tasks</div>
                      : colTasks.map(task => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            selected={task.id === selectedTaskId}
                            onClick={() => selectTask(task.id === selectedTaskId ? null : task.id)}
                          />
                        ))
                    }
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className={`drawer ${selectedTask ? 'open' : ''}`}>
          {selectedTask && <TaskDetail task={selectedTask} onClose={() => selectTask(null)} />}
        </div>
      </div>

      {showModal && <NewTaskModal onClose={() => setShowModal(false)} />}
    </>
  )
}
