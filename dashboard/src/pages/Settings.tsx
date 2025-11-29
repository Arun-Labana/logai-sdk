import { useState, useEffect } from 'react'
import { 
  Server, 
  Trash2,
  Plus,
  Copy,
  Check,
  Zap
} from 'lucide-react'
import { 
  getApplications,
  createApplication,
  deleteApplication,
  Application
} from '../lib/supabase'

export default function Settings() {
  const [apps, setApps] = useState<Application[]>([])
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
      setApps(applications)
    } catch (error) {
      console.error('Failed to load apps:', error)
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
    if (!confirm('Are you sure? This will delete all logs and analysis for this application.')) {
      return
    }
    
    try {
      await deleteApplication(id)
      loadApps()
    } catch (error) {
      console.error('Failed to delete app:', error)
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopiedKey(id)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <div className="animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-logai-text-primary">Settings</h1>
        <p className="text-logai-text-secondary mt-1">
          Manage applications and view integration settings
        </p>
      </div>

      <div className="space-y-8">
        {/* LLM Info Card */}
        <div className="bg-logai-bg-card border border-logai-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-logai-accent/10 rounded-lg">
              <Zap className="w-5 h-5 text-logai-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-logai-text-primary">
                AI Analysis
              </h2>
              <p className="text-sm text-logai-text-secondary">
                Powered by Intuit's internal LLM service
              </p>
            </div>
          </div>

          <div className="bg-logai-bg-secondary rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-logai-success rounded-full animate-pulse" />
              <span className="text-sm text-logai-success font-medium">Connected</span>
            </div>
            <p className="text-sm text-logai-text-secondary">
              Model: <span className="text-logai-text-primary font-mono">gpt-5-2025-08-07</span>
            </p>
            <p className="text-xs text-logai-text-secondary mt-2">
              No API key required - authentication handled automatically via Intuit IAM
            </p>
          </div>
        </div>

        {/* Applications */}
        <div className="bg-logai-bg-card border border-logai-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-logai-border flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-logai-text-primary">
                Applications
              </h2>
              <p className="text-sm text-logai-text-secondary">
                Manage registered applications and their API keys
              </p>
            </div>
            <button
              onClick={() => setShowNewApp(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-logai-accent text-black font-medium rounded-lg hover:bg-logai-accent-dim transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add App
            </button>
          </div>

          {apps.length === 0 ? (
            <div className="p-8 text-center">
              <Server className="w-12 h-12 text-logai-text-secondary mx-auto mb-4" />
              <p className="text-logai-text-secondary">
                No applications registered yet.
              </p>
              <button
                onClick={() => setShowNewApp(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-logai-accent text-black font-medium rounded-lg hover:bg-logai-accent-dim transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Your First App
              </button>
            </div>
          ) : (
            <div className="divide-y divide-logai-border">
              {apps.map((app) => (
                <div key={app.id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-logai-text-primary">{app.name}</h3>
                      <p className="text-sm text-logai-text-secondary">
                        {app.description || 'No description'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteApp(app.id)}
                      className="p-2 text-logai-text-secondary hover:text-logai-error transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Integration info */}
                  <div className="mt-4 bg-logai-bg-secondary rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-logai-text-secondary">App ID</span>
                      <button
                        onClick={() => copyToClipboard(app.id, `id-${app.id}`)}
                        className="text-xs text-logai-accent hover:underline flex items-center gap-1"
                      >
                        {copiedKey === `id-${app.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedKey === `id-${app.id}` ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <code className="text-xs text-logai-text-primary block truncate mb-4">
                      {app.id}
                    </code>

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-logai-text-secondary">API Key</span>
                      <button
                        onClick={() => copyToClipboard(app.api_key, `key-${app.id}`)}
                        className="text-xs text-logai-accent hover:underline flex items-center gap-1"
                      >
                        {copiedKey === `key-${app.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedKey === `key-${app.id}` ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <code className="text-xs text-logai-text-primary block truncate">
                      {app.api_key}
                    </code>
                  </div>

                  {/* Logback config example */}
                  <details className="mt-4">
                    <summary className="text-sm text-logai-accent cursor-pointer hover:underline">
                      View Logback configuration
                    </summary>
                    <pre className="mt-2 p-4 bg-logai-bg-secondary rounded-lg text-xs overflow-x-auto">
{`<appender name="LOGAI" class="com.logai.remote.RemoteLogAppender">
    <supabaseUrl>\${SUPABASE_URL}</supabaseUrl>
    <supabaseKey>\${SUPABASE_KEY}</supabaseKey>
    <appId>${app.id}</appId>
    <threshold>WARN</threshold>
</appender>

<root level="INFO">
    <appender-ref ref="LOGAI" />
</root>`}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Environment Variables */}
        <div className="bg-logai-bg-card border border-logai-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-logai-text-primary mb-4">
            Environment Setup for Java Apps
          </h2>
          
          <p className="text-sm text-logai-text-secondary mb-4">
            Set these environment variables in your Java application:
          </p>

          <pre className="bg-logai-bg-secondary rounded-lg p-4 text-sm font-mono overflow-x-auto">
{`SUPABASE_URL=https://rdlhvdpuxddbryhepukn.supabase.co
SUPABASE_KEY=your_supabase_anon_key`}
          </pre>
        </div>
      </div>

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
