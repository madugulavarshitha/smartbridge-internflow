import React, { useState, useEffect, useCallback } from 'react'
import {
  Users, UserCheck, AlertCircle, RefreshCw, Search, Plus,
  UserMinus, BarChart2,
} from 'lucide-react'
import AdminLayout from '../../../components/layout/AdminLayout'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Card from '../../../components/ui/Card'
import Modal from '../../../components/ui/Modal'
import Select from '../../../components/ui/Select'
import EmptyState from '../../../components/ui/EmptyState'
import { supabase, isSupabaseConfigured } from '../../../lib/supabase'
import { useAuth } from '../../../contexts/AuthContext'
import { accountService } from '../../../lib/accountService'
import type { MentorAssignment, Intern, Mentor } from '../../../types'

const DEMO_ASSIGNMENTS_KEY = 'internflow_demo_assignments'
const DEMO_UNASSIGNED_KEY = 'internflow_demo_unassigned'
const DEMO_WORKLOAD_KEY = 'internflow_demo_workload'

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_ASSIGNMENTS: (MentorAssignment & { batchName?: string })[] = [
  {
    id: 'a1', intern_id: 'i1', mentor_id: 'm1', assigned_by: 'admin',
    assigned_at: '2026-01-20T00:00:00Z', is_current: true,
    batchName: 'LP-JAN26',
    intern: {
      id: 'i1', profile_id: 'p1', intern_id: 'INT-001', current_stage: 2,
      status: 'active', created_at: '', updated_at: '',
      profile: { id: 'p1', email: 'rahul@example.com', full_name: 'Rahul Sharma', role: 'intern', is_active: true, created_at: '', updated_at: '' },
    },
    mentor: {
      id: 'm1', profile_id: 'pm1', employee_id: 'EMP-001', status: 'active',
      created_at: '', updated_at: '', intern_count: 3,
      profile: { id: 'pm1', email: 'anita@example.com', full_name: 'Anita Verma', role: 'mentor', is_active: true, created_at: '', updated_at: '' },
    },
  },
  {
    id: 'a2', intern_id: 'i2', mentor_id: 'm2', assigned_by: 'admin',
    assigned_at: '2026-01-21T00:00:00Z', is_current: true,
    batchName: 'LP-JAN26',
    intern: {
      id: 'i2', profile_id: 'p2', intern_id: 'INT-002', current_stage: 1,
      status: 'active', created_at: '', updated_at: '',
      profile: { id: 'p2', email: 'priya@example.com', full_name: 'Priya Patel', role: 'intern', is_active: true, created_at: '', updated_at: '' },
    },
    mentor: {
      id: 'm2', profile_id: 'pm2', employee_id: 'EMP-002', status: 'active',
      created_at: '', updated_at: '', intern_count: 2,
      profile: { id: 'pm2', email: 'raju@example.com', full_name: 'Raju Nair', role: 'mentor', is_active: true, created_at: '', updated_at: '' },
    },
  },
  {
    id: 'a3', intern_id: 'i3', mentor_id: 'm1', assigned_by: 'admin',
    assigned_at: '2026-04-05T00:00:00Z', is_current: false,
    batchName: 'LP-APR26',
    intern: {
      id: 'i3', profile_id: 'p3', intern_id: 'INT-003', current_stage: 3,
      status: 'active', created_at: '', updated_at: '',
      profile: { id: 'p3', email: 'amit@example.com', full_name: 'Amit Kumar', role: 'intern', is_active: true, created_at: '', updated_at: '' },
    },
    mentor: {
      id: 'm1', profile_id: 'pm1', employee_id: 'EMP-001', status: 'active',
      created_at: '', updated_at: '', intern_count: 3,
      profile: { id: 'pm1', email: 'anita@example.com', full_name: 'Anita Verma', role: 'mentor', is_active: true, created_at: '', updated_at: '' },
    },
  },
]

