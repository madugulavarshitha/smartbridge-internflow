import React, { useMemo } from 'react'
import {
  Rocket,
  Award,
  CheckCircle2,
  Clock,
  TrendingUp,
  Target,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { accountService } from '../../lib/accountService'
import InternLayout from '../../components/layout/InternLayout'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import StatCard from '../../components/ui/StatCard'
import { LAUNCHPAD_STAGES } from '../../lib/constants'

const InternLaunchPadPage: React.FC = () => {
  const { user, profile } = useAuth()

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

  const currentStageNum = internRecord?.current_stage ?? 1

  return (
    <InternLayout
      title="LaunchPad 24-Week Journey"
      subtitle={`Enrolled Track: ${internRecord?.track ?? 'Technology Track'} · Stage ${currentStageNum} Candidate`}
    >
      <div className="space-y-6">
        {/* KPI Framework Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Learning Velocity"
            value="25%"
            subtitle="Curriculum labs & weekly tasks"
            icon={Rocket}
            iconColor="text-primary"
            iconBg="bg-blue-50"
          />
          <StatCard
            title="Professional Behavior"
            value="45%"
            subtitle="Attendance, daily standups, discipline"
            icon={Target}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
          <StatCard
            title="Skill Execution"
            value="15%"
            subtitle="Code reviews & deliverables"
            icon={TrendingUp}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
          />
          <StatCard
            title="Social / Soft Skills"
            value="15%"
            subtitle="Collaboration & presentations"
            icon={Award}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
          />
        </div>

        {/* Current Progression Stepper Banner */}
        <Card>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-navy text-base">Stage Progression Roadmap</h3>
                <p className="text-xs text-muted">Complete milestone gates to unlock stage promotion</p>
              </div>
              <Badge variant="primary" size="sm">
                Active in Stage {currentStageNum}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {LAUNCHPAD_STAGES.map((stg) => {
                const isCurrent = stg.id === currentStageNum
                const isPast = stg.id < currentStageNum
                return (
                  <div
                    key={stg.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-blue-50/50 border-primary shadow-xs ring-2 ring-primary/10'
                        : isPast
                        ? 'bg-emerald-50/30 border-emerald-200'
                        : 'bg-gray-50/60 border-gray-200 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold font-mono text-muted">Weeks {stg.weeks}</span>
                      {isPast ? (
                        <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 size={13} /> Completed
                        </span>
                      ) : isCurrent ? (
                        <span className="text-primary text-xs font-bold flex items-center gap-1">
                          <Clock size={13} /> In Progress
                        </span>
                      ) : (
                        <span className="text-muted text-xs">Upcoming</span>
                      )}
                    </div>
                    <h4 className="font-bold text-navy text-sm">{stg.name}</h4>
                    <p className="text-xs text-muted mt-1 line-clamp-2">{stg.description}</p>
                    <div className="mt-3 pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-muted">Passing Score:</span>
                      <span className="font-bold text-navy">{stg.minScore}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>

        {/* Stage Deliverables & Milestones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LAUNCHPAD_STAGES.map((stg) => (
            <Card key={stg.id}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    Weeks {stg.weeks}
                  </span>
                  <Badge variant={stg.id <= currentStageNum ? 'primary' : 'muted'} size="sm">
                    Stage {stg.id}
                  </Badge>
                </div>

                <h3 className="font-bold text-navy text-base">{stg.name}</h3>
                <p className="text-xs text-muted leading-relaxed">{stg.description}</p>

                <div className="p-3 bg-gray-50 rounded-xl space-y-1 text-xs">
                  <p className="font-semibold text-navy">Exit Gate Requirements:</p>
                  <p className="text-slate-600">{stg.exitGate}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-muted uppercase tracking-wider">Required Deliverables:</p>
                  <ul className="text-xs text-navy space-y-1 list-disc list-inside">
                    {stg.deliverables.map((del, i) => (
                      <li key={i}>{del}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </InternLayout>
  )
}

export default InternLaunchPadPage
