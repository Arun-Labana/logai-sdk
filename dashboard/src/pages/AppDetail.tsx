import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft,
  Play,
  AlertTriangle,
  Clock,
  Activity,
  ChevronRight
} from 'lucide-react'
import { 
  getApplication,
  getErrorClusters,
  getScanHistory,
  Application,
  ErrorCluster,
  ScanHistory
} from '../lib/supabase'
import { formatDistanceToNow } from 'date-fns'

export default function AppDetail() {
  const { appId } = useParams<{ appId: string }>()
  const [app, setApp] = useState<Application | null>(null)
  const [clusters, setClusters] = useState<ErrorCluster[]>([])
  const [scans, setScans] = useState<ScanHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (appId) {
      loadData()
    }
  }, [appId])

  async function loadData() {
    try {
      const [appData, clusterData, scanData] = await Promise.all([
        getApplication(appId!),
        getErrorClusters(appId!),
        getScanHistory(appId!)
      ])
      
      setApp(appData)
      setClusters(clusterData)
      setScans(scanData)
    } catch (error) {
      console.error('Failed to load app data:', error)
    } finally {
      setLoading(false)
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

  const criticalCount = clusters.filter(c => c.severity === 'CRITICAL').length
  const highCount = clusters.filter(c => c.severity === 'HIGH').length

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/"
          className="p-2 text-logai-text-secondary hover:text-logai-text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-logai-text-primary">{app.name}</h1>
          <p className="text-logai-text-secondary">{app.description || 'No description'}</p>
        </div>
        <Link
          to={`/app/${appId}/scan`}
          className="flex items-center gap-2 px-4 py-2 bg-logai-accent text-black font-medium rounded-lg hover:bg-logai-accent-dim transition-colors"
        >
          <Play className="w-5 h-5" />
          Run Scan
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-logai-bg-card border border-logai-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-logai-text-secondary text-sm">Total Clusters</span>
            <Activity className="w-5 h-5 text-logai-accent" />
          </div>
          <p className="text-3xl font-bold text-logai-accent">{clusters.length}</p>
        </div>
        
        <div className="bg-logai-bg-card border border-logai-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-logai-text-secondary text-sm">Critical</span>
            <AlertTriangle className="w-5 h-5 text-logai-critical" />
          </div>
          <p className="text-3xl font-bold text-logai-critical">{criticalCount}</p>
        </div>
        
        <div className="bg-logai-bg-card border border-logai-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-logai-text-secondary text-sm">High Priority</span>
            <AlertTriangle className="w-5 h-5 text-logai-warning" />
          </div>
          <p className="text-3xl font-bold text-logai-warning">{highCount}</p>
        </div>
        
        <div className="bg-logai-bg-card border border-logai-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-logai-text-secondary text-sm">Last Scan</span>
            <Clock className="w-5 h-5 text-logai-text-secondary" />
          </div>
          <p className="text-lg font-semibold text-logai-text-primary">
            {scans[0] 
              ? formatDistanceToNow(new Date(scans[0].started_at), { addSuffix: true })
              : 'Never'
            }
          </p>
        </div>
      </div>

      {/* Error Clusters */}
      <div className="bg-logai-bg-card border border-logai-border rounded-xl overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-logai-border">
          <h2 className="text-lg font-semibold text-logai-text-primary">Error Clusters</h2>
        </div>
        
        {clusters.length === 0 ? (
          <div className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-logai-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-logai-text-primary mb-2">
              No error clusters yet
            </h3>
            <p className="text-logai-text-secondary mb-4">
              Run a scan to analyze your logs and identify error patterns.
            </p>
            <Link
              to={`/app/${appId}/scan`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-logai-accent text-black font-medium rounded-lg hover:bg-logai-accent-dim transition-colors"
            >
              <Play className="w-5 h-5" />
              Run Scan
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-logai-border">
            {clusters.map((cluster) => (
              <ClusterRow key={cluster.id} cluster={cluster} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Scans */}
      {scans.length > 0 && (
        <div className="bg-logai-bg-card border border-logai-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-logai-border">
            <h2 className="text-lg font-semibold text-logai-text-primary">Recent Scans</h2>
          </div>
          
          <div className="divide-y divide-logai-border">
            {scans.map((scan) => (
              <div key={scan.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        scan.status === 'COMPLETED' 
                          ? 'bg-logai-success/10 text-logai-success'
                          : scan.status === 'FAILED'
                          ? 'bg-logai-error/10 text-logai-error'
                          : 'bg-logai-warning/10 text-logai-warning'
                      }`}>
                        {scan.status}
                      </span>
                      <span className="text-sm text-logai-text-secondary">
                        {formatDistanceToNow(new Date(scan.started_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-logai-text-secondary">
                    {scan.logs_scanned} logs • {scan.errors_found} errors • {scan.clusters_created} clusters
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ClusterRow({ cluster }: { cluster: ErrorCluster }) {
  const severityColors = {
    CRITICAL: 'bg-logai-critical text-white',
    HIGH: 'bg-logai-warning text-black',
    MEDIUM: 'bg-yellow-500 text-black',
    LOW: 'bg-logai-success text-white',
  }

  const statusColors = {
    OPEN: 'text-logai-error',
    ACKNOWLEDGED: 'text-logai-warning',
    RESOLVED: 'text-logai-success',
    IGNORED: 'text-logai-text-secondary',
  }

  return (
    <Link
      to={`/cluster/${cluster.id}`}
      className="flex items-center px-6 py-4 hover:bg-logai-bg-hover transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${severityColors[cluster.severity]}`}>
            {cluster.severity}
          </span>
          <span className={`text-sm font-medium ${statusColors[cluster.status]}`}>
            {cluster.status}
          </span>
          <span className="text-sm text-logai-text-secondary">
            {cluster.occurrence_count} occurrences
          </span>
        </div>
        
        <h4 className="font-mono text-sm text-logai-text-primary truncate">
          {cluster.exception_class || 'Unknown Exception'}
        </h4>
        
        <p className="text-sm text-logai-text-secondary truncate mt-1">
          {cluster.message_pattern || 'No message pattern'}
        </p>
        
        {cluster.primary_class && (
          <p className="text-xs text-logai-text-secondary mt-1">
            📍 {cluster.primary_class}
            {cluster.primary_method && `.${cluster.primary_method}`}
            {cluster.primary_line && `:${cluster.primary_line}`}
          </p>
        )}
      </div>
      
      <div className="ml-4 text-right">
        <p className="text-xs text-logai-text-secondary">Last seen</p>
        <p className="text-sm text-logai-text-primary">
          {formatDistanceToNow(new Date(cluster.last_seen), { addSuffix: true })}
        </p>
      </div>
      
      <ChevronRight className="w-5 h-5 text-logai-text-secondary ml-4" />
    </Link>
  )
}

