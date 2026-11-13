import React from 'react'
import {
  Rocket,
  Layers,
  Award,
  TrendingUp,
  Target,
} from 'lucide-react'
import MentorLayout from '../../components/layout/MentorLayout'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import StatCard from '../../components/ui/StatCard'
import { LAUNCHPAD_STAGES } from '../../lib/constants'

const MentorLaunchPadPage: React.FC = () => {
  return (
    <MentorLayout
      title="LaunchPad 24-Week Framework"
      subtitle="Standardized competency progression across the 4 key stages and L-B-S-S performance framework"
    >
      <div className="space-y-6">
        {/* KPI Framework Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Learning Velocity"
            value="25%"
            subtitle="Curriculum completion, labs & assessments"
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
            subtitle="Code reviews, pull requests & deliverables"
            icon={TrendingUp}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
          />
          <StatCard
            title="Social / Soft Skills"
            value="15%"
            subtitle="Peer collaboration, presentations, demos"
            icon={Award}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
          />
        </div>

        {/* 24-Week Stage Breakdown */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-navy flex items-center gap-2">
            <Layers className="text-primary" size={18} />
            LaunchPad Progression Stages
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LAUNCHPAD_STAGES.map((stg) => (
              <Card key={stg.id}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-primary bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                      Weeks {stg.weeks}
                    </span>
                    <Badge variant="primary" size="sm">Stage {stg.id}</Badge>
                  </div>

                  <div>
                    <h3 className="font-bold text-navy text-base">{stg.name}</h3>
                    <p className="text-xs text-muted mt-1 leading-relaxed">{stg.description}</p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-navy">
                      <span className="font-semibold">Minimum Passing Score:</span>
                      <span className="font-bold text-primary">{stg.minScore}%</span>
                    </div>
                    <div className="flex items-center justify-between text-navy">
                      <span className="font-semibold">Key Milestone:</span>
                      <span className="text-muted">{stg.exitGate}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-muted uppercase tracking-wider">Required Deliverables:</p>
                    <ul className="text-xs text-navy space-y-1 list-disc list-inside">
                      {stg.deliverables.map((d, idx) => (
                        <li key={idx} className="truncate">{d}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MentorLayout>
  )
}

export default MentorLaunchPadPage
