import { useEffect } from 'react'
import { useStore } from './store'
import { Dashboard } from './components/Dashboard'
import './index.css'

export default function App() {
  const { fetchTasks, connectWS } = useStore()

  useEffect(() => {
    fetchTasks()
    connectWS()
  }, [])

  return <Dashboard />
}
