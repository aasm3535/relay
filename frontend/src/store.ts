import { create } from 'zustand'
import type { Task, WSMessage } from './types'

const API = 'http://localhost:8080'
const WS_URL = 'ws://localhost:8080/ws'

interface RelayStore {
  tasks: Task[]
  connected: boolean
  selectedTaskId: string | null
  fetchTasks: () => Promise<void>
  createTask: (data: Omit<Task, 'id' | 'status' | 'output' | 'error' | 'created_at' | 'updated_at' | 'started_at' | 'finished_at'>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  retryTask: (id: string) => Promise<void>
  selectTask: (id: string | null) => void
  connectWS: () => void
}

export const useStore = create<RelayStore>((set, get) => ({
  tasks: [],
  connected: false,
  selectedTaskId: null,

  selectTask: (id) => set({ selectedTaskId: id }),

  fetchTasks: async () => {
    const res = await fetch(`${API}/api/tasks`)
    const tasks: Task[] = await res.json()
    set({ tasks })
  },

  createTask: async (data) => {
    await fetch(`${API}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  },

  deleteTask: async (id) => {
    await fetch(`${API}/api/tasks/${id}`, { method: 'DELETE' })
  },

  retryTask: async (id) => {
    await fetch(`${API}/api/tasks/${id}/retry`, { method: 'POST' })
  },

  connectWS: () => {
    const ws = new WebSocket(WS_URL)

    ws.onopen = () => set({ connected: true })
    ws.onclose = () => {
      set({ connected: false })
      setTimeout(() => get().connectWS(), 2000)
    }

    ws.onmessage = (e) => {
      const msg: WSMessage = JSON.parse(e.data)
      const { tasks } = get()

      if (msg.event === 'task:created') {
        set({ tasks: [msg.payload as Task, ...tasks] })
      } else if (msg.event === 'task:updated') {
        const updated = msg.payload as Task
        set({ tasks: tasks.map(t => t.id === updated.id ? updated : t) })
      } else if (msg.event === 'task:deleted') {
        set({ tasks: tasks.filter(t => t.id !== msg.payload.id) })
      } else if (msg.event === 'task:output') {
        const { id, chunk } = msg.payload
        set({
          tasks: tasks.map(t =>
            t.id === id ? { ...t, output: t.output + chunk } : t
          )
        })
      }
    }
  },
}))
