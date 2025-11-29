import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft,
  Play,
  CheckCircle,
  XCircle,
  Loader2,
  Sparkles
} from 'lucide-react'
import { 
  getApplication,
  triggerScan,
  Application
} from '../lib/supabase'

interface ScanResult {
  success: boolean
  scan_id: string
  logs_scanned: number
  clusters_found: number
  clusters_created: number
  cluster_ids: string[]
}

export default function Scan() {
  const { appId } = useParams<{ appId: string }>()
  const [app, setApp] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hours, setHours] = useState(24)

  useEffect(() => {
    if (appId) {
      loadData()
    }
  }, [appId])

  async function loadData() {
    try {
      const appData = await getApplication(appId!)
      setApp(appData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleScan() {
    setScanning(true)
    setError(null)
    setScanComplete(false)
    
    try {
      const result = await triggerScan(appId!, hours, false)
      setScanResult(result)
      setScanComplete(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed')
    } finally {
      setScanning(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-logai-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!app) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-logai-text-primary mb-2">
          Application not found
        </h2>
        <Link to="/" className="text-logai-accent hover:underline">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to={`/app/${appId}`}
          className="p-2 text-logai-text-secondary hover:text-logai-text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-logai-text-primary">Run Scan</h1>
          <p className="text-logai-text-secondary">{app.name}</p>
        </div>
      </div>

      {/* Scan configuration */}
      <div className="bg-logai-bg-card border border-logai-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-logai-text-primary mb-4">
          Scan Configuration
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-logai-text-secondary mb-2">
              Time Range
            </label>
            <select
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              disabled={scanning}
              className="w-full px-4 py-2 bg-logai-bg-secondary border border-logai-border rounded-lg text-logai-text-primary focus:border-logai-accent focus:outline-none"
            >
              <option value={1}>Last 1 hour</option>
              <option value={6}>Last 6 hours</option>
              <option value={24}>Last 24 hours</option>
              <option value={48}>Last 48 hours</option>
              <option value={168}>Last 7 days</option>
            </select>
          </div>

        </div>

        <button
          onClick={handleScan}
          disabled={scanning}
          className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-logai-accent text-black font-medium rounded-lg hover:bg-logai-accent-dim transition-colors disabled:opacity-50"
        >
          {scanning ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start Scan
            </>
          )}
        </button>
      </div>

      {/* Progress/Results */}
      {scanning && (
        <div className="bg-logai-bg-card border border-logai-border rounded-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-logai-accent/20 rounded-full animate-ping" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-logai-accent" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-logai-text-primary mb-2">
            Analyzing Logs...
          </h3>
          <p className="text-logai-text-secondary">
            This may take a moment depending on the number of logs.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-logai-error/10 border border-logai-error/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-6 h-6 text-logai-error" />
            <h3 className="text-lg font-semibold text-logai-text-primary">
              Scan Failed
            </h3>
          </div>
          <p className="text-logai-text-secondary">{error}</p>
          <button
            onClick={handleScan}
            className="mt-4 px-4 py-2 bg-logai-bg-hover text-logai-text-primary rounded-lg hover:bg-logai-border transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {scanComplete && scanResult && (
        <div className="bg-logai-success/10 border border-logai-success/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-logai-success" />
            <h3 className="text-lg font-semibold text-logai-text-primary">
              Scan Complete
            </h3>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-logai-bg-secondary rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-logai-accent">
                {scanResult.logs_scanned}
              </p>
              <p className="text-xs text-logai-text-secondary">Logs Scanned</p>
            </div>
            <div className="bg-logai-bg-secondary rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-logai-warning">
                {scanResult.clusters_found}
              </p>
              <p className="text-xs text-logai-text-secondary">Clusters Found</p>
            </div>
            <div className="bg-logai-bg-secondary rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-logai-success">
                {scanResult.clusters_created}
              </p>
              <p className="text-xs text-logai-text-secondary">New Clusters</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              to={`/app/${appId}`}
              className="flex-1 px-4 py-2 bg-logai-accent text-black font-medium rounded-lg text-center hover:bg-logai-accent-dim transition-colors"
            >
              View Error Clusters
            </Link>
            {scanResult.cluster_ids.length > 0 && (
              <Link
                to={`/cluster/${scanResult.cluster_ids[0]}`}
                className="px-4 py-2 bg-logai-bg-hover text-logai-text-primary rounded-lg hover:bg-logai-border transition-colors"
              >
                View First Cluster
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

