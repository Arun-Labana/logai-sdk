import { Link } from 'react-router-dom'
import { ChevronRight, AlertTriangle } from 'lucide-react'
import { ErrorCluster } from '../lib/supabase'
import { formatDistanceToNow } from 'date-fns'

interface ClusterListProps {
  clusters: ErrorCluster[]
  emptyMessage?: string
  showAppLink?: boolean
}

export default function ClusterList({ 
  clusters, 
  emptyMessage = 'No error clusters found',
  showAppLink = false
}: ClusterListProps) {
  if (clusters.length === 0) {
    return (
      <div className="p-12 text-center">
        <AlertTriangle className="w-12 h-12 text-logai-text-secondary mx-auto mb-4" />
        <p className="text-logai-text-secondary">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-logai-border">
      {clusters.map((cluster) => (
        <ClusterItem key={cluster.id} cluster={cluster} />
      ))}
    </div>
  )
}

interface ClusterItemProps {
  cluster: ErrorCluster
}

function ClusterItem({ cluster }: ClusterItemProps) {
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
      className="flex items-center px-6 py-4 hover:bg-logai-bg-hover transition-colors group"
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
            {cluster.occurrence_count} occurrence{cluster.occurrence_count !== 1 ? 's' : ''}
          </span>
        </div>
        
        <h4 className="font-mono text-sm text-logai-text-primary truncate group-hover:text-logai-accent transition-colors">
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
      
      <div className="ml-4 text-right flex-shrink-0">
        <p className="text-xs text-logai-text-secondary">Last seen</p>
        <p className="text-sm text-logai-text-primary">
          {formatDistanceToNow(new Date(cluster.last_seen), { addSuffix: true })}
        </p>
      </div>
      
      <ChevronRight className="w-5 h-5 text-logai-text-secondary ml-4 group-hover:text-logai-accent transition-colors" />
    </Link>
  )
}

// Export the individual item component for use elsewhere
export { ClusterItem }

