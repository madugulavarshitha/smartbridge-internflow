import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Rocket,
  Award,
  Clock,
  UserCheck,
  Layers,
  GraduationCap,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { accountService } from '../../lib/accountService'
import InternLayout from '../../components/layout/InternLayout'
import Card from '../../components/ui/Card'
import Badge, { statusToBadgeVariant } from '../../components/ui/Badge'
import StatCard from '../../components/ui/StatCard'
import Button from '../../components/ui/Button'
import { LAUNCHPAD_STAGES } from '../../lib/constants'

const InternDashboardPage: React.FC = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  // Find intern record
  const internRecord = useMemo(() => {
    if (!profile) return null
    return (
      accountService.getInterns().find(
        (i) =>
          i.profile_id === profile.id ||
          i.profile?.email.toLowerCase() === profile.email.toLowerCase() ||
          i.id === user?.id
      ) ?? null
    )
  }, [profile, user])

  const currentMentor = useMemo(() => {
    if (!internRecord) return null
    return internRecord.mentor ?? null
  }, [internRecord])

  const stage = internRecord ? LAUNCHPAD_STAGES.find((s) => s.id === internRecord.current_stage) : null

  return (
    <InternLayout
      title="Intern Learning Hub"
      subtitle={`${internRecord?.intern_id ?? 'INT-001'} · ${internRecord?.track ?? 'Program Track'}`}
    >
      <div className="space-y-6">
        {/* Welcome & Profile Header */}
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 font-bold text-xl">
                {profile?.full_name?.[0] ?? 'I'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-navy">{profile?.full_name}</h2>
                  <Badge variant={statusToBadgeVariant(internRecord?.status ?? 'active')} size="sm">
                    {internRecord?.status ?? 'active'}
                  </Badge>
                </div>
                <p className="text-xs text-muted mt-0.5">{profile?.email}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
                  <span className="font-semibold text-navy">Track:</span>
                  <Badge variant="primary" size="sm">{internRecord?.track ?? 'AI & Cloud'}</Badge>
                  <span className="text-muted ml-2">Intern ID:</span>
                  <span className="font-mono font-medium text-navy">{internRecord?.intern_id ?? 'INT-001'}</span>
                  <span className="text-muted ml-2">College:</span>
                  <span className="font-medium text-slate-700">{internRecord?.college ?? 'Engineering Institution'}</span>
                </div>
              </div>
            </div>
            <div>
              <Button
                variant="outline"
                size="sm"
                icon={<ExternalLink size={14} />}
                onClick={() => {
                  if (internRecord) navigate(`/admin/interns/${internRecord.id}`)
                }}
              >
                View Full Profile
              </Button>
            </div>
          </div>
        </Card>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Current Stage"
            value={stage ? stage.name.split('–')[0].trim() : 'Stage 1'}
            subtitle={stage ? stage.name.split('–')[1]?.trim() : 'Learner'}
            icon={Layers}
            iconColor="text-primary"
            iconBg="bg-blue-50"
          />
          <StatCard
            title="Assigned Mentor"
            value={currentMentor?.profile?.full_name ?? 'Dr. Ramesh Babu'}
            subtitle={currentMentor?.domain ?? 'Assigned Track Expert'}
            icon={UserCheck}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
          <StatCard
            title="Overall KPI Score"
            value="82%"
            subtitle="L-B-S-S Weighted Average"
            icon={Award}
            iconColor="text-amber-500"
            iconBg="bg-amber-50"
          />
          <StatCard
            title="Program Duration"
            value="24 Weeks"
            subtitle="Cohort 2026-2027"
            icon={Clock}
            iconColor="text-navy"
            iconBg="bg-slate-50"
          />
        </div>

        {/* Two Columns: Dedicated Mentor Card + 24-Week Stage Roadmap */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assigned Mentor Card */}
          <Card className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <UserCheck size={18} className="text-emerald-600" />
              <h3 className="font-bold text-navy text-base">Dedicated Mentor</h3>
            </div>

            {currentMentor ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-navy/10 flex items-center justify-center font-bold text-navy text-lg">
                    {currentMentor.profile?.full_name?.[0] ?? 'M'}
                  </div>
                  <div>
                    <p className="font-bold text-navy text-sm">{currentMentor.profile?.full_name}</p>
                    <p className="text-xs text-muted">{currentMentor.designation ?? 'Senior Architect'}</p>
                    <p className="text-xs text-primary font-medium mt-0.5">{currentMentor.department ?? 'Engineering'}</p>
                  </div>
                </div>

                <div className="p-3 bg-surface rounded-xl border border-gray-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted">Mentor Email:</span>
                    <span className="font-medium text-navy">{currentMentor.profile?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Employee ID:</span>
                    <span className="font-mono text-navy">{currentMentor.employee_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Domain Expertise:</span>
                    <span className="font-medium text-primary">{currentMentor.domain}</span>
                  </div>
                </div>

                {currentMentor.expertise && currentMentor.expertise.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-navy mb-2">Mentor Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {currentMentor.expertise.map((skill) => (
                        <Badge key={skill} variant="muted" size="sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-muted text-xs">
                No mentor assigned yet. Please contact your batch administrator.
              </div>
            )}
          </Card>

          {/* 24-Week Stage Progression Roadmap */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Rocket size={18} className="text-primary" />
                <h3 className="font-bold text-navy text-base">24-Week LaunchPad Journey</h3>
              </div>
              <Badge variant="primary" size="sm">Stage {internRecord?.current_stage ?? 1} of 4</Badge>
            </div>

            <div className="space-y-3">
              {LAUNCHPAD_STAGES.map((stg) => {
                const currentStageNum = internRecord?.current_stage ?? 1
                const isPassed = stg.id < currentStageNum
                const isCurrent = stg.id === currentStageNum
                return (
                  <div
                    key={stg.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isCurrent
                        ? 'border-primary bg-primary/5 shadow-xs'
                        : isPassed
                          ? 'border-emerald-200 bg-emerald-50/40'
                          : 'border-gray-100 bg-white opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isPassed
                              ? 'bg-emerald-500 text-white'
                              : isCurrent
                                ? 'bg-primary text-white'
                                : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {stg.id}
                        </span>
                        <span className="font-bold text-sm text-navy">{stg.name}</span>
                      </div>
                      {isPassed && <Badge variant="success" size="sm">Completed</Badge>}
                      {isCurrent && <Badge variant="primary" size="sm">In Progress</Badge>}
                      {!isPassed && !isCurrent && <Badge variant="muted" size="sm">Upcoming</Badge>}
                    </div>
                    <p className="text-xs text-muted ml-9">Weeks: {stg.weeks}</p>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Academic & Program Profile */}
        <Card>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
            <GraduationCap size={18} className="text-primary" />
            <h3 className="font-bold text-navy text-base">Academic &amp; Program Profile</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted">College / Institution</p>
              <p className="font-semibold text-navy mt-0.5">{internRecord?.college ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Degree &amp; Branch</p>
              <p className="font-semibold text-navy mt-0.5">{internRecord?.degree ? `${internRecord.degree} · ${internRecord.branch}` : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Graduation Year</p>
              <p className="font-semibold text-navy mt-0.5">{internRecord?.grad_year ?? '2026'}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Joining Date</p>
              <p className="font-semibold text-navy mt-0.5">
                {internRecord?.joining_date ? new Date(internRecord.joining_date).toLocaleDateString('en-IN') : '—'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </InternLayout>
  )
}

export default InternDashboardPage
