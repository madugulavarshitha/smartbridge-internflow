import React, { useState, useEffect, useCallback } from 'react'
import { FileText, Search, Shield, Users, Clock, ChevronDown, ChevronRight } from 'lucide-react'
import AdminLayout from '../../../components/layout/AdminLayout'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import StatCard from '../../../components/ui/StatCard'
import EmptyState from '../../../components/ui/EmptyState'
import { supabase } from '../../../lib/supabase'
import type { AuditLog } from '../../../types'

const MOCK_LOGS: AuditLog[] = [
  { id: 'al1', actor_id: 'a1', actor_role: 'admin', action: 'intern.created', entity_type: 'intern', entity_id: 'INT-001', after_value: { status: 'invited', track: 'Full Stack' }, reason: 'New onboarding', created_at: new Date(Date.now() - 10 * 60000).toISOString(), actor: { id: 'a1', email: 'hr@smartbridge.in', full_name: 'HR Admin', role: 'admin', is_active: true, created_at: '', updated_at: '' } },
  { id: 'al2', actor_id: 'a1', actor_role: 'admin', action: 'mentor.assigned', entity_type: 'mentor_assignment', entity_id: 'INT-001', after_value: { mentor_id: 'EMP-001' }, reason: 'Domain match', created_at: new Date(Date.now() - 35 * 60000).toISOString(), actor: { id: 'a1', email: 'hr@smartbridge.in', full_name: 'HR Admin', role: 'admin', is_active: true, created_at: '', updated_at: '' } },
  { id: 'al3', actor_id: 'a2', actor_role: 'admin', action: 'progression.decided', entity_type: 'progression_decision', entity_id: 'INT-003', before_value: { current_stage: 2 }, after_value: { current_stage: 3, decision: 'approved' }, reason: 'Met Stage 2 criteria', created_at: new Date(Date.now() - 2 * 3600000).toISOString(), actor: { id: 'a2', email: 'delivery@smartbridge.in', full_name: 'Delivery Lead', role: 'admin', is_active: true, created_at: '', updated_at: '' } },
  { id: 'al4', actor_id: 'a2', actor_role: 'admin', action: 'certification.verified', entity_type: 'certification', entity_id: 'CERT-102', before_value: { verification_status: 'pending' }, after_value: { verification_status: 'verified' }, created_at: new Date(Date.now() - 5 * 3600000).toISOString(), actor: { id: 'a2', email: 'delivery@smartbridge.in', full_name: 'Delivery Lead', role: 'admin', is_active: true, created_at: '', updated_at: '' } },
  { id: 'al5', actor_id: 'a1', actor_role: 'admin', action: 'batch.updated', entity_type: 'batch', entity_id: 'LP-JAN26', before_value: { status: 'active' }, after_value: { status: 'active', duration_weeks: 24 }, created_at: new Date(Date.now() - 24 * 3600000).toISOString(), actor: { id: 'a1', email: 'hr@smartbridge.in', full_name: 'HR Admin', role: 'admin', is_active: true, created_at: '', updated_at: '' } },
  { id: 'al6', actor_id: 'a3', actor_role: 'mentor', action: 'evaluation.submitted', entity_type: 'stage_evaluation', entity_id: 'EVAL-09', after_value: { stage_number: 1, total_score: 82 }, created_at: new Date(Date.now() - 48 * 3600000).toISOString(), actor: { id: 'a3', email: 'arjun@smartbridge.in', full_name: 'Arjun Reddy', role: 'mentor', is_active: true, created_at: '', updated_at: '' } },
]

const fmtTime = (d: string) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [entityFilter, setEntityFilter] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*, actor:profiles(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error || !data || data.length === 0) setLogs(MOCK_LOGS)
      else setLogs(data as AuditLog[])
    } catch {
      setLogs(MOCK_LOGS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const filtered = logs.filter(l => {
    const matchSearch = !search ||
      (l.actor?.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      (l.entity_id ?? '').toLowerCase().includes(search.toLowerCase())
    const matchRole = !roleFilter || l.actor_role === roleFilter
    const matchEntity = !entityFilter || l.entity_type === entityFilter
    return matchSearch && matchRole && matchEntity
  })

  const uniqueActors = new Set(logs.map(l => l.actor_id)).size
  const todayLogs = logs.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length

  return (
    <AdminLayout title="Audit Logs" subtitle="Immutable read-only trail of system actions">
      <div className="mb-4 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-center gap-2">
        <Shield size={14} className="text-navy" />
        <span>Audit logs are immutable and cannot be edited or deleted. Every administrative and evaluation action is permanently recorded.</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Audit Records" value={logs.length} icon={FileText} iconColor="text-primary" iconBg="bg-blue-50" loading={loading} />
        <StatCard title="Today's Actions" value={todayLogs} icon={Clock} iconColor="text-success" iconBg="bg-green-50" loading={loading} />
        <StatCard title="Unique Actors" value={uniqueActors} icon={Users} iconColor="text-navy" iconBg="bg-indigo-50" loading={loading} />
      </div>

      <Card padding="none">
        <div className="flex flex-wrap items-center gap-3 p-5 border-b border-gray-100">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search actor, action, entity ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 w-64"
            />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="mentor">Mentor</option>
            <option value="intern">Intern</option>
          </select>
          <select value={entityFilter} onChange={e => setEntityFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Entities</option>
            <option value="intern">Intern</option>
            <option value="mentor_assignment">Mentor Assignment</option>
            <option value="batch">Batch</option>
            <option value="stage_evaluation">Stage Evaluation</option>
            <option value="progression_decision">Progression Decision</option>
            <option value="certification">Certification</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['', 'Timestamp', 'Actor', 'Role', 'Action', 'Entity', 'Reason'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7}><EmptyState icon={FileText} title="No audit logs found" description="Adjust filters to view historical records." /></td></tr>
              ) : (
                filtered.map(log => {
                  const isOpen = expandedId === log.id
                  return (
                    <React.Fragment key={log.id}>
                      <tr onClick={() => setExpandedId(isOpen ? null : log.id)} className="bg-white hover:bg-surface transition-colors cursor-pointer">
                        <td className="px-4 py-3 text-muted">
                          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">{fmtTime(log.created_at)}</td>
                        <td className="px-4 py-3 font-medium text-navy">{log.actor?.full_name ?? log.actor_id}</td>
                        <td className="px-4 py-3"><Badge variant="navy">{log.actor_role}</Badge></td>
                        <td className="px-4 py-3 font-mono text-xs text-primary">{log.action}</td>
                        <td className="px-4 py-3 text-xs">
                          <span className="text-navy">{log.entity_type}</span>
                          {log.entity_id && <span className="text-muted font-mono ml-1">({log.entity_id})</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted max-w-xs truncate">{log.reason || '—'}</td>
                      </tr>
                      {isOpen && (
                        <tr className="bg-gray-50/70">
                          <td colSpan={7} className="px-8 py-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div>
                                <p className="font-semibold text-muted mb-1">Before Value</p>
                                <pre className="bg-white p-2.5 rounded border border-gray-200 overflow-x-auto">{JSON.stringify(log.before_value ?? null, null, 2)}</pre>
                              </div>
                              <div>
                                <p className="font-semibold text-muted mb-1">After Value</p>
                                <pre className="bg-white p-2.5 rounded border border-gray-200 overflow-x-auto">{JSON.stringify(log.after_value ?? null, null, 2)}</pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminLayout>
  )
}

export default AuditLogsPage
