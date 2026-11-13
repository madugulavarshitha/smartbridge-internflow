import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  CheckSquare,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { accountService } from '../../lib/accountService'
import MentorLayout from '../../components/layout/MentorLayout'
import Card from '../../components/ui/Card'
import Badge, { statusToBadgeVariant } from '../../components/ui/Badge'
import StatCard from '../../components/ui/StatCard'
import Button from '../../components/ui/Button'
import { LAUNCHPAD_STAGES } from '../../lib/constants'

const MentorDashboardPage: React.FC = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  // Find mentor profile & assigned interns
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

  const assignedInterns = useMemo(() => {
    if (!mentorRecord) return []
    return accountService.getAssignedInternsForMentor(mentorRecord.id)
  }, [mentorRecord])

  return (
    <MentorLayout
      title="Mentor Workspace"
      subtitle={`${mentorRecord?.designation ?? 'Industry Mentor'} · ${mentorRecord?.domain ?? 'Track'}`}
    >
      <div className="space-y-6">
        {/* Mentor Overview Card */}
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                {profile?.full_name?.[0] ?? 'M'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-navy">{profile?.full_name}</h2>
                  <Badge variant="primary" size="sm">Mentor</Badge>
                </div>
                <p className="text-xs text-muted mt-0.5">{profile?.email}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
                  <span className="font-semibold text-navy">Track:</span>
                  <Badge variant="muted" size="sm">{mentorRecord?.domain ?? 'AI & Cloud'}</Badge>
                  <span className="text-muted ml-2">Employee ID:</span>
                  <span className="font-mono font-medium text-navy">{mentorRecord?.employee_id ?? 'EMP-001'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<ExternalLink size={14} />}
                onClick={() => {
                  navigate('/mentor/profile')
                }}
              >
                View My Profile
              </Button>
            </div>
          </div>
        </Card>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Assigned Interns"
            value={assignedInterns.length}
            subtitle="Under your mentorship"
            icon={Users}
            iconColor="text-primary"
            iconBg="bg-blue-50"
          />
          <StatCard
            title="Pending Evaluations"
            value={assignedInterns.filter(i => i.current_stage > 0).length}
            subtitle="Stage milestones to review"
            icon={CheckSquare}
            iconColor="text-warning"
            iconBg="bg-amber-50"
          />
          <StatCard
            title="Tasks Reviewed"
            value={14}
            subtitle="This cohort cycle"
            icon={Clock}
            iconColor="text-navy"
            iconBg="bg-slate-50"
          />
          <StatCard
            title="Track Domain"
            value={mentorRecord?.domain ?? 'AI & Cloud'}
            subtitle="Specialization"
            icon={ShieldCheck}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
        </div>

        {/* Assigned Interns Table */}
        <Card padding="none">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-navy text-base">My Assigned Interns</h3>
              <p className="text-xs text-muted mt-0.5">
                Interns currently paired with you for stage guidance and assessments
              </p>
            </div>
            <Badge variant="primary" size="sm">
              {assignedInterns.length} Intern{assignedInterns.length === 1 ? '' : 's'}
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted uppercase">Intern</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Track</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Current Stage</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">College</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {assignedInterns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-muted">
                      No interns currently assigned to this mentor account.
                    </td>
                  </tr>
                ) : (
                  assignedInterns.map((intern) => {
                    const stg = LAUNCHPAD_STAGES.find((s) => s.id === intern.current_stage)
                    return (
                      <tr key={intern.id} className="hover:bg-surface transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                              {intern.profile?.full_name?.[0] ?? '?'}
                            </div>
                            <div>
                              <p className="font-semibold text-navy">{intern.profile?.full_name}</p>
                              <p className="text-xs text-muted">{intern.profile?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-mono text-xs text-muted">{intern.intern_id}</td>
                        <td className="px-4 py-4 font-medium text-navy">{intern.track}</td>
                        <td className="px-4 py-4">
                          <Badge variant="primary" size="sm">
                            {stg ? stg.name : `Stage ${intern.current_stage}`}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant={statusToBadgeVariant(intern.status)} size="sm">
                            {intern.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-xs text-muted">{intern.college ?? '—'}</td>
                        <td className="px-4 py-4">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => navigate(`/mentor/interns/${intern.id}`)}
                          >
                            Review Details
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Section C: Pending Actions & Section D: Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
              <h3 className="font-bold text-navy text-sm flex items-center gap-2">
                <AlertCircle className="text-amber-500" size={16} />
                Pending Mentor Actions
              </h3>
              <Badge variant="warning" size="sm">Action Required</Badge>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-navy">Rahul Sharma – Deliverable Awaiting Review</p>
                  <p className="text-slate-600 mt-0.5">Stage 2 Microservices Architecture Deliverable</p>
                </div>
                <Button size="sm" variant="primary" onClick={() => navigate('/mentor/tasks')}>
                  Review
                </Button>
              </div>

              <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-xl flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-navy">Stage 2 Competency Evaluations Due</p>
                  <p className="text-slate-600 mt-0.5">Approaching Week 12 gateway checkpoint</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate('/mentor/evaluations')}>
                  Evaluate
                </Button>
              </div>

              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-navy">Improvement Plan Follow-up</p>
                  <p className="text-slate-600 mt-0.5">Container Security review scheduled for Rahul Sharma</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate('/mentor/feedback')}>
                  View Plan
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
              <h3 className="font-bold text-navy text-sm flex items-center gap-2">
                <Clock className="text-primary" size={16} />
                Recent Mentorship Activity
              </h3>
              <span className="text-[11px] text-muted">Last 7 days</span>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5 pb-2.5 border-b border-gray-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-navy">Task submission reviewed for Priya Patel</p>
                  <p className="text-muted text-[11px]">Apex Triggers &amp; Test Classes scored 94/100 with feedback</p>
                </div>
                <span className="text-muted text-[10px]">2d ago</span>
              </div>

              <div className="flex items-start gap-2.5 pb-2.5 border-b border-gray-100">
                <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-navy">Stage 1 Evaluation finalized</p>
                  <p className="text-muted text-[11px]">Rahul Sharma cleared Stage 1 exit gate with score of 88/100</p>
                </div>
                <span className="text-muted text-[10px]">4d ago</span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-navy">Week 12 Certification proof verified</p>
                  <p className="text-muted text-[11px]">AWS Certified Cloud Practitioner badge verified on Credly</p>
                </div>
                <span className="text-muted text-[10px]">1w ago</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Mentor Expertise & Guideline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <h4 className="font-bold text-navy text-sm mb-3">Domain Specialization &amp; Skills</h4>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {mentorRecord?.expertise && mentorRecord.expertise.length > 0 ? (
                mentorRecord.expertise.map((skill) => (
                  <Badge key={skill} variant="muted" size="sm">
                    {skill}
                  </Badge>
                ))
              ) : (
                <p className="text-xs text-muted">No specific tags recorded.</p>
              )}
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Assigned interns in your domain are matched to your architectural skill set for direct weekly mentoring.
            </p>
          </Card>

          <Card>
            <h4 className="font-bold text-navy text-sm mb-2">Mentorship Guidelines</h4>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
              <li>Conduct stage assessments at the end of weeks 6, 12, 18, and 24.</li>
              <li>Provide constructive technical feedback on code submissions and lab exercises.</li>
              <li>Verify external certifications submitted by interns with proof URLs.</li>
            </ul>
          </Card>
        </div>
      </div>
    </MentorLayout>
  )
}

export default MentorDashboardPage
