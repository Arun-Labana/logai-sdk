import { Sparkles, Target, Lightbulb, AlertCircle } from 'lucide-react'
import { AnalysisResult } from '../lib/supabase'

interface AnalysisCardProps {
  analysis: AnalysisResult | null
  loading?: boolean
  onAnalyze?: () => void
  canAnalyze?: boolean
}

export default function AnalysisCard({ 
  analysis, 
  loading = false, 
  onAnalyze,
  canAnalyze = true 
}: AnalysisCardProps) {
  const confidenceColors = {
    HIGH: 'bg-logai-success/10 text-logai-success',
    MEDIUM: 'bg-logai-warning/10 text-logai-warning',
    LOW: 'bg-logai-error/10 text-logai-error',
    UNKNOWN: 'bg-logai-text-secondary/10 text-logai-text-secondary',
  }

  if (loading) {
    return (
      <div className="bg-logai-bg-card border border-logai-border rounded-xl p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-4 relative">
          <div className="absolute inset-0 bg-logai-accent/20 rounded-full animate-ping" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-logai-accent" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-logai-text-primary mb-2">
          Analyzing with AI...
        </h3>
        <p className="text-logai-text-secondary text-sm">
          This may take a few seconds
        </p>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="bg-logai-bg-card border border-logai-border rounded-xl p-8 text-center">
        <Sparkles className="w-12 h-12 text-logai-text-secondary mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-logai-text-primary mb-2">
          No Analysis Yet
        </h3>
        <p className="text-logai-text-secondary text-sm mb-4">
          Run AI analysis to get insights and recommendations
        </p>
        {onAnalyze && canAnalyze && (
          <button
            onClick={onAnalyze}
            className="inline-flex items-center gap-2 px-4 py-2 bg-logai-accent text-black font-medium rounded-lg hover:bg-logai-accent-dim transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Analyze with AI
          </button>
        )}
        {!canAnalyze && (
          <p className="text-xs text-logai-warning">
            Configure OpenAI API key in Settings to enable analysis
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="bg-logai-bg-card border border-logai-border rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-logai-border flex items-center justify-between">
        <h3 className="text-lg font-semibold text-logai-text-primary flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-logai-accent" />
          AI Analysis
        </h3>
        {analysis.confidence && (
          <span className={`px-2 py-1 rounded text-xs font-medium ${confidenceColors[analysis.confidence]}`}>
            {analysis.confidence} confidence
          </span>
        )}
      </div>

      <div className="p-6 space-y-6">
        {analysis.explanation && (
          <AnalysisSection
            icon={<AlertCircle className="w-5 h-5" />}
            title="What Happened"
            content={analysis.explanation}
          />
        )}

        {analysis.root_cause && (
          <AnalysisSection
            icon={<Target className="w-5 h-5" />}
            title="Root Cause"
            content={analysis.root_cause}
          />
        )}

        {analysis.recommendation && (
          <AnalysisSection
            icon={<Lightbulb className="w-5 h-5" />}
            title="Recommendation"
            content={analysis.recommendation}
          />
        )}

        {analysis.model_used && (
          <div className="pt-4 border-t border-logai-border">
            <p className="text-xs text-logai-text-secondary">
              Analyzed by {analysis.model_used}
              {analysis.tokens_used && ` • ${analysis.tokens_used} tokens`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

interface AnalysisSectionProps {
  icon: React.ReactNode
  title: string
  content: string
}

function AnalysisSection({ icon, title, content }: AnalysisSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 text-logai-accent">
        {icon}
        <h4 className="font-medium">{title}</h4>
      </div>
      <p className="text-logai-text-primary whitespace-pre-wrap leading-relaxed">
        {content}
      </p>
    </div>
  )
}

