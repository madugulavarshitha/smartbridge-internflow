import React, { useState, useEffect } from 'react'
import AdminLayout from '../../../components/layout/AdminLayout'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import { supabase } from '../../../lib/supabase'
import type { ImprovementPlan, ImprovementPlanStatus } from '../../../types'
import {
  ClipboardList, Plus, Search, Eye, Edit3, AlertCircle,
  CheckCircle2, Circle, Trash2,
} from 'lucide-react'

// ─── Mock Data ───────────────────────────────────────────────────────────────
const MOCK_PLANS: (ImprovementPlan & { intern_name: string; intern_id_code: string; batch_name: string; assigned_to_name: string })[] = [
  {
    id: 'plan-1', intern_id: 'int-1', intern_name: 'Riya Sharma', intern_id_code: 'SB-2026-001', batch_name: 'AI & Cloud',
    stage: 2, concerns: 'Consistently scoring below threshold on BUILD pillar tasks; practical implementation assignments incomplete for two consecutive months.',
    weak_pillars: ['BUILD', 'SHOWCASE'], objectives: 'Improve hands-on project completion rate. Complete at least 3 implementation assignments to a satisfactory standard by target date.',
    action_items: [
      { item: 'Complete React component library task', due_date: '2026-11-20', completed: true },
      { item: 'Attend daily code review sessions with mentor', due_date: '2026-11-30', completed: false },
      { item: 'Submit showcase presentation draft', due_date: '2026-12-05', completed: false },
    ],
    assigned_to: 'admin-1', assigned_to_name: 'Priya Nair', target_date: '2026-12-15', follow_up_date: '2026-11-25',
    status: 'in_progress', outcome: undefined, mentor_id: 'mentor-1', created_at: '2026-10-15T09:00:00Z', updated_at: '2026-11-01T10:30:00Z',
  },
  {
    id: 'plan-2', intern_id: 'int-2', intern_name: 'Aditya Verma', intern_id_code: 'SB-2026-002', batch_name: 'Salesforce',
    stage: 1, concerns: 'Difficulty understanding core concepts during Stage 1. LEARN scores below 60 for two consecutive months. Requires structured guidance to build foundational knowledge.',
    weak_pillars: ['LEARN', 'SHARE'], objectives: 'Strengthen foundational technical knowledge and improve knowledge sharing participation.',
    action_items: [
      { item: 'Complete supplementary reading modules on data structures', due_date: '2026-11-18', completed: true },
      { item: 'Lead one KT session per week', due_date: '2026-12-01', completed: false },
      { item: 'Write summary notes for each topic covered', due_date: '2026-12-10', completed: false },
    ],
    assigned_to: 'admin-2', assigned_to_name: 'Rajan Mehta', target_date: '2026-12-20', follow_up_date: '2026-11-22',
    status: 'open', outcome: undefined, mentor_id: 'mentor-2', created_at: '2026-11-01T08:00:00Z', updated_at: '2026-11-01T08:00:00Z',
  },
  {
    id: 'plan-3', intern_id: 'int-3', intern_name: 'Meera Pillai', intern_id_code: 'SB-2026-003', batch_name: 'Software Engineering',
    stage: 3, concerns: 'Project milestones missed for Stage 3. BUILD and SHOWCASE scores not meeting L2 threshold. Communication during team coordination needs improvement.',
    weak_pillars: ['BUILD', 'SHARE', 'SHOWCASE'], objectives: 'Deliver Stage 3 project on schedule. Improve team communication and showcase quality.',
    action_items: [
      { item: 'Define project scope and timeline with mentor', due_date: '2026-10-30', completed: true },
      { item: 'Weekly progress check-in with assigned admin', due_date: '2026-11-30', completed: true },
      { item: 'Submit final project documentation', due_date: '2026-12-01', completed: false },
    ],
    assigned_to: 'admin-1', assigned_to_name: 'Priya Nair', target_date: '2026-12-01', follow_up_date: '2026-11-15',
    status: 'under_review', outcome: undefined, mentor_id: 'mentor-3', created_at: '2026-10-01T09:00:00Z', updated_at: '2026-11-10T11:00:00Z',
  },
  {
    id: 'plan-4', intern_id: 'int-4', intern_name: 'Karan Joshi', intern_id_code: 'SB-2025-012', batch_name: 'IoT & Robotics',
    stage: 2, concerns: 'No measurable improvement after first improvement plan cycle. Persistent low scores across all KPI pillars despite additional support.',
    weak_pillars: ['LEARN', 'BUILD', 'SHARE', 'SHOWCASE'], objectives: 'Final escalation review before program decision.',
    action_items: [
      { item: 'HR review meeting', due_date: '2026-11-10', completed: true },
      { item: 'Director-level decision on continuation', due_date: '2026-11-15', completed: false },
    ],
    assigned_to: 'admin-3', assigned_to_name: 'Suresh Kumar', target_date: '2026-11-20', follow_up_date: '2026-11-12',
    status: 'escalated', outcome: undefined, mentor_id: 'mentor-1', created_at: '2026-09-01T09:00:00Z', updated_at: '2026-11-08T16:00:00Z',
  },
  {
    id: 'plan-5', intern_id: 'int-5', intern_name: 'Sneha Reddy', intern_id_code: 'SB-2025-008', batch_name: 'ServiceNow',
    stage: 4, concerns: 'Initial difficulty with Stage 4 capstone project scope. Required structured plan to meet final deliverable standards.',
    weak_pillars: ['BUILD', 'SHOWCASE'], objectives: 'Complete capstone project to L3 standard.',
    action_items: [
      { item: 'Weekly technical review with senior mentor', due_date: '2026-09-30', completed: true },
      { item: 'Submit capstone documentation', due_date: '2026-10-15', completed: true },
      { item: 'Final demonstration to panel', due_date: '2026-10-20', completed: true },
    ],
    assigned_to: 'admin-2', assigned_to_name: 'Rajan Mehta', target_date: '2026-10-20', follow_up_date: '2026-10-10',
    status: 'completed', outcome: 'Intern successfully completed capstone project with L3 score (88). Improvement plan objectives fully achieved.',
    mentor_id: 'mentor-4', created_at: '2026-08-01T09:00:00Z', updated_at: '2026-10-22T10:00:00Z',
  },
  {
    id: 'plan-6', intern_id: 'int-6', intern_name: 'Arjun Nambiar', intern_id_code: 'SB-2026-004', batch_name: 'Business Intelligence',
    stage: 1, concerns: 'Attendance and participation irregularity during Stage 1 KT sessions. SHARE pillar consistently low.',
    weak_pillars: ['SHARE', 'LEARN'], objectives: 'Improve consistent participation. Meet SHARE pillar threshold of 70 by target date.',
    action_items: [
      { item: 'Attend all KT sessions without exception', due_date: '2026-11-30', completed: false },
      { item: 'Submit participation log weekly', due_date: '2026-11-30', completed: false },
      { item: 'Lead one KT topic presentation', due_date: '2026-12-05', completed: false },
    ],
    assigned_to: 'admin-1', assigned_to_name: 'Priya Nair', target_date: '2026-12-10', follow_up_date: '2026-11-20',
    status: 'open', outcome: undefined, mentor_id: 'mentor-2', created_at: '2026-11-05T09:00:00Z', updated_at: '2026-11-05T09:00:00Z',
  },
]

