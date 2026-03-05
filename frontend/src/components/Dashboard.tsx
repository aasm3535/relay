import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { TaskCard } from './TaskCard'
import { TaskDetail } from './TaskDetail'
import { NewTaskModal } from './NewTaskModal'
import type { TaskStatus } from '../types'
import {
  LayoutGrid,
  List,
  Plus,
  Clock,
  Loader,
  CheckCircle2,
  XCircle,
  Sun,
  Moon,
  Settings,
  Inbox,
  Workflow,
} from 'lucide-react'

type ViewMode = 'board' | 'list'

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'pending', label: 'Pending' },
  { status: 'running', label: 'In Progress' },
  { status: 'done',    label: 'Done' },
  { status: 'failed',  label: 'Failed' },
]

export function Dashboard() {
  const { tasks, connected, selectedTaskId, selectTask } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [view, setView] = useState<ViewMode>(() =>
    (localStorage.getItem('relay-view') as ViewMode) ?? 'board'
  )
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    (localStorage.getItem('relay-theme') as 'light' | 'dark') ?? 'light'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('relay-theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('relay-view', view)
  }, [view])

  const byStatus = (s: TaskStatus) => tasks.filter(t => t.status === s)
  const selectedTask = tasks.find(t => t.id === selectedTaskId) ?? null

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Workflow size={18} />
          Relay
        </div>

        <button className="btn-new-task" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          New Task
        </button>

        <div className="sidebar-section-label">Views</div>
        <button
          className={`sidebar-item ${view === 'board' && !selectedTask ? 'active' : ''}`}
          onClick={() => { setView('board'); selectTask(null) }}
        >
          <LayoutGrid size={16} />
          Board
        </button>
        <button
          className={`sidebar-item ${view === 'list' && !selectedTask ? 'active' : ''}`}
          onClick={() => { setView('list'); selectTask(null) }}
        >
          <List size={16} />
          List
        </button>

        <div className="sidebar-section-label">Status</div>
        {COLUMNS.map(col => {
          const count = byStatus(col.status).length
          const Icon = col.status === 'pending' ? Clock
            : col.status === 'running' ? Loader
            : col.status === 'done' ? CheckCircle2
            : XCircle
          return (
            <div key={col.status} className="sidebar-item">
              <Icon size={16} />
              {col.label}
              {count > 0 && <span className="sidebar-item-count">{count}</span>}
            </div>
          )
        })}

        <div className="sidebar-space" />

        <div className="sidebar-footer">
          <button
            className="sidebar-item"
            onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </button>
          <div className="sidebar-item">
            <Settings size={16} />
            Settings
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        {selectedTask ? (
          /* Task Detail Page */
          <TaskDetail task={selectedTask} onClose={() => selectTask(null)} />
        ) : (
          /* Board / List View */
          <>
            <header className="main-header">
              <span className="main-title">{view === 'board' ? 'Board' : 'List'}</span>
              <div className="main-header-sep" />
              <span className="main-header-count">{tasks.length} tasks</span>
              <div className="main-header-space" />
              <div className={`ws-status ${connected ? 'live' : ''}`}>
                <div className="ws-dot" />
                {connected ? 'Live' : 'Offline'}
              </div>
            </header>

            <div className="board-container">
              {tasks.length === 0 ? (
                <div className="board-empty">
                  <div className="board-empty-inner">
                    <div className="board-empty-icon">
                      <Inbox size={22} />
                    </div>
                    <h3>No tasks yet</h3>
                    <p>Create your first task and let an AI agent handle the implementation.</p>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                      <Plus size={15} /> New Task
                    </button>
                  </div>
                </div>
              ) : view === 'board' ? (
                <div className="board">
                  {COLUMNS.map(col => {
                    const colTasks = byStatus(col.status)
                    return (
                      <div key={col.status} className="column">
                        <div className="column-header">
                          <div className={`column-dot ${col.status}`} />
                          <span className="column-name">{col.label}</span>
                          <span className="column-count">{colTasks.length}</span>
                        </div>
                        <div className="column-body">
                          {colTasks.length === 0 ? (
                            <div className="column-empty">No tasks</div>
                          ) : (
                            colTasks.map(task => (
                              <TaskCard
                                key={task.id}
                                task={task}
                                selected={false}
                                onClick={() => selectTask(task.id)}
                              />
                            ))
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="list-view">
                  {COLUMNS.map(col => {
                    const colTasks = byStatus(col.status)
                    if (colTasks.length === 0) return null
                    return (
                      <div key={col.status} className="list-group">
                        <div className="list-group-header">
                          <div className={`column-dot ${col.status}`} />
                          <span className="list-group-name">{col.label}</span>
                          <span className="list-group-count">{colTasks.length}</span>
                        </div>
                        <div className="list-group-items">
                          {colTasks.map(task => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              selected={false}
                              onClick={() => selectTask(task.id)}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {showModal && <NewTaskModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
