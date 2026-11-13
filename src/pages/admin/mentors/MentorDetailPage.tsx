import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Users,
  Edit2,
  CheckSquare,
  Award,
  Activity,
  FolderKanban,
  UserCheck,
  UserX,
  UserPlus,
  CheckCircle,
} from 'lucide-react'
import AdminLayout from '../../../components/layout/AdminLayout'
import Badge, { statusToBadgeVariant } from '../../../components/ui/Badge'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import EmptyState from '../../../components/ui/EmptyState'
import StatCard from '../../../components/ui/StatCard'
import Modal from '../../../components/ui/Modal'
import Input from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import { accountService, type Mentor, type Intern } from '../../../lib/accountService'
import { supabase } from '../../../lib/supabase'
import type { StageEvaluation, Task, AuditLog, Certification } from '../../../types'
import { LAUNCHPAD_STAGES } from '../../../lib/constants'

// ── Mock data for fallback ───────────────────────────────────────────────────
const MOCK_MENTOR: Mentor = {
  id: '1',
  profile_id: 'mp1',
  employee_id: 'EMP-001',
  department: 'Engineering',
  domain: 'AI & Cloud',
  designation: 'Senior Architect',
  expertise: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
  status: 'active',
  intern_count: 4,
  created_at: '2025-06-01T00:00:00Z',
  updated_at: '2026-01-15T00:00:00Z',
  profile: {
    id: 'mp1',
    email: 'arjun@smartbridge.in',
    full_name: 'Arjun Reddy',
    role: 'mentor',
    is_active: true,
    created_at: '',
    updated_at: '',
  },
}

const MOCK_ASSIGNED_INTERNS: Intern[] = [
  {
    id: 'i1',
    profile_id: 'pi1',
    intern_id: 'INT-001',
    current_stage: 2,
    status: 'active',
    track: 'AI & Cloud',
    college: 'VIT Vellore',
    created_at: '',
    updated_at: '',
    profile: {
      id: 'pi1',
      email: 'rahul@example.com',
      full_name: 'Rahul Sharma',
      role: 'intern',
      is_active: true,
      created_at: '',
      updated_at: '',
    },
  },
  {
    id: 'i2',
    profile_id: 'pi2',
    intern_id: 'INT-005',
    current_stage: 1,
    status: 'active',
    track: 'Salesforce',
    college: 'IIIT Hyderabad',
    created_at: '',
    updated_at: '',
    profile: {
      id: 'pi2',
      email: 'priya@example.com',
      full_name: 'Priya Patel',
      role: 'intern',
      is_active: true,
      created_at: '',
      updated_at: '',
    },
  },
]

const MOCK_EVALUATIONS: StageEvaluation[] = [
  {
    id: 'e1',
    intern_id: 'i1',
    mentor_id: '1',
    stage_number: 1,
    metric_scores: {},
    total_score: 78,
    status: 'reviewed',
    evaluated_at: '2026-03-01',
    comments: 'Good progress.',
    created_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'e2',
    intern_id: 'i2',
    mentor_id: '1',
    stage_number: 1,
    metric_scores: {},
    total_score: 72,
    status: 'submitted',
    evaluated_at: '2026-06-01',
    comments: '',
    created_at: '2026-06-01T00:00:00Z',
  },
]

const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Complete Cloud Architecture module',
    intern_id: 'i1',
    mentor_id: '1',
    stage: 1,
    priority: 'high',
    status: 'reviewed',
    due_date: '2026-02-15',
    created_at: '2026-01-20T00:00:00Z',
  },
  {
    id: 't2',
    title: 'Build capstone microservice',
    intern_id: 'i1',
    mentor_id: '1',
    stage: 2,
    priority: 'high',
    status: 'submitted',
    due_date: '2026-04-01',
    created_at: '2026-03-01T00:00:00Z',
  },
]

const MOCK_CERTS: Certification[] = [
  {
    id: 'c1',
    intern_id: 'i1',
    mentor_id: '1',
    milestone_week: 12,
    cert_name: 'AWS Cloud Practitioner',
    cert_issuer: 'AWS',
    issue_date: '2026-04-15',
    verification_status: 'verified',
    verified_at: '2026-04-20',
    created_at: '2026-04-15T00:00:00Z',
  },
]