const MOCK_UNASSIGNED: Intern[] = [
  {
    id: 'i4', profile_id: 'p4', intern_id: 'INT-004', current_stage: 1,
    status: 'active', batch_id: 'b2', track: 'Full Stack', created_at: '', updated_at: '',
    profile: { id: 'p4', email: 'sneha@example.com', full_name: 'Sneha Reddy', role: 'intern', is_active: true, created_at: '', updated_at: '' },
    batch: { id: 'b2', name: 'LaunchPad Apr 2026', code: 'LP-APR26', duration_weeks: 24, status: 'active', created_at: '' },
  },
  {
    id: 'i5', profile_id: 'p5', intern_id: 'INT-005', current_stage: 2,
    status: 'active', batch_id: 'b1', track: 'AI/ML', created_at: '', updated_at: '',
    profile: { id: 'p5', email: 'lakshmi@example.com', full_name: 'Lakshmi Narayan', role: 'intern', is_active: true, created_at: '', updated_at: '' },
    batch: { id: 'b1', name: 'LaunchPad Jan 2026', code: 'LP-JAN26', duration_weeks: 24, status: 'active', created_at: '' },
  },
]

interface MentorWorkload {
  mentor: Mentor
  activeInterns: number
  pendingEvaluations: number
}

const MOCK_WORKLOAD: MentorWorkload[] = [
  {
    mentor: {
      id: 'm1', profile_id: 'pm1', employee_id: 'EMP-001', status: 'active',
      domain: 'Full Stack', designation: 'Senior Engineer',
      created_at: '', updated_at: '', intern_count: 3,
      profile: { id: 'pm1', email: 'anita@example.com', full_name: 'Anita Verma', role: 'mentor', is_active: true, created_at: '', updated_at: '' },
    },
    activeInterns: 3,
    pendingEvaluations: 1,
  },
  {
    mentor: {
      id: 'm2', profile_id: 'pm2', employee_id: 'EMP-002', status: 'active',
      domain: 'AI/ML', designation: 'Tech Lead',
      created_at: '', updated_at: '', intern_count: 2,
      profile: { id: 'pm2', email: 'raju@example.com', full_name: 'Raju Nair', role: 'mentor', is_active: true, created_at: '', updated_at: '' },
    },
    activeInterns: 2,
    pendingEvaluations: 3,
  },
  {
    mentor: {
      id: 'm3', profile_id: 'pm3', employee_id: 'EMP-003', status: 'active',
      domain: 'DevOps', designation: 'Principal Engineer',
      created_at: '', updated_at: '', intern_count: 0,
      profile: { id: 'pm3', email: 'deepa@example.com', full_name: 'Deepa Krishnan', role: 'mentor', is_active: true, created_at: '', updated_at: '' },
    },
    activeInterns: 0,
    pendingEvaluations: 0,
  },
]

const MOCK_MENTORS_FOR_ASSIGN: Mentor[] = MOCK_WORKLOAD.map(w => w.mentor)

const MAX_INTERNS_PER_MENTOR = 5

type TabId = 'all' | 'unassigned' | 'workload'

const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

