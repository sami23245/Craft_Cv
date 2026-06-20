import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutTemplate, PenSquare, ScanLine, User, CreditCard,
  LogOut, ChevronRight, Sparkles, X
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import api from '../../lib/api'

const NAV = [
  { to: '/templates', icon: LayoutTemplate, label: 'Templates' },
  { to: '/builder', icon: PenSquare, label: 'Resume Builder' },
  { to: '/scan', icon: ScanLine, label: 'AI CV Scanner' },
]

const BOTTOM_NAV = [
  { to: '/account', icon: User, label: 'Account' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) await api.post('/auth/logout/', { refresh })
    } catch {
      // ignore — still logout locally
    }
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {/* Desktop sidebar — always visible on lg+ */}
      <aside className="hidden lg:flex w-64 h-screen bg-slate-900 text-white flex-col fixed left-0 top-0 z-40">
        <SidebarContent user={user} nav={NAV} bottomNav={BOTTOM_NAV} onLogout={handleLogout} />
      </aside>

      {/* Mobile sidebar — slide in when open */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="lg:hidden w-64 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 z-40 shadow-2xl"
          >
            {/* Close button (mobile only) */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X size={18} />
            </button>
            <SidebarContent user={user} nav={NAV} bottomNav={BOTTOM_NAV} onLogout={handleLogout} onNavClick={onClose} />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}

function SidebarContent({ user, nav, bottomNav, onLogout, onNavClick }) {
  return (
    <>
      {/* Brand */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="text-base font-black">C</span>
          </div>
          <div>
            <h1 className="font-black text-lg leading-none">CraftCV</h1>
            <p className="text-slate-400 text-xs mt-0.5">Resume Builder</p>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3">Workspace</p>
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            <span className="flex-1">{label}</span>
            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>
        ))}

        <div className="pt-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3">Account</p>
          {bottomNav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Premium banner */}
      {user && !user.is_premium && (
        <div className="mx-4 mb-4 p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-yellow-300" />
            <span className="text-sm font-bold">Upgrade to Premium</span>
          </div>
          <p className="text-xs text-blue-200 mb-3">Unlock all templates & AI features</p>
          <NavLink
            to="/payments"
            onClick={onNavClick}
            className="block text-center text-xs font-bold bg-white text-blue-700 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Upgrade Now
          </NavLink>
        </div>
      )}

      {/* User + Logout */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
          {user?.is_premium && (
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full font-medium">Pro</span>
          )}
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </>
  )
}
