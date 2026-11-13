import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  LogOut,
  Bell,
  Rocket,
  ShieldCheck,
  ClipboardList,
  Layers,
  MessageSquare,
  FileBarChart,
  User,
  FolderKanban,
  Award,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface MentorLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

const MentorLayout: React.FC<MentorLayoutProps> = ({ children, title = 'Mentor Workspace', subtitle }) => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (profile && profile.role !== 'mentor') {
      if (profile.role === 'admin') navigate('/admin')
      else if (profile.role === 'intern') navigate('/intern/dashboard')
    }
  }, [profile, navigate])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/mentor/dashboard' },
    { label: 'Assigned Interns', icon: Users, path: '/mentor/interns' },
    { label: 'Task Reviews', icon: CheckSquare, path: '/mentor/tasks' },
    { label: 'Stage Evaluations', icon: ClipboardList, path: '/mentor/evaluations' },
    { label: 'Feedback & Plans', icon: MessageSquare, path: '/mentor/feedback' },
    { label: 'LaunchPad Roadmap', icon: Layers, path: '/mentor/launchpad' },
    { label: 'Assigned Batches', icon: FolderKanban, path: '/mentor/batches' },
    { label: 'Cohort Reports', icon: FileBarChart, path: '/mentor/reports' },
    { label: 'Mentor Profile', icon: User, path: '/mentor/profile' },
  ]

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Mentor Sidebar (Matches Admin Sidebar Design) */}
      <aside className="w-64 bg-navy text-white fixed top-0 bottom-0 left-0 flex flex-col z-30">
        {/* Brand Header */}
        <div className="p-5 flex items-center gap-3 border-b border-navy-light/40">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <Rocket size={18} />
          </div>
          <div>
            <span className="font-bold text-white text-base leading-tight block tracking-tight">INTERNFLOW</span>
            <span className="text-[11px] font-semibold text-blue-200 uppercase tracking-wide">Mentor Portal</span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 text-[10px] font-bold text-blue-300 uppercase tracking-wider mb-2">Mentor Workspace</p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-blue-100/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={17} />
                <span>{item.label}</span>
              </button>
            )
          })}

          <div className="pt-6">
            <p className="px-3 text-[10px] font-bold text-blue-300 uppercase tracking-wider mb-2">Mentorship Scope</p>
            <div className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-blue-100 space-y-2">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-primary-light" />
                <span>Assigned Interns</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckSquare size={14} className="text-amber-400" />
                <span>Stage 1–4 Assessments</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={14} className="text-emerald-400" />
                <span>Milestone Verification</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Mentor Profile Card & Sign Out */}
        <div className="p-4 border-t border-navy-light/40 bg-navy-light/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary-light font-bold text-sm">
              {profile?.full_name?.[0] ?? 'M'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{profile?.full_name ?? 'Mentor'}</p>
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
            <button
              onClick={() => navigate('/mentor/notifications')}
              className="relative p-2 rounded-lg text-muted hover:text-navy hover:bg-gray-50 transition-colors"
              title="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </button>

            <button
              onClick={() => navigate('/mentor/profile')}
              className="flex items-center gap-3 pl-3 border-l border-gray-100 hover:opacity-85 transition-opacity text-left"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-navy leading-tight">{profile?.full_name}</p>
                <div className="flex items-center justify-end gap-1 text-[11px] text-primary font-medium">
                  <ShieldCheck size={12} />
                  <span>Verified Mentor</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center text-navy font-bold text-xs">
                {profile?.full_name?.[0] ?? 'M'}
              </div>
            </button>
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

export default MentorLayout
