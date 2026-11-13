import React, { useState, useEffect } from 'react'
import { FileBarChart, Users, UserCheck, Grid3X3, TrendingUp, Award, Download, BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import AdminLayout from '../../../components/layout/AdminLayout'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import StatCard from '../../../components/ui/StatCard'
import { LAUNCHPAD_STAGES } from '../../../lib/constants'

const REPORT_CATEGORIES = [
  { id: 'program', title: 'Program Overview Report', description: 'Comprehensive summary of LaunchPad cohorts, stage distribution, and completion rates.', icon: BarChart3 },
  { id: 'intern', title: 'Intern Performance Report', description: 'Individual intern KPI scores, stage evaluation results, and progression status.', icon: Users },
  { id: 'mentor', title: 'Mentor Workload & Analysis', description: 'Assigned intern counts, evaluation turnaround times, and feedback activity.', icon: UserCheck },
  { id: 'batch', title: 'Batch Comparison Report', description: 'Cross-batch KPI benchmarks, attendance, and milestone completion.', icon: Grid3X3 },
  { id: 'kpi', title: 'KPI Trends & Banding', description: 'Monthly Learn, Build, Share, Showcase pillar trends across cohorts.', icon: TrendingUp },
  { id: 'cert', title: 'Certification Status Report', description: 'Week 12 and Week 24 certification submissions and verification audit.', icon: Award },
]

const STAGE_DATA = LAUNCHPAD_STAGES.map((s, idx) => ({
  name: `Stage ${s.id}`,
  interns: [4, 15, 12, 11, 6][idx] ?? 0,
}))

const ReportsPage: React.FC = () => {
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  const handleGenerate = (title: string) => {
    setToast(`Generating "${title}" CSV export...`)
  }

  return (
    <AdminLayout title="Reports & Analytics" subtitle="Program-wide analytics and exportable reports">
      {toast && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white bg-primary">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Active Cohorts" value={3} icon={Grid3X3} iconColor="text-primary" iconBg="bg-blue-50" />
        <StatCard title="Avg Program KPI" value="76%" icon={TrendingUp} iconColor="text-success" iconBg="bg-green-50" />
        <StatCard title="Eval Completion" value="88%" icon={FileBarChart} iconColor="text-navy" iconBg="bg-indigo-50" />
        <StatCard title="Cert Verification" value="82%" icon={Award} iconColor="text-warning" iconBg="bg-amber-50" />
      </div>

      <Card className="mb-6">
        <h3 className="text-base font-semibold text-navy mb-4">Interns Across LaunchPad Stages</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={STAGE_DATA} margin={{ left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
            <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
            <Bar dataKey="interns" fill="#2563EB" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {REPORT_CATEGORIES.map(rep => (
          <Card key={rep.id}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <rep.icon size={20} className="text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-navy text-sm">{rep.title}</h4>
                <p className="text-xs text-muted mt-1">{rep.description}</p>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <Button size="sm" variant="outline" icon={<Download size={13} />} onClick={() => handleGenerate(rep.title)}>
                Generate Report
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </AdminLayout>
  )
}

export default ReportsPage
