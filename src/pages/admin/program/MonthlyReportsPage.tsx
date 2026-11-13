import React, { useState, useEffect, useCallback } from 'react'
import { FileText, Search, CheckCircle2, Clock, AlertCircle, Eye } from 'lucide-react'
import AdminLayout from '../../../components/layout/AdminLayout'
import Card from '../../../components/ui/Card'
import Badge, { statusToBadgeVariant } from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import StatCard from '../../../components/ui/StatCard'
import Modal from '../../../components/ui/Modal'
import EmptyState from '../../../components/ui/EmptyState'
import { supabase } from '../../../lib/supabase'
import type { MonthlyReport, ReportStatus } from '../../../types'
import { calculateKPIScore } from '../../../lib/constants'

interface EnrichedReport extends MonthlyReport {
  intern_name: string
  intern_code: string
  batch_name: string
}

const STANDARD_TRACKS = [
  'AI & Cloud',
  'Salesforce',
  'Software Engineering',
  'IoT & Robotics',
  'ServiceNow',
  'Business Intelligence',
]

const MOCK_REPORTS: EnrichedReport[] = [
  { id: 'r1', intern_id: 'i1', intern_name: 'Rahul Sharma', intern_code: 'INT-001', batch_name: 'AI & Cloud', report_month: '2026-05-01', learn_score: 85, build_score: 90, share_score: 78, showcase_score: 82, overall_kpi: calculateKPIScore(85, 90, 78, 82), status: 'approved', intern_notes: 'Completed REST API and React frontend.', mentor_feedback: 'Strong execution and clean code.', submitted_at: '2026-05-29T10:00:00Z', reviewed_at: '2026-05-31T14:00:00Z' },
  { id: 'r2', intern_id: 'i2', intern_name: 'Priya Patel', intern_code: 'INT-002', batch_name: 'Salesforce', report_month: '2026-05-01', learn_score: 78, build_score: 82, share_score: 75, showcase_score: 76, overall_kpi: calculateKPIScore(78, 82, 75, 76), status: 'submitted', intern_notes: 'Finished database schema & auth.', submitted_at: '2026-05-30T11:30:00Z' },
  { id: 'r3', intern_id: 'i3', intern_name: 'Amit Kumar', intern_code: 'INT-003', batch_name: 'Software Engineering', report_month: '2026-05-01', learn_score: 90, build_score: 92, share_score: 86, showcase_score: 88, overall_kpi: calculateKPIScore(90, 92, 86, 88), status: 'reviewed', mentor_feedback: 'Excellent KT session.', submitted_at: '2026-05-28T09:00:00Z', reviewed_at: '2026-05-30T16:00:00Z' },
  { id: 'r4', intern_id: 'i4', intern_name: 'Sneha Reddy', intern_code: 'INT-004', batch_name: 'IoT & Robotics', report_month: '2026-05-01', learn_score: 62, build_score: 58, share_score: 65, showcase_score: 60, overall_kpi: calculateKPIScore(62, 58, 65, 60), status: 'revision_requested', intern_notes: 'Working on unit tests.', mentor_feedback: 'Please attach test coverage evidence.', submitted_at: '2026-05-29T15:00:00Z', reviewed_at: '2026-05-31T09:00:00Z' },
  { id: 'r5', intern_id: 'i5', intern_name: 'Vikram Singh', intern_code: 'INT-005', batch_name: 'ServiceNow', report_month: '2026-05-01', status: 'not_submitted' },
]

