import React, { useState } from 'react'
import AdminLayout from '../../../components/layout/AdminLayout'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import StatCard from '../../../components/ui/StatCard'
import Modal from '../../../components/ui/Modal'
import { Users, CheckCircle, Clock, Percent, Eye, AlertCircle, Edit3, CheckCircle2 } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────
type BaselineStatus = 'completed' | 'pending' | 'not_started'
type AssessmentLevel = 'L1' | 'L2' | 'L3' | 'L4'

interface BaselineRecord {
  id: string
  intern_name: string
  intern_id: string
  batch: string
  level: AssessmentLevel
  status: BaselineStatus
  assessment_date?: string
  score?: number
  reviewer?: string
  comments?: string
  evidence_url?: string
}

const STANDARD_TRACKS = [
  'AI & Cloud',
  'Salesforce',
  'Software Engineering',
  'IoT & Robotics',
  'ServiceNow',
  'Business Intelligence',
]

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockBaselines: BaselineRecord[] = [
  {
    id: '1', intern_name: 'Aanya Sharma', intern_id: 'INT-001', batch: 'AI & Cloud', level: 'L3',
    status: 'completed', assessment_date: '2025-01-06', score: 72,
    reviewer: 'Rajan Mehta', comments: 'Strong fundamentals in Python and data concepts.', evidence_url: '#',
  },
  {
    id: '2', intern_name: 'Karthik Rajan', intern_id: 'INT-002', batch: 'Salesforce', level: 'L2',
    status: 'completed', assessment_date: '2025-01-06', score: 65,
    reviewer: 'Priya Nair', comments: 'Good conceptual clarity; needs improvement in practicals.', evidence_url: '#',
  },
  {
    id: '3', intern_name: 'Meera Pillai', intern_id: 'INT-003', batch: 'Software Engineering', level: 'L1',
    status: 'pending', assessment_date: '2025-01-08',
    reviewer: 'Rajan Mehta',
  },
  {
    id: '4', intern_name: 'Arjun Patel', intern_id: 'INT-004', batch: 'IoT & Robotics', level: 'L1',
    status: 'not_started',
  },
  {
    id: '5', intern_name: 'Divya Krishnan', intern_id: 'INT-005', batch: 'ServiceNow', level: 'L4',
    status: 'completed', assessment_date: '2025-02-03', score: 80,
    reviewer: 'Suresh Rao', comments: 'Excellent baseline performance.', evidence_url: '#',
  },
  {
    id: '6', intern_name: 'Nikhil Verma', intern_id: 'INT-006', batch: 'Business Intelligence', level: 'L2',
    status: 'pending',
  },
]

const statusVariant: Record<BaselineStatus, 'success' | 'warning' | 'muted'> = {
  completed: 'success',
  pending: 'warning',
  not_started: 'muted',
}

const statusLabel: Record<BaselineStatus, string> = {
  completed: 'Completed',
  pending: 'Pending',
  not_started: 'Not Started',
}

const ASSESSMENT_STORAGE_KEY = 'internflow_assessment_records_v1'

