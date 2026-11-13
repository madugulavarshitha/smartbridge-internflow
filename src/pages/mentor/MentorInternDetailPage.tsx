import React, { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  BookOpen,
  BarChart3,
  CheckSquare,
  Award,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Phone,
  GraduationCap,
  Plus,
  FolderGit2,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import {
  accountService,
  type TaskRecord,
  type MentorFeedbackRecord,
} from '../../lib/accountService'
import MentorLayout from '../../components/layout/MentorLayout'
import Card from '../../components/ui/Card'
import Badge, { statusToBadgeVariant } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { LAUNCHPAD_STAGES } from '../../lib/constants'

type TabType =
  | 'overview'
  | 'baseline'
  | 'progress'
  | 'tasks'
  | 'kpis'
  | 'evaluations'
  | 'feedback'
  | 'improvements'
  | 'projects'
  | 'readiness'

const MentorInternDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [toast, setToast] = useState<string>('')

  // Modals
  const [isReviewTaskOpen, setIsReviewTaskOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TaskRecord | null>(null)
  const [taskScore, setTaskScore] = useState('85')
  const [taskFeedback, setTaskFeedback] = useState('')

  const [isEvalOpen, setIsEvalOpen] = useState(false)
  const [evalStage, setEvalStage] = useState<number>(1)
  const [metric1, setMetric1] = useState(20)
  const [metric2, setMetric2] = useState(25)
  const [metric3, setMetric3] = useState(18)
  const [metric4, setMetric4] = useState(13)
  const [metric5, setMetric5] = useState(12)
  const [evalStrengths, setEvalStrengths] = useState('')
  const [evalImprovements, setEvalImprovements] = useState('')
  const [evalActionPlan, setEvalActionPlan] = useState('')

  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const [fbCategory, setFbCategory] = useState<MentorFeedbackRecord['category']>('Technical Skills')
  const [fbComments, setFbComments] = useState('')
  const [fbStrengths, setFbStrengths] = useState('')
  const [fbRecs, setFbRecs] = useState('')

  const [isImprovementOpen, setIsImprovementOpen] = useState(false)
  const [impArea, setImpArea] = useState('')
  const [impObs, setImpObs] = useState('')
  const [impObj, setImpObj] = useState('')
  const [impActivities, setImpActivities] = useState('')
  const [impEvidence, setImpEvidence] = useState('')
  const [impTargetDate, setImpTargetDate] = useState('2026-06-30')
  const [impFollowUp, setImpFollowUp] = useState('2026-06-15')

  const [isReadinessOpen, setIsReadinessOpen] = useState(false)
  const [readinessMilestone, setReadinessMilestone] = useState<'Week 12' | 'Week 24'>('Week 12')
  const [readinessStatus, setReadinessStatus] = useState<'ready' | 'needs_preparation' | 'not_ready'>('ready')
  const [readinessObs, setReadinessObs] = useState('')
  const [readinessRec, setReadinessRec] = useState('')

  // Mentor record
  const mentorRecord = useMemo(() => {
    if (!profile) return null
    return (
      accountService.getMentors().find(
        (m) =>
          m.profile_id === profile.id ||
          m.profile?.email.toLowerCase() === profile.email.toLowerCase() ||
          m.id === user?.id
      ) ?? null
    )
  }, [profile, user])

  // Intern lookup
  const intern = useMemo(() => {
    if (!id) return null
    return accountService.getInternById(id)
  }, [id])

  // Related data
  const internTasks = useMemo(() => {
    if (!id && !intern) return []
    return accountService.getTasksForIntern(id ?? intern?.id ?? '')
  }, [id, intern])

  const internEvaluations = useMemo(() => {
    if (!id && !intern) return []
    return accountService.getEvaluationsForIntern(id ?? intern?.id ?? '')
  }, [id, intern])

  const internCertifications = useMemo(() => {
    if (!id && !intern) return []
    return accountService.getCertificationsForIntern(id ?? intern?.id ?? '')
  }, [id, intern])

  const internImprovements = useMemo(() => {
    if (!id && !intern) return []
    return accountService.getImprovementPlansForIntern(id ?? intern?.id ?? '')
  }, [id, intern])

  const internFeedbackList = useMemo(() => {
    if (!id && !intern) return []
    return accountService.getFeedbackForIntern(id ?? intern?.id ?? '')
  }, [id, intern])

  const internBaseline = useMemo(() => {
    if (!id && !intern) return null
    return accountService.getBaselineForIntern(id ?? intern?.id ?? '')
  }, [id, intern])

  const internReadiness = useMemo(() => {
    if (!id && !intern) return []
    return accountService.getCertificationReadinessForIntern(id ?? intern?.id ?? '')
  }, [id, intern])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  // Handlers
  const handleSaveTaskReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTask) return
    const scoreNum = Number(taskScore)
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) return

    accountService.reviewTask(selectedTask.id, {
      mentor_score: scoreNum,
      mentor_feedback: taskFeedback.trim(),
    })
    setIsReviewTaskOpen(false)
    showToast(`Task review saved for ${selectedTask.title}!`)
  }

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault()
    if (!intern) return
    const total = metric1 + metric2 + metric3 + metric4 + metric5

    accountService.saveEvaluation({
      intern_id: intern.id,
      intern_name: intern.profile?.full_name ?? 'Intern',
      intern_email: intern.profile?.email ?? '',
      mentor_id: mentorRecord?.id ?? 'm1',
      mentor_name: profile?.full_name ?? 'Mentor',
      track: intern.track || 'Technology Track',
      stage_number: evalStage,
      total_score: total,
      status: 'approved',
      learning_agility: metric1,
      technical_proficiency: metric2,
      problem_solving: metric3,
      collaboration: metric4,
      deliverable_quality: metric5,
      strengths: evalStrengths.trim(),
      areas_for_improvement: evalImprovements.trim(),
      action_plan: evalActionPlan.trim(),
    })
    setIsEvalOpen(false)
    showToast(`Stage ${evalStage} evaluation recorded successfully!`)
  }

  const handleSaveFeedback = (e: React.FormEvent) => {
    e.preventDefault()
    if (!intern) return

    accountService.saveFeedback({
      intern_id: intern.id,
      intern_name: intern.profile?.full_name ?? 'Intern',
      mentor_id: mentorRecord?.id ?? 'm1',
      mentor_name: profile?.full_name ?? 'Mentor',
      category: fbCategory,
      stage_number: intern.current_stage || 1,
      comments: fbComments.trim(),
      strengths: fbStrengths.trim() || undefined,
      recommendations: fbRecs.trim() || undefined,
      is_acknowledged: false,
    })
    setIsFeedbackOpen(false)
    setFbComments('')
    setFbStrengths('')
    setFbRecs('')
    showToast('Structured mentor feedback recorded!')
  }

  const handleSaveImprovement = (e: React.FormEvent) => {
    e.preventDefault()
    if (!intern) return

    accountService.saveImprovementPlan({
      intern_id: intern.id,
      intern_name: intern.profile?.full_name ?? 'Intern',
      mentor_id: mentorRecord?.id ?? 'm1',
      mentor_name: profile?.full_name ?? 'Mentor',
      area_for_improvement: impArea.trim(),
      current_performance_observation: impObs.trim(),
      improvement_objective: impObj.trim(),
      recommended_activities: impActivities.trim(),
      expected_evidence: impEvidence.trim(),
      target_date: impTargetDate,
      follow_up_date: impFollowUp,
      status: 'active',
    })
    setIsImprovementOpen(false)
    showToast('Improvement plan initiated for candidate!')
  }

  const handleSaveReadiness = (e: React.FormEvent) => {
    e.preventDefault()
    if (!intern) return

    accountService.saveCertificationReadiness({
      intern_id: intern.id,
      intern_name: intern.profile?.full_name ?? 'Intern',
      mentor_id: mentorRecord?.id ?? 'm1',
      milestone: readinessMilestone,
      readiness_status: readinessStatus,
      completed_evaluations_verified: true,
      required_evidence_submitted: true,
      readiness_observations: readinessObs.trim(),
      mentor_recommendation: readinessRec.trim(),
    })
    setIsReadinessOpen(false)
    showToast('Certification readiness recommendation submitted!')
  }

  if (!intern) {
    return (
      <MentorLayout title="Intern Details">
        <Card>
          <div className="py-12 text-center space-y-3">
            <User className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="font-bold text-navy text-lg">Intern Not Found</h3>
            <p className="text-xs text-muted">The requested candidate profile does not exist or you lack assignment permissions.</p>
            <Button variant="primary" size="sm" onClick={() => navigate('/mentor/interns')}>
              Back to Assigned Interns
            </Button>
          </div>
        </Card>
      </MentorLayout>
    )
  }

  const stage = LAUNCHPAD_STAGES.find((s) => s.id === intern.current_stage)

  const tabs: { id: TabType; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'baseline', label: 'Baseline', icon: TrendingUp },
    { id: 'progress', label: 'LaunchPad Progress', icon: BookOpen },
    { id: 'tasks', label: 'Tasks & Deliverables', icon: CheckSquare },
    { id: 'kpis', label: 'KPI Tracking', icon: BarChart3 },
    { id: 'evaluations', label: 'Stage Evaluations', icon: Award },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'improvements', label: 'Improvement Plans', icon: AlertCircle },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'readiness', label: 'Certification Readiness', icon: ShieldCheck },
  ]

  return (
    <MentorLayout
      title={`Intern: ${intern.profile?.full_name}`}
      subtitle={`${intern.intern_id} · ${intern.track} · Stage ${intern.current_stage} Candidate`}
    >
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-navy text-white text-sm px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Top Back Nav & Quick Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate('/mentor/interns')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-navy transition-colors"
          >
            <ArrowLeft size={14} /> Back to Assigned Interns
          </button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<MessageSquare size={13} />}
              onClick={() => setIsFeedbackOpen(true)}
            >
              Add Feedback
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Award size={13} />}
              onClick={() => setIsEvalOpen(true)}
            >
              Evaluate Stage
            </Button>
          </div>
        </div>

        {/* Candidate Summary Card */}
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-2xl">
                {intern.profile?.full_name?.[0] ?? 'I'}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold text-navy">{intern.profile?.full_name}</h2>
                  <Badge variant={statusToBadgeVariant(intern.status)} size="sm">
                    {intern.status}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-primary bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {intern.intern_id}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Mail size={12} /> {intern.profile?.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone size={12} /> {intern.phone || '—'}
                  </span>
                  <span className="flex items-center gap-1">
                    <GraduationCap size={12} /> {intern.college || 'Engineering Institution'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-right">
              <p className="text-[11px] font-bold text-muted uppercase tracking-wider">Enrolled Track &amp; Stage</p>
              <p className="font-bold text-navy text-sm mt-0.5">{intern.track}</p>
              <Badge variant="primary" size="sm" className="mt-1">
                {stage?.name ?? `Stage ${intern.current_stage}`}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-gray-200 pb-px scrollbar-none">
          {tabs.map((t) => {
            const isActive = activeTab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap rounded-t-lg transition-all border-b-2 ${
                  isActive
                    ? 'border-primary text-primary bg-white shadow-xs font-bold'
                    : 'border-transparent text-muted hover:text-navy hover:bg-gray-50'
                }`}
              >
                <t.icon size={14} className={isActive ? 'text-primary' : 'text-muted'} />
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <p className="text-xs text-muted">Current Stage</p>
                <p className="text-lg font-bold text-navy mt-1">Stage {intern.current_stage}</p>
                <p className="text-[11px] text-primary mt-0.5">{stage?.name.split('–')[1] ?? 'Learner'}</p>
              </Card>
              <Card>
                <p className="text-xs text-muted">Tasks Assigned</p>
                <p className="text-lg font-bold text-navy mt-1">{internTasks.length}</p>
                <p className="text-[11px] text-muted mt-0.5">{internTasks.filter((t) => t.status === 'reviewed').length} reviewed</p>
              </Card>
              <Card>
                <p className="text-xs text-muted">Stage Evaluations</p>
                <p className="text-lg font-bold text-navy mt-1">{internEvaluations.length}</p>
                <p className="text-[11px] text-emerald-600 mt-0.5">Approved records</p>
              </Card>
              <Card>
                <p className="text-xs text-muted">Active Improvement Plans</p>
                <p className="text-lg font-bold text-navy mt-1">{internImprovements.filter((i) => i.status === 'active' || i.status === 'in_progress').length}</p>
                <p className="text-[11px] text-amber-600 mt-0.5">Under mentor review</p>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <h3 className="font-bold text-navy text-sm mb-3">Academic &amp; Program Profile</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-muted">Degree &amp; Branch:</span>
                    <span className="font-semibold text-navy">{intern.degree} {intern.branch}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-muted">Graduation Year:</span>
                    <span className="font-semibold text-navy">{intern.grad_year}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-muted">Joining Date:</span>
                    <span className="font-semibold text-navy">{intern.joining_date}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted">Assigned Mentor:</span>
                    <span className="font-semibold text-primary">{profile?.full_name}</span>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="font-bold text-navy text-sm mb-2">Mentor Quick Actions</h3>
                <p className="text-xs text-muted mb-4">
                  Direct actions for guiding candidate through the 24-week progression.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('tasks')}>
                    Review Tasks ({internTasks.filter((t) => t.status === 'submitted').length})
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('evaluations')}>
                    Stage Competency
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('improvements')}>
                    Improvement Plan
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('readiness')}>
                    Certification Gate ({internCertifications.length})
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 2: Baseline */}
        {activeTab === 'baseline' && (
          <div className="space-y-4">
            <Card>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="font-bold text-navy text-base">Week 0 Baseline Diagnostic Assessment</h3>
                    <p className="text-xs text-muted">Initial benchmark evaluating core logic, programming, and track essentials.</p>
                  </div>
                  <Badge variant="primary" size="sm">
                    {internBaseline ? `Diagnostic Score: ${internBaseline.score}/100` : 'Score: 85/100'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-gray-50 rounded-xl text-center">
                    <p className="text-xs text-muted">Logical Reasoning</p>
                    <p className="text-lg font-bold text-navy mt-1">{internBaseline?.logic_score ?? 27} / 30</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl text-center">
                    <p className="text-xs text-muted">Coding Fundamentals</p>
                    <p className="text-lg font-bold text-navy mt-1">{internBaseline?.coding_score ?? 35} / 40</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl text-center">
                    <p className="text-xs text-muted">Track Foundations</p>
                    <p className="text-lg font-bold text-navy mt-1">{internBaseline?.domain_fundamentals_score ?? 23} / 30</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-xs">
                  <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                    <p className="font-bold text-emerald-800">Demonstrated Strengths</p>
                    <p className="text-slate-700 mt-0.5">
                      {internBaseline?.mentor_observations ??
                        'Solid grasp of data structures, clean function definitions, and algorithmic reasoning.'}
                    </p>
                  </div>

                  <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl">
                    <p className="font-bold text-amber-800">Identified Knowledge Gaps</p>
                    <p className="text-slate-700 mt-0.5">
                      {internBaseline?.identified_knowledge_gaps ??
                        'Needs reinforcement in container networking, distributed state, and cloud security.'}
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl">
                    <p className="font-bold text-primary">Recommended Learning Priorities</p>
                    <p className="text-slate-700 mt-0.5">
                      {internBaseline?.recommended_learning_priorities ??
                        'Focus on Stage 1 lab exercises Weeks 1–6 and complete foundational cloud quizzes.'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 3: LaunchPad Progress */}
        {activeTab === 'progress' && (
          <div className="space-y-4">
            <h3 className="font-bold text-navy text-sm">24-Week Competency Progression Road</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {LAUNCHPAD_STAGES.map((stg) => {
                const isCurrent = stg.id === intern.current_stage
                const isPast = stg.id < intern.current_stage
                return (
                  <Card key={stg.id}>
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          Weeks {stg.weeks}
                        </span>
                        {isPast ? (
                          <Badge variant="success" size="sm">Completed</Badge>
                        ) : isCurrent ? (
                          <Badge variant="primary" size="sm">Active Stage</Badge>
                        ) : (
                          <Badge variant="muted" size="sm">Upcoming</Badge>
                        )}
                      </div>
                      <h4 className="font-bold text-navy text-sm">{stg.name}</h4>
                      <p className="text-muted leading-relaxed">{stg.description}</p>
                      <div className="p-2.5 bg-gray-50 rounded-lg space-y-1">
                        <p className="font-semibold text-navy">Exit Gate Requirements:</p>
                        <p className="text-slate-600">{stg.exitGate}</p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Tasks & Deliverables */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-navy text-sm">Deliverables &amp; Code Submissions</h3>
                <p className="text-xs text-muted">Review implementation code, evaluate deliverables, and request changes.</p>
              </div>
            </div>

            <div className="space-y-3">
              {internTasks.length === 0 ? (
                <Card>
                  <div className="py-8 text-center text-muted text-xs">
                    No deliverables assigned to this candidate yet.
                  </div>
                </Card>
              ) : (
                internTasks.map((t) => (
                  <Card key={t.id}>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="primary" size="sm">Stage {t.stage_number}</Badge>
                          <span className="font-bold text-navy text-sm">{t.title}</span>
                        </div>
                        {t.status === 'reviewed' ? (
                          <Badge variant="success" size="sm">Score: {t.mentor_score}/100</Badge>
                        ) : t.status === 'submitted' ? (
                          <Badge variant="warning" size="sm">Awaiting Review</Badge>
                        ) : (
                          <Badge variant="muted" size="sm">Pending</Badge>
                        )}
                      </div>

                      <p className="text-slate-600">{t.description}</p>

                      {t.submission_text && (
                        <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                          <p className="font-bold text-navy">Candidate Submission Notes:</p>
                          <p className="text-slate-700">{t.submission_text}</p>
                          {t.submission_url && (
                            <a
                              href={t.submission_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-primary hover:underline font-semibold mt-1"
                            >
                              <ExternalLink size={12} /> {t.submission_url}
                            </a>
                          )}
                        </div>
                      )}

                      {t.mentor_feedback && (
                        <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-1">
                          <p className="font-bold text-primary">Mentor Review Comments:</p>
                          <p className="text-slate-700 italic">{t.mentor_feedback}</p>
                        </div>
                      )}

                      <div className="flex justify-end pt-2 border-t border-gray-100">
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<CheckSquare size={13} />}
                          onClick={() => {
                            setSelectedTask(t)
                            setTaskScore(t.mentor_score != null ? String(t.mentor_score) : '85')
                            setTaskFeedback(t.mentor_feedback ?? '')
                            setIsReviewTaskOpen(true)
                          }}
                        >
                          {t.status === 'reviewed' ? 'Update Review' : 'Review & Score'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 5: KPIs */}
        {activeTab === 'kpis' && (
          <div className="space-y-4">
            <Card>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="font-bold text-navy text-base">L-B-S-S Performance Framework</h3>
                    <p className="text-xs text-muted">Learn (25%), Build (45%), Share (15%), Showcase (15%)</p>
                  </div>
                  <Badge variant="primary" size="sm">Weighted Total: 86%</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl">
                    <p className="font-bold text-navy">LEARN (25%)</p>
                    <p className="text-xl font-bold text-primary mt-1">84%</p>
                    <p className="text-[11px] text-muted mt-1">Curriculum labs &amp; knowledge quizzes</p>
                  </div>
                  <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                    <p className="font-bold text-navy">BUILD (45%)</p>
                    <p className="text-xl font-bold text-emerald-600 mt-1">88%</p>
                    <p className="text-[11px] text-muted mt-1">Hands-on projects &amp; code reviews</p>
                  </div>
                  <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl">
                    <p className="font-bold text-navy">SHARE (15%)</p>
                    <p className="text-xl font-bold text-amber-600 mt-1">82%</p>
                    <p className="text-[11px] text-muted mt-1">KT sessions &amp; peer assistance</p>
                  </div>
                  <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-xl">
                    <p className="font-bold text-navy">SHOWCASE (15%)</p>
                    <p className="text-xl font-bold text-purple-600 mt-1">85%</p>
                    <p className="text-[11px] text-muted mt-1">Technical demos &amp; sprint defence</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 6: Evaluations */}
        {activeTab === 'evaluations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-navy text-sm">Official Stage Competency Records</h3>
                <p className="text-xs text-muted">Stage 1–4 competency assessments scored against standardized criteria.</p>
              </div>
              <Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => setIsEvalOpen(true)}>
                Conduct Evaluation
              </Button>
            </div>

            <div className="space-y-3">
              {internEvaluations.length === 0 ? (
                <Card>
                  <div className="py-8 text-center text-muted text-xs">
                    No official stage evaluations recorded yet. Click &quot;Conduct Evaluation&quot; to begin.
                  </div>
                </Card>
              ) : (
                internEvaluations.map((ev) => (
                  <Card key={ev.id}>
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="primary" size="sm">Stage {ev.stage_number}</Badge>
                          <span className="font-bold text-navy text-sm">Total Score: {ev.total_score}/100</span>
                        </div>
                        <span className="text-muted">{new Date(ev.submitted_at).toLocaleDateString()}</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        <div className="p-2 bg-gray-50 rounded-lg text-center">
                          <p className="text-muted text-[10px]">Learning Agility</p>
                          <p className="font-bold text-navy">{ev.learning_agility}/20</p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-lg text-center">
                          <p className="text-muted text-[10px]">Tech Proficiency</p>
                          <p className="font-bold text-navy">{ev.technical_proficiency}/30</p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-lg text-center">
                          <p className="text-muted text-[10px]">Problem Solving</p>
                          <p className="font-bold text-navy">{ev.problem_solving}/20</p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-lg text-center">
                          <p className="text-muted text-[10px]">Collaboration</p>
                          <p className="font-bold text-navy">{ev.collaboration}/15</p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-lg text-center">
                          <p className="text-muted text-[10px]">Deliverables</p>
                          <p className="font-bold text-navy">{ev.deliverable_quality}/15</p>
                        </div>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                        <p className="font-bold text-navy">Strengths:</p>
                        <p className="text-slate-700">{ev.strengths}</p>
                      </div>

                      <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl space-y-1">
                        <p className="font-bold text-amber-800">Areas For Improvement:</p>
                        <p className="text-slate-700">{ev.areas_for_improvement}</p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 7: Feedback */}
        {activeTab === 'feedback' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-navy text-sm">Structured Mentor Feedback</h3>
                <p className="text-xs text-muted">Regular coaching feedback recorded across the 10 core mentorship categories.</p>
              </div>
              <Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => setIsFeedbackOpen(true)}>
                Add Feedback
              </Button>
            </div>

            <div className="space-y-3">
              {internFeedbackList.length === 0 ? (
                <Card>
                  <div className="py-8 text-center text-muted text-xs">
                    No coaching feedback added yet. Click &quot;Add Feedback&quot; to log a mentoring note.
                  </div>
                </Card>
              ) : (
                internFeedbackList.map((fb) => (
                  <Card key={fb.id}>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <Badge variant="primary" size="sm">{fb.category}</Badge>
                        <span className="text-muted">{new Date(fb.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{fb.comments}</p>
                      {fb.strengths && (
                        <p className="text-emerald-700"><strong>Strengths:</strong> {fb.strengths}</p>
                      )}
                      {fb.recommendations && (
                        <p className="text-primary"><strong>Recommendation:</strong> {fb.recommendations}</p>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 8: Improvements */}
        {activeTab === 'improvements' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-navy text-sm">Performance Improvement Plans</h3>
                <p className="text-xs text-muted">Targeted development plans for addressing specific skill or behavioral gaps.</p>
              </div>
              <Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => setIsImprovementOpen(true)}>
                Initiate Plan
              </Button>
            </div>

            <div className="space-y-3">
              {internImprovements.length === 0 ? (
                <Card>
                  <div className="py-8 text-center text-muted text-xs">
                    No improvement plans currently active for this intern.
                  </div>
                </Card>
              ) : (
                internImprovements.map((imp) => (
                  <Card key={imp.id}>
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-navy text-sm">{imp.area_for_improvement}</h4>
                        <Badge variant={imp.status === 'completed' ? 'success' : 'warning'} size="sm">
                          {imp.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-slate-700"><strong>Observation:</strong> {imp.current_performance_observation}</p>
                      <p className="text-slate-700"><strong>Objective:</strong> {imp.improvement_objective}</p>
                      <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                        <p className="font-bold text-navy">Recommended Activities:</p>
                        <p className="text-slate-700">{imp.recommended_activities}</p>
                      </div>
                      <div className="flex justify-between text-muted text-[11px] pt-1 border-t border-gray-100">
                        <span>Target: {imp.target_date}</span>
                        <span>Follow-up: {imp.follow_up_date}</span>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 9: Projects */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <Card>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <Badge variant="primary" size="sm">Stage 3–4 Capstone</Badge>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={13} /> Architecture Approved
                  </span>
                </div>
                <h3 className="font-bold text-navy text-base">
                  {intern.track === 'Salesforce'
                    ? 'Automated Enterprise Service Portal with LWC & Apex'
                    : intern.track === 'Software Engineering'
                    ? 'Distributed Microservices Architecture & Real-Time Sync'
                    : 'Cloud-Native GenAI Telemetry & Predictive Analytics Engine'}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Full lifecycle enterprise project including requirements gathering, architecture review, test automation suite, and deployment pipeline.
                </p>
                <div className="p-3 bg-gray-50 rounded-xl space-y-1.5">
                  <p className="font-bold text-navy">Mentor Technical Review Checkpoints:</p>
                  <ul className="space-y-1 text-slate-700 list-disc list-inside">
                    <li>Requirement Understanding: Verified &amp; Signed off</li>
                    <li>Architecture &amp; System Design: Microservice boundary approved</li>
                    <li>Code Quality &amp; Automated Tests: 90%+ target coverage</li>
                    <li>Final Defence Readiness: Scheduled for Week 24</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 10: Certification Readiness */}
        {activeTab === 'readiness' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-navy text-sm">Certification Gate Readiness Assessment</h3>
                <p className="text-xs text-muted">Verify eligibility and recommend candidates for Week 12 and Week 24 industry certifications.</p>
              </div>
              <Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => setIsReadinessOpen(true)}>
                Record Readiness
              </Button>
            </div>

            <div className="space-y-3">
              {internReadiness.length === 0 ? (
                <Card>
                  <div className="py-8 text-center text-muted text-xs">
                    No readiness records submitted yet. Click &quot;Record Readiness&quot; to review milestone eligibility.
                  </div>
                </Card>
              ) : (
                internReadiness.map((cr) => (
                  <Card key={cr.id}>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <Badge variant="primary" size="sm">{cr.milestone}</Badge>
                        <Badge variant={cr.readiness_status === 'ready' ? 'success' : 'warning'} size="sm">
                          {cr.readiness_status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-slate-700"><strong>Mentor Observation:</strong> {cr.readiness_observations}</p>
                      <p className="text-primary font-semibold"><strong>Recommendation:</strong> {cr.mentor_recommendation}</p>
                      <p className="text-[11px] text-muted text-right">Submitted on {new Date(cr.recommended_at).toLocaleDateString()}</p>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Review Task Modal */}
        <Modal
          isOpen={isReviewTaskOpen}
          onClose={() => setIsReviewTaskOpen(false)}
          title={`Review Task: ${selectedTask?.title ?? ''}`}
          size="md"
        >
          {selectedTask && (
            <form onSubmit={handleSaveTaskReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy mb-1">Score (0–100) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taskScore}
                  onChange={(e) => setTaskScore(e.target.value)}
                  required
                  className="w-32 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-navy focus:border-primary focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy mb-1">Mentor Feedback *</label>
                <textarea
                  rows={4}
                  value={taskFeedback}
                  onChange={(e) => setTaskFeedback(e.target.value)}
                  placeholder="Specific constructive comments on code structure, edge cases, and improvements..."
                  required
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsReviewTaskOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Review
                </Button>
              </div>
            </form>
          )}
        </Modal>

        {/* Conduct Evaluation Modal */}
        <Modal
          isOpen={isEvalOpen}
          onClose={() => setIsEvalOpen(false)}
          title={`Conduct Stage Evaluation: ${intern.profile?.full_name}`}
          size="lg"
        >
          <form onSubmit={handleSaveEvaluation} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Stage *</label>
              <select
                value={evalStage}
                onChange={(e) => setEvalStage(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              >
                <option value={1}>Stage 1: Learner (Weeks 1–6)</option>
                <option value={2}>Stage 2: Practitioner (Weeks 7–12)</option>
                <option value={3}>Stage 3: Developer (Weeks 13–18)</option>
                <option value={4}>Stage 4: Professional (Weeks 19–24)</option>
              </select>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl space-y-3 text-xs">
              <div className="flex justify-between font-bold text-navy">
                <span>Weighted Metrics</span>
                <span className="text-primary font-bold">Total: {metric1 + metric2 + metric3 + metric4 + metric5}/100</span>
              </div>
              <div>
                <div className="flex justify-between mb-1"><span>Learning Agility &amp; Speed</span><span className="font-bold">{metric1}/20</span></div>
                <input type="range" min="0" max="20" value={metric1} onChange={(e) => setMetric1(Number(e.target.value))} className="w-full accent-primary" />
              </div>
              <div>
                <div className="flex justify-between mb-1"><span>Technical Proficiency</span><span className="font-bold">{metric2}/30</span></div>
                <input type="range" min="0" max="30" value={metric2} onChange={(e) => setMetric2(Number(e.target.value))} className="w-full accent-primary" />
              </div>
              <div>
                <div className="flex justify-between mb-1"><span>Problem Solving &amp; Architecture</span><span className="font-bold">{metric3}/20</span></div>
                <input type="range" min="0" max="20" value={metric3} onChange={(e) => setMetric3(Number(e.target.value))} className="w-full accent-primary" />
              </div>
              <div>
                <div className="flex justify-between mb-1"><span>Professional Collaboration</span><span className="font-bold">{metric4}/15</span></div>
                <input type="range" min="0" max="15" value={metric4} onChange={(e) => setMetric4(Number(e.target.value))} className="w-full accent-primary" />
              </div>
              <div>
                <div className="flex justify-between mb-1"><span>Deliverable Quality &amp; Presentation</span><span className="font-bold">{metric5}/15</span></div>
                <input type="range" min="0" max="15" value={metric5} onChange={(e) => setMetric5(Number(e.target.value))} className="w-full accent-primary" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy mb-1">Key Strengths *</label>
              <textarea
                rows={2}
                value={evalStrengths}
                onChange={(e) => setEvalStrengths(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Areas for Improvement *</label>
              <textarea
                rows={2}
                value={evalImprovements}
                onChange={(e) => setEvalImprovements(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Recommended Action Plan</label>
              <input
                type="text"
                value={evalActionPlan}
                onChange={(e) => setEvalActionPlan(e.target.value)}
                placeholder="Specific next-milestone goals..."
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEvalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Evaluation
              </Button>
            </div>
          </form>
        </Modal>

        {/* Add Feedback Modal */}
        <Modal
          isOpen={isFeedbackOpen}
          onClose={() => setIsFeedbackOpen(false)}
          title={`Add Mentoring Feedback: ${intern.profile?.full_name}`}
          size="md"
        >
          <form onSubmit={handleSaveFeedback} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Category *</label>
              <select
                value={fbCategory}
                onChange={(e) => setFbCategory(e.target.value as MentorFeedbackRecord['category'])}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              >
                <option value="Technical Skills">Technical Skills</option>
                <option value="Problem Solving">Problem Solving</option>
                <option value="Communication">Communication</option>
                <option value="Learning Consistency">Learning Consistency</option>
                <option value="Task Execution">Task Execution</option>
                <option value="Quality of Work">Quality of Work</option>
                <option value="Team Collaboration">Team Collaboration</option>
                <option value="Ownership">Ownership</option>
                <option value="Professional Development">Professional Development</option>
                <option value="Improvement Areas">Improvement Areas</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Comments *</label>
              <textarea
                rows={3}
                value={fbComments}
                onChange={(e) => setFbComments(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Recommendations (Optional)</label>
              <input
                type="text"
                value={fbRecs}
                onChange={(e) => setFbRecs(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsFeedbackOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Feedback
              </Button>
            </div>
          </form>
        </Modal>

        {/* Improvement Plan Modal */}
        <Modal
          isOpen={isImprovementOpen}
          onClose={() => setIsImprovementOpen(false)}
          title={`Initiate Improvement Plan: ${intern.profile?.full_name}`}
          size="md"
        >
          <form onSubmit={handleSaveImprovement} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Area for Improvement *</label>
              <input
                type="text"
                value={impArea}
                onChange={(e) => setImpArea(e.target.value)}
                placeholder="e.g. Test Automation Coverage"
                required
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Performance Observation *</label>
              <textarea
                rows={2}
                value={impObs}
                onChange={(e) => setImpObs(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Improvement Objective *</label>
              <input
                type="text"
                value={impObj}
                onChange={(e) => setImpObj(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Recommended Activities *</label>
              <textarea
                rows={2}
                value={impActivities}
                onChange={(e) => setImpActivities(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Expected Evidence *</label>
              <input
                type="text"
                value={impEvidence}
                onChange={(e) => setImpEvidence(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-navy mb-1">Target Date</label>
                <input
                  type="date"
                  value={impTargetDate}
                  onChange={(e) => setImpTargetDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy mb-1">Follow-Up Date</label>
                <input
                  type="date"
                  value={impFollowUp}
                  onChange={(e) => setImpFollowUp(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsImprovementOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Plan
              </Button>
            </div>
          </form>
        </Modal>

        {/* Readiness Modal */}
        <Modal
          isOpen={isReadinessOpen}
          onClose={() => setIsReadinessOpen(false)}
          title={`Certification Readiness: ${intern.profile?.full_name}`}
          size="md"
        >
          <form onSubmit={handleSaveReadiness} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Milestone Gate *</label>
              <select
                value={readinessMilestone}
                onChange={(e) => setReadinessMilestone(e.target.value as 'Week 12' | 'Week 24')}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              >
                <option value="Week 12">Week 12 (Foundational Certification)</option>
                <option value="Week 24">Week 24 (Advanced Role Specialization)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Readiness Assessment *</label>
              <select
                value={readinessStatus}
                onChange={(e) => setReadinessStatus(e.target.value as 'ready' | 'needs_preparation' | 'not_ready')}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              >
                <option value="ready">Ready for Official Certification</option>
                <option value="needs_preparation">Needs Additional Preparation</option>
                <option value="not_ready">Not Ready</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Readiness Observations *</label>
              <textarea
                rows={3}
                value={readinessObs}
                onChange={(e) => setReadinessObs(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Mentor Recommendation *</label>
              <input
                type="text"
                value={readinessRec}
                onChange={(e) => setReadinessRec(e.target.value)}
                placeholder="Recommendation to Admin examination committee..."
                required
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsReadinessOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Submit Recommendation
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </MentorLayout>
  )
}

export default MentorInternDetailPage