const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const MonthlyReportsPage: React.FC = () => {
  const [reports, setReports] = useState<EnrichedReport[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReportStatus | ''>('')
  const [batchFilter, setBatchFilter] = useState('')
  const [selected, setSelected] = useState<EnrichedReport | null>(null)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('monthly_reports')
        .select('*, intern:interns(intern_id, batch:batches(name), profile:profiles(full_name))')
        .order('report_month', { ascending: false })

      if (error || !data || data.length === 0) {
        setReports(MOCK_REPORTS)
      } else {
        const mapped = data.map((r: Record<string, unknown>) => {
          const intern = r.intern as { intern_id?: string; batch?: { name?: string }; profile?: { full_name?: string } } | null
          return {
            ...(r as unknown as MonthlyReport),
            intern_name: intern?.profile?.full_name ?? 'Unknown',
            intern_code: intern?.intern_id ?? '—',
            batch_name: intern?.batch?.name ?? 'Unassigned',
          }
        })
        setReports(mapped)
      }
    } catch {
      setReports(MOCK_REPORTS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchReports() }, [fetchReports])

  const batches = STANDARD_TRACKS
  const filtered = reports.filter(r => {
    const matchSearch = !search || r.intern_name.toLowerCase().includes(search.toLowerCase()) || r.intern_code.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || r.status === statusFilter
    const matchBatch = !batchFilter || r.batch_name === batchFilter
    return matchSearch && matchStatus && matchBatch
  })

  const pendingReview = reports.filter(r => r.status === 'submitted' || r.status === 'under_review').length
  const approvedCount = reports.filter(r => r.status === 'approved' || r.status === 'reviewed').length
  const revisionCount = reports.filter(r => r.status === 'revision_requested').length

  return (
    <AdminLayout title="Monthly Reports" subtitle="Monthly intern KPI submissions and mentor reviews">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Reports" value={reports.length} icon={FileText} iconColor="text-primary" iconBg="bg-blue-50" loading={loading} />
        <StatCard title="Pending Review" value={pendingReview} icon={Clock} iconColor="text-warning" iconBg="bg-amber-50" loading={loading} />
        <StatCard title="Approved / Reviewed" value={approvedCount} icon={CheckCircle2} iconColor="text-success" iconBg="bg-green-50" loading={loading} />
        <StatCard title="Revision Requested" value={revisionCount} icon={AlertCircle} iconColor="text-danger" iconBg="bg-red-50" loading={loading} />
      </div>

      <Card padding="none">
        <div className="flex flex-wrap items-center gap-3 p-5 border-b border-gray-100">
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
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as ReportStatus | '')} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Status</option>
            <option value="not_submitted">Not Submitted</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="revision_requested">Revision Requested</option>
            <option value="reviewed">Reviewed</option>
            <option value="approved">Approved</option>
          </select>
          <select value={batchFilter} onChange={e => setBatchFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Tracks</option>
            {batches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Intern', 'Month', 'Learn', 'Build', 'Share', 'Showcase', 'Overall KPI', 'Status', 'Submitted', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 10 }).map((_, j) => <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={10}><EmptyState icon={FileText} title="No monthly reports found" description="Try adjusting the filters." /></td></tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id} className="bg-white hover:bg-surface transition-colors">
                    <td className="px-4 py-4">
                      <p className="font-medium text-navy">{r.intern_name}</p>
                      <p className="text-xs text-muted font-mono">{r.intern_code}</p>
                    </td>
                    <td className="px-4 py-4 text-muted">{fmt(r.report_month)}</td>
                    <td className="px-4 py-4">{r.learn_score ?? '—'}</td>
                    <td className="px-4 py-4">{r.build_score ?? '—'}</td>
                    <td className="px-4 py-4">{r.share_score ?? '—'}</td>
                    <td className="px-4 py-4">{r.showcase_score ?? '—'}</td>
                    <td className="px-4 py-4 font-bold text-navy">{r.overall_kpi != null ? `${r.overall_kpi}%` : '—'}</td>
                    <td className="px-4 py-4"><Badge variant={statusToBadgeVariant(r.status)}>{r.status.replace(/_/g, ' ')}</Badge></td>
                    <td className="px-4 py-4 text-muted">{fmt(r.submitted_at)}</td>
                    <td className="px-4 py-4">
                      <Button size="sm" variant="outline" icon={<Eye size={13} />} onClick={() => setSelected(r)}>View</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selected && (
        <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Monthly Report – ${selected.intern_name}`} size="lg" footer={<Button variant="outline" onClick={() => setSelected(null)}>Close</Button>}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-surface rounded-lg"><p className="text-xs text-muted">Learn (25%)</p><p className="text-lg font-bold text-navy">{selected.learn_score ?? '—'}</p></div>
              <div className="p-3 bg-surface rounded-lg"><p className="text-xs text-muted">Build (45%)</p><p className="text-lg font-bold text-navy">{selected.build_score ?? '—'}</p></div>
              <div className="p-3 bg-surface rounded-lg"><p className="text-xs text-muted">Share (15%)</p><p className="text-lg font-bold text-navy">{selected.share_score ?? '—'}</p></div>
              <div className="p-3 bg-surface rounded-lg"><p className="text-xs text-muted">Showcase (15%)</p><p className="text-lg font-bold text-navy">{selected.showcase_score ?? '—'}</p></div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted uppercase mb-1">Intern Notes</p>
              <p className="text-sm text-navy bg-gray-50 p-3 rounded-lg">{selected.intern_notes || 'No notes provided.'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted uppercase mb-1">Mentor Feedback</p>
              <p className="text-sm text-navy bg-blue-50/50 p-3 rounded-lg">{selected.mentor_feedback || 'Awaiting mentor review.'}</p>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  )
}

export default MonthlyReportsPage
