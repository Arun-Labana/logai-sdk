import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Settings, 
  Search,
  Bug,
  Zap
} from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-logai-bg-secondary border-r border-logai-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-logai-border">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-logai-accent to-purple-500 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">LogAI</h1>
              <p className="text-xs text-logai-text-secondary">Log Analyzer</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path
              return (
                <li key={path}>
                  <Link
                    to={path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-logai-accent/10 text-logai-accent'
                        : 'text-logai-text-secondary hover:bg-logai-bg-hover hover:text-logai-text-primary'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Quick actions */}
          <div className="mt-8">
            <p className="px-4 text-xs text-logai-text-secondary uppercase tracking-wider mb-3">
              Quick Actions
            </p>
            <ul className="space-y-2">
              <li>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-logai-text-secondary hover:bg-logai-bg-hover hover:text-logai-text-primary transition-colors">
                  <Search className="w-5 h-5" />
                  <span className="font-medium">Search Logs</span>
                </button>
              </li>
              <li>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-logai-text-secondary hover:bg-logai-bg-hover hover:text-logai-text-primary transition-colors">
                  <Bug className="w-5 h-5" />
                  <span className="font-medium">View Errors</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-logai-border">
          <div className="bg-logai-bg-card rounded-lg p-4">
            <p className="text-xs text-logai-text-secondary mb-2">Powered by</p>
            <p className="text-sm font-medium text-logai-text-primary">OpenAI GPT-4</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

