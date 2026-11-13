import React, { useState, useEffect, useCallback } from 'react'
import { Award, Search, CheckCircle2, Clock, XCircle, ExternalLink, Eye } from 'lucide-react'
import AdminLayout from '../../../components/layout/AdminLayout'
import Card from '../../../components/ui/Card'
import Badge, { statusToBadgeVariant } from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import StatCard from '../../../components/ui/StatCard'
import Modal from '../../../components/ui/Modal'
import EmptyState from '../../../components/ui/EmptyState'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../contexts/AuthContext'
import { accountService } from '../../../lib/accountService'
import type { Certification, CertVerificationStatus } from '../../../types'

interface EnrichedCert extends Certification {
  intern_name: string
  intern_code: string
}

const MOCK_CERTS: EnrichedCert[] = [
  { id: 'c1', intern_id: 'i1', intern_name: 'Rahul Sharma', intern_code: 'INT-001', milestone_week: 12, cert_name: 'AWS Certified Cloud Practitioner', cert_issuer: 'Amazon Web Services', issue_date: '2026-04-15', evidence_url: 'https://aws.amazon.com/verification', verification_status: 'verified', mentor_comments: 'Valid credential verified.', verified_at: '2026-04-18T10:00:00Z', created_at: '2026-04-15T00:00:00Z' },
  { id: 'c2', intern_id: 'i2', intern_name: 'Priya Patel', intern_code: 'INT-002', milestone_week: 12, cert_name: 'Meta Front-End Developer', cert_issuer: 'Coursera / Meta', issue_date: '2026-05-02', evidence_url: 'https://coursera.org/verify/123', verification_status: 'pending', created_at: '2026-05-02T00:00:00Z' },
  { id: 'c3', intern_id: 'i3', intern_name: 'Amit Kumar', intern_code: 'INT-003', milestone_week: 24, cert_name: 'Google Associate Cloud Engineer', cert_issuer: 'Google Cloud', issue_date: '2026-06-01', evidence_url: 'https://cloud.google.com/cert', verification_status: 'pending', created_at: '2026-06-01T00:00:00Z' },
  { id: 'c4', intern_id: 'i4', intern_name: 'Sneha Reddy', intern_code: 'INT-004', milestone_week: 12, cert_name: 'Docker Fundamentals', cert_issuer: 'Udemy', issue_date: '2026-04-20', verification_status: 'rejected', mentor_comments: 'Certificate URL missing verification ID.', verified_at: '2026-04-22T12:00:00Z', created_at: '2026-04-20T00:00:00Z' },
]

