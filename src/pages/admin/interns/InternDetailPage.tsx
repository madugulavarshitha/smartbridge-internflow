import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, User, BookOpen, BarChart3, FileText, CheckSquare, Award,
  TrendingUp, AlertCircle, ArrowUpCircle, Link2, Clock, Edit2,
  FolderOpen, List, UserCheck, UserX, UserPlus, CheckCircle,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'
import AdminLayout from '../../../components/layout/AdminLayout'
import Badge, { statusToBadgeVariant } from '../../../components/ui/Badge'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import EmptyState from '../../../components/ui/EmptyState'
import Modal from '../../../components/ui/Modal'
import Input from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import { accountService, type Mentor } from '../../../lib/accountService'
import { supabase } from '../../../lib/supabase'
import type {
  Intern, MonthlyReport, StageEvaluation, Task, Certification,
  ProgressionDecisionRecord, ImprovementPlan, MentorAssignment, AuditLog,
  ImprovementPlanStatus, ProjectStatus,
} from '../../../types'
import { LAUNCHPAD_STAGES, STAGE_EVAL_METRICS, getScoreBand, calculateKPIScore } from '../../../lib/constants'

// ─── Types ───────────────────────────────────────────────────────────────────

interface InternProject {
  id: string
  intern_id: string
  title: string
  domain?: string
  stage?: number
  status: ProjectStatus
  problem_statement?: string
  review_status?: string
  created_at: string
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_INTERN: Intern = {
  id: '1', profile_id: 'p1', intern_id: 'INT-001', current_stage: 2, status: 'active',
  batch_id: 'b1', track: 'Full Stack', college: 'VIT Vellore', degree: 'B.Tech', branch: 'CSE',
  grad_year: 2026, joining_date: '2026-01-15', phone: '+91 98765 43210',
  notes: 'High performer. Strong in React and Node.js.',
  created_at: '2026-01-15T00:00:00Z', updated_at: '2026-01-15T00:00:00Z',
  profile: { id: 'p1', email: 'rahul@example.com', full_name: 'Rahul Sharma', role: 'intern', is_active: true, created_at: '', updated_at: '' },
}

const MOCK_REPORTS: MonthlyReport[] = [
  { id: 'r1', intern_id: '1', report_month: '2026-01', learn_score: 78, build_score: 82, share_score: 70, showcase_score: 75, overall_kpi: calculateKPIScore(78,82,70,75), status: 'reviewed' },
  { id: 'r2', intern_id: '1', report_month: '2026-02', learn_score: 80, build_score: 85, share_score: 72, showcase_score: 78, overall_kpi: calculateKPIScore(80,85,72,78), status: 'reviewed' },
  { id: 'r3', intern_id: '1', report_month: '2026-03', learn_score: 82, build_score: 88, share_score: 75, showcase_score: 80, overall_kpi: calculateKPIScore(82,88,75,80), status: 'reviewed' },
  { id: 'r4', intern_id: '1', report_month: '2026-04', learn_score: 85, build_score: 90, share_score: 78, showcase_score: 82, overall_kpi: calculateKPIScore(85,90,78,82), status: 'submitted' },
  { id: 'r5', intern_id: '1', report_month: '2026-05', learn_score: 83, build_score: 87, share_score: 76, showcase_score: 79, overall_kpi: calculateKPIScore(83,87,76,79), status: 'under_review' },
  { id: 'r6', intern_id: '1', report_month: '2026-06', learn_score: 0, build_score: 0, share_score: 0, showcase_score: 0, overall_kpi: 0, status: 'not_submitted' },
]

const MOCK_TASKS: Task[] = [
  { id: 't1', title: 'Complete REST API module', intern_id: '1', mentor_id: 'm1', stage: 1, priority: 'high', status: 'reviewed', due_date: '2026-02-15', created_at: '2026-01-20T00:00:00Z' },
  { id: 't2', title: 'Build CRUD project', intern_id: '1', mentor_id: 'm1', stage: 2, priority: 'high', status: 'submitted', due_date: '2026-04-01', created_at: '2026-03-01T00:00:00Z' },
  { id: 't3', title: 'Weekly knowledge share session', intern_id: '1', mentor_id: 'm1', stage: 2, priority: 'medium', status: 'pending', due_date: '2026-06-30', created_at: '2026-06-01T00:00:00Z' },
  { id: 't4', title: 'Submit Stage 1 portfolio', intern_id: '1', mentor_id: 'm1', stage: 1, priority: 'low', status: 'overdue', due_date: '2026-02-28', created_at: '2026-02-01T00:00:00Z' },
]

const MOCK_EVALUATIONS: StageEvaluation[] = [
  { id: 'e1', intern_id: '1', mentor_id: 'm1', stage_number: 1, metric_scores: { 'Technical Fundamentals and Learning Assessments': 80, 'Research and Conceptual Understanding': 75, 'Practical Exercises and Lab Completion': 85, 'Communication, Active KT Participation and Peer Mentoring Receptivity': 70, 'Introductory Presentation and Knowledge Sharing Explanation': 72 }, total_score: 78, status: 'reviewed', evaluated_at: '2026-03-01', comments: 'Good progress in Stage 1. Strong technical fundamentals.', created_at: '2026-03-01T00:00:00Z' },
]

const MOCK_CERTS: Certification[] = [
  { id: 'c1', intern_id: '1', milestone_week: 12, cert_name: 'AWS Cloud Practitioner', cert_issuer: 'Amazon Web Services', issue_date: '2026-04-15', evidence_url: 'https://example.com/cert1', verification_status: 'verified', created_at: '2026-04-15T00:00:00Z' },
]

const MOCK_PROGRESSIONS: ProgressionDecisionRecord[] = [
  { id: 'pd1', intern_id: '1', from_stage: 1, to_stage: 2, decision: 'approved', reason: 'Met all Stage 1 criteria with high scores.', decided_by: 'Admin', decided_at: '2026-03-15', mentor_recommendation: 'Ready to proceed', created_at: '2026-03-15T00:00:00Z' },
]

const MOCK_IMPROVEMENTS: ImprovementPlan[] = []

const MOCK_MENTOR_ASSIGNMENTS: MentorAssignment[] = [
  { id: 'ma1', intern_id: '1', mentor_id: 'm1', assigned_by: 'HR Admin', assigned_at: '2026-01-15', effective_date: '2026-01-15', is_current: true, reason: 'Initial assignment' },
]

const MOCK_AUDIT: AuditLog[] = [
  { id: 'al1', actor_id: 'admin1', actor_role: 'admin', action: 'intern.created', entity_type: 'intern', entity_id: 'p1', created_at: '2026-01-15T10:00:00Z' },
  { id: 'al2', actor_id: 'admin1', actor_role: 'admin', action: 'mentor.assigned', entity_type: 'mentor_assignment', entity_id: 'p1', created_at: '2026-01-15T10:30:00Z' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtMonth(ym: string) {
  const [y, m] = ym.split('-')
  return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
}

function fmtDate(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function daysIn(joining?: string) {
  if (!joining) return '—'
  return `${Math.floor((Date.now() - new Date(joining).getTime()) / 86400000)} days`
}

function scoreBandVariant(band: string) {
  if (band === 'L3') return 'success'
  if (band === 'L2') return 'primary'
  if (band === 'L1') return 'warning'
  return 'danger'
}

function improvementStatusVariant(s: ImprovementPlanStatus) {
  const m: Record<ImprovementPlanStatus, 'muted'|'primary'|'warning'|'success'|'danger'> = {
    open: 'muted', in_progress: 'primary', under_review: 'warning', completed: 'success', escalated: 'danger',
  }
  return m[s] ?? 'default'
}

function projectStatusVariant(s: ProjectStatus) {
  const m: Record<ProjectStatus, 'muted'|'primary'|'warning'|'success'|'danger'|'navy'> = {
    draft: 'muted', submitted: 'primary', under_review: 'warning', approved: 'success',
    revision_requested: 'danger', completed: 'navy',
  }
  return m[s] ?? 'muted'
}

function progressionDecisionVariant(d: string) {
  if (d === 'approved') return 'success'
  if (d === 'improvement_required') return 'warning'
  if (d === 'deferred') return 'muted'
  if (d === 'return_for_evaluation') return 'danger'
  return 'default'
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview',       label: 'Overview',          icon: User },
  { id: 'kpi',            label: 'KPI & Scores',       icon: BarChart3 },
  { id: 'evaluations',    label: 'Evaluations',        icon: CheckSquare },
  { id: 'reports',        label: 'Monthly Reports',    icon: FileText },
  { id: 'tasks',          label: 'Tasks',              icon: List },
  { id: 'projects',       label: 'Projects',           icon: BookOpen },
  { id: 'certifications', label: 'Certifications',     icon: Award },
  { id: 'progression',    label: 'Progression',        icon: ArrowUpCircle },
  { id: 'improvement',    label: 'Improvement Plans',  icon: AlertCircle },
  { id: 'mentor',         label: 'Mentor History',     icon: Link2 },
  { id: 'baseline',       label: 'Baseline',           icon: TrendingUp },
  { id: 'audit',          label: 'Audit Log',          icon: Clock },
  { id: 'documents',      label: 'Documents',          icon: FolderOpen },
]

// ─── Tab components ───────────────────────────────────────────────────────────

// ── Overview ──

const OverviewTab: React.FC<{
  intern: Intern
  reports: MonthlyReport[]
  mentorAssignments: MentorAssignment[]
  onOpenAssignMentor?: () => void
}> = ({ intern, reports, mentorAssignments, onOpenAssignMentor }) => {
  const latestReport = [...reports].filter(r => r.overall_kpi).sort((a, b) => b.report_month.localeCompare(a.report_month))[0]
  const currentMentor = mentorAssignments.find(m => m.is_current)
  const mentorName = (currentMentor as any)?.mentor?.profile?.full_name ?? intern.mentor?.profile?.full_name ?? 'Unassigned'

  const stats = [
    { label: 'Current Stage', value: `Stage ${intern.current_stage}` },
    { label: 'Overall KPI', value: latestReport ? `${latestReport.overall_kpi}%` : '—' },
    { label: 'Mentor', value: mentorName },
    { label: 'Days in Program', value: daysIn(intern.joining_date) },
  ]

  return (
    <div>
      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-surface rounded-xl p-4 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted mb-1">{s.label}</p>
              <p className="text-lg font-bold text-navy">{s.value}</p>
            </div>
            {s.label === 'Mentor' && onOpenAssignMentor && (
              <button
                type="button"
                onClick={onOpenAssignMentor}
                className="text-xs text-primary hover:underline font-medium ml-2"
              >
                Change
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Stage stepper */}
      <h3 className="font-semibold text-navy mb-4">Program Progress</h3>
      <div className="flex items-center gap-2 mb-6">
        {LAUNCHPAD_STAGES.map((s, idx) => (
          <React.Fragment key={s.id}>
            <div className={`flex flex-col items-center ${idx < LAUNCHPAD_STAGES.length - 1 ? 'flex-1' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                s.id < intern.current_stage ? 'bg-green-500 border-green-500 text-white' :
                s.id === intern.current_stage ? 'bg-primary border-primary text-white' :
                'bg-white border-gray-200 text-muted'
              }`}>
                {s.id}
              </div>
              <span className="text-xs text-muted mt-1 text-center hidden sm:block" style={{ maxWidth: 60 }}>
                {s.id === 0 ? 'Baseline' : `S${s.id}`}
              </span>
            </div>
            {idx < LAUNCHPAD_STAGES.length - 1 && (
              <div className={`flex-1 h-0.5 ${s.id < intern.current_stage ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Notes */}
      {intern.notes && (
        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-amber-700 mb-1">Notes</p>
          <p className="text-sm text-amber-800">{intern.notes}</p>
        </div>
      )}
    </div>
  )
}

// ── KPI & Scores ──

const KpiTab: React.FC<{ reports: MonthlyReport[]; loading: boolean }> = ({ reports, loading }) => {
  if (loading) return <LoadingSpinner size="md" message="Loading KPI data..." />

  const sorted = [...reports].sort((a, b) => a.report_month.localeCompare(b.report_month))
  const latest = [...reports].filter(r => r.overall_kpi).sort((a, b) => b.report_month.localeCompare(a.report_month))[0]
  const chartData = sorted.slice(-6).map(r => ({
    month: fmtMonth(r.report_month),
    KPI: r.overall_kpi ?? 0,
    LEARN: r.learn_score ?? 0,
    BUILD: r.build_score ?? 0,
    SHARE: r.share_score ?? 0,
    SHOWCASE: r.showcase_score ?? 0,
  }))

  const band = latest ? getScoreBand(latest.overall_kpi ?? 0) : null

  const pillars = [
    { key: 'LEARN', label: 'LEARN', weight: '25%', score: latest?.learn_score ?? 0, color: '#2563EB' },
    { key: 'BUILD', label: 'BUILD', weight: '45%', score: latest?.build_score ?? 0, color: '#172B4D' },
    { key: 'SHARE', label: 'SHARE', weight: '15%', score: latest?.share_score ?? 0, color: '#16A34A' },
    { key: 'SHOWCASE', label: 'SHOWCASE', weight: '15%', score: latest?.showcase_score ?? 0, color: '#F59E0B' },
  ]

  if (!reports.length) return <EmptyState icon={BarChart3} title="No KPI data yet" description="Monthly reports will appear here once submitted." />

  return (
    <div className="space-y-6">
      {/* Pillar cards */}
      <div>
        <h3 className="font-semibold text-navy mb-3">KPI Pillars – Latest Month</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {pillars.map(p => (
            <div key={p.key} className="bg-surface rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-muted">{p.label} ({p.weight})</p>
              <p className="text-2xl font-bold mt-1" style={{ color: p.color }}>{p.score}</p>
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full">
                <div className="h-1.5 rounded-full" style={{ width: `${p.score}%`, backgroundColor: p.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Band badge */}
      {band && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">Score Band:</span>
          <Badge variant={scoreBandVariant(band) as any}>{band}</Badge>
          <span className="text-xs text-muted italic">Classification bands are proposed – pending SmartBridge approval</span>
        </div>
      )}

      {/* Line chart */}
      <div>
        <h3 className="font-semibold text-navy mb-3">KPI Trend (Last 6 Months)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="KPI" stroke="#172B4D" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="LEARN" stroke="#2563EB" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="BUILD" stroke="#16A34A" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="SHARE" stroke="#F59E0B" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="SHOWCASE" stroke="#DC2626" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* History table */}
      <div>
        <h3 className="font-semibold text-navy mb-3">Monthly KPI History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-xs text-muted font-medium">Month</th>
                <th className="text-right py-2 px-3 text-xs text-muted font-medium">LEARN</th>
                <th className="text-right py-2 px-3 text-xs text-muted font-medium">BUILD</th>
                <th className="text-right py-2 px-3 text-xs text-muted font-medium">SHARE</th>
                <th className="text-right py-2 px-3 text-xs text-muted font-medium">SHOWCASE</th>
                <th className="text-right py-2 px-3 text-xs text-muted font-medium">Overall KPI</th>
                <th className="text-left py-2 px-3 text-xs text-muted font-medium">Band</th>
                <th className="text-left py-2 px-3 text-xs text-muted font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(r => {
                const kpi = r.overall_kpi ?? 0
                const b = getScoreBand(kpi)
                return (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium text-navy">{fmtMonth(r.report_month)}</td>
                    <td className="py-2 px-3 text-right">{r.learn_score ?? '—'}</td>
                    <td className="py-2 px-3 text-right">{r.build_score ?? '—'}</td>
                    <td className="py-2 px-3 text-right">{r.share_score ?? '—'}</td>
                    <td className="py-2 px-3 text-right">{r.showcase_score ?? '—'}</td>
                    <td className="py-2 px-3 text-right font-bold text-navy">{kpi || '—'}</td>
                    <td className="py-2 px-3">{kpi ? <Badge variant={scoreBandVariant(b) as any}>{b}</Badge> : '—'}</td>
                    <td className="py-2 px-3"><ReportStatusBadge status={r.status} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Report status badge helper ──

const REPORT_STATUS_LABELS: Record<string, string> = {
  not_submitted: 'Not Submitted', submitted: 'Submitted',
  under_review: 'Under Review', revision_requested: 'Revision Requested',
  reviewed: 'Reviewed', approved: 'Approved',
}

function ReportStatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, any> = {
    not_submitted: 'muted', submitted: 'primary', under_review: 'warning',
    revision_requested: 'danger', reviewed: 'success', approved: 'success',
  }
  return <Badge variant={variantMap[status] ?? 'default'}>{REPORT_STATUS_LABELS[status] ?? status}</Badge>
}

// ── Evaluations ──

const EvaluationsTab: React.FC<{ evaluations: StageEvaluation[]; loading: boolean }> = ({ evaluations, loading }) => {
  if (loading) return <LoadingSpinner size="md" message="Loading evaluations..." />

  const stages = [1, 2, 3, 4] as const
  const metricsMap: Record<number, { metric: string; weight: number }[]> = {
    1: [...STAGE_EVAL_METRICS.STAGE_1],
    2: [...STAGE_EVAL_METRICS.STAGE_2],
    3: [...STAGE_EVAL_METRICS.STAGE_3],
    4: [...STAGE_EVAL_METRICS.STAGE_4],
  }

  return (
    <div className="space-y-6">
      {stages.map(stage => {
        const eval_ = evaluations.find(e => e.stage_number === stage)
        const metrics = metricsMap[stage] ?? []
        return (
          <div key={stage} className="border border-gray-100 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-navy">Stage {stage} – {LAUNCHPAD_STAGES[stage]?.name?.split('–')[1]?.trim()}</h3>
              <div className="flex items-center gap-2">
                {eval_ ? (
                  <>
                    <span className="text-sm font-bold text-navy">{eval_.total_score ?? '—'}/100</span>
                    <Badge variant={eval_.status === 'reviewed' ? 'success' : eval_.status === 'submitted' ? 'primary' : 'muted'}>
                      {eval_.status.charAt(0).toUpperCase() + eval_.status.slice(1)}
                    </Badge>
                  </>
                ) : (
                  <Badge variant="muted">Pending</Badge>
                )}
              </div>
            </div>

            {eval_ ? (
              <>
                <div className="text-xs text-muted mb-3">Evaluated: {fmtDate(eval_.evaluated_at)}</div>
                <table className="w-full text-sm mb-4">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-1.5 text-xs text-muted font-medium">Metric</th>
                      <th className="text-right py-1.5 text-xs text-muted font-medium w-16">Weight</th>
                      <th className="text-right py-1.5 text-xs text-muted font-medium w-16">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map(m => (
                      <tr key={m.metric} className="border-b border-gray-50">
                        <td className="py-1.5 pr-4 text-navy">{m.metric}</td>
                        <td className="py-1.5 text-right text-muted">{m.weight}%</td>
                        <td className="py-1.5 text-right font-medium text-navy">
                          {eval_.metric_scores?.[m.metric] ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {eval_.comments && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-blue-700 mb-1">Mentor Comments</p>
                    <p className="text-sm text-blue-800">{eval_.comments}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted italic">No evaluation submitted for this stage yet.</p>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Monthly Reports ──

const ReportsTab: React.FC<{ reports: MonthlyReport[]; loading: boolean }> = ({ reports, loading }) => {
  const [filter, setFilter] = useState('all')
  if (loading) return <LoadingSpinner size="md" message="Loading reports..." />
  if (!reports.length) return <EmptyState icon={FileText} title="No monthly reports" description="Reports will appear here once submitted." />

  const sorted = [...reports].sort((a, b) => b.report_month.localeCompare(a.report_month))
  const filtered = filter === 'all' ? sorted : sorted.filter(r => r.status === filter)

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-navy focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All Statuses</option>
          <option value="not_submitted">Not Submitted</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="reviewed">Reviewed</option>
          <option value="approved">Approved</option>
        </select>
        <span className="text-xs text-muted">{filtered.length} record(s)</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Month','LEARN','BUILD','SHARE','SHOWCASE','Overall KPI','Status','Mentor Review'].map(h => (
                <th key={h} className={`py-2 px-3 text-xs text-muted font-medium ${h === 'Month' || h === 'Status' || h === 'Mentor Review' ? 'text-left' : 'text-right'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-2 px-3 font-medium text-navy">{fmtMonth(r.report_month)}</td>
                <td className="py-2 px-3 text-right">{r.learn_score ?? '—'}</td>
                <td className="py-2 px-3 text-right">{r.build_score ?? '—'}</td>
                <td className="py-2 px-3 text-right">{r.share_score ?? '—'}</td>
                <td className="py-2 px-3 text-right">{r.showcase_score ?? '—'}</td>
                <td className="py-2 px-3 text-right font-bold text-navy">{r.overall_kpi || '—'}</td>
                <td className="py-2 px-3"><ReportStatusBadge status={r.status} /></td>
                <td className="py-2 px-3 text-muted text-xs">{r.mentor_feedback ? r.mentor_feedback.slice(0, 40) + '…' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Tasks ──

const TasksTab: React.FC<{ tasks: Task[]; loading: boolean }> = ({ tasks, loading }) => {
  if (loading) return <LoadingSpinner size="md" message="Loading tasks..." />
  if (!tasks.length) return <EmptyState icon={CheckSquare} title="No tasks" description="Tasks assigned to this intern will appear here." />

  const priorityVariant: Record<string, any> = { low: 'muted', medium: 'warning', high: 'danger' }
  const statusVariant: Record<string, any> = { pending: 'muted', submitted: 'primary', reviewed: 'success', overdue: 'danger' }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {['Title','Stage','Priority','Due Date','Status'].map(h => (
              <th key={h} className="text-left py-2 px-3 text-xs text-muted font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tasks.map(t => (
            <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="py-2 px-3 font-medium text-navy">{t.title}</td>
              <td className="py-2 px-3 text-muted">{t.stage ? `Stage ${t.stage}` : '—'}</td>
              <td className="py-2 px-3"><Badge variant={priorityVariant[t.priority]}>{t.priority}</Badge></td>
              <td className="py-2 px-3 text-muted">{fmtDate(t.due_date)}</td>
              <td className="py-2 px-3"><Badge variant={statusVariant[t.status]}>{t.status}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Projects ──

const ProjectsTab: React.FC<{ projects: InternProject[]; loading: boolean }> = ({ projects, loading }) => {
  if (loading) return <LoadingSpinner size="md" message="Loading projects..." />
  if (!projects.length) return <EmptyState icon={BookOpen} title="No projects" description="Projects submitted by this intern will appear here." />

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {projects.map(p => (
        <div key={p.id} className="border border-gray-100 rounded-xl p-4">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-navy">{p.title}</h4>
            <Badge variant={projectStatusVariant(p.status)}>{p.status.replace(/_/g, ' ')}</Badge>
          </div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {p.domain && <Badge variant="muted">{p.domain}</Badge>}
            {p.stage && <Badge variant="outline">Stage {p.stage}</Badge>}
            {p.review_status && <Badge variant="default">{p.review_status}</Badge>}
          </div>
          {p.problem_statement && (
            <p className="text-xs text-muted mt-2 line-clamp-2">{p.problem_statement}</p>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Certifications ──

const CertificationsTab: React.FC<{ certs: Certification[]; loading: boolean }> = ({ certs, loading }) => {
  if (loading) return <LoadingSpinner size="md" message="Loading certifications..." />

  const cert12 = certs.find(c => c.milestone_week === 12)
  const cert24 = certs.find(c => c.milestone_week === 24)

  const verVariant: Record<string, any> = { pending: 'warning', verified: 'success', rejected: 'danger' }

  const CertSection = ({ week, cert }: { week: 12 | 24; cert?: Certification }) => (
    <div className="border border-gray-100 rounded-xl p-5">
      <h3 className="font-semibold text-navy mb-4">Week {week} Certification</h3>
      {cert ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted mb-0.5">Certificate Name</p>
            <p className="text-sm font-medium text-navy">{cert.cert_name ?? 'Not specified'}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-0.5">Issuer</p>
            <p className="text-sm font-medium text-navy">{cert.cert_issuer ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-0.5">Issue Date</p>
            <p className="text-sm font-medium text-navy">{fmtDate(cert.issue_date)}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-0.5">Verification Status</p>
            <Badge variant={verVariant[cert.verification_status]}>{cert.verification_status}</Badge>
          </div>
          {cert.evidence_url && (
            <div className="col-span-2">
              <p className="text-xs text-muted mb-0.5">Evidence Link</p>
              <a href={cert.evidence_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">{cert.evidence_url}</a>
            </div>
          )}
          {cert.mentor_comments && (
            <div className="col-span-2 bg-blue-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-700 mb-1">Mentor Comments</p>
              <p className="text-sm text-blue-800">{cert.mentor_comments}</p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted italic">No Week {week} certification on record.</p>
      )}
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 rounded-lg p-3 text-xs text-amber-700">
        📋 Certification names are configurable once confirmed by SmartBridge management.
      </div>
      <CertSection week={12} cert={cert12} />
      <CertSection week={24} cert={cert24} />
    </div>
  )
}

// ── Progression ──

const ProgressionTab: React.FC<{ progressions: ProgressionDecisionRecord[]; loading: boolean }> = ({ progressions, loading }) => {
  if (loading) return <LoadingSpinner size="md" message="Loading progression data..." />
  if (!progressions.length) return <EmptyState icon={ArrowUpCircle} title="No progression decisions" description="Progression decisions will appear here." />

  const sorted = [...progressions].sort((a, b) => b.decided_at.localeCompare(a.decided_at))

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100" />
      <div className="space-y-6 pl-10">
        {sorted.map(p => (
          <div key={p.id} className="relative">
            <div className="absolute -left-10 top-1 w-4 h-4 rounded-full border-2 border-primary bg-white" />
            <div className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="font-semibold text-navy text-sm">
                  Stage {p.from_stage} → Stage {p.to_stage ?? '?'}
                </div>
                <Badge variant={progressionDecisionVariant(p.decision) as any}>
                  {p.decision.replace(/_/g, ' ')}
                </Badge>
              </div>
              <p className="text-xs text-muted mb-2">{fmtDate(p.decided_at)} · Decided by: {p.decided_by}</p>
              {p.reason && <p className="text-sm text-navy mb-2">{p.reason}</p>}
              {p.mentor_recommendation && (
                <div className="bg-blue-50 rounded-lg p-2">
                  <p className="text-xs text-blue-700 font-medium">Mentor Recommendation</p>
                  <p className="text-xs text-blue-800 mt-0.5">{p.mentor_recommendation}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Improvement Plans ──

const ImprovementTab: React.FC<{ plans: ImprovementPlan[]; loading: boolean }> = ({ plans, loading }) => {
  if (loading) return <LoadingSpinner size="md" message="Loading improvement plans..." />
  if (!plans.length) return <EmptyState icon={AlertCircle} title="No improvement plans" description="No improvement plans have been created for this intern." />

  return (
    <div className="space-y-4">
      {plans.map(plan => (
        <div key={plan.id} className="border border-gray-100 rounded-xl p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-xs text-muted">Stage {plan.stage ?? '—'}</span>
              {plan.assigned_to && <span className="ml-2 text-xs text-muted">· Assigned to: {plan.assigned_to}</span>}
            </div>
            <Badge variant={improvementStatusVariant(plan.status)}>{plan.status.replace(/_/g, ' ')}</Badge>
          </div>
          {plan.concerns && <p className="text-sm text-navy mb-2">{plan.concerns}</p>}
          {plan.target_date && <p className="text-xs text-muted">Target Date: {fmtDate(plan.target_date)}</p>}
          {plan.weak_pillars && plan.weak_pillars.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {plan.weak_pillars.map(w => <Badge key={w} variant="warning">{w}</Badge>)}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Mentor History ──

const MentorTab: React.FC<{
  assignments: MentorAssignment[]
  loading: boolean
  onOpenAssignMentor?: () => void
}> = ({ assignments, loading, onOpenAssignMentor }) => {
  if (loading) return <LoadingSpinner size="md" message="Loading mentor history..." />

  const sorted = [...assignments].sort((a, b) => (b.assigned_at || '').localeCompare(a.assigned_at || ''))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-navy">Mentor Assignment History</h3>
        {onOpenAssignMentor && (
          <Button size="sm" icon={<UserPlus size={14} />} onClick={onOpenAssignMentor}>
            Assign / Change Mentor
          </Button>
        )}
      </div>
      {!sorted.length ? (
        <EmptyState
          icon={Link2}
          title="No mentor assignments"
          description="Click 'Assign / Change Mentor' to connect this intern with a dedicated mentor."
          action={onOpenAssignMentor ? <Button size="sm" onClick={onOpenAssignMentor}>Assign Mentor</Button> : undefined}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Mentor','Assigned By','Effective Date','End Date','Reason','Current'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs text-muted font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(a => (
                <tr key={a.id} className={`border-b border-gray-50 hover:bg-gray-50 ${a.is_current ? 'bg-green-50' : ''}`}>
                  <td className="py-2 px-3 font-medium text-navy">
                    {(a as any).mentor?.profile?.full_name ?? 'Assigned Mentor'}
                    {a.is_current && <Badge variant="success" className="ml-2">Current</Badge>}
                  </td>
                  <td className="py-2 px-3 text-muted">{a.assigned_by}</td>
                  <td className="py-2 px-3 text-muted">{fmtDate(a.effective_date)}</td>
                  <td className="py-2 px-3 text-muted">{fmtDate(a.end_date)}</td>
                  <td className="py-2 px-3 text-muted">{a.reason ?? '—'}</td>
                  <td className="py-2 px-3">{a.is_current ? '✓' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Baseline ──

const BaselineTab: React.FC<{ evaluations: StageEvaluation[]; loading: boolean }> = ({ evaluations, loading }) => {
  if (loading) return <LoadingSpinner size="md" message="Loading baseline assessment..." />
  const baseline = evaluations.find(e => (e.stage_number as unknown as number) === 0)

  if (!baseline) {
    return <EmptyState icon={TrendingUp} title="Baseline assessment not yet completed" description="The Week 0 baseline assessment will appear here once completed." />
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-muted">Assessment Date</p>
          <p className="text-sm font-medium text-navy mt-0.5">{fmtDate(baseline.evaluated_at)}</p>
        </div>
        <div className="bg-surface rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-muted">Overall Score</p>
          <p className="text-2xl font-bold text-primary mt-0.5">{baseline.total_score ?? '—'}</p>
        </div>
        <div className="bg-surface rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-muted">Status</p>
          <Badge variant={baseline.status === 'reviewed' ? 'success' : 'muted'} className="mt-1">
            {baseline.status}
          </Badge>
        </div>
      </div>

      {baseline.metric_scores && Object.keys(baseline.metric_scores).length > 0 && (
        <div>
          <h4 className="font-semibold text-navy mb-2">Skill Areas</h4>
          <div className="space-y-2">
            {Object.entries(baseline.metric_scores).map(([key, val]) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-sm text-navy flex-1">{key}</span>
                <span className="text-sm font-medium text-navy w-10 text-right">{val}</span>
                <div className="w-24 h-1.5 bg-gray-100 rounded-full">
                  <div className="h-1.5 bg-primary rounded-full" style={{ width: `${val}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {baseline.comments && (
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs font-semibold text-blue-700 mb-1">Comments</p>
          <p className="text-sm text-blue-800">{baseline.comments}</p>
        </div>
      )}
    </div>
  )
}

// ── Audit Log ──

const AuditTab: React.FC<{ logs: AuditLog[]; loading: boolean }> = ({ logs, loading }) => {
  if (loading) return <LoadingSpinner size="md" message="Loading audit log..." />
  if (!logs.length) return <EmptyState icon={Clock} title="No audit log entries" description="Activity for this intern will be recorded here." />

  const sorted = [...logs].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 20)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {['Action','Actor','Before → After','Timestamp'].map(h => (
              <th key={h} className="text-left py-2 px-3 text-xs text-muted font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map(log => (
            <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="py-2 px-3 font-mono text-xs text-navy">{log.action}</td>
              <td className="py-2 px-3 text-muted">
                {log.actor?.full_name ?? log.actor_id.slice(0, 8)}
                <span className="ml-1 text-xs opacity-60">({log.actor_role})</span>
              </td>
              <td className="py-2 px-3 text-xs text-muted">
                {log.before_value && <span className="line-through mr-1">{JSON.stringify(log.before_value).slice(0, 30)}</span>}
                {log.after_value && <span>{JSON.stringify(log.after_value).slice(0, 30)}</span>}
              </td>
              <td className="py-2 px-3 text-muted text-xs">{new Date(log.created_at).toLocaleString('en-IN')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-muted mt-2 text-right">Showing up to 20 most recent entries.</p>
    </div>
  )
}

// ── Documents ──

const DocumentsTab: React.FC = () => {
  const sections = [
    { label: 'Profile Documents', desc: 'ID proof, offer letters, joining forms' },
    { label: 'Academic Documents', desc: 'Mark sheets, transcripts, college ID' },
    { label: 'Certification Documents', desc: 'Certificate evidence files' },
  ]
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
        📁 Documents are stored in Supabase Storage. Upload functionality available in the next release.
      </div>
      {sections.map(s => (
        <div key={s.label} className="border border-dashed border-gray-200 rounded-xl p-5">
          <h4 className="font-semibold text-navy mb-1">{s.label}</h4>
          <p className="text-xs text-muted">{s.desc}</p>
          <p className="text-xs text-muted italic mt-3">No documents uploaded yet.</p>
        </div>
      ))}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const InternDetailPage: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [intern, setIntern] = useState<Intern | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Tab-level data
  const [reports, setReports] = useState<MonthlyReport[]>([])
  const [evaluations, setEvaluations] = useState<StageEvaluation[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<InternProject[]>([])
  const [certs, setCerts] = useState<Certification[]>([])
  const [progressions, setProgressions] = useState<ProgressionDecisionRecord[]>([])
  const [improvements, setImprovements] = useState<ImprovementPlan[]>([])
  const [mentorAssignments, setMentorAssignments] = useState<MentorAssignment[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])

  const [tabLoading, setTabLoading] = useState(false)
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set())

  // Modals & Action States
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [mentorsList, setMentorsList] = useState<Mentor[]>([])
  const [selectedMentorId, setSelectedMentorId] = useState('')
  const [assignReason, setAssignReason] = useState('Dedicated mentor assignment')
  const [assignLoading, setAssignLoading] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    track: '',
    status: 'active',
    college: '',
    degree: '',
    branch: '',
    grad_year: 2026,
    notes: '',
  })
  const [editLoading, setEditLoading] = useState(false)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  // ── Fetch intern base ──
  const fetchIntern = useCallback(async () => {
    setLoading(true)
    try {
      // 1. Try local account service first
      const local = accountService.getInternById(id || '')
      if (local) {
        setIntern(local)
        setEditForm({
          full_name: local.profile?.full_name ?? '',
          email: local.profile?.email ?? '',
          phone: local.phone ?? '',
          track: local.track ?? 'AI & Cloud',
          status: local.status ?? 'active',
          college: local.college ?? '',
          degree: local.degree ?? 'B.Tech',
          branch: local.branch ?? '',
          grad_year: local.grad_year ?? 2026,
          notes: local.notes ?? '',
        })
        const assignments = accountService.getAssignmentsForIntern(local.id)
        if (assignments && assignments.length > 0) {
          setMentorAssignments(assignments)
        }
        setLoading(false)
        return
      }

      // 2. Fallback to Supabase query
      const { data, error } = await supabase
        .from('interns')
        .select('*, profile:profiles(*), batch:batches(*), mentor:mentor_assignments(*, mentor:mentors(*, profile:profiles(*)))')
        .eq('id', id)
        .single()
      if (error || !data) {
        setIntern(MOCK_INTERN)
      } else {
        setIntern(data as unknown as Intern)
      }
    } catch {
      setIntern(MOCK_INTERN)
    } finally {
      setLoading(false)
    }
  }, [id])

  // Load mentors for assignment
  useEffect(() => {
    try {
      setMentorsList(accountService.getMentors())
    } catch {
      // fallback
    }
  }, [])

  // ── Fetch tab data on demand ──
  const fetchTabData = useCallback(async (tab: string) => {
    if (!intern || loadedTabs.has(tab)) return
    setTabLoading(true)
    const internId = intern.id
    const profileId = intern.profile_id

    try {
      if (tab === 'reports' || tab === 'kpi' || tab === 'overview') {
        const { data } = await supabase.from('monthly_reports').select('*').eq('intern_id', internId).order('report_month', { ascending: true })
        setReports(data?.length ? (data as unknown as MonthlyReport[]) : MOCK_REPORTS)
      }
      if (tab === 'evaluations' || tab === 'baseline') {
        const { data } = await supabase.from('stage_evaluations').select('*').eq('intern_id', internId)
        setEvaluations(data?.length ? (data as unknown as StageEvaluation[]) : MOCK_EVALUATIONS)
      }
      if (tab === 'tasks') {
        const { data } = await supabase.from('tasks').select('*').eq('intern_id', internId)
        setTasks(data?.length ? (data as unknown as Task[]) : MOCK_TASKS)
      }
      if (tab === 'projects') {
        const { data } = await supabase.from('projects').select('*').eq('intern_id', internId)
        setProjects(data?.length ? (data as unknown as InternProject[]) : [])
      }
      if (tab === 'certifications') {
        const { data } = await supabase.from('certifications').select('*').eq('intern_id', internId)
        setCerts(data?.length ? (data as unknown as Certification[]) : MOCK_CERTS)
      }
      if (tab === 'progression') {
        const { data } = await supabase.from('progression_decisions').select('*').eq('intern_id', internId)
        setProgressions(data?.length ? (data as unknown as ProgressionDecisionRecord[]) : MOCK_PROGRESSIONS)
      }
      if (tab === 'improvement') {
        const { data } = await supabase.from('improvement_plans').select('*').eq('intern_id', internId)
        setImprovements(data?.length ? (data as unknown as ImprovementPlan[]) : MOCK_IMPROVEMENTS)
      }
      if (tab === 'mentor' || tab === 'overview') {
        const localAssignments = accountService.getAssignmentsForIntern(internId)
        if (localAssignments.length > 0) {
          setMentorAssignments(localAssignments)
        } else {
          const { data } = await supabase.from('mentor_assignments').select('*, mentor:mentors(*, profile:profiles(*))').eq('intern_id', internId)
          setMentorAssignments(data?.length ? (data as unknown as MentorAssignment[]) : MOCK_MENTOR_ASSIGNMENTS)
        }
      }
      if (tab === 'audit') {
        const { data } = await supabase.from('audit_logs').select('*, actor:profiles(*)').eq('entity_id', profileId).order('created_at', { ascending: false }).limit(20)
        setAuditLogs(data?.length ? (data as unknown as AuditLog[]) : MOCK_AUDIT)
      }
    } catch {
      // Fall back to mock data
    } finally {
      setTabLoading(false)
      setLoadedTabs(prev => new Set([...prev, tab]))
    }
  }, [intern, loadedTabs])

  useEffect(() => { fetchIntern() }, [fetchIntern])

  // Load overview data immediately after intern loads
  useEffect(() => {
    if (intern && !loadedTabs.has('overview')) {
      fetchTabData('overview')
    }
  }, [intern, fetchTabData, loadedTabs])

  useEffect(() => {
    if (intern) fetchTabData(activeTab)
  }, [activeTab, intern, fetchTabData])

  const handleToggleStatus = () => {
    if (!intern) return
    try {
      const updated = accountService.toggleInternStatus(intern.id)
      setIntern(updated)
      showToast(`Account status updated to "${updated.status}"`)
    } catch {
      showToast('Status update failed.')
    }
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!intern) return
    setEditLoading(true)
    try {
      const updated = accountService.updateIntern(intern.id, {
        full_name: editForm.full_name,
        email: editForm.email,
        phone: editForm.phone,
        track: editForm.track,
        status: editForm.status as any,
        college: editForm.college,
        degree: editForm.degree,
        branch: editForm.branch,
        grad_year: Number(editForm.grad_year),
        notes: editForm.notes,
      })
      setIntern(updated)
      setEditModalOpen(false)
      showToast('Intern profile updated successfully!')
    } catch {
      showToast('Failed to save profile changes.')
    } finally {
      setEditLoading(false)
    }
  }

  const handleAssignMentor = (e: React.FormEvent) => {
    e.preventDefault()
    if (!intern || !selectedMentorId) return
    setAssignLoading(true)
    try {
      accountService.assignMentor(intern.id, selectedMentorId, assignReason)
      const freshAssignments = accountService.getAssignmentsForIntern(intern.id)
      setMentorAssignments(freshAssignments)
      const freshIntern = accountService.getInternById(intern.id)
      if (freshIntern) setIntern(freshIntern)
      setAssignModalOpen(false)
      showToast('Mentor assigned successfully!')
    } catch {
      showToast('Failed to assign mentor.')
    } finally {
      setAssignLoading(false)
    }
  }

  if (loading) return <AdminLayout><LoadingSpinner size="full" message="Loading intern profile..." /></AdminLayout>
  if (!intern) return <AdminLayout><div className="text-center py-20 text-muted">Intern not found.</div></AdminLayout>

  const stage = LAUNCHPAD_STAGES[intern.current_stage]

  return (
    <AdminLayout title={intern.profile?.full_name ?? 'Intern Profile'} subtitle={`${intern.intern_id} · ${intern.track ?? 'No track'}`}>
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-navy text-white px-4 py-2.5 rounded-lg shadow-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      <button
        onClick={() => navigate('/admin/interns')}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-navy mb-5 transition-colors"
      >
        <ArrowLeft size={15} /> Back to Interns
      </button>

      {/* Profile header */}
      <Card className="mb-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-2xl font-bold">
              {intern.profile?.full_name?.[0] ?? '?'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-navy">{intern.profile?.full_name}</h2>
              <p className="text-sm text-muted">{intern.profile?.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant={statusToBadgeVariant(intern.status)}>{intern.status.replace('_', ' ')}</Badge>
                <Badge variant="primary">Stage {intern.current_stage} – {stage?.name?.split('–')[1]?.trim() ?? ''}</Badge>
                {intern.track && <Badge variant="muted">{intern.track}</Badge>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              icon={<UserPlus size={14} />}
              onClick={() => {
                const cur = mentorAssignments.find(m => m.is_current)
                if (cur) setSelectedMentorId(cur.mentor_id)
                setAssignModalOpen(true)
              }}
            >
              Assign Mentor
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Edit2 size={14} />}
              onClick={() => setEditModalOpen(true)}
            >
              Edit Profile
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={intern.status === 'active' ? <UserX size={14} /> : <UserCheck size={14} />}
              onClick={handleToggleStatus}
              className={intern.status === 'active' ? 'text-danger hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}
            >
              {intern.status === 'active' ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100">
          {[
            { label: 'Intern ID', value: intern.intern_id },
            { label: 'College', value: intern.college ?? '—' },
            { label: 'Degree', value: intern.degree ? `${intern.degree} · ${intern.branch ?? ''}` : '—' },
            { label: 'Graduation Year', value: intern.grad_year?.toString() ?? '—' },
            { label: 'Phone', value: intern.phone ?? '—' },
            { label: 'Joining Date', value: intern.joining_date ? new Date(intern.joining_date).toLocaleDateString('en-IN') : '—' },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs text-muted">{item.label}</p>
              <p className="text-sm font-medium text-navy mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-1 mb-5 bg-white rounded-xl border border-gray-100 p-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'bg-navy text-white' : 'text-muted hover:bg-gray-50 hover:text-navy'
            }`}
          >
            <tab.icon size={13} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <Card>
        {activeTab === 'overview' && (
          <OverviewTab
            intern={intern}
            reports={reports}
            mentorAssignments={mentorAssignments}
            onOpenAssignMentor={() => setAssignModalOpen(true)}
          />
        )}
        {activeTab === 'kpi' && (
          <KpiTab reports={reports} loading={tabLoading && !loadedTabs.has('kpi')} />
        )}
        {activeTab === 'evaluations' && (
          <EvaluationsTab evaluations={evaluations} loading={tabLoading && !loadedTabs.has('evaluations')} />
        )}
        {activeTab === 'reports' && (
          <ReportsTab reports={reports} loading={tabLoading && !loadedTabs.has('reports')} />
        )}
        {activeTab === 'tasks' && (
          <TasksTab tasks={tasks} loading={tabLoading && !loadedTabs.has('tasks')} />
        )}
        {activeTab === 'projects' && (
          <ProjectsTab projects={projects} loading={tabLoading && !loadedTabs.has('projects')} />
        )}
        {activeTab === 'certifications' && (
          <CertificationsTab certs={certs} loading={tabLoading && !loadedTabs.has('certifications')} />
        )}
        {activeTab === 'progression' && (
          <ProgressionTab progressions={progressions} loading={tabLoading && !loadedTabs.has('progression')} />
        )}
        {activeTab === 'improvement' && (
          <ImprovementTab plans={improvements} loading={tabLoading && !loadedTabs.has('improvement')} />
        )}
        {activeTab === 'mentor' && (
          <MentorTab
            assignments={mentorAssignments}
            loading={tabLoading && !loadedTabs.has('mentor')}
            onOpenAssignMentor={() => setAssignModalOpen(true)}
          />
        )}
        {activeTab === 'baseline' && (
          <BaselineTab evaluations={evaluations} loading={tabLoading && !loadedTabs.has('baseline')} />
        )}
        {activeTab === 'audit' && (
          <AuditTab logs={auditLogs} loading={tabLoading && !loadedTabs.has('audit')} />
        )}
        {activeTab === 'documents' && <DocumentsTab />}
      </Card>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Intern Profile"
        size="lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Full Name"
              value={editForm.full_name}
              onChange={(e) => setEditForm(f => ({ ...f, full_name: e.target.value }))}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))}
              required
            />
            <Input
              label="Phone Number"
              value={editForm.phone}
              onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))}
            />
            <Select
              label="Track"
              options={[
                { value: 'AI & Cloud', label: 'AI & Cloud' },
                { value: 'Salesforce', label: 'Salesforce' },
                { value: 'Software Engineering', label: 'Software Engineering' },
                { value: 'IoT & Robotics', label: 'IoT & Robotics' },
                { value: 'ServiceNow', label: 'ServiceNow' },
                { value: 'Business Intelligence', label: 'Business Intelligence' },
              ]}
              value={editForm.track}
              onChange={(e) => setEditForm(f => ({ ...f, track: e.target.value }))}
            />
            <Select
              label="Status"
              options={[
                { value: 'active', label: 'Active' },
                { value: 'invited', label: 'Invited' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'on_hold', label: 'On Hold' },
                { value: 'completed', label: 'Completed' },
              ]}
              value={editForm.status}
              onChange={(e) => setEditForm(f => ({ ...f, status: e.target.value }))}
            />
            <Input
              label="College"
              value={editForm.college}
              onChange={(e) => setEditForm(f => ({ ...f, college: e.target.value }))}
            />
            <Input
              label="Degree"
              value={editForm.degree}
              onChange={(e) => setEditForm(f => ({ ...f, degree: e.target.value }))}
            />
            <Input
              label="Branch"
              value={editForm.branch}
              onChange={(e) => setEditForm(f => ({ ...f, branch: e.target.value }))}
            />
            <Input
              label="Graduation Year"
              type="number"
              value={String(editForm.grad_year)}
              onChange={(e) => setEditForm(f => ({ ...f, grad_year: Number(e.target.value) }))}
            />
          </div>
          <div>
            <Input
              label="Notes"
              value={editForm.notes}
              onChange={(e) => setEditForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={editLoading}>
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Mentor Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Dedicated Mentor"
        size="md"
      >
        <form onSubmit={handleAssignMentor} className="space-y-4">
          <p className="text-xs text-muted">
            Select an expert mentor to oversee {intern.profile?.full_name}&apos;s learning path, tasks, and stage assessments.
          </p>
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-navy">Select Mentor</label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {mentorsList.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedMentorId(m.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedMentorId === m.id
                      ? 'border-primary bg-primary/5 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-sm text-navy">{m.profile?.full_name}</p>
                    <p className="text-xs text-muted">{m.domain} · {m.designation}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={m.status === 'active' ? 'success' : 'muted'} size="sm">
                      {m.intern_count ?? 0} interns
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Input
              label="Assignment Reason / Notes"
              value={assignReason}
              onChange={(e) => setAssignReason(e.target.value)}
              placeholder="e.g. Assigned for Stage 1 track guidance"
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={assignLoading} disabled={!selectedMentorId}>
              Confirm Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  )
}

export default InternDetailPage
