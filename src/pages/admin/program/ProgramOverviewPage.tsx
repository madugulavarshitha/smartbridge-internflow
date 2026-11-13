import React, { useState } from 'react'
import AdminLayout from '../../../components/layout/AdminLayout'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import { KPI_WEIGHTS, LAUNCHPAD_STAGES, STAGE_EVAL_METRICS } from '../../../lib/constants'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { ChevronDown, ChevronRight, AlertCircle, Award, BookOpen, Wrench, Share2, Star } from 'lucide-react'

// ─── Mock Data ───────────────────────────────────────────────────────────────
const mockStageDistribution: Record<number, number> = { 0: 3, 1: 12, 2: 9, 3: 6, 4: 4 }

const stageColors: Record<string, string> = {
  muted: '#64748B',
  primary: '#2563EB',
  warning: '#F59E0B',
  success: '#16A34A',
  navy: '#172B4D',
}

const stageDescriptions: Record<number, string> = {
  0: 'Initial skills assessment to establish a baseline for each intern before the program begins.',
  1: 'Foundational learning, technical fundamentals, and guided exercises. Interns build core domain knowledge.',
  2: 'Applied practice through assignments, case studies, and independent troubleshooting.',
  3: 'Real-world problem solving, project development, testing, and documentation.',
  4: 'Advanced delivery, final project demonstration, mentoring leadership, and professional handover.',
}

const kpiPillars = [
  {
    key: 'LEARN',
    weight: KPI_WEIGHTS.LEARN,
    icon: BookOpen,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    desc: 'Technical fundamentals, research, conceptual understanding, and guided knowledge acquisition.',
  },
  {
    key: 'BUILD',
    weight: KPI_WEIGHTS.BUILD,
    icon: Wrench,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    desc: 'Practical implementation, assignments, development, testing, and solution quality.',
  },
  {
    key: 'SHARE',
    weight: KPI_WEIGHTS.SHARE,
    icon: Share2,
    color: 'text-green-600',
    bg: 'bg-green-50',
    desc: 'Communication, collaboration, peer mentoring, knowledge transfer, and KT sessions.',
  },
  {
    key: 'SHOWCASE',
    weight: KPI_WEIGHTS.SHOWCASE,
    icon: Star,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    desc: 'Presentations, demonstrations, project defences, and showcasing completed work.',
  },
]

const stageEvalData: Array<{ key: keyof typeof STAGE_EVAL_METRICS; label: string; stageId: number }> = [
  { key: 'STAGE_1', label: 'Stage 1 – Learner', stageId: 1 },
  { key: 'STAGE_2', label: 'Stage 2 – Practitioner', stageId: 2 },
  { key: 'STAGE_3', label: 'Stage 3 – Developer', stageId: 3 },
  { key: 'STAGE_4', label: 'Stage 4 – Professional', stageId: 4 },
]

const chartData = LAUNCHPAD_STAGES.map((s) => ({
  name: s.id === 0 ? 'Baseline' : `Stage ${s.id}`,
  interns: mockStageDistribution[s.id] ?? 0,
  color: stageColors[s.color],
}))

