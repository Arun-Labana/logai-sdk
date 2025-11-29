import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft,
  Sparkles,
  Download,
  Copy,
  Check,
  Clock,
  Target,
  Loader2
} from 'lucide-react'
import { 
  getErrorCluster,
  getClusterAnalysis,
  getApplication,
  analyzeCluster,
  generatePatch,
  updateClusterStatus,
  ErrorCluster,
  AnalysisResult,
  Application
} from '../lib/supabase'
import { formatDistanceToNow } from 'date-fns'

export default function ClusterDetail() {
  const { clusterId } = useParams<{ clusterId: string }>()
  const [cluster, setCluster] = useState<ErrorCluster | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [app, setApp] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [generatingPatch, setGeneratingPatch] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (clusterId) {
      loadData()
    }
  }, [clusterId])

  async function loadData() {
    try {
      const clusterData = await getErrorCluster(clusterId!)
      setCluster(clusterData)
      
      if (clusterData) {
        const [analysisData, appData] = await Promise.all([
          getClusterAnalysis(clusterId!),
          getApplication(clusterData.app_id),
        ])
        setAnalysis(analysisData)
        setApp(appData)
      }
    } catch (error) {
      console.error('Failed to load cluster:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAnalyze() {
    if (!clusterId) return
    
    setAnalyzing(true)
    setError(null)
    
    try {
      const result = await analyzeCluster(clusterId)
      setAnalysis({
        ...result,
        cluster_id: clusterId,
        created_at: new Date().toISOString()
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleGeneratePatch() {
    if (!clusterId) return
    
    setGeneratingPatch(true)
    setError(null)
    
    try {
      const result = await generatePatch(clusterId)
      if (result.patch) {
        setAnalysis(prev => prev ? { ...prev, patch: result.patch } : null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Patch generation failed')
    } finally {
      setGeneratingPatch(false)
    }
  }

  async function handleStatusChange(status: ErrorCluster['status']) {
    if (!clusterId) return
    
    try {
      await updateClusterStatus(clusterId, status)
      setCluster(prev => prev ? { ...prev, status } : null)
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  function copyPatch() {
    if (analysis?.patch) {
      navigator.clipboard.writeText(analysis.patch)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function downloadPatch() {
    if (analysis?.patch) {
      const blob = new Blob([analysis.patch], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = analysis.patch_file_name || 'fix.diff'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-logai-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!cluster) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-logai-text-primary mb-2">
          Cluster not found
        </h2>
        <Link to="/" className="text-logai-accent hover:underline">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const severityColors = {
    CRITICAL: 'bg-logai-critical text-white',
    HIGH: 'bg-logai-warning text-black',
    MEDIUM: 'bg-yellow-500 text-black',
    LOW: 'bg-logai-success text-white',
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to={app ? `/app/${app.id}` : '/'}
          className="p-2 text-logai-text-secondary hover:text-logai-text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className={`px-2 py-1 rounded text-xs font-semibold ${severityColors[cluster.severity]}`}>
              {cluster.severity}
            </span>
            <select
              value={cluster.status}
              onChange={(e) => handleStatusChange(e.target.value as ErrorCluster['status'])}
              className="px-2 py-1 bg-logai-bg-secondary border border-logai-border rounded text-sm text-logai-text-primary focus:outline-none"
            >
              <option value="OPEN">Open</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="RESOLVED">Resolved</option>
              <option value="IGNORED">Ignored</option>
            </select>
          </div>
          <h1 className="text-2xl font-bold text-logai-text-primary font-mono">
            {cluster.exception_class || 'Unknown Exception'}
          </h1>
        </div>
      </div>

      {/* Cluster info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Message pattern */}
          <div className="bg-logai-bg-card border border-logai-border rounded-xl p-6">
            <h3 className="text-sm font-medium text-logai-text-secondary mb-3">
              Message Pattern
            </h3>
            <p className="font-mono text-sm text-logai-text-primary whitespace-pre-wrap">
              {cluster.message_pattern || 'No message pattern'}
            </p>
          </div>

          {/* Location */}
          <div className="bg-logai-bg-card border border-logai-border rounded-xl p-6">
            <h3 className="text-sm font-medium text-logai-text-secondary mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Error Location
            </h3>
            <div className="bg-logai-bg-secondary rounded-lg p-4">
              <p className="font-mono text-sm text-logai-accent">
                {cluster.primary_class || 'Unknown'}
                {cluster.primary_method && (
                  <span className="text-logai-text-primary">.{cluster.primary_method}</span>
                )}
                {cluster.primary_line && (
                  <span className="text-logai-warning">:{cluster.primary_line}</span>
                )}
              </p>
              {cluster.primary_file && (
                <p className="text-xs text-logai-text-secondary mt-2">
                  📁 {cluster.primary_file}
                </p>
              )}
            </div>
          </div>

          {/* AI Analysis */}
          <div className="bg-logai-bg-card border border-logai-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-logai-border flex items-center justify-between">
              <h3 className="text-lg font-semibold text-logai-text-primary flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-logai-accent" />
                AI Analysis
              </h3>
              {!analysis && (
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="flex items-center gap-2 px-4 py-2 bg-logai-accent text-black font-medium rounded-lg hover:bg-logai-accent-dim transition-colors disabled:opacity-50"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Analyze with AI
                    </>
                  )}
                </button>
              )}
            </div>

            {!analysis && !analyzing && (
              <div className="p-6 text-center text-logai-text-secondary">
                Click "Analyze with AI" to generate insights and a potential fix.
              </div>
            )}

            {analysis && (
              <div className="p-6 space-y-6">
                {analysis.explanation && (
                  <div>
                    <h4 className="text-sm font-medium text-logai-text-secondary mb-2">
                      Explanation
                    </h4>
                    <p className="text-logai-text-primary whitespace-pre-wrap">
                      {analysis.explanation}
                    </p>
                  </div>
                )}

                {analysis.root_cause && (
                  <div>
                    <h4 className="text-sm font-medium text-logai-text-secondary mb-2">
                      Root Cause
                    </h4>
                    <p className="text-logai-text-primary whitespace-pre-wrap">
                      {analysis.root_cause}
                    </p>
                  </div>
                )}

                {analysis.recommendation && (
                  <div>
                    <h4 className="text-sm font-medium text-logai-text-secondary mb-2">
                      Recommendation
                    </h4>
                    <p className="text-logai-text-primary whitespace-pre-wrap">
                      {analysis.recommendation}
                    </p>
                  </div>
                )}

                {analysis.confidence && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-logai-text-secondary">Confidence:</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      analysis.confidence === 'HIGH' 
                        ? 'bg-logai-success/10 text-logai-success'
                        : analysis.confidence === 'MEDIUM'
                        ? 'bg-logai-warning/10 text-logai-warning'
                        : 'bg-logai-text-secondary/10 text-logai-text-secondary'
                    }`}>
                      {analysis.confidence}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Patch */}
          <div className="bg-logai-bg-card border border-logai-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-logai-border flex items-center justify-between">
              <h3 className="text-lg font-semibold text-logai-text-primary">
                Suggested Fix
              </h3>
              <div className="flex items-center gap-2">
                {analysis && !analysis.patch && (
                  <button
                    onClick={handleGeneratePatch}
                    disabled={generatingPatch}
                    className="flex items-center gap-2 px-3 py-1.5 bg-logai-bg-hover text-logai-text-primary rounded-lg hover:bg-logai-border transition-colors disabled:opacity-50 text-sm"
                  >
                    {generatingPatch ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>Generate Patch</>
                    )}
                  </button>
                )}
                {analysis?.patch && (
                  <>
                    <button
                      onClick={copyPatch}
                      className="flex items-center gap-1 px-3 py-1.5 bg-logai-bg-hover text-logai-text-primary rounded-lg hover:bg-logai-border transition-colors text-sm"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={downloadPatch}
                      className="flex items-center gap-1 px-3 py-1.5 bg-logai-bg-hover text-logai-text-primary rounded-lg hover:bg-logai-border transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {analysis?.patch ? (
              <div className="p-4 overflow-x-auto">
                <pre className="font-mono text-sm text-logai-text-primary">
                  {analysis.patch.split('\n').map((line, i) => (
                    <div
                      key={i}
                      className={`px-2 ${
                        line.startsWith('+') && !line.startsWith('+++')
                          ? 'diff-add'
                          : line.startsWith('-') && !line.startsWith('---')
                          ? 'diff-remove'
                          : line.startsWith('@@')
                          ? 'text-logai-accent'
                          : 'diff-context'
                      }`}
                    >
                      {line}
                    </div>
                  ))}
                </pre>
              </div>
            ) : (
              <div className="p-6 text-center text-logai-text-secondary">
                {analysis 
                  ? 'No patch available. Click "Generate Patch" to create one.'
                  : 'Run AI analysis first to generate a fix.'
                }
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statistics */}
          <div className="bg-logai-bg-card border border-logai-border rounded-xl p-6">
            <h3 className="text-sm font-medium text-logai-text-secondary mb-4">
              Statistics
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-logai-text-secondary">Occurrences</span>
                <span className="text-xl font-bold text-logai-error">
                  {cluster.occurrence_count}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-logai-text-secondary flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  First seen
                </span>
                <span className="text-sm text-logai-text-primary">
                  {formatDistanceToNow(new Date(cluster.first_seen), { addSuffix: true })}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-logai-text-secondary flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Last seen
                </span>
                <span className="text-sm text-logai-text-primary">
                  {formatDistanceToNow(new Date(cluster.last_seen), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>

          {/* Application info */}
          {app && (
            <div className="bg-logai-bg-card border border-logai-border rounded-xl p-6">
              <h3 className="text-sm font-medium text-logai-text-secondary mb-4">
                Application
              </h3>
              <p className="text-logai-text-primary font-medium">{app.name}</p>
              <p className="text-sm text-logai-text-secondary mt-1">
                {app.description || 'No description'}
              </p>
              <Link
                to={`/app/${app.id}`}
                className="text-logai-accent hover:underline text-sm mt-3 inline-block"
              >
                View all clusters →
              </Link>
            </div>
          )}

          {/* Error info */}
          {error && (
            <div className="bg-logai-error/10 border border-logai-error/30 rounded-xl p-4">
              <p className="text-sm text-logai-error">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

