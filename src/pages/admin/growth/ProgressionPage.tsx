import React, { useState, useEffect, useCallback } from 'react'
import { ArrowUpCircle, Search, Plus, CheckCircle2, AlertTriangle, Clock } from 'lucide-react'
import AdminLayout from '../../../components/layout/AdminLayout'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import StatCard from '../../../components/ui/StatCard'
import Modal from '../../../components/ui/Modal'
import Select from '../../../components/ui/Select'
import EmptyState from '../../../components/ui/EmptyState'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../contexts/AuthContext'
import { LAUNCHPAD_STAGES } from '../../../lib/constants'
import type { ProgressionDecisionRecord, ProgressionDecision } from '../../../types'

interface EnrichedProgression extends ProgressionDecisionRecord {
  intern_name: string
  intern_code: string
  decider_name: string
}

const MOCK_DECISIONS: EnrichedProgression[] = [
  { id: 'pd1', intern_id: 'i1', intern_name: 'Rahul Sharma', intern_code: 'INT-001', from_stage: 1, to_stage: 2, decision: 'approved', reason: 'Achieved 84% in Stage 1 evaluation.', decided_by: 'admin1', decider_name: 'HR Admin', decided_at: '2026-03-15T10:00:00Z', mentor_recommendation: 'Ready for Stage 2', created_at: '2026-03-15T10:00:00Z' },
  { id: 'pd2', intern_id: 'i3', intern_name: 'Amit Kumar', intern_code: 'INT-003', from_stage: 2, to_stage: 3, decision: 'approved', reason: 'Completed Week 12 certification and project milestone.', decided_by: 'admin1', decider_name: 'Delivery Lead', decided_at: '2026-05-01T14:00:00Z', mentor_recommendation: 'Strong technical ownership', created_at: '2026-05-01T14:00:00Z' },
  { id: 'pd3', intern_id: 'i4', intern_name: 'Sneha Reddy', intern_code: 'INT-004', from_stage: 1, to_stage: 1, decision: 'improvement_required', reason: 'KPI below 60% in Build pillar.', decided_by: 'admin1', decider_name: 'Talent Accelerator', decided_at: '2026-05-10T11:00:00Z', mentor_recommendation: 'Needs 2-week improvement plan', created_at: '2026-05-10T11:00:00Z' },
  { id: 'pd4', intern_id: 'i5', intern_name: 'Vikram Singh', intern_code: 'INT-005', from_stage: 2, decision: 'deferred', reason: 'Pending Week 12 certification verification.', decided_by: 'admin1', decider_name: 'Super Admin', decided_at: '2026-05-20T09:30:00Z', created_at: '2026-05-20T09:30:00Z' },
]

const decisionVariant = (d: ProgressionDecision) => {
  if (d === 'approved') return 'success'
  if (d === 'return_for_evaluation') return 'warning'
  if (d === 'improvement_required') return 'danger'
  return 'muted'
}

