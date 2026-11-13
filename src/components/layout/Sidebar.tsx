import React, { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserCheck, Grid3X3, Link2,
  BookOpen, BarChart3, FileText, CheckSquare, FolderKanban,
  Award, TrendingUp, AlertCircle, ArrowUpCircle,
  FileBarChart, Bell, Shield, Settings, LogOut, ChevronDown, ChevronRight,
  Rocket, ClipboardList, CalendarCheck
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface NavItem {
  label: string
  icon: React.ElementType
  to?: string
  children?: NavItem[]
  group?: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin' },
  {
    label: 'People', icon: Users, group: 'people', children: [
      { label: 'Interns', icon: Users, to: '/admin/interns' },
      { label: 'Mentors', icon: UserCheck, to: '/admin/mentors' },
      { label: 'Tracks', icon: Grid3X3, to: '/admin/batches' },
      { label: 'Assignments', icon: Link2, to: '/admin/assignments' },
    ]
  },
  {
    label: 'Program', icon: Rocket, group: 'program', children: [
      { label: 'Program Overview', icon: BookOpen, to: '/admin/program' },
      { label: 'Assessment', icon: ClipboardList, to: '/admin/baseline' },
      { label: 'Attendance', icon: CalendarCheck, to: '/admin/attendance' },
      { label: 'KPI Monitoring', icon: BarChart3, to: '/admin/kpi' },
      { label: 'Monthly Reports', icon: FileText, to: '/admin/reports/monthly' },
    ]
  },
  {
    label: 'Work', icon: FolderKanban, group: 'work', children: [
      { label: 'Tasks', icon: CheckSquare, to: '/admin/tasks' },
      { label: 'Projects', icon: FolderKanban, to: '/admin/projects' },
      { label: 'Certifications', icon: Award, to: '/admin/certifications' },
    ]
  },
  {
    label: 'Growth', icon: TrendingUp, group: 'growth', children: [
      { label: 'Improvement Plans', icon: AlertCircle, to: '/admin/improvement-plans' },
      { label: 'Progression', icon: ArrowUpCircle, to: '/admin/progression' },
    ]
  },
  {
    label: 'Admin', icon: Shield, group: 'admin', children: [
      { label: 'Reports', icon: FileBarChart, to: '/admin/reports' },
      { label: 'Notifications', icon: Bell, to: '/admin/notifications' },
      { label: 'Audit Logs', icon: FileText, to: '/admin/audit-logs' },
      { label: 'Permissions', icon: Shield, to: '/admin/permissions' },
      { label: 'Settings', icon: Settings, to: '/admin/settings' },
    ]
  },
]

const SIDEBAR_GROUPS_KEY = 'internflow_sidebar_open_groups'

function readOpenGroups(): Record<string, boolean> {
  try {
    const raw = sessionStorage.getItem(SIDEBAR_GROUPS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

interface SidebarItemProps {
  item: NavItem
}

const SidebarItem: React.FC<SidebarItemProps> = ({ item }) => {
  const { pathname } = useLocation()
  const groupKey = item.group ?? item.label

  const [open, setOpen] = useState<boolean>(() => {
    const saved = readOpenGroups()
    if (groupKey in saved) return Boolean(saved[groupKey])
    return Boolean(item.children?.some((child) => child.to && pathname.startsWith(child.to)))
  })

  const toggleOpen = () => {
    setOpen((prev) => {
      const next = !prev
      const saved = readOpenGroups()
      saved[groupKey] = next
      try {
        sessionStorage.setItem(SIDEBAR_GROUPS_KEY, JSON.stringify(saved))
      } catch { /* ignore */ }
      return next
    })
  }

  if (item.children) {
    return (
      <div>
        <button
          onClick={toggleOpen}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-blue-100 hover:bg-white/10 transition-colors text-sm font-medium"
        >
          <item.icon size={18} className="flex-shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {open && (
          <div className="ml-4 mt-1 space-y-0.5 border-l border-white/10 pl-3">
            {item.children.map((child) => (
              <NavLink
                key={child.to}
                to={child.to!}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white font-semibold'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <child.icon size={15} className="flex-shrink-0" />
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <NavLink
      to={item.to!}
      end={item.to === '/admin'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-white/20 text-white font-semibold'
            : 'text-blue-100 hover:bg-white/10 hover:text-white'
        }`
      }
    >
      <item.icon size={18} className="flex-shrink-0" />
      {item.label}
    </NavLink>
  )
}

const Sidebar: React.FC = () => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-navy flex flex-col z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
          <Rocket size={20} className="text-white" />
        </div>
        <div>
          <span className="text-white font-bold text-sm leading-tight block">INTERNFLOW</span>
          <span className="text-blue-200 text-xs">LaunchPad Admin</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <SidebarItem key={item.label} item={item} />
        ))}
      </nav>

      {/* User info */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            {profile?.full_name?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{profile?.full_name ?? 'Admin'}</p>
            <p className="text-blue-200 text-xs truncate">{profile?.email ?? ''}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-blue-100 hover:bg-white/10 hover:text-white transition-colors text-sm"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}

export default Sidebar

