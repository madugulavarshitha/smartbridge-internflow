import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Rocket,
  LogOut,
  Bell,
  GraduationCap,
  Layers,
  CheckSquare,
  Award,
  MessageSquare,
  User,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface InternLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

const InternLayout: React.FC<InternLayoutProps> = ({ children, title = 'Intern Learning Hub', subtitle }) => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (profile && profile.role !== 'intern') {
      if (profile.role === 'admin') navigate('/admin')
      else if (profile.role === 'mentor') navigate('/mentor/dashboard')
    }
  }, [profile, navigate])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/intern/dashboard' },
    { label: 'LaunchPad Roadmap', icon: Layers, path: '/intern/launchpad' },
    { label: 'My Deliverables', icon: CheckSquare, path: '/intern/tasks' },
    { label: 'Certifications', icon: Award, path: '/intern/certifications' },
    { label: 'Mentor Feedback', icon: MessageSquare, path: '/intern/feedback' },
    { label: 'My Profile', icon: User, path: '/intern/profile' },
  ]

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Intern Sidebar (Matches Admin Sidebar Design) */}
      <aside className="w-64 bg-navy text-white fixed top-0 bottom-0 left-0 flex flex-col z-30">
        {/* Brand Header */}
        <div className="p-5 flex items-center gap-3 border-b border-navy-light/40">
          <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <Rocket size={18} />
          </div>
          <div>
            <span className="font-bold text-white text-base leading-tight block tracking-tight">INTERNFLOW</span>
            <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wide">Intern Portal</span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 text-[10px] font-bold text-blue-300 uppercase tracking-wider mb-2">My Journey</p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-blue-100/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={17} />
                <span>{item.label}</span>
              </button>
            )
          })}

          <div className="pt-6">
            <p className="px-3 text-[10px] font-bold text-blue-300 uppercase tracking-wider mb-2">Program Stages</p>
            <div className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-blue-100 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-500/30 text-blue-300 text-[10px] flex items-center justify-center font-bold">W</span>
                <span>Week 0 Baseline</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] flex items-center justify-center font-bold">1</span>
                <span>Stage 1: Learner</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-500/30 text-amber-300 text-[10px] flex items-center justify-center font-bold">2</span>
                <span>Stage 2: Practitioner</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-purple-500/30 text-purple-300 text-[10px] flex items-center justify-center font-bold">3</span>
                <span>Stage 3: Developer</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-rose-500/30 text-rose-300 text-[10px] flex items-center justify-center font-bold">4</span>
                <span>Stage 4: Professional</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Intern Profile Card & Sign Out */}
        <div className="p-4 border-t border-navy-light/40 bg-navy-light/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold text-sm">
              {profile?.full_name?.[0] ?? 'I'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{profile?.full_name ?? 'Intern'}</p>
              <p className="text-xs text-blue-300 truncate">{profile?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-blue-200 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Body */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Topbar (Matches Admin Topbar Design) */}
        <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-lg font-bold text-navy leading-tight">{title}</h1>
            {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg text-muted hover:text-navy hover:bg-gray-50 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
            </button>

            <div className="flex items-center gap-3 pl-3 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-navy leading-tight">{profile?.full_name}</p>
                <div className="flex items-center justify-end gap-1 text-[11px] text-emerald-600 font-medium">
                  <GraduationCap size={12} />
                  <span>Enrolled Intern</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-xs">
                {profile?.full_name?.[0] ?? 'I'}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default InternLayout