const ADMIN_OPTIONS = [
  { id: 'admin-1', name: 'Priya Nair' },
  { id: 'admin-2', name: 'Rajan Mehta' },
  { id: 'admin-3', name: 'Suresh Kumar' },
]

const INTERN_OPTIONS = [
  { id: 'int-1', name: 'Riya Sharma', code: 'SB-2026-001', stage: 2, batch: 'AI & Cloud' },
  { id: 'int-2', name: 'Aditya Verma', code: 'SB-2026-002', stage: 1, batch: 'Salesforce' },
  { id: 'int-3', name: 'Meera Pillai', code: 'SB-2026-003', stage: 3, batch: 'Software Engineering' },
  { id: 'int-4', name: 'Karan Joshi', code: 'SB-2025-012', stage: 2, batch: 'IoT & Robotics' },
  { id: 'int-5', name: 'Sneha Reddy', code: 'SB-2025-008', stage: 4, batch: 'ServiceNow' },
  { id: 'int-6', name: 'Arjun Nambiar', code: 'SB-2026-004', stage: 1, batch: 'Business Intelligence' },
]

const BATCHES = [
  'AI & Cloud',
  'Salesforce',
  'Software Engineering',
  'IoT & Robotics',
  'ServiceNow',
  'Business Intelligence',
]
const STAGES = [1, 2, 3, 4]
const PILLARS = ['LEARN', 'BUILD', 'SHARE', 'SHOWCASE']

