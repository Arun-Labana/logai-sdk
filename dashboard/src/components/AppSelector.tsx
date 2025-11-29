import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Server, Check } from 'lucide-react'
import { getApplications, Application } from '../lib/supabase'

interface AppSelectorProps {
  selectedApp: Application | null
  onSelect: (app: Application) => void
  placeholder?: string
}

export default function AppSelector({ selectedApp, onSelect, placeholder = 'Select application' }: AppSelectorProps) {
  const [apps, setApps] = useState<Application[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadApps()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function loadApps() {
    try {
      const applications = await getApplications()
      setApps(applications)
    } catch (error) {
      console.error('Failed to load apps:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="flex items-center justify-between w-full px-4 py-3 bg-logai-bg-secondary border border-logai-border rounded-lg text-left hover:border-logai-accent/50 transition-colors focus:outline-none focus:border-logai-accent"
      >
        <div className="flex items-center gap-3">
          <Server className="w-5 h-5 text-logai-text-secondary" />
          {selectedApp ? (
            <div>
              <p className="text-logai-text-primary font-medium">{selectedApp.name}</p>
              <p className="text-xs text-logai-text-secondary">{selectedApp.description || 'No description'}</p>
            </div>
          ) : (
            <span className="text-logai-text-secondary">{loading ? 'Loading...' : placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-logai-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && apps.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-logai-bg-card border border-logai-border rounded-lg shadow-xl overflow-hidden animate-fade-in">
          <ul className="max-h-64 overflow-y-auto py-2">
            {apps.map((app) => (
              <li key={app.id}>
                <button
                  onClick={() => {
                    onSelect(app)
                    setIsOpen(false)
                  }}
                  className="flex items-center justify-between w-full px-4 py-3 hover:bg-logai-bg-hover transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Server className="w-5 h-5 text-logai-text-secondary" />
                    <div className="text-left">
                      <p className="text-logai-text-primary font-medium">{app.name}</p>
                      <p className="text-xs text-logai-text-secondary">{app.description || 'No description'}</p>
                    </div>
                  </div>
                  {selectedApp?.id === app.id && (
                    <Check className="w-5 h-5 text-logai-accent" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isOpen && apps.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-2 bg-logai-bg-card border border-logai-border rounded-lg shadow-xl p-4 text-center animate-fade-in">
          <p className="text-logai-text-secondary">No applications found</p>
        </div>
      )}
    </div>
  )
}