const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const ProgressionPage: React.FC = () => {
  const { user, profile } = useAuth()
  const [decisions, setDecisions] = useState<EnrichedProgression[]>([])
  const [internOptions, setInternOptions] = useState<Array<{ value: string; label: string }>>([
    { value: 'i1', label: 'Rahul Sharma (INT-001)' },
    { value: 'i2', label: 'Priya Patel (INT-002)' },
    { value: 'i3', label: 'Amit Kumar (INT-003)' },
  ])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [decisionFilter, setDecisionFilter] = useState<ProgressionDecision | ''>('')
  const [stageFilter, setStageFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const [form, setForm] = useState({
    intern_id: 'i1',
    from_stage: '1',
    to_stage: '2',
    decision: 'approved' as ProgressionDecision,
    reason: '',
    mentor_recommendation: '',
  })

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  const fetchDecisions = useCallback(async () => {
    setLoading(true)
    try {
      const [{ data, error }, { data: internsData }] = await Promise.all([
        supabase
          .from('progression_decisions')
          .select('*, intern:interns(intern_id, profile:profiles(full_name)), decider:profiles!decided_by(full_name)')
          .order('decided_at', { ascending: false }),
        supabase.from('interns').select('id, intern_id, profile:profiles(full_name)').eq('status', 'active'),
      ])

      if (internsData && internsData.length > 0) {
        setInternOptions(internsData.map((i: Record<string, unknown>) => {
          const p = i.profile as { full_name?: string } | null
          return { value: String(i.id), label: `${p?.full_name ?? 'Intern'} (${i.intern_id})` }
        }))
      }

      if (error || !data || data.length === 0) {
        setDecisions(MOCK_DECISIONS)
      } else {
        const mapped = data.map((d: Record<string, unknown>) => {
          const intern = d.intern as { intern_id?: string; profile?: { full_name?: string } } | null
          const decider = d.decider as { full_name?: string } | null
          return {
            ...(d as unknown as ProgressionDecisionRecord),
            intern_name: intern?.profile?.full_name ?? 'Unknown',
            intern_code: intern?.intern_id ?? '—',
            decider_name: decider?.full_name ?? 'Admin',
          }
        })
        setDecisions(mapped)
      }
    } catch {
      setDecisions(MOCK_DECISIONS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDecisions() }, [fetchDecisions])

  const handleCreate = async () => {
    if (!form.reason.trim()) {
      setToast({ type: 'error', msg: 'Please provide a decision reason.' })
      return
    }
    setSaving(true)
    const fromStage = Number(form.from_stage)
    const toStage = form.decision === 'approved' ? Number(form.to_stage) : fromStage
    const now = new Date().toISOString()

    try {
      await supabase.from('progression_decisions').insert({
        intern_id: form.intern_id,
        from_stage: fromStage,
        to_stage: toStage,
        decision: form.decision,
        reason: form.reason,
        mentor_recommendation: form.mentor_recommendation || null,
        decided_by: user?.id,
        decided_at: now,
      })

      if (form.decision === 'approved') {
        await supabase.from('interns').update({ current_stage: toStage }).eq('id', form.intern_id)
      }

      if (user) {
        await supabase.from('audit_logs').insert({
          actor_id: user.id,
          actor_role: profile?.role ?? 'admin',
          action: 'progression.decided',
          entity_type: 'progression_decision',
          entity_id: form.intern_id,
          after_value: { from_stage: fromStage, to_stage: toStage, decision: form.decision },
          reason: form.reason,
        })
      }
    } catch { /* fallback */ }

    const internLabel = internOptions.find(o => o.value === form.intern_id)?.label ?? 'Intern'
    const newItem: EnrichedProgression = {
      id: `pd-${Date.now()}`,
      intern_id: form.intern_id,
      intern_name: internLabel.split(' (')[0],
      intern_code: internLabel.match(/\(([^)]+)\)/)?.[1] ?? '—',
      from_stage: fromStage,
      to_stage: toStage,
      decision: form.decision,
      reason: form.reason,
      mentor_recommendation: form.mentor_recommendation,
      decided_by: user?.id ?? 'admin',
      decider_name: profile?.full_name ?? 'Admin',
      decided_at: now,
      created_at: now,
    }
    setDecisions(prev => [newItem, ...prev])
    setToast({ type: 'success', msg: 'Progression decision recorded!' })
    setShowModal(false)
    setForm({ intern_id: internOptions[0]?.value ?? 'i1', from_stage: '1', to_stage: '2', decision: 'approved', reason: '', mentor_recommendation: '' })
    setSaving(false)
  }

  const filtered = decisions.filter(d => {
    const matchSearch = !search || d.intern_name.toLowerCase().includes(search.toLowerCase()) || d.intern_code.toLowerCase().includes(search.toLowerCase())
    const matchDecision = !decisionFilter || d.decision === decisionFilter
    const matchStage = !stageFilter || String(d.from_stage) === stageFilter
    return matchSearch && matchDecision && matchStage
  })

  return (
    <AdminLayout title="Progression Decisions" subtitle="Manage authorized LaunchPad stage progression approvals">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Decisions" value={decisions.length} icon={ArrowUpCircle} iconColor="text-primary" iconBg="bg-blue-50" loading={loading} />
        <StatCard title="Approved" value={decisions.filter(d => d.decision === 'approved').length} icon={CheckCircle2} iconColor="text-success" iconBg="bg-green-50" loading={loading} />
        <StatCard title="Improvement Required" value={decisions.filter(d => d.decision === 'improvement_required').length} icon={AlertTriangle} iconColor="text-danger" iconBg="bg-red-50" loading={loading} />
        <StatCard title="Deferred" value={decisions.filter(d => d.decision === 'deferred').length} icon={Clock} iconColor="text-muted" iconBg="bg-slate-50" loading={loading} />
      </div>

      <Card padding="none">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search intern name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 w-60"
              />
            </div>
            <select value={decisionFilter} onChange={e => setDecisionFilter(e.target.value as ProgressionDecision | '')} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
              <option value="">All Decisions</option>
              <option value="approved">Approved</option>
              <option value="return_for_evaluation">Return for Evaluation</option>
              <option value="improvement_required">Improvement Required</option>
              <option value="deferred">Deferred</option>
            </select>
            <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
              <option value="">All From Stages</option>
              {LAUNCHPAD_STAGES.map(s => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
            </select>
          </div>
          <Button size="sm" icon={<Plus size={14} />} onClick={() => setShowModal(true)}>Record Decision</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Intern', 'From Stage', 'To Stage', 'Decision', 'Reason', 'Decided By', 'Date'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7}><EmptyState icon={ArrowUpCircle} title="No progression decisions" description="Record an explicit progression decision to advance interns." /></td></tr>
              ) : (
                filtered.map(d => (
                  <tr key={d.id} className="bg-white hover:bg-surface transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-navy">{d.intern_name}</p>
                      <p className="text-xs text-muted font-mono">{d.intern_code}</p>
                    </td>
                    <td className="px-5 py-4"><Badge variant="muted">Stage {d.from_stage}</Badge></td>
                    <td className="px-5 py-4">{d.to_stage != null ? <Badge variant="primary">Stage {d.to_stage}</Badge> : '—'}</td>
                    <td className="px-5 py-4"><Badge variant={decisionVariant(d.decision)}>{d.decision.replace(/_/g, ' ')}</Badge></td>
                    <td className="px-5 py-4 text-muted text-xs max-w-xs truncate">{d.reason || '—'}</td>
                    <td className="px-5 py-4 text-muted">{d.decider_name}</td>
                    <td className="px-5 py-4 text-muted">{fmt(d.decided_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Record Progression Decision"
          size="md"
          footer={
            <>
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button loading={saving} onClick={handleCreate}>Save Decision</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Select label="Intern" options={internOptions} value={form.intern_id} onChange={e => setForm(f => ({ ...f, intern_id: e.target.value }))} />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="From Stage"
                options={LAUNCHPAD_STAGES.map(s => ({ value: String(s.id), label: `Stage ${s.id}` }))}
                value={form.from_stage}
                onChange={e => setForm(f => ({ ...f, from_stage: e.target.value }))}
              />
              <Select
                label="To Stage"
                options={LAUNCHPAD_STAGES.map(s => ({ value: String(s.id), label: `Stage ${s.id}` }))}
                value={form.to_stage}
                onChange={e => setForm(f => ({ ...f, to_stage: e.target.value }))}
              />
            </div>
            <Select
              label="Decision"
              options={[
                { value: 'approved', label: 'Approved' },
                { value: 'return_for_evaluation', label: 'Return for Evaluation' },
                { value: 'improvement_required', label: 'Improvement Required' },
                { value: 'deferred', label: 'Deferred' },
              ]}
              value={form.decision}
              onChange={e => setForm(f => ({ ...f, decision: e.target.value as ProgressionDecision }))}
            />
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Reason *</label>
              <textarea
                rows={3}
                value={form.reason}
                onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                placeholder="Document the basis for this progression decision..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Mentor Recommendation</label>
              <input
                type="text"
                value={form.mentor_recommendation}
                onChange={e => setForm(f => ({ ...f, mentor_recommendation: e.target.value }))}
                placeholder="Optional mentor recommendation..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  )
}

export default ProgressionPage