type PlanWithMeta = ImprovementPlan & { intern_name: string; intern_id_code: string; batch_name: string; assigned_to_name: string }

// ─── Helpers ─────────────────────────────────────────────────────────────────
function statusBadge(status: ImprovementPlanStatus) {
  const map: Record<ImprovementPlanStatus, { variant: 'warning' | 'primary' | 'muted' | 'success' | 'danger'; label: string }> = {
    open: { variant: 'warning', label: 'Open' },
    in_progress: { variant: 'primary', label: 'In Progress' },
    under_review: { variant: 'muted', label: 'Under Review' },
    completed: { variant: 'success', label: 'Completed' },
    escalated: { variant: 'danger', label: 'Escalated' },
  }
  const { variant, label } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

function pillarColor(p: string) {
  const c: Record<string, string> = {
    LEARN: 'bg-blue-100 text-blue-700',
    BUILD: 'bg-purple-100 text-purple-700',
    SHARE: 'bg-orange-100 text-orange-700',
    SHOWCASE: 'bg-green-100 text-green-700',
  }
  return c[p] ?? 'bg-gray-100 text-gray-600'
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard: React.FC<{ label: string; value: number; color: string; icon?: React.ReactNode }> = ({ label, value, color, icon }) => (
  <Card>
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-navy">{value}</p>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </div>
  </Card>
)

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
const TableSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex gap-4 animate-pulse">
        <div className="h-10 bg-gray-100 rounded w-1/5" />
        <div className="h-10 bg-gray-100 rounded w-1/12" />
        <div className="h-10 bg-gray-100 rounded flex-1" />
        <div className="h-10 bg-gray-100 rounded w-1/6" />
      </div>
    ))}
  </div>
)