const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const CertificationsPage: React.FC = () => {
  const { user, profile } = useAuth()
  const [certs, setCerts] = useState<EnrichedCert[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<CertVerificationStatus | ''>('')
  const [weekFilter, setWeekFilter] = useState('')
  const [selected, setSelected] = useState<EnrichedCert | null>(null)
  const [comments, setComments] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  const fetchCerts = useCallback(async () => {
    setLoading(true)
    try {
      const managed = accountService.getCertifications().map((c) => ({
        id: c.id,
        intern_id: c.intern_id,
        intern_name: c.intern_name,
        intern_code: c.intern_id.toUpperCase(),
        milestone_week: (c.milestone === 'Week 12' ? 12 : 24) as (12 | 24),
        cert_name: c.cert_name,
        cert_issuer: c.cert_issuer,
        issue_date: c.issue_date,
        evidence_url: c.credential_url,
        verification_status: c.status as CertVerificationStatus,
        mentor_comments: c.remarks,
        verified_at: c.verified_at,
        created_at: c.created_at,
      }))

      const existingIds = new Set(managed.map((m) => m.id))
      const extra = MOCK_CERTS.filter((m) => !existingIds.has(m.id))
      setCerts([...managed, ...extra])
    } catch {
      setCerts(MOCK_CERTS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCerts() }, [fetchCerts])

  const handleDecision = async (status: 'verified' | 'rejected') => {
    if (!selected) return
    setSaving(true)
    const now = new Date().toISOString()
    try {
      // Sync with accountService
      accountService.verifyCertification(selected.id, {
        status,
        verified_by: profile?.full_name ?? 'Admin',
        remarks: comments,
      })

      await supabase
        .from('certifications')
        .update({ verification_status: status, mentor_comments: comments, verified_at: now })
        .eq('id', selected.id)

      if (user) {
        await supabase.from('audit_logs').insert({
          actor_id: user.id,
          actor_role: profile?.role ?? 'admin',
          action: `certification.${status}`,
          entity_type: 'certification',
          entity_id: selected.id,
          after_value: { verification_status: status, comments },
        })
      }
    } catch { /* fallback to local state */ }

    setCerts(prev => prev.map(c => c.id === selected.id ? { ...c, verification_status: status, mentor_comments: comments, verified_at: now } : c))
    setToast({ type: 'success', msg: `Certification ${status}` })
    setSelected(null)
    setComments('')
    setSaving(false)
  }

  const filtered = certs.filter(c => {
    const matchSearch = !search ||
      c.intern_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.cert_name ?? '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || c.verification_status === statusFilter
    const matchWeek = !weekFilter || String(c.milestone_week) === weekFilter
    return matchSearch && matchStatus && matchWeek
  })

  return (
    <AdminLayout title="Certifications" subtitle="Verify Week 12 and Week 24 milestone certifications">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Certifications" value={certs.length} icon={Award} iconColor="text-primary" iconBg="bg-blue-50" loading={loading} />
        <StatCard title="Pending Verification" value={certs.filter(c => c.verification_status === 'pending').length} icon={Clock} iconColor="text-warning" iconBg="bg-amber-50" loading={loading} />
        <StatCard title="Verified" value={certs.filter(c => c.verification_status === 'verified').length} icon={CheckCircle2} iconColor="text-success" iconBg="bg-green-50" loading={loading} />
        <StatCard title="Rejected" value={certs.filter(c => c.verification_status === 'rejected').length} icon={XCircle} iconColor="text-danger" iconBg="bg-red-50" loading={loading} />
      </div>

      <Card padding="none">
        <div className="flex flex-wrap items-center gap-3 p-5 border-b border-gray-100">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search intern or certificate..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 w-64"
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as CertVerificationStatus | '')} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
          <select value={weekFilter} onChange={e => setWeekFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Milestones</option>
            <option value="12">Week 12</option>
            <option value="24">Week 24</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Intern', 'Certification', 'Issuer', 'Milestone', 'Issue Date', 'Status', 'Verified At', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 8 }).map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8}><EmptyState icon={Award} title="No certifications found" description="No certification records match your filters." /></td></tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id} className="bg-white hover:bg-surface transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-navy">{c.intern_name}</p>
                      <p className="text-xs text-muted font-mono">{c.intern_code}</p>
                    </td>
                    <td className="px-5 py-4 font-medium text-navy">{c.cert_name || '—'}</td>
                    <td className="px-5 py-4 text-muted">{c.cert_issuer || '—'}</td>
                    <td className="px-5 py-4"><Badge variant="primary">Week {c.milestone_week}</Badge></td>
                    <td className="px-5 py-4 text-muted">{fmt(c.issue_date)}</td>
                    <td className="px-5 py-4"><Badge variant={statusToBadgeVariant(c.verification_status)}>{c.verification_status}</Badge></td>
                    <td className="px-5 py-4 text-muted">{fmt(c.verified_at)}</td>
                    <td className="px-5 py-4">
                      <Button size="sm" variant="outline" icon={<Eye size={13} />} onClick={() => { setSelected(c); setComments(c.mentor_comments ?? '') }}>
                        Review
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selected && (
        <Modal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          title="Certification Verification"
          size="md"
          footer={
            <>
              <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
              <Button variant="danger" loading={saving} onClick={() => handleDecision('rejected')}>Reject</Button>
              <Button loading={saving} onClick={() => handleDecision('verified')}>Verify</Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-muted">Intern</p><p className="font-medium text-navy">{selected.intern_name}</p></div>
              <div><p className="text-xs text-muted">Milestone</p><p className="font-medium text-navy">Week {selected.milestone_week}</p></div>
              <div><p className="text-xs text-muted">Certificate</p><p className="font-medium text-navy">{selected.cert_name}</p></div>
              <div><p className="text-xs text-muted">Issuer</p><p className="font-medium text-navy">{selected.cert_issuer}</p></div>
            </div>
            {selected.evidence_url && (
              <a href={selected.evidence_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                <ExternalLink size={14} /> View Certificate Evidence
              </a>
            )}
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Verification Comments</label>
              <textarea
                rows={3}
                value={comments}
                onChange={e => setComments(e.target.value)}
                placeholder="Add verification notes or rejection reason..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  )
}

export default CertificationsPage
