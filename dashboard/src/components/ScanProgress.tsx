import { CheckCircle, XCircle, Loader2, Search, GitBranch, Sparkles } from 'lucide-react'

interface ScanProgressProps {
  status: 'idle' | 'scanning' | 'clustering' | 'analyzing' | 'complete' | 'error'
  logsScanned?: number
  clustersFound?: number
  clustersAnalyzed?: number
  errorMessage?: string
}

export default function ScanProgress({ 
  status, 
  logsScanned = 0,
  clustersFound = 0,
  clustersAnalyzed = 0,
  errorMessage
}: ScanProgressProps) {
  const steps = [
    {
      id: 'scan',
      label: 'Scanning Logs',
      description: `${logsScanned} logs processed`,
      icon: Search,
      status: getStepStatus('scanning')
    },
    {
      id: 'cluster',
      label: 'Clustering Errors',
      description: `${clustersFound} clusters identified`,
      icon: GitBranch,
      status: getStepStatus('clustering')
    },
    {
      id: 'analyze',
      label: 'AI Analysis',
      description: `${clustersAnalyzed} clusters analyzed`,
      icon: Sparkles,
      status: getStepStatus('analyzing')
    }
  ]

  function getStepStatus(step: string): 'pending' | 'active' | 'complete' | 'error' {
    const stepOrder = ['scanning', 'clustering', 'analyzing', 'complete']
    const currentIndex = stepOrder.indexOf(status)
    const stepIndex = stepOrder.indexOf(step)

    if (status === 'error') {
      if (stepIndex <= currentIndex) return 'error'
      return 'pending'
    }
    if (status === 'idle') return 'pending'
    if (stepIndex < currentIndex) return 'complete'
    if (stepIndex === currentIndex) return 'active'
    return 'pending'
  }

  if (status === 'idle') {
    return null
  }

  return (
    <div className="bg-logai-bg-card border border-logai-border rounded-xl p-6">
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-4">
            {/* Icon */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              step.status === 'complete' 
                ? 'bg-logai-success/10'
                : step.status === 'active'
                ? 'bg-logai-accent/10'
                : step.status === 'error'
                ? 'bg-logai-error/10'
                : 'bg-logai-bg-secondary'
            }`}>
              {step.status === 'complete' ? (
                <CheckCircle className="w-5 h-5 text-logai-success" />
              ) : step.status === 'active' ? (
                <Loader2 className="w-5 h-5 text-logai-accent animate-spin" />
              ) : step.status === 'error' ? (
                <XCircle className="w-5 h-5 text-logai-error" />
              ) : (
                <step.icon className="w-5 h-5 text-logai-text-secondary" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className={`font-medium ${
                  step.status === 'complete' 
                    ? 'text-logai-success'
                    : step.status === 'active'
                    ? 'text-logai-accent'
                    : step.status === 'error'
                    ? 'text-logai-error'
                    : 'text-logai-text-secondary'
                }`}>
                  {step.label}
                </h4>
                {step.status === 'active' && (
                  <span className="text-xs text-logai-accent animate-pulse">In progress...</span>
                )}
              </div>
              <p className="text-sm text-logai-text-secondary mt-1">
                {step.description}
              </p>
            </div>

            {/* Connection line */}
            {index < steps.length - 1 && (
              <div className="absolute left-5 mt-10 h-6 w-px bg-logai-border" style={{ display: 'none' }} />
            )}
          </div>
        ))}

        {/* Error message */}
        {status === 'error' && errorMessage && (
          <div className="mt-4 p-4 bg-logai-error/10 border border-logai-error/30 rounded-lg">
            <p className="text-sm text-logai-error">{errorMessage}</p>
          </div>
        )}

        {/* Success message */}
        {status === 'complete' && (
          <div className="mt-4 p-4 bg-logai-success/10 border border-logai-success/30 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-logai-success" />
              <p className="text-sm text-logai-success font-medium">Scan completed successfully!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Simple progress bar component
export function ProgressBar({ 
  progress, 
  label,
  color = 'accent'
}: { 
  progress: number
  label?: string
  color?: 'accent' | 'success' | 'warning' | 'error'
}) {
  const colors = {
    accent: 'bg-logai-accent',
    success: 'bg-logai-success',
    warning: 'bg-logai-warning',
    error: 'bg-logai-error',
  }

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-logai-text-secondary">{label}</span>
          <span className="text-sm text-logai-text-primary font-medium">{Math.round(progress)}%</span>
        </div>
      )}
      <div className="h-2 bg-logai-bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[color]} transition-all duration-300 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  )
}

