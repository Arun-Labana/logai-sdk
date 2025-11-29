import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import AppDetail from './pages/AppDetail'
import Scan from './pages/Scan'
import ClusterDetail from './pages/ClusterDetail'
import Settings from './pages/Settings'
import { isSupabaseConfigured } from './lib/supabase'

function App() {
  const [configured, setConfigured] = useState(true)

  useEffect(() => {
    setConfigured(isSupabaseConfigured())
  }, [])

  if (!configured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-logai-bg-primary">
        <div className="max-w-md p-8 bg-logai-bg-card rounded-xl border border-logai-border text-center">
          <h1 className="text-2xl font-bold gradient-text mb-4">LogAI Dashboard</h1>
          <p className="text-logai-text-secondary mb-6">
            Supabase is not configured. Please set the following environment variables:
          </p>
          <div className="bg-logai-bg-secondary p-4 rounded-lg text-left font-mono text-sm mb-6">
            <p className="text-logai-accent">VITE_SUPABASE_URL=https://xxx.supabase.co</p>
            <p className="text-logai-accent">VITE_SUPABASE_ANON_KEY=your-anon-key</p>
          </div>
          <p className="text-logai-text-secondary text-sm">
            Create a <code className="text-logai-accent">.env</code> file in the dashboard directory with these values.
          </p>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/app/:appId" element={<AppDetail />} />
        <Route path="/app/:appId/scan" element={<Scan />} />
        <Route path="/cluster/:clusterId" element={<ClusterDetail />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App