const MOCK_ACTIVITY: AuditLog[] = [
  {
    id: 'a1',
    actor_id: 'mp1',
    actor_role: 'mentor',
    action: 'evaluation.submitted',
    entity_type: 'stage_evaluation',
    created_at: '2026-06-01T10:00:00Z',
  },
  {
    id: 'a2',
    actor_id: 'mp1',
    actor_role: 'mentor',
    action: 'task.created',
    entity_type: 'task',
    created_at: '2026-06-01T09:00:00Z',
  },
]

const STANDARD_DOMAINS = [
  'AI & Cloud',
  'Salesforce',
  'Software Engineering',
  'IoT & Robotics',
  'ServiceNow',
  'Business Intelligence',
]

type TabKey = 'interns' | 'evaluations' | 'tasks' | 'certifications' | 'activity'
const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'interns', label: 'Assigned Interns', icon: Users },
  { key: 'evaluations', label: 'Evaluations', icon: CheckSquare },
  { key: 'tasks', label: 'Tasks', icon: FolderKanban },
  { key: 'certifications', label: 'Certifications', icon: Award },
  { key: 'activity', label: 'Activity', icon: Activity },
]

const MentorDetailPage: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [mentor, setMentor] = useState<Mentor | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabKey>('interns')
  const [assignedInterns, setAssignedInterns] = useState<Intern[]>([])
  const [evaluations, setEvaluations] = useState<StageEvaluation[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [certs, setCerts] = useState<Certification[]>([])
  const [activity, setActivity] = useState<AuditLog[]>([])

  // Modal and actions state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [availableInterns, setAvailableInterns] = useState<Intern[]>([])
  const [selectedInternId, setSelectedInternId] = useState('')
  const [assignReason, setAssignReason] = useState('Mentorship assignment')
  const [assignLoading, setAssignLoading] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    department: '',
    domain: '',
    designation: '',
    expertise: '',
    status: 'active',
  })
  const [editLoading, setEditLoading] = useState(false)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const fetchMentor = useCallback(async () => {
    setLoading(true)
    try {
      // 1. Try local account service first
      const local = accountService.getMentorById(id || '')
      if (local) {
        setMentor(local)
        setEditForm({
          full_name: local.profile?.full_name ?? '',
          email: local.profile?.email ?? '',
          department: local.department ?? '',
          domain: local.domain ?? 'AI & Cloud',
          designation: local.designation ?? '',
          expertise: local.expertise?.join(', ') ?? '',
          status: local.status ?? 'active',
        })
        const interns = accountService.getAssignedInternsForMentor(local.id)
        setAssignedInterns(interns)
        setEvaluations(MOCK_EVALUATIONS)
        setTasks(MOCK_TASKS)
        setCerts(MOCK_CERTS)
        setActivity(MOCK_ACTIVITY)
        setLoading(false)
        return
      }

      // 2. Fallback to Supabase
      const { data, error } = await supabase.from('mentors').select('*, profile:profiles(*)').eq('id', id).single()
      if (error || !data) {
        setMentor(MOCK_MENTOR)
        setAssignedInterns(MOCK_ASSIGNED_INTERNS)
        setEvaluations(MOCK_EVALUATIONS)
        setTasks(MOCK_TASKS)
        setCerts(MOCK_CERTS)
        setActivity(MOCK_ACTIVITY)
      } else {
        setMentor(data as unknown as Mentor)
        const { data: assignments } = await supabase
          .from('mentor_assignments')
          .select('intern:interns(*, profile:profiles(*))')
          .eq('mentor_id', id)
          .eq('is_current', true)
        if (assignments) {
          setAssignedInterns(assignments.map((a: Record<string, unknown>) => a.intern as unknown as Intern).filter(Boolean))
        }
        setEvaluations(MOCK_EVALUATIONS)
        setTasks(MOCK_TASKS)
        setCerts(MOCK_CERTS)
        setActivity(MOCK_ACTIVITY)
      }
    } catch {
      setMentor(MOCK_MENTOR)
      setAssignedInterns(MOCK_ASSIGNED_INTERNS)
      setEvaluations(MOCK_EVALUATIONS)
      setTasks(MOCK_TASKS)
      setCerts(MOCK_CERTS)
      setActivity(MOCK_ACTIVITY)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchMentor()
  }, [fetchMentor])

  // Load interns list for assignment modal
  useEffect(() => {
    try {
      setAvailableInterns(accountService.getInterns())
    } catch {
      // fallback
    }
  }, [])

  const handleToggleStatus = () => {
    if (!mentor) return
    try {
      const updated = accountService.toggleMentorStatus(mentor.id)
      setMentor(updated)
      showToast(`Mentor status updated to "${updated.status}"`)
    } catch {
      showToast('Failed to update status.')
    }
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!mentor) return
    setEditLoading(true)
    try {
      const updated = accountService.updateMentor(mentor.id, {
        full_name: editForm.full_name,
        email: editForm.email,
        department: editForm.department,
        domain: editForm.domain,
        designation: editForm.designation,
        expertise: editForm.expertise.split(',').map((s) => s.trim()).filter(Boolean),
        status: editForm.status as 'active' | 'inactive',
      })
      setMentor(updated)
      setEditModalOpen(false)
      showToast('Mentor profile updated successfully!')
    } catch {
      showToast('Failed to save mentor profile.')
    } finally {
      setEditLoading(false)
    }
  }

  const handleAssignIntern = (e: React.FormEvent) => {
    e.preventDefault()
    if (!mentor || !selectedInternId) return
    setAssignLoading(true)
    try {
      accountService.assignMentor(selectedInternId, mentor.id, assignReason)
      const freshInterns = accountService.getAssignedInternsForMentor(mentor.id)
      setAssignedInterns(freshInterns)
      const freshMentor = accountService.getMentorById(mentor.id)
      if (freshMentor) setMentor(freshMentor)
      setAssignModalOpen(false)
      setSelectedInternId('')
      showToast('Intern assigned to mentor successfully!')
    } catch {
      showToast('Failed to assign intern.')
    } finally {
      setAssignLoading(false)
    }
  }

  if (loading) return <AdminLayout><LoadingSpinner size="full" message="Loading mentor profile..." /></AdminLayout>
  if (!mentor) return <AdminLayout><div className="text-center py-20 text-muted">Mentor not found.</div></AdminLayout>

  const pendingEvals = evaluations.filter((e) => e.status !== 'reviewed').length
  const totalTasks = tasks.length
  const pendingTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'overdue').length
  const pendingCerts = certs.filter((c) => c.verification_status === 'pending').length

  return (
    <AdminLayout title={mentor.profile?.full_name ?? 'Mentor Profile'} subtitle={mentor.designation ?? ''}>
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-navy text-white px-4 py-2.5 rounded-lg shadow-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      <button
        onClick={() => navigate('/admin/mentors')}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-navy mb-5 transition-colors"
      >
        <ArrowLeft size={15} /> Back to Mentors
      </button>

      {/* Profile Header */}
      <Card className="mb-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-navy/10 rounded-2xl flex items-center justify-center text-navy text-2xl font-bold">
              {mentor.profile?.full_name?.[0] ?? '?'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-navy">{mentor.profile?.full_name}</h2>
              <p className="text-sm text-muted">{mentor.profile?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={statusToBadgeVariant(mentor.status)}>{mentor.status}</Badge>
                {mentor.domain && <Badge variant="primary">{mentor.domain}</Badge>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              icon={<UserPlus size={14} />}
              onClick={() => setAssignModalOpen(true)}
            >
              Assign Intern
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
              icon={mentor.status === 'active' ? <UserX size={14} /> : <UserCheck size={14} />}
              onClick={handleToggleStatus}
              className={mentor.status === 'active' ? 'text-danger hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}
            >
              {mentor.status === 'active' ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100">
          {[
            { label: 'Employee ID', value: mentor.employee_id },
            { label: 'Department', value: mentor.department ?? '—' },
            { label: 'Designation', value: mentor.designation ?? '—' },
            { label: 'Assigned Interns', value: String(assignedInterns.length) },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs text-muted">{item.label}</p>
              <p className="text-sm font-medium text-navy mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>

        {mentor.expertise && mentor.expertise.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-muted mb-2">Technical Expertise & Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {mentor.expertise.map((e) => (
                <Badge key={e} variant="muted">
                  {e}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <StatCard title="Assigned Interns" value={assignedInterns.length} icon={Users} iconColor="text-primary" iconBg="bg-blue-50" />
        <StatCard title="Pending Evaluations" value={pendingEvals} icon={CheckSquare} iconColor="text-warning" iconBg="bg-amber-50" />
        <StatCard title="Total Tasks" value={totalTasks} icon={FolderKanban} iconColor="text-navy" iconBg="bg-slate-50" subtitle={`${pendingTasks} pending`} />
        <StatCard title="Pending Certs" value={pendingCerts} icon={Award} iconColor="text-primary" iconBg="bg-blue-50" />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-5">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-navy hover:border-gray-300'
              }`}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <Card>
        {tab === 'interns' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-navy">Assigned Interns ({assignedInterns.length})</h3>
              <Button size="sm" icon={<UserPlus size={14} />} onClick={() => setAssignModalOpen(true)}>
                Assign Intern
              </Button>
            </div>
            {assignedInterns.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No interns assigned"
                description="This mentor currently has no assigned interns. Click 'Assign Intern' to connect an intern."
                action={<Button size="sm" onClick={() => setAssignModalOpen(true)}>Assign Intern</Button>}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['Intern', 'ID', 'Track', 'Stage', 'Status', 'College'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {assignedInterns.map((intern) => (
                      <tr
                        key={intern.id}
                        className="hover:bg-surface transition-colors cursor-pointer"
                        onClick={() => navigate(`/admin/interns/${intern.id}`)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs font-semibold">
                              {intern.profile?.full_name?.[0]}
                            </div>
                            <div>
                              <p className="font-medium text-navy">{intern.profile?.full_name}</p>
                              <p className="text-xs text-muted">{intern.profile?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted">{intern.intern_id}</td>
                        <td className="px-4 py-3 font-medium text-navy">{intern.track ?? '—'}</td>
                        <td className="px-4 py-3">
                          <Badge variant="primary">
                            {LAUNCHPAD_STAGES.find((s) => s.id === intern.current_stage)?.name ?? `Stage ${intern.current_stage}`}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusToBadgeVariant(intern.status)}>{intern.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-muted">{intern.college ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'evaluations' && (
          <div>
            <h3 className="font-semibold text-navy mb-4">Evaluation History ({evaluations.length})</h3>
            {evaluations.length === 0 ? (
              <EmptyState icon={CheckSquare} title="No evaluations yet" description="No stage evaluations conducted yet." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['Stage', 'Intern', 'Score', 'Status', 'Date', 'Comments'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {evaluations.map((ev) => (
                      <tr key={ev.id} className="hover:bg-surface transition-colors">
                        <td className="px-4 py-3">
                          <Badge variant="primary">Stage {ev.stage_number}</Badge>
                        </td>
                        <td className="px-4 py-3 font-medium text-navy">
                          {MOCK_ASSIGNED_INTERNS.find((i) => i.id === ev.intern_id)?.profile?.full_name ?? ev.intern_id}
                        </td>
                        <td className="px-4 py-3 font-bold text-navy">{ev.total_score ?? '—'}/100</td>
                        <td className="px-4 py-3">
                          <Badge variant={ev.status === 'reviewed' ? 'success' : 'primary'}>{ev.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-muted text-xs">
                          {ev.evaluated_at ? new Date(ev.evaluated_at).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td className="px-4 py-3 text-muted text-xs">{ev.comments || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'tasks' && (
          <div>
            <h3 className="font-semibold text-navy mb-4">Review Tasks ({tasks.length})</h3>
            {tasks.length === 0 ? (
              <EmptyState icon={FolderKanban} title="No tasks assigned" description="No tasks created by this mentor yet." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['Task Title', 'Stage', 'Priority', 'Status', 'Due Date'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {tasks.map((t) => (
                      <tr key={t.id} className="hover:bg-surface transition-colors">
                        <td className="px-4 py-3 font-medium text-navy">{t.title}</td>
                        <td className="px-4 py-3">Stage {t.stage}</td>
                        <td className="px-4 py-3">
                          <Badge variant={t.priority === 'high' ? 'danger' : 'muted'} size="sm">
                            {t.priority}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={t.status === 'reviewed' ? 'success' : 'primary'} size="sm">
                            {t.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted text-xs">
                          {t.due_date ? new Date(t.due_date).toLocaleDateString('en-IN') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'certifications' && (
          <div>
            <h3 className="font-semibold text-navy mb-4">Milestone Certifications ({certs.length})</h3>
            {certs.length === 0 ? (
              <EmptyState icon={Award} title="No certifications" description="No certifications reviewed by this mentor yet." />
            ) : (
              <div className="space-y-3">
                {certs.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-primary">
                        <Award size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-navy text-sm">{c.cert_name}</p>
                        <p className="text-xs text-muted">Issuer: {c.cert_issuer} · Week {c.milestone_week}</p>
                      </div>
                    </div>
                    <Badge variant={c.verification_status === 'verified' ? 'success' : 'muted'}>
                      {c.verification_status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'activity' && (
          <div>
            <h3 className="font-semibold text-navy mb-4">Recent Mentor Activity ({activity.length})</h3>
            <div className="space-y-3">
              {activity.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-50 text-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="font-medium text-navy">{a.action}</span>
                    <span className="text-xs text-muted">({a.entity_type})</span>
                  </div>
                  <span className="text-xs text-muted">
                    {new Date(a.created_at).toLocaleDateString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Edit Mentor Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Mentor Profile"
        size="lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Full Name"
              value={editForm.full_name}
              onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
            <Input
              label="Designation"
              value={editForm.designation}
              onChange={(e) => setEditForm((f) => ({ ...f, designation: e.target.value }))}
              required
            />
            <Input
              label="Department"
              value={editForm.department}
              onChange={(e) => setEditForm((f) => ({ ...f, department: e.target.value }))}
            />
            <Select
              label="Primary Domain / Track"
              options={STANDARD_DOMAINS.map((d) => ({ value: d, label: d }))}
              value={editForm.domain}
              onChange={(e) => setEditForm((f) => ({ ...f, domain: e.target.value }))}
            />
            <Select
              label="Account Status"
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
              value={editForm.status}
              onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
            />
            <div className="sm:col-span-2">
              <Input
                label="Technical Expertise & Skills (comma-separated)"
                value={editForm.expertise}
                onChange={(e) => setEditForm((f) => ({ ...f, expertise: e.target.value }))}
              />
            </div>
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

      {/* Assign Intern Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Intern to Mentor"
        size="md"
      >
        <form onSubmit={handleAssignIntern} className="space-y-4">
          <p className="text-xs text-muted">
            Select an intern from the LaunchPad program to assign under {mentor.profile?.full_name}&apos;s direct mentorship.
          </p>
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-navy">Select Intern</label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {availableInterns.map((i) => (
                <div
                  key={i.id}
                  onClick={() => setSelectedInternId(i.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedInternId === i.id
                      ? 'border-primary bg-primary/5 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-sm text-navy">{i.profile?.full_name}</p>
                    <p className="text-xs text-muted">{i.intern_id} · {i.track} · {i.college}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="primary" size="sm">
                      Stage {i.current_stage}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Input
              label="Assignment Reason / Notes"
              value={assignReason}
              onChange={(e) => setAssignReason(e.target.value)}
              placeholder="e.g. Domain track mentorship assignment"
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={assignLoading} disabled={!selectedInternId}>
              Confirm Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  )
}

export default MentorDetailPage
