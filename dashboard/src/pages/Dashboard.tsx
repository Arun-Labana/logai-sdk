import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Server, 
  AlertTriangle, 
  Activity,
  ArrowRight,
  Trash2,
  Copy,
  Check
} from 'lucide-react'
import { 
  getApplications, 
  createApplication, 
  deleteApplication,
  getAppStats,
  Application 
} from '../lib/supabase'

interface AppWithStats extends Application {
  stats?: {
    total_logs: number
    error_logs: number
    cluster_count: number
    critical_count: number
    last_error: string | null
  }
}

export default function Dashboard() {
  const [apps, setApps] = useState<AppWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewApp, setShowNewApp] = useState(false)
  const [newAppName, setNewAppName] = useState('')
  const [newAppDesc, setNewAppDesc] = useState('')
  const [creating, setCreating] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  useEffect(() => {
    loadApps()
  }, [])

  async function loadApps() {
    try {
      const applications = await getApplications()
      
      // Load stats for each app
      const appsWithStats = await Promise.all(
        applications.map(async (app) => {
          try {
            const stats = await getAppStats(app.id)
            return { ...app, stats }
          } catch {
            return { ...app, stats: undefined }
          }
        })
      )
      
      setApps(appsWithStats)
    } catch (error) {
      console.error('Failed to load apps:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateApp() {
    if (!newAppName.trim()) return
    
    setCreating(true)
    try {
      await createApplication(newAppName, newAppDesc || undefined)
      setNewAppName('')
      setNewAppDesc('')
      setShowNewApp(false)
      loadApps()
    } catch (error) {
      console.error('Failed to create app:', error)
    } finally {
      setCreating(false)
    }
  }

  async function handleDeleteApp(id: string) {
    if (!confirm('Are you sure you want to delete this application? All logs and analysis will be lost.')) {
      return
    }
    
    try {
      await deleteApplication(id)
      loadApps()
    } catch (error) {
      console.error('Failed to delete app:', error)
    }
  }

  function copyApiKey(key: string) {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-logai-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-logai-text-primary">Dashboard</h1>
          <p className="text-logai-text-secondary mt-1">
            Manage your applications and monitor error health
          </p>
        </div>
        <button
          onClick={() => setShowNewApp(true)}
          className="flex items-center gap-2 px-4 py-2 bg-logai-accent text-black font-medium rounded-lg hover:bg-logai-accent-dim transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Application
        </button>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Applications"
          value={apps.length}
          icon={<Server className="w-5 h-5" />}
        />
        <StatCard
          label="Total Errors"
          value={apps.reduce((sum, app) => sum + (app.stats?.error_logs || 0), 0)}
          icon={<AlertTriangle className="w-5 h-5" />}
          variant="warning"
        />
        <StatCard
          label="Error Clusters"
          value={apps.reduce((sum, app) => sum + (app.stats?.cluster_count || 0), 0)}
          icon={<Activity className="w-5 h-5" />}
        />
        <StatCard
          label="Critical Issues"
          value={apps.reduce((sum, app) => sum + (app.stats?.critical_count || 0), 0)}
          icon={<AlertTriangle className="w-5 h-5" />}
          variant="error"
        />
      </div>

      {/* Applications list */}
      {apps.length === 0 ? (
        <div className="bg-logai-bg-card border border-logai-border rounded-xl p-12 text-center">
          <Server className="w-12 h-12 text-logai-text-secondary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-logai-text-primary mb-2">
            No applications yet
          </h3>
          <p className="text-logai-text-secondary mb-6">
            Add your first application to start collecting and analyzing logs.
          </p>
          <button
            onClick={() => setShowNewApp(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-logai-accent text-black font-medium rounded-lg hover:bg-logai-accent-dim transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Application
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              onDelete={() => handleDeleteApp(app.id)}
              onCopyKey={() => copyApiKey(app.api_key)}
              copied={copiedKey === app.api_key}
            />
          ))}
        </div>
      )}

      {/* New app modal */}
      {showNewApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-logai-bg-card border border-logai-border rounded-xl p-6 w-full max-w-md animate-fade-in">
            <h2 className="text-xl font-bold text-logai-text-primary mb-4">
              Add New Application
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-logai-text-secondary mb-2">
                  Application Name *
                </label>
                <input
                  type="text"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  placeholder="My API Server"
                  className="w-full px-4 py-2 bg-logai-bg-secondary border border-logai-border rounded-lg text-logai-text-primary placeholder-logai-text-secondary focus:border-logai-accent focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-logai-text-secondary mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={newAppDesc}
                  onChange={(e) => setNewAppDesc(e.target.value)}
                  placeholder="Backend API for my e-commerce app"
                  className="w-full px-4 py-2 bg-logai-bg-secondary border border-logai-border rounded-lg text-logai-text-primary placeholder-logai-text-secondary focus:border-logai-accent focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewApp(false)}
                className="px-4 py-2 text-logai-text-secondary hover:text-logai-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateApp}
                disabled={creating || !newAppName.trim()}
                className="px-4 py-2 bg-logai-accent text-black font-medium rounded-lg hover:bg-logai-accent-dim transition-colors disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ 
  label, 
  value, 
  icon, 
  variant = 'default' 
}: { 
  label: string
  value: number
  icon: React.ReactNode
  variant?: 'default' | 'warning' | 'error'
}) {
  const colors = {
    default: 'text-logai-accent',
    warning: 'text-logai-warning',
    error: 'text-logai-error',
  }

  return (
    <div className="bg-logai-bg-card border border-logai-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-logai-text-secondary text-sm">{label}</span>
        <span className={colors[variant]}>{icon}</span>
      </div>
      <p className={`text-3xl font-bold ${colors[variant]}`}>
        {value.toLocaleString()}
      </p>
    </div>
  )
}

function AppCard({ 
  app, 
  onDelete, 
  onCopyKey,
  copied 
}: { 
  app: AppWithStats
  onDelete: () => void
  onCopyKey: () => void
  copied: boolean
}) {
  const stats = app.stats

  return (
    <div className="bg-logai-bg-card border border-logai-border rounded-xl p-6 card-hover">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-logai-text-primary">{app.name}</h3>
          <p className="text-sm text-logai-text-secondary">{app.description || 'No description'}</p>
        </div>
        <button
          onClick={onDelete}
          className="p-2 text-logai-text-secondary hover:text-logai-error transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-logai-text-secondary">Total Logs</p>
            <p className="text-lg font-semibold text-logai-text-primary">
              {stats.total_logs.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-logai-text-secondary">Errors</p>
            <p className="text-lg font-semibold text-logai-error">
              {stats.error_logs.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-logai-text-secondary">Clusters</p>
            <p className="text-lg font-semibold text-logai-warning">
              {stats.cluster_count}
            </p>
          </div>
          <div>
            <p className="text-xs text-logai-text-secondary">Critical</p>
            <p className="text-lg font-semibold text-logai-critical">
              {stats.critical_count}
            </p>
          </div>
        </div>
      )}

      {/* API Key */}
      <div className="bg-logai-bg-secondary rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-logai-text-secondary">API Key</span>
          <button
            onClick={onCopyKey}
            className="flex items-center gap-1 text-xs text-logai-accent hover:text-logai-accent-dim transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy
              </>
            )}
          </button>
        </div>
        <p className="font-mono text-xs text-logai-text-primary truncate mt-1">
          {app.api_key.substring(0, 20)}...
        </p>
      </div>

      <Link
        to={`/app/${app.id}`}
        className="flex items-center justify-center gap-2 w-full py-2 bg-logai-bg-hover text-logai-text-primary rounded-lg hover:bg-logai-border transition-colors"
      >
        View Details
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}

