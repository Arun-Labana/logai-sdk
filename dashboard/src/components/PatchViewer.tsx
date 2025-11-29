import { useState } from 'react'
import { Copy, Check, Download, Code, FileCode } from 'lucide-react'

interface PatchViewerProps {
  patch: string | null
  fileName?: string | null
  onDownload?: () => void
  onCopy?: () => void
  loading?: boolean
  onGenerate?: () => void
  canGenerate?: boolean
}

export default function PatchViewer({ 
  patch, 
  fileName,
  onDownload,
  onCopy,
  loading = false,
  onGenerate,
  canGenerate = true
}: PatchViewerProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    if (!patch) return
    navigator.clipboard.writeText(patch)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    onCopy?.()
  }

  function handleDownload() {
    if (!patch) return
    const blob = new Blob([patch], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName || 'fix.diff'
    a.click()
    URL.revokeObjectURL(url)
    onDownload?.()
  }

  if (loading) {
    return (
      <div className="bg-logai-bg-card border border-logai-border rounded-xl p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-logai-accent border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-logai-text-secondary">Generating patch...</p>
      </div>
    )
  }

  if (!patch) {
    return (
      <div className="bg-logai-bg-card border border-logai-border rounded-xl p-8 text-center">
        <FileCode className="w-12 h-12 text-logai-text-secondary mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-logai-text-primary mb-2">
          No Patch Available
        </h3>
        <p className="text-logai-text-secondary text-sm mb-4">
          Generate a fix patch using AI analysis
        </p>
        {onGenerate && canGenerate && (
          <button
            onClick={onGenerate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-logai-bg-hover text-logai-text-primary rounded-lg hover:bg-logai-border transition-colors"
          >
            <Code className="w-4 h-4" />
            Generate Patch
          </button>
        )}
      </div>
    )
  }

  const lines = patch.split('\n')

  return (
    <div className="bg-logai-bg-card border border-logai-border rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-logai-border flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-logai-text-primary">
            Suggested Fix
          </h3>
          {fileName && (
            <p className="text-sm text-logai-text-secondary font-mono">{fileName}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 bg-logai-bg-hover text-logai-text-primary rounded-lg hover:bg-logai-border transition-colors text-sm"
          >
            {copied ? <Check className="w-4 h-4 text-logai-success" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1.5 bg-logai-bg-hover text-logai-text-primary rounded-lg hover:bg-logai-border transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <pre className="font-mono text-sm">
          {lines.map((line, index) => (
            <DiffLine key={index} line={line} lineNumber={index + 1} />
          ))}
        </pre>
      </div>
    </div>
  )
}

interface DiffLineProps {
  line: string
  lineNumber: number
}

function DiffLine({ line, lineNumber }: DiffLineProps) {
  let className = 'px-4 py-0.5 '
  let prefix = ' '

  if (line.startsWith('+++') || line.startsWith('---')) {
    className += 'text-logai-text-secondary bg-logai-bg-secondary'
  } else if (line.startsWith('+')) {
    className += 'diff-add text-logai-success'
    prefix = '+'
  } else if (line.startsWith('-')) {
    className += 'diff-remove text-logai-error'
    prefix = '-'
  } else if (line.startsWith('@@')) {
    className += 'text-logai-accent bg-logai-accent/5'
  } else {
    className += 'diff-context text-logai-text-primary'
  }

  return (
    <div className={className}>
      <span className="select-none text-logai-text-secondary w-8 inline-block text-right mr-4 text-xs">
        {lineNumber}
      </span>
      {line || ' '}
    </div>
  )
}

// Helper function to validate if a string is a valid diff
export function isValidDiff(patch: string): boolean {
  if (!patch || patch.length < 20) return false
  const hasHeader = patch.includes('---') && patch.includes('+++')
  const hasHunk = patch.includes('@@')
  const hasChanges = patch.includes('\n+') || patch.includes('\n-')
  return hasHeader && hasHunk && hasChanges
}