function loadAssessments(): BaselineRecord[] {
  try {
    const raw = sessionStorage.getItem(ASSESSMENT_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as BaselineRecord[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // ignore storage errors
  }
  return mockBaselines
}

// ─── Component ────────────────────────────────────────────────────────────────
const BaselinePage: React.FC = () => {
  const [records, setRecords] = useState<BaselineRecord[]>(loadAssessments)
  const [batchFilter, setBatchFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<BaselineStatus | ''>('')
  const [levelFilter, setLevelFilter] = useState<AssessmentLevel | ''>('')
  const [selected, setSelected] = useState<BaselineRecord | null>(null)
  const [evaluating, setEvaluating] = useState<BaselineRecord | null>(null)
  const [evalScore, setEvalScore] = useState('')
  const [evalLevel, setEvalLevel] = useState<AssessmentLevel>('L1')
  const [evalStatus, setEvalStatus] = useState<BaselineStatus>('completed')
  const [evalReviewer, setEvalReviewer] = useState('')
  const [evalDate, setEvalDate] = useState('')
  const [evalComments, setEvalComments] = useState('')
  const [evalError, setEvalError] = useState('')
  const [toast, setToast] = useState('')

  const batches = STANDARD_TRACKS

  const filtered = records.filter((r) => {
    if (batchFilter && r.batch !== batchFilter) return false
    if (statusFilter && r.status !== statusFilter) return false
    if (levelFilter && r.level !== levelFilter) return false
    return true
  })

  const total = records.length
  const completed = records.filter((r) => r.status === 'completed').length
  const pending = records.filter((r) => r.status !== 'completed').length
  const rate = total ? Math.round((completed / total) * 100) : 0

  const openEvaluate = (rec: BaselineRecord) => {
    setEvaluating(rec)
    setEvalScore(rec.score != null ? String(rec.score) : '')
    setEvalLevel(rec.level)
    setEvalStatus(rec.status === 'not_started' ? 'completed' : rec.status)
    setEvalReviewer(rec.reviewer ?? 'Admin')
    setEvalDate(rec.assessment_date ?? new Date().toISOString().slice(0, 10))
    setEvalComments(rec.comments ?? '')
    setEvalError('')
  }

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault()
    if (!evaluating) return

    let parsedScore: number | undefined = evaluating.score
    if (evalScore.trim() !== '') {
      const n = Number(evalScore)
      if (Number.isNaN(n) || n < 0 || n > 100) {
        setEvalError('Score must be between 0 and 100')
        return
      }
      parsedScore = Math.round(n)
    } else if (evalStatus === 'completed') {
      setEvalError('Please enter a score (0–100) for a completed assessment')
      return
    } else {
      parsedScore = undefined
    }

    const updated = records.map((r) =>
      r.id === evaluating.id
        ? {
            ...r,
            score: parsedScore,
            level: evalLevel,
            status: evalStatus,
            reviewer: evalReviewer.trim() || 'Admin',
            assessment_date: evalDate || new Date().toISOString().slice(0, 10),
            comments: evalComments.trim() || undefined,
          }
        : r
    )
    setRecords(updated)
    try {
      sessionStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(updated))
    } catch {
      // ignore storage errors
    }
    setEvaluating(null)
    setToast(`Updated score for ${evaluating.intern_name}`)
    setTimeout(() => setToast(''), 2500)
  }

  return (
    <AdminLayout title="Assessment" subtitle="Intern track & level assessments">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-navy text-white text-sm px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-400" />
          {toast}
        </div>
      )}
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Interns" value={total} icon={Users} iconBg="bg-blue-50" iconColor="text-primary" />
        <StatCard title="Assessment Completed" value={completed} icon={CheckCircle} iconBg="bg-green-50" iconColor="text-success" />
        <StatCard title="Assessment Pending" value={pending} icon={Clock} iconBg="bg-amber-50" iconColor="text-warning" />
        <StatCard title="Completion Rate" value={`${rate}%`} icon={Percent} iconBg="bg-purple-50" iconColor="text-purple-600" />
      </div>

      {/* Important Note */}
      <div className="mb-6 flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <AlertCircle size={18} className="text-primary flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Note:</span> Assessment scores are preserved and tracked across levels L1–L4.
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-3">
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
          >
            <option value="">All Tracks</option>
            {batches.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BaselineStatus | '')}
          >
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="not_started">Not Started</option>
          </select>
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as AssessmentLevel | '')}
          >
            <option value="">All Levels</option>
            <option value="L1">L1</option>
            <option value="L2">L2</option>
            <option value="L3">L3</option>
            <option value="L4">L4</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Intern Name / ID', 'Track', 'Level', 'Status', 'Assessment Date', 'Score', 'Reviewer', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-muted px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-muted text-sm">No records found.</td>
                </tr>
              ) : filtered.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-navy">{r.intern_name}</p>
                    <p className="text-xs text-muted">{r.intern_id}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{r.batch}</td>
                  <td className="px-4 py-3">
                    <Badge variant="primary">{r.level}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[r.status]}>{statusLabel[r.status]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted">{r.assessment_date ?? '—'}</td>
                  <td className="px-4 py-3">
                    {r.score != null ? (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-navy">{r.score}/100</span>
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${r.score}%` }} />
                        </div>
                      </div>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-muted">{r.reviewer ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" icon={<Eye size={14} />} onClick={() => setSelected(r)}>
                        View
                      </Button>
                      <Button size="sm" variant="primary" icon={<Edit3 size={14} />} onClick={() => openEvaluate(r)}>
                        Evaluate
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Assessment Details" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-muted mb-0.5">Intern</p><p className="font-semibold text-navy">{selected.intern_name} ({selected.intern_id})</p></div>
              <div><p className="text-xs text-muted mb-0.5">Track</p><p className="text-navy">{selected.batch}</p></div>
              <div><p className="text-xs text-muted mb-0.5">Level</p><Badge variant="primary">{selected.level}</Badge></div>
              <div><p className="text-xs text-muted mb-0.5">Status</p><Badge variant={statusVariant[selected.status]}>{statusLabel[selected.status]}</Badge></div>
              <div><p className="text-xs text-muted mb-0.5">Assessment Date</p><p className="text-navy">{selected.assessment_date ?? '—'}</p></div>
              <div>
                <p className="text-xs text-muted mb-0.5">Score</p>
                {selected.score != null ? (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-navy text-lg">{selected.score}/100</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${selected.score}%` }} />
                    </div>
                  </div>
                ) : <span className="text-muted">—</span>}
              </div>
              <div><p className="text-xs text-muted mb-0.5">Reviewer</p><p className="text-navy">{selected.reviewer ?? '—'}</p></div>
            </div>
            {selected.comments && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-muted mb-1 font-medium">Reviewer Comments</p>
                <p className="text-sm text-navy">{selected.comments}</p>
              </div>
            )}
            {selected.evidence_url && (
              <div>
                <p className="text-xs text-muted mb-1 font-medium">Evidence</p>
                <a href={selected.evidence_url} className="text-sm text-primary underline">View Evidence Link</a>
              </div>
            )}
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-xs text-blue-700 italic">Baseline scores are preserved and never overwritten by subsequent evaluations.</p>
            </div>
          </div>
        )}
      </Modal>
      {/* Evaluate / Reassign Score Modal */}
      <Modal
        isOpen={!!evaluating}
        onClose={() => setEvaluating(null)}
        title={`Evaluate & Reassign Score — ${evaluating?.intern_name ?? ''}`}
        size="md"
      >
        {evaluating && (
          <form onSubmit={handleSaveEvaluation} className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3.5 py-2.5 text-xs">
              <span>
                <strong className="text-navy">{evaluating.intern_id}</strong> · {evaluating.batch}
              </span>
              {evaluating.score != null && (
                <span className="text-muted">
                  Previous Score: <strong className="text-navy">{evaluating.score}/100</strong>
                </span>
              )}
            </div>

            {evalError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                {evalError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Score (0–100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="e.g. 85"
                  value={evalScore}
                  onChange={(e) => { setEvalScore(e.target.value); setEvalError('') }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Level</label>
                <select
                  value={evalLevel}
                  onChange={(e) => setEvalLevel(e.target.value as AssessmentLevel)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="L1">L1</option>
                  <option value="L2">L2</option>
                  <option value="L3">L3</option>
                  <option value="L4">L4</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Status</label>
                <select
                  value={evalStatus}
                  onChange={(e) => setEvalStatus(e.target.value as BaselineStatus)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="not_started">Not Started</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Assessment Date</label>
                <input
                  type="date"
                  value={evalDate}
                  onChange={(e) => setEvalDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Reviewer</label>
              <input
                type="text"
                value={evalReviewer}
                onChange={(e) => setEvalReviewer(e.target.value)}
                placeholder="Reviewer name"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Evaluation Comments</label>
              <textarea
                rows={3}
                value={evalComments}
                onChange={(e) => setEvalComments(e.target.value)}
                placeholder="Add feedback or reason for score reassignment..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEvaluating(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Score
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </AdminLayout>
  )
}

export default BaselinePage