// ─── Component ───────────────────────────────────────────────────────────────
const ProgramOverviewPage: React.FC = () => {
  const [expandedStage, setExpandedStage] = useState<string | null>(null)

  const toggle = (key: string) => setExpandedStage((prev) => (prev === key ? null : key))

  return (
    <AdminLayout title="Program Overview" subtitle="LaunchPad stage & curriculum overview">
      {/* Page Header */}
      <div className="mb-6">
        <p className="text-sm text-muted max-w-3xl">
          The <span className="font-semibold text-navy">LAUNCHPAD</span> is a structured 24-week internship development
          framework comprising Week 0 Baseline Assessment followed by four progressive stages. Each stage builds on
          the previous, covering learning, building, sharing, and showcasing capabilities evaluated against defined KPI pillars.
        </p>
      </div>

      {/* Program Timeline */}
      <Card className="mb-6">
        <h2 className="text-base font-semibold text-navy mb-4">Program Timeline</h2>
        <div className="flex flex-col md:flex-row gap-3">
          {LAUNCHPAD_STAGES.map((stage, idx) => (
            <div key={stage.id} className="flex flex-col md:flex-row items-stretch flex-1">
              <div
                className="flex-1 rounded-xl p-4 border-2"
                style={{
                  borderColor: stageColors[stage.color],
                  background: `${stageColors[stage.color]}10`,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: stageColors[stage.color] }}>
                    Wk {stage.weeks}
                  </span>
                  <Badge variant={stage.color as any} size="sm">
                    {mockStageDistribution[stage.id] ?? 0} interns
                  </Badge>
                </div>
                <p className="text-sm font-semibold text-navy mb-1">{stage.name}</p>
                <p className="text-xs text-muted">{stageDescriptions[stage.id]}</p>
              </div>
              {idx < LAUNCHPAD_STAGES.length - 1 && (
                <div className="hidden md:flex items-center px-1 text-gray-300">
                  <ChevronRight size={18} />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* KPI Pillars */}
      <Card className="mb-6">
        <h2 className="text-base font-semibold text-navy mb-4">KPI Pillars</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpiPillars.map(({ key, weight, icon: Icon, color, bg, desc }) => (
            <div key={key} className={`rounded-xl p-4 ${bg}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-white/60`}>
                <Icon className={color} size={20} />
              </div>
              <p className={`text-lg font-bold ${color}`}>{(weight * 100).toFixed(0)}%</p>
              <p className="text-sm font-semibold text-navy mb-1">{key}</p>
              <p className="text-xs text-muted">{desc}</p>
            </div>
          ))}
        </div>
        {/* Formula */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-muted font-medium mb-1">KPI Formula</p>
          <code className="text-xs text-navy">
            Overall KPI = (LEARN × 25%) + (BUILD × 45%) + (SHARE × 15%) + (SHOWCASE × 15%)
          </code>
        </div>
      </Card>

      {/* Stage Evaluation Criteria */}
      <Card className="mb-6">
        <h2 className="text-base font-semibold text-navy mb-4">Stage Evaluation Criteria</h2>
        <div className="space-y-2">
          {stageEvalData.map(({ key, label, stageId }) => {
            const metrics = STAGE_EVAL_METRICS[key]
            const isOpen = expandedStage === key
            const stage = LAUNCHPAD_STAGES.find((s) => s.id === stageId)
            return (
              <div key={key} className="border border-gray-100 rounded-lg overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  onClick={() => toggle(key)}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ background: stage ? stageColors[stage.color] : '#64748B' }}
                    />
                    <span className="text-sm font-semibold text-navy">{label}</span>
                  </div>
                  {isOpen ? <ChevronDown size={16} className="text-muted" /> : <ChevronRight size={16} className="text-muted" />}
                </button>
                {isOpen && (
                  <div className="px-4 py-3">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left text-xs font-medium text-muted pb-2">Evaluation Metric</th>
                          <th className="text-right text-xs font-medium text-muted pb-2 w-20">Weight</th>
                        </tr>
                      </thead>
                      <tbody>
                        {metrics.map((m, i) => (
                          <tr key={i} className="border-b border-gray-50 last:border-0">
                            <td className="py-2 text-navy pr-4">{m.metric}</td>
                            <td className="py-2 text-right font-semibold text-primary">{m.weight}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Important Note */}
      <div className="mb-6 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Important:</span> Stage progression is based on documented evaluation evidence
          and authorized decisions – not the passage of time alone.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Certification Milestones */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Award size={18} className="text-primary" />
            <h2 className="text-base font-semibold text-navy">Certification Milestones</h2>
          </div>
          <div className="space-y-3">
            {[
              { week: 12, label: 'Mid-Program Certification', desc: 'Awarded upon successful completion of Stages 1 & 2 (Weeks 1–12).' },
              { week: 24, label: 'Program Completion Certification', desc: 'Awarded upon successful completion of Stages 3 & 4 (Weeks 13–24).' },
            ].map((cert) => (
              <div key={cert.week} className="flex gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">W{cert.week}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy">{cert.label}</p>
                  <p className="text-xs text-muted">{cert.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mt-3 italic">
            Certification names are configurable once confirmed by SmartBridge management.
          </p>
        </Card>

        {/* Stage Distribution Chart */}
        <Card>
          <h2 className="text-base font-semibold text-navy mb-4">Current Stage Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                formatter={(v) => [v ?? 0, 'Interns']}
              />
              <Bar dataKey="interns" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default ProgramOverviewPage