// ─── Main Page ────────────────────────────────────────────────────────────────
const ImprovementPlansPage: React.FC = () => {
  const [plans, setPlans] = useState<PlanWithMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterBatch, setFilterBatch] = useState('')
  const [filterStage, setFilterStage] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterAssigned, setFilterAssigned] = useState('')

  const [viewPlan, setViewPlan] = useState<PlanWithMeta | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editStatusPlan, setEditStatusPlan] = useState<PlanWithMeta | null>(null)

  // Create form state
  const [form, setForm] = useState({
    intern_id: '', stage: '', concerns: '', weak_pillars: [] as string[],
    objectives: '', assigned_to: '', target_date: '', follow_up_date: '', status: 'open' as ImprovementPlanStatus,
    action_items: [{ item: '', due_date: '', completed: false }],
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase.from('improvement_plans').select('*').order('created_at', { ascending: false })
        if (error || !data || data.length === 0) throw new Error('fallback')
        setPlans(data)
      } catch {
        setPlans(MOCK_PLANS)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Derived Stats ────────────────────────────────────────────────────────
  const stats = {
    total: plans.length,
    open: plans.filter(p => p.status === 'open').length,
    in_progress: plans.filter(p => p.status === 'in_progress').length,
    completed: plans.filter(p => p.status === 'completed').length,
    escalated: plans.filter(p => p.status === 'escalated').length,
  }

  // ── Filtered Plans ───────────────────────────────────────────────────────
  const filtered = plans.filter(p => {
    if (search && !p.intern_name.toLowerCase().includes(search.toLowerCase()) && !p.intern_id_code.toLowerCase().includes(search.toLowerCase())) return false
    if (filterBatch && p.batch_name !== filterBatch) return false
    if (filterStage && p.stage !== Number(filterStage)) return false
    if (filterStatus && p.status !== filterStatus) return false
    if (filterAssigned && p.assigned_to !== filterAssigned) return false
    return true
  })

  // ── Pillar multi-select toggle ───────────────────────────────────────────
  const togglePillar = (p: string) => {
    setForm(f => ({
      ...f,
      weak_pillars: f.weak_pillars.includes(p) ? f.weak_pillars.filter(x => x !== p) : [...f.weak_pillars, p],
    }))
  }

  // ── Action item helpers ──────────────────────────────────────────────────
  const addActionItem = () => setForm(f => ({ ...f, action_items: [...f.action_items, { item: '', due_date: '', completed: false }] }))
  const removeActionItem = (i: number) => setForm(f => ({ ...f, action_items: f.action_items.filter((_, idx) => idx !== i) }))
  const updateActionItem = (i: number, field: string, value: string | boolean) =>
    setForm(f => ({ ...f, action_items: f.action_items.map((ai, idx) => idx === i ? { ...ai, [field]: value } : ai) }))

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = () => {
    const errors: Record<string, string> = {}
    if (!form.intern_id) errors.intern_id = 'Select an intern'
    if (!form.stage) errors.stage = 'Stage is required'
    if (!form.concerns.trim()) errors.concerns = 'Describe the concerns'
    if (form.weak_pillars.length === 0) errors.weak_pillars = 'Select at least one pillar'
    if (!form.objectives.trim()) errors.objectives = 'Objectives are required'
    if (!form.assigned_to) errors.assigned_to = 'Assign to an admin'
    if (!form.target_date) errors.target_date = 'Target date is required'
    if (!form.follow_up_date) errors.follow_up_date = 'Follow-up date is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    const intern = INTERN_OPTIONS.find(i => i.id === form.intern_id)
    const admin = ADMIN_OPTIONS.find(a => a.id === form.assigned_to)
    const newPlan: PlanWithMeta = {
      id: `plan-${Date.now()}`, intern_id: form.intern_id,
      intern_name: intern?.name ?? 'Unknown', intern_id_code: intern?.code ?? '',
      batch_name: intern?.batch ?? '', assigned_to_name: admin?.name ?? '',
      stage: Number(form.stage), concerns: form.concerns, weak_pillars: form.weak_pillars,
      objectives: form.objectives, action_items: form.action_items,
      assigned_to: form.assigned_to, target_date: form.target_date,
      follow_up_date: form.follow_up_date, status: form.status, outcome: undefined,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }
    try {
      const { error } = await supabase.from('improvement_plans').insert([newPlan])
      if (error) throw error
    } catch {
      // local fallback
    }
    setPlans(prev => [newPlan, ...prev])
    setSaving(false)
    setShowCreateModal(false)
    setForm({ intern_id: '', stage: '', concerns: '', weak_pillars: [], objectives: '', assigned_to: '', target_date: '', follow_up_date: '', status: 'open', action_items: [{ item: '', due_date: '', completed: false }] })
    setFormErrors({})
  }

  // ── Edit Status save ─────────────────────────────────────────────────────
  const [newStatus, setNewStatus] = useState<ImprovementPlanStatus>('open')
  const handleEditStatus = async () => {
    if (!editStatusPlan) return
    setSaving(true)
    try {
      await supabase.from('improvement_plans').update({ status: newStatus }).eq('id', editStatusPlan.id)
    } catch { /* fallback */ }
    setPlans(prev => prev.map(p => p.id === editStatusPlan.id ? { ...p, status: newStatus } : p))
    setSaving(false)
    setEditStatusPlan(null)
  }

  return (
    <AdminLayout title="Improvement Plans" subtitle="Manage and track intern improvement plans">
      {/* Info Note */}
      <div className="mb-4 flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <AlertCircle size={16} className="text-blue-600 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700">
          <strong>Note:</strong> Improvement plans support interns who need additional guidance. Avoid labelling interns as failures based on incomplete data.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard label="Total Plans" value={stats.total} color="bg-navy/10" icon={<ClipboardList size={18} className="text-navy" />} />
        <StatCard label="Open" value={stats.open} color="bg-amber-100" icon={<Circle size={18} className="text-amber-600" />} />
        <StatCard label="In Progress" value={stats.in_progress} color="bg-blue-100" icon={<ClipboardList size={18} className="text-blue-600" />} />
        <StatCard label="Completed" value={stats.completed} color="bg-green-100" icon={<CheckCircle2 size={18} className="text-green-600" />} />
        <StatCard label="Escalated" value={stats.escalated} color="bg-red-100" icon={<AlertCircle size={18} className="text-red-600" />} />
      </div>

      {/* Filters + Create */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Search intern name or ID…"
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none" value={filterBatch} onChange={e => setFilterBatch(e.target.value)}>
            <option value="">All Tracks</option>
            {BATCHES.map(b => <option key={b}>{b}</option>)}
          </select>
          <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none" value={filterStage} onChange={e => setFilterStage(e.target.value)}>
            <option value="">All Stages</option>
            {STAGES.map(s => <option key={s} value={s}>Stage {s}</option>)}
          </select>
          <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="under_review">Under Review</option>
            <option value="completed">Completed</option>
            <option value="escalated">Escalated</option>
          </select>
          <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none" value={filterAssigned} onChange={e => setFilterAssigned(e.target.value)}>
            <option value="">All Assignees</option>
            {ADMIN_OPTIONS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <Button icon={<Plus size={16} />} onClick={() => setShowCreateModal(true)} className="ml-auto">Create Plan</Button>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        {loading ? (
          <div className="p-6"><TableSkeleton /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ClipboardList size={40} className="text-gray-200 mb-3" />
            <p className="text-muted text-sm">No improvement plans found matching the current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Intern</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Stage</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Concerns</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Weak Pillars</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Target Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Follow-up</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Assigned To</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy">{p.intern_name}</p>
                      <p className="text-xs text-muted">{p.intern_id_code}</p>
                    </td>
                    <td className="px-4 py-3 text-muted">Stage {p.stage}</td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="text-gray-700 truncate" title={p.concerns}>{p.concerns}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(p.weak_pillars ?? []).map(pill => (
                          <span key={pill} className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${pillarColor(pill)}`}>{pill}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">{p.target_date ?? '—'}</td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">{p.follow_up_date ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{p.assigned_to_name}</td>
                    <td className="px-4 py-3">{statusBadge(p.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" icon={<Eye size={14} />} onClick={() => setViewPlan(p)}>View</Button>
                        <Button variant="outline" size="sm" icon={<Edit3 size={14} />} onClick={() => { setEditStatusPlan(p); setNewStatus(p.status) }}>Status</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── View Plan Modal ──────────────────────────────────────────────── */}
      <Modal isOpen={!!viewPlan} onClose={() => setViewPlan(null)} title="Improvement Plan Details" size="xl"
        footer={<Button variant="outline" onClick={() => setViewPlan(null)}>Close</Button>}>
        {viewPlan && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-navy text-base">{viewPlan.intern_name}</h3>
                <p className="text-xs text-muted">{viewPlan.intern_id_code} · {viewPlan.batch_name}</p>
              </div>
              {statusBadge(viewPlan.status)}
            </div>

            {/* Stage + Pillars */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-muted uppercase mb-1">Stage</p>
                <p className="text-sm text-gray-800">Stage {viewPlan.stage}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted uppercase mb-1">Weak KPI Pillars</p>
                <div className="flex flex-wrap gap-1">
                  {(viewPlan.weak_pillars ?? []).map(p => (
                    <span key={p} className={`text-xs px-2 py-0.5 rounded-full font-semibold ${pillarColor(p)}`}>{p}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Concerns */}
            <div>
              <p className="text-xs font-semibold text-muted uppercase mb-1">Performance Concerns</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-amber-50 border border-amber-200 rounded-lg p-3">{viewPlan.concerns}</p>
            </div>

            {/* Objectives */}
            <div>
              <p className="text-xs font-semibold text-muted uppercase mb-1">Objectives</p>
              <p className="text-sm text-gray-700 leading-relaxed">{viewPlan.objectives}</p>
            </div>

            {/* Action Items */}
            <div>
              <p className="text-xs font-semibold text-muted uppercase mb-2">Action Items</p>
              <div className="space-y-2">
                {(viewPlan.action_items ?? []).map((ai, i) => (
                  <div key={i} className={`flex items-start gap-3 p-2 rounded-lg border ${ai.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    {ai.completed
                      ? <CheckCircle2 size={16} className="text-green-600 mt-0.5 shrink-0" />
                      : <Circle size={16} className="text-gray-400 mt-0.5 shrink-0" />}
                    <div className="flex-1">
                      <p className={`text-sm ${ai.completed ? 'line-through text-muted' : 'text-gray-700'}`}>{ai.item}</p>
                      {ai.due_date && <p className="text-xs text-muted">Due: {ai.due_date}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-gray-100">
              <div>
                <p className="text-xs text-muted uppercase">Assigned To</p>
                <p className="text-sm font-medium text-navy">{viewPlan.assigned_to_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted uppercase">Target Date</p>
                <p className="text-sm text-gray-700">{viewPlan.target_date ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted uppercase">Follow-up Date</p>
                <p className="text-sm text-gray-700">{viewPlan.follow_up_date ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted uppercase">Created</p>
                <p className="text-sm text-gray-700">{new Date(viewPlan.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Outcome */}
            {viewPlan.outcome && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-green-700 uppercase mb-1">Outcome</p>
                <p className="text-sm text-green-800">{viewPlan.outcome}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ── Edit Status Modal ───────────────────────────────────────────── */}
      <Modal isOpen={!!editStatusPlan} onClose={() => setEditStatusPlan(null)} title="Update Plan Status" size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditStatusPlan(null)}>Cancel</Button>
            <Button loading={saving} onClick={handleEditStatus}>Save</Button>
          </>
        }>
        {editStatusPlan && (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">Update status for <strong>{editStatusPlan.intern_name}</strong>'s improvement plan.</p>
            <div>
              <label className="text-xs font-semibold text-muted uppercase mb-1 block">New Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={newStatus} onChange={e => setNewStatus(e.target.value as ImprovementPlanStatus)}
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="under_review">Under Review</option>
                <option value="completed">Completed</option>
                <option value="escalated">Escalated</option>
              </select>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Create Plan Modal ───────────────────────────────────────────── */}
      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); setFormErrors({}) }} title="Create Improvement Plan" size="xl"
        footer={
          <>
            <Button variant="outline" onClick={() => { setShowCreateModal(false); setFormErrors({}) }}>Cancel</Button>
            <Button loading={saving} onClick={handleSave}>Create Plan</Button>
          </>
        }>
        <div className="space-y-5">
          {/* Note */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle size={14} className="text-blue-600 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700">Improvement plans support interns who need additional guidance. Avoid labelling interns as failures based on incomplete data.</p>
          </div>

          {/* Select Intern */}
          <div>
            <label className="text-xs font-semibold text-muted uppercase mb-1 block">Intern <span className="text-red-500">*</span></label>
            <select
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${formErrors.intern_id ? 'border-red-400' : 'border-gray-200'}`}
              value={form.intern_id} onChange={e => setForm(f => ({ ...f, intern_id: e.target.value }))}
            >
              <option value="">Select intern…</option>
              {INTERN_OPTIONS.map(i => <option key={i.id} value={i.id}>{i.name} ({i.code})</option>)}
            </select>
            {formErrors.intern_id && <p className="text-xs text-red-500 mt-0.5">{formErrors.intern_id}</p>}
          </div>

          {/* Stage */}
          <div>
            <label className="text-xs font-semibold text-muted uppercase mb-1 block">Stage <span className="text-red-500">*</span></label>
            <select
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${formErrors.stage ? 'border-red-400' : 'border-gray-200'}`}
              value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}
            >
              <option value="">Select stage…</option>
              {STAGES.map(s => <option key={s} value={s}>Stage {s}</option>)}
            </select>
            {formErrors.stage && <p className="text-xs text-red-500 mt-0.5">{formErrors.stage}</p>}
          </div>

          {/* Performance Concerns */}
          <div>
            <label className="text-xs font-semibold text-muted uppercase mb-1 block">Performance Concerns <span className="text-red-500">*</span></label>
            <textarea
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none ${formErrors.concerns ? 'border-red-400' : 'border-gray-200'}`}
              placeholder="Describe the specific performance concerns observed…"
              value={form.concerns} onChange={e => setForm(f => ({ ...f, concerns: e.target.value }))}
            />
            {formErrors.concerns && <p className="text-xs text-red-500 mt-0.5">{formErrors.concerns}</p>}
          </div>

          {/* Weak KPI Pillars */}
          <div>
            <label className="text-xs font-semibold text-muted uppercase mb-2 block">Weak KPI Pillars <span className="text-red-500">*</span></label>
            <div className="flex gap-2 flex-wrap">
              {PILLARS.map(p => (
                <button
                  key={p} type="button"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${form.weak_pillars.includes(p) ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:border-primary'}`}
                  onClick={() => togglePillar(p)}
                >{p}</button>
              ))}
            </div>
            {formErrors.weak_pillars && <p className="text-xs text-red-500 mt-0.5">{formErrors.weak_pillars}</p>}
          </div>

          {/* Objectives */}
          <div>
            <label className="text-xs font-semibold text-muted uppercase mb-1 block">Objectives <span className="text-red-500">*</span></label>
            <textarea
              rows={2}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none ${formErrors.objectives ? 'border-red-400' : 'border-gray-200'}`}
              placeholder="What should the intern achieve by the end of this plan?"
              value={form.objectives} onChange={e => setForm(f => ({ ...f, objectives: e.target.value }))}
            />
            {formErrors.objectives && <p className="text-xs text-red-500 mt-0.5">{formErrors.objectives}</p>}
          </div>

          {/* Action Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-muted uppercase">Action Items</label>
              <Button variant="ghost" size="sm" icon={<Plus size={12} />} onClick={addActionItem}>Add Item</Button>
            </div>
            <div className="space-y-2">
              {form.action_items.map((ai, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Action item description…"
                    value={ai.item} onChange={e => updateActionItem(i, 'item', e.target.value)}
                  />
                  <input
                    type="date"
                    className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={ai.due_date} onChange={e => updateActionItem(i, 'due_date', e.target.value)}
                  />
                  <button type="button" onClick={() => removeActionItem(i)} className="p-1.5 text-muted hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned To */}
          <div>
            <label className="text-xs font-semibold text-muted uppercase mb-1 block">Assigned To <span className="text-red-500">*</span></label>
            <select
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${formErrors.assigned_to ? 'border-red-400' : 'border-gray-200'}`}
              value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}
            >
              <option value="">Select admin…</option>
              {ADMIN_OPTIONS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            {formErrors.assigned_to && <p className="text-xs text-red-500 mt-0.5">{formErrors.assigned_to}</p>}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted uppercase mb-1 block">Target Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${formErrors.target_date ? 'border-red-400' : 'border-gray-200'}`}
                value={form.target_date} onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))}
              />
              {formErrors.target_date && <p className="text-xs text-red-500 mt-0.5">{formErrors.target_date}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-muted uppercase mb-1 block">Follow-up Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${formErrors.follow_up_date ? 'border-red-400' : 'border-gray-200'}`}
                value={form.follow_up_date} onChange={e => setForm(f => ({ ...f, follow_up_date: e.target.value }))}
              />
              {formErrors.follow_up_date && <p className="text-xs text-red-500 mt-0.5">{formErrors.follow_up_date}</p>}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-semibold text-muted uppercase mb-1 block">Initial Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ImprovementPlanStatus }))}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
            </select>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}

export default ImprovementPlansPage