// ─── Component ────────────────────────────────────────────────────────────────
const AssignmentsPage: React.FC = () => {
  const { user, profile } = useAuth()
  const [tab, setTab] = useState<TabId>('all')

  // All Assignments
  const [assignments, setAssignments] = useState<(MentorAssignment & { batchName?: string })[]>([])
  const [loadingAll, setLoadingAll] = useState(true)
  const [searchAll, setSearchAll] = useState('')
  const [batchFilter, setBatchFilter] = useState('')
  const [mentorFilter, setMentorFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'current' | 'historical' | ''>('')

  // Unassigned
  const [unassigned, setUnassigned] = useState<Intern[]>([])
  const [loadingUnassigned, setLoadingUnassigned] = useState(true)

  // Workload
  const [workload, setWorkload] = useState<MentorWorkload[]>([])
  const [loadingWorkload, setLoadingWorkload] = useState(true)

  // Reassign modal
  const [reassignTarget, setReassignTarget] = useState<(MentorAssignment & { batchName?: string }) | null>(null)
  const [showReassign, setShowReassign] = useState(false)
  const [reassignMentorId, setReassignMentorId] = useState('')
  const [reassignReason, setReassignReason] = useState('')
  const [reassignErrors, setReassignErrors] = useState<{ mentor?: string; reason?: string }>({})
  const [reassigning, setReassigning] = useState(false)

  // Assign modal (for unassigned interns)
  const [assignTarget, setAssignTarget] = useState<Intern | null>(null)
  const [showAssign, setShowAssign] = useState(false)
  const [assignMentorId, setAssignMentorId] = useState('')
  const [assignErrors, setAssignErrors] = useState<{ mentor?: string }>({})
  const [assigning, setAssigning] = useState(false)

  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoadingAll(true)
    try {
      const managed = accountService.getAssignments()
      if (!isSupabaseConfigured) {
        const saved = sessionStorage.getItem(DEMO_ASSIGNMENTS_KEY)
        const demoList = saved ? JSON.parse(saved) : MOCK_ASSIGNMENTS
        const existingIds = new Set(managed.map((m) => m.id))
        const extra = demoList.filter((d: MentorAssignment) => !existingIds.has(d.id))
        setAssignments([...managed, ...extra])
        return
      }
      const { data, error } = await supabase
        .from('mentor_assignments')
        .select('*, intern:interns(*, profile:profiles(*), batch:batches(*)), mentor:mentors(*, profile:profiles(*))')
        .order('assigned_at', { ascending: false })
      if (error || !data) {
        const existingIds = new Set(managed.map((m) => m.id))
        const extra = MOCK_ASSIGNMENTS.filter((d) => !existingIds.has(d.id))
        setAssignments([...managed, ...extra])
      } else {
        setAssignments(data as typeof MOCK_ASSIGNMENTS)
      }
    } catch {
      const managed = accountService.getAssignments()
      const existingIds = new Set(managed.map((m) => m.id))
      const extra = MOCK_ASSIGNMENTS.filter((d) => !existingIds.has(d.id))
      setAssignments([...managed, ...extra])
    }
    finally { setLoadingAll(false) }
  }, [])

  const fetchUnassigned = useCallback(async () => {
    setLoadingUnassigned(true)
    try {
      if (!isSupabaseConfigured) {
        const saved = sessionStorage.getItem(DEMO_UNASSIGNED_KEY)
        setUnassigned(saved ? JSON.parse(saved) : MOCK_UNASSIGNED)
        return
      }
      const [{ data, error }, { data: currentAssigns }] = await Promise.all([
        supabase.from('interns').select('*, profile:profiles(*), batch:batches(*)').eq('status', 'active'),
        supabase.from('mentor_assignments').select('intern_id').eq('is_current', true),
      ])
      if (error || !data) {
        setUnassigned(MOCK_UNASSIGNED)
      } else {
        const assignedIds = new Set((currentAssigns ?? []).map((a: { intern_id: string }) => a.intern_id))
        setUnassigned((data as Intern[]).filter(i => !assignedIds.has(i.id)))
      }
    } catch { setUnassigned(MOCK_UNASSIGNED) }
    finally { setLoadingUnassigned(false) }
  }, [])

  const fetchWorkload = useCallback(async () => {
    setLoadingWorkload(true)
    try {
      if (!isSupabaseConfigured) {
        const saved = sessionStorage.getItem(DEMO_WORKLOAD_KEY)
        setWorkload(saved ? JSON.parse(saved) : MOCK_WORKLOAD)
        return
      }
      const [{ data, error }, { data: activeAssigns }] = await Promise.all([
        supabase.from('mentors').select('*, profile:profiles(*)').eq('status', 'active'),
        supabase.from('mentor_assignments').select('mentor_id').eq('is_current', true),
      ])
      if (error || !data) {
        setWorkload(MOCK_WORKLOAD)
      } else {
        const countByMentor: Record<string, number> = {}
        for (const a of (activeAssigns ?? []) as Array<{ mentor_id: string }>) {
          countByMentor[a.mentor_id] = (countByMentor[a.mentor_id] || 0) + 1
        }
        setWorkload((data as Mentor[]).map(m => ({
          mentor: m,
          activeInterns: countByMentor[m.id] ?? m.intern_count ?? 0,
          pendingEvaluations: 0,
        })))
      }
    } catch { setWorkload(MOCK_WORKLOAD) }
    finally { setLoadingWorkload(false) }
  }, [])

  useEffect(() => { fetchAll(); fetchUnassigned(); fetchWorkload() }, [fetchAll, fetchUnassigned, fetchWorkload])

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  // ── Filtered assignments ───────────────────────────────────────────────────
  const filteredAssignments = assignments.filter(a => {
    const matchSearch = !searchAll ||
      a.intern?.profile?.full_name?.toLowerCase().includes(searchAll.toLowerCase()) ||
      a.intern?.intern_id?.toLowerCase().includes(searchAll.toLowerCase()) ||
      a.mentor?.profile?.full_name?.toLowerCase().includes(searchAll.toLowerCase())
    const matchBatch = !batchFilter || (a.batchName ?? a.intern?.batch?.code ?? '').toLowerCase().includes(batchFilter.toLowerCase())
    const matchMentor = !mentorFilter || a.mentor?.profile?.full_name?.toLowerCase().includes(mentorFilter.toLowerCase())
    const matchStatus = !statusFilter || (statusFilter === 'current' ? a.is_current : !a.is_current)
    return matchSearch && matchBatch && matchMentor && matchStatus
  })

  // ── Reassign ───────────────────────────────────────────────────────────────
  const openReassign = (a: MentorAssignment & { batchName?: string }) => {
    setReassignTarget(a)
    setReassignMentorId('')
    setReassignReason('')
    setReassignErrors({})
    setShowReassign(true)
  }

  const handleReassign = async () => {
    const errs: typeof reassignErrors = {}
    if (!reassignMentorId) errs.mentor = 'Please select a mentor'
    else if (reassignMentorId === reassignTarget?.mentor_id) errs.mentor = 'Please select a different mentor'
    if (!reassignReason.trim()) errs.reason = 'Reason is required'
    setReassignErrors(errs)
    if (Object.keys(errs).length > 0 || !reassignTarget) return
    setReassigning(true)
    const now = new Date().toISOString()

    try {
      if (isSupabaseConfigured) {
        const { error: updErr } = await supabase
          .from('mentor_assignments')
          .update({ is_current: false, end_date: now })
          .eq('id', reassignTarget.id)
        if (updErr) throw updErr

        const { error: insErr } = await supabase.from('mentor_assignments').insert([{
          intern_id: reassignTarget.intern_id,
          mentor_id: reassignMentorId,
          assigned_by: user?.id,
          assigned_at: now,
          is_current: true,
          reason: reassignReason,
        }])
        if (insErr) throw insErr

        if (user) {
          await supabase.from('audit_logs').insert({
            actor_id: user.id,
            actor_role: profile?.role ?? 'admin',
            action: 'mentor.reassigned',
            entity_type: 'mentor_assignment',
            entity_id: reassignTarget.intern_id,
            before_value: { mentor_id: reassignTarget.mentor_id },
            after_value: { mentor_id: reassignMentorId },
            reason: reassignReason,
          })
        }
        await Promise.all([fetchAll(), fetchWorkload()])
        setToast({ type: 'success', msg: 'Mentor reassigned successfully!' })
      } else {
        const newMentor = workload.find(w => w.mentor.id === reassignMentorId)?.mentor
          ?? MOCK_MENTORS_FOR_ASSIGN.find(m => m.id === reassignMentorId)
        const newAssignment: MentorAssignment & { batchName?: string } = {
          id: `a-${Date.now()}`,
          intern_id: reassignTarget.intern_id,
          mentor_id: reassignMentorId,
          assigned_by: user?.id ?? 'admin',
          assigned_at: now,
          is_current: true,
          reason: reassignReason,
          batchName: reassignTarget.batchName ?? reassignTarget.intern?.batch?.code,
          intern: reassignTarget.intern,
          mentor: newMentor,
        }
        setAssignments(prev => {
          const updated = [
            newAssignment,
            ...prev.map(a => a.id === reassignTarget.id ? { ...a, is_current: false, end_date: now } : a),
          ]
          sessionStorage.setItem(DEMO_ASSIGNMENTS_KEY, JSON.stringify(updated))
          return updated
        })
        setWorkload(prev => {
          const updated = prev.map(w => {
            if (w.mentor.id === reassignTarget.mentor_id) return { ...w, activeInterns: Math.max(0, w.activeInterns - 1) }
            if (w.mentor.id === reassignMentorId) return { ...w, activeInterns: w.activeInterns + 1 }
            return w
          })
          sessionStorage.setItem(DEMO_WORKLOAD_KEY, JSON.stringify(updated))
          return updated
        })
        setToast({ type: 'success', msg: 'Mentor reassigned successfully!' })
      }
      setShowReassign(false)
    } catch (err) {
      setToast({ type: 'error', msg: (err as Error).message || 'Failed to reassign mentor.' })
    } finally {
      setReassigning(false)
    }
  }

  // ── Assign ─────────────────────────────────────────────────────────────────
  const openAssign = (intern: Intern) => {
    setAssignTarget(intern)
    setAssignMentorId('')
    setAssignErrors({})
    setShowAssign(true)
  }

  const handleAssign = async () => {
    if (!assignMentorId) { setAssignErrors({ mentor: 'Please select a mentor' }); return }
    if (!assignTarget) return
    setAssigning(true)
    const now = new Date().toISOString()

    try {
      if (isSupabaseConfigured) {
        const { error: insErr } = await supabase.from('mentor_assignments').insert([{
          intern_id: assignTarget.id,
          mentor_id: assignMentorId,
          assigned_by: user?.id,
          assigned_at: now,
          is_current: true,
        }])
        if (insErr) throw insErr

        if (user) {
          await supabase.from('audit_logs').insert({
            actor_id: user.id,
            actor_role: profile?.role ?? 'admin',
            action: 'mentor.assigned',
            entity_type: 'mentor_assignment',
            entity_id: assignTarget.id,
            after_value: { mentor_id: assignMentorId },
          })
        }
        await Promise.all([fetchAll(), fetchUnassigned(), fetchWorkload()])
        setToast({ type: 'success', msg: 'Mentor assigned successfully!' })
      } else {
        const chosenMentor = workload.find(w => w.mentor.id === assignMentorId)?.mentor
          ?? MOCK_MENTORS_FOR_ASSIGN.find(m => m.id === assignMentorId)
        const newAssignment: MentorAssignment & { batchName?: string } = {
          id: `a-${Date.now()}`,
          intern_id: assignTarget.id,
          mentor_id: assignMentorId,
          assigned_by: user?.id ?? 'admin',
          assigned_at: now,
          is_current: true,
          batchName: assignTarget.batch?.code,
          intern: assignTarget,
          mentor: chosenMentor,
        }
        setAssignments(prev => {
          const updated = [newAssignment, ...prev]
          sessionStorage.setItem(DEMO_ASSIGNMENTS_KEY, JSON.stringify(updated))
          return updated
        })
        setUnassigned(prev => {
          const updated = prev.filter(i => i.id !== assignTarget.id)
          sessionStorage.setItem(DEMO_UNASSIGNED_KEY, JSON.stringify(updated))
          return updated
        })
        setWorkload(prev => {
          const updated = prev.map(w => w.mentor.id === assignMentorId ? { ...w, activeInterns: w.activeInterns + 1 } : w)
          sessionStorage.setItem(DEMO_WORKLOAD_KEY, JSON.stringify(updated))
          return updated
        })
        setToast({ type: 'success', msg: 'Mentor assigned successfully!' })
      }
      setShowAssign(false)
    } catch (err) {
      setToast({ type: 'error', msg: (err as Error).message || 'Failed to assign mentor.' })
    } finally {
      setAssigning(false)
    }
  }

  // ── Mentor select options ──────────────────────────────────────────────────
  const availableMentors = workload.length > 0 ? workload.map(w => ({ ...w.mentor, intern_count: w.activeInterns })) : MOCK_MENTORS_FOR_ASSIGN
  const mentorOptions = [
    { value: '', label: 'Select a mentor…' },
    ...availableMentors.map(m => ({
      value: m.id,
      label: `${m.profile?.full_name ?? m.employee_id} (${m.intern_count ?? 0} interns)`,
    })),
  ]

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AdminLayout title="Assignments" subtitle="Manage mentor–intern assignments">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white
          ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-white rounded-xl border border-gray-100 shadow-sm p-1 w-fit">
        {([
          { id: 'all', label: 'All Assignments', icon: Users },
          { id: 'unassigned', label: 'Unassigned Interns', icon: UserMinus },
          { id: 'workload', label: 'Mentor Workload', icon: BarChart2 },
        ] as { id: TabId; label: string; icon: React.ElementType }[]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${tab === t.id ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-navy hover:bg-gray-50'}`}
          >
            <t.icon size={15} />
            {t.label}
            {t.id === 'unassigned' && unassigned.length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                {unassigned.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: All Assignments ── */}
      {tab === 'all' && (
        <Card padding="none">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 p-5 border-b border-gray-100">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search intern or mentor…"
                value={searchAll}
                onChange={e => setSearchAll(e.target.value)}
                className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 w-56"
              />
            </div>
            <input
              type="text"
              placeholder="Filter by batch…"
              value={batchFilter}
              onChange={e => setBatchFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 w-40"
            />
            <input
              type="text"
              placeholder="Filter by mentor…"
              value={mentorFilter}
              onChange={e => setMentorFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 w-40"
            />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as 'current' | 'historical' | '')}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All</option>
              <option value="current">Current</option>
              <option value="historical">Historical</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Intern', 'Intern ID', 'Mentor', 'Batch', 'Assigned Date', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loadingAll ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState icon={Users} title="No assignments found" description="Adjust filters or create an assignment." />
                    </td>
                  </tr>
                ) : (
                  filteredAssignments.map(a => (
                    <tr key={a.id} className="bg-white hover:bg-surface transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm font-semibold flex-shrink-0">
                            {a.intern?.profile?.full_name?.[0] ?? '?'}
                          </div>
                          <div>
                            <p className="font-medium text-navy">{a.intern?.profile?.full_name ?? '—'}</p>
                            <p className="text-xs text-muted">{a.intern?.profile?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-muted">{a.intern?.intern_id ?? '—'}</td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-gray-800">{a.mentor?.profile?.full_name ?? '—'}</p>
                          <p className="text-xs text-muted">{a.mentor?.employee_id}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted">
                        {a.batchName ?? a.intern?.batch?.code ?? '—'}
                      </td>
                      <td className="px-5 py-4 text-muted">{fmt(a.assigned_at)}</td>
                      <td className="px-5 py-4">
                        <Badge variant={a.is_current ? 'success' : 'muted'}>
                          {a.is_current ? 'Current' : 'Historical'}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        {a.is_current && (
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<RefreshCw size={12} />}
                            onClick={() => openReassign(a)}
                          >
                            Reassign
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── Tab: Unassigned Interns ── */}
      {tab === 'unassigned' && (
        <Card padding="none">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div>
              <h3 className="font-semibold text-navy">Unassigned Interns</h3>
              <p className="text-xs text-muted mt-0.5">Interns with no current mentor assignment</p>
            </div>
            <Badge variant="danger" size="md">{unassigned.length} unassigned</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Intern', 'ID', 'Track', 'Stage', 'Batch', 'Action'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loadingUnassigned ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : unassigned.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        icon={UserCheck}
                        title="All interns are assigned!"
                        description="Every active intern currently has a mentor."
                      />
                    </td>
                  </tr>
                ) : (
                  unassigned.map(intern => (
                    <tr key={intern.id} className="bg-white hover:bg-surface transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center text-warning text-sm font-semibold flex-shrink-0">
                            {intern.profile?.full_name?.[0] ?? '?'}
                          </div>
                          <div>
                            <p className="font-medium text-navy">{intern.profile?.full_name ?? '—'}</p>
                            <p className="text-xs text-muted">{intern.profile?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-muted">{intern.intern_id}</td>
                      <td className="px-5 py-4">{intern.track ?? '—'}</td>
                      <td className="px-5 py-4">
                        <Badge variant="primary" size="sm">Stage {intern.current_stage}</Badge>
                      </td>
                      <td className="px-5 py-4 text-muted">{intern.batch?.code ?? '—'}</td>
                      <td className="px-5 py-4">
                        <Button
                          size="sm"
                          icon={<Plus size={12} />}
                          onClick={() => openAssign(intern)}
                        >
                          Assign Mentor
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── Tab: Mentor Workload ── */}
      {tab === 'workload' && (
        <Card padding="none">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-navy">Mentor Workload</h3>
            <p className="text-xs text-muted mt-0.5">Active interns per mentor and pending evaluations</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Mentor', 'Employee ID', 'Domain', 'Active Interns', 'Pending Evals', 'Workload'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loadingWorkload ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : workload.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState icon={AlertCircle} title="No mentor data" description="No active mentors found." />
                    </td>
                  </tr>
                ) : (
                  workload.map(w => {
                    const pct = Math.min(100, Math.round((w.activeInterns / MAX_INTERNS_PER_MENTOR) * 100))
                    const barColor = pct >= 90 ? 'bg-danger' : pct >= 60 ? 'bg-warning' : 'bg-success'
                    return (
                      <tr key={w.mentor.id} className="bg-white hover:bg-surface transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-navy/10 rounded-full flex items-center justify-center text-navy text-sm font-semibold flex-shrink-0">
                              {w.mentor.profile?.full_name?.[0] ?? '?'}
                            </div>
                            <div>
                              <p className="font-medium text-navy">{w.mentor.profile?.full_name ?? '—'}</p>
                              <p className="text-xs text-muted">{w.mentor.designation ?? w.mentor.profile?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-muted">{w.mentor.employee_id}</td>
                        <td className="px-5 py-4">{w.mentor.domain ?? '—'}</td>
                        <td className="px-5 py-4">
                          <span className="font-semibold text-navy">{w.activeInterns}</span>
                          <span className="text-muted text-xs"> / {MAX_INTERNS_PER_MENTOR}</span>
                        </td>
                        <td className="px-5 py-4">
                          {w.pendingEvaluations > 0 ? (
                            <Badge variant="warning">{w.pendingEvaluations} pending</Badge>
                          ) : (
                            <Badge variant="success">None</Badge>
                          )}
                        </td>
                        <td className="px-5 py-4 w-40">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-2 rounded-full transition-all ${barColor}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted w-8">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── Reassign Modal ── */}
      <Modal
        isOpen={showReassign}
        onClose={() => setShowReassign(false)}
        title="Reassign Mentor"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowReassign(false)}>Cancel</Button>
            <Button loading={reassigning} onClick={handleReassign}>Reassign</Button>
          </>
        }
      >
        {reassignTarget && (
          <div className="space-y-4">
            <div className="bg-surface rounded-lg p-4 text-sm">
              <p className="text-muted">Reassigning mentor for</p>
              <p className="font-semibold text-navy mt-0.5">
                {reassignTarget.intern?.profile?.full_name ?? 'Intern'} ({reassignTarget.intern?.intern_id})
              </p>
              <p className="text-xs text-muted mt-1">
                Current mentor: {reassignTarget.mentor?.profile?.full_name ?? '—'}
              </p>
            </div>
            <Select
              label="New Mentor"
              required
              options={mentorOptions.filter(o => o.value !== reassignTarget.mentor_id)}
              value={reassignMentorId}
              onChange={e => setReassignMentorId(e.target.value)}
              error={reassignErrors.mentor}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason <span className="text-danger">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Reason for reassignment…"
                value={reassignReason}
                onChange={e => setReassignReason(e.target.value)}
                className={`w-full rounded-lg border text-sm text-gray-900 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                  ${reassignErrors.reason ? 'border-danger' : 'border-gray-300'}`}
              />
              {reassignErrors.reason && <p className="mt-1 text-xs text-danger">{reassignErrors.reason}</p>}
            </div>
          </div>
        )}
      </Modal>

      {/* ── Assign Modal ── */}
      <Modal
        isOpen={showAssign}
        onClose={() => setShowAssign(false)}
        title="Assign Mentor"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowAssign(false)}>Cancel</Button>
            <Button loading={assigning} onClick={handleAssign}>Assign</Button>
          </>
        }
      >
        {assignTarget && (
          <div className="space-y-4">
            <div className="bg-surface rounded-lg p-4 text-sm">
              <p className="text-muted">Assigning a mentor to</p>
              <p className="font-semibold text-navy mt-0.5">
                {assignTarget.profile?.full_name ?? 'Intern'} ({assignTarget.intern_id})
              </p>
              <p className="text-xs text-muted mt-1">
                Batch: {assignTarget.batch?.code ?? '—'} · Track: {assignTarget.track ?? '—'}
              </p>
            </div>
            <Select
              label="Select Mentor"
              required
              options={mentorOptions}
              value={assignMentorId}
              onChange={e => setAssignMentorId(e.target.value)}
              error={assignErrors.mentor}
            />
          </div>
        )}
      </Modal>
    </AdminLayout>
  )
}

export default AssignmentsPage
