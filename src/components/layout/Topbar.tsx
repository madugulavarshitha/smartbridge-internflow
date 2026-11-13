import React, { useState } from 'react'
import { Bell, ChevronDown, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface TopbarProps {
  title?: string
  subtitle?: string
}

const Topbar: React.FC<TopbarProps> = ({ title, subtitle }) => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center justify-between sticky top-0 z-20">
      <div>
        {title && <h1 className="text-lg font-semibold text-navy">{title}</h1>}
        {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false) }}
            className="relative p-2 rounded-lg hover:bg-gray-50 text-muted transition-colors"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-sm text-navy">Notifications</h3>
                <button onClick={() => setNotifOpen(false)}><X size={14} className="text-muted" /></button>
              </div>
              <div className="p-4 text-center text-sm text-muted">No new notifications</div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false) }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 bg-navy rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {profile?.full_name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-navy leading-tight">{profile?.full_name ?? 'Admin'}</p>
              <p className="text-xs text-muted capitalize">{profile?.role ?? 'admin'}</p>
            </div>
            <ChevronDown size={14} className="text-muted" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50 py-1">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-navy">{profile?.full_name}</p>
                <p className="text-xs text-muted">{profile?.email}</p>
              </div>
              <button
                onClick={() => navigate('/admin/settings')}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Settings
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 text-sm text-danger hover:bg-gray-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Topbar
