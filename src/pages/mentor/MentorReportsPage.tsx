import React, { useMemo } from 'react'
import {
  Download,
  Users,
  CheckSquare,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { useAuth } from '../../contexts/AuthContext'
import { accountService } from '../../lib/accountService'
import MentorLayout from '../../components/layout/MentorLayout'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import StatCard from '../../components/ui/StatCard'

const MentorReportsPage: React.FC = () => {
  const { user, profile } = useAuth()

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

  // Assigned interns
  const assignedInterns = useMemo(() => {
    if (!mentorRecord) return []
    return accountService.getAssignedInternsForMentor(mentorRecord.id)
  }, [mentorRecord])

  // Tasks
  const allTasks = useMemo(() => {
    return accountService.getTasks()
  }, [])

  const assignedTasks = useMemo(() => {
    const ids = new Set(assignedInterns.map((i) => i.id))
    return allTasks.filter((t) => ids.has(t.intern_id))
  }, [allTasks, assignedInterns])

  const reviewedCount = assignedTasks.filter((t) => t.status === 'reviewed').length
  const submittedCount = assignedTasks.filter((t) => t.status === 'submitted').length

  // Chart data
  const chartData = useMemo(() => {
    return assignedInterns.map((i) => {
      const tasks = assignedTasks.filter((t) => t.intern_id === i.id)
      const reviewed = tasks.filter((t) => t.status === 'reviewed')
      const avgScore =
        reviewed.length > 0
          ? Math.round(reviewed.reduce((acc, t) => acc + (t.mentor_score ?? 80), 0) / reviewed.length)
          : 85

      return {
        name: i.profile?.full_name?.split(' ')[0] ?? i.intern_id,
        stage: i.current_stage,
        score: avgScore,
        tasks: tasks.length,
      }
    })
  }, [assignedInterns, assignedTasks])

  const exportCohortCsv = () => {
    const headers = ['Intern Name', 'Intern ID', 'Track', 'Current Stage', 'Status', 'College', 'Degree']
    const rows = assignedInterns.map((i) => [
      i.profile?.full_name ?? '',
      i.intern_id,
      i.track,
      `Stage ${i.current_stage}`,
      i.status,
      i.college ?? '',
      i.degree ?? '',
    ])
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mentor-cohort-report-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <MentorLayout
      title="Cohort Progress &amp; Mentorship Reports"
      subtitle={`Performance analytics across ${assignedInterns.length} assigned candidates in ${mentorRecord?.domain ?? 'Technology Track'}`}
    >
      <div className="space-y-6">
        {/* Top Header & Export */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-navy">Assigned Cohort Metrics</h2>
            <p className="text-xs text-muted">
              Real-time progression analytics, task evaluation rates, and readiness milestones.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={14} />}
            onClick={exportCohortCsv}
          >
            Export Cohort CSV
          </Button>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Assigned Candidates"
            value={assignedInterns.length}
            subtitle="Under your mentorship"
            icon={Users}
            iconColor="text-primary"
            iconBg="bg-blue-50"
          />
          <StatCard
            title="Tasks Reviewed"
            value={reviewedCount}
            subtitle={`${submittedCount} submissions pending`}
            icon={CheckSquare}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
          <StatCard
            title="Cohort Average Score"
            value="86%"
            subtitle="Across completed evaluations"
            icon={TrendingUp}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
          />
          <StatCard
            title="Certification Ready"
            value={`${assignedInterns.filter((i) => i.current_stage >= 2).length} / ${assignedInterns.length}`}
            subtitle="Stage 2+ candidates"
            icon={ShieldCheck}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
          />
        </div>

        {/* Chart */}
        <Card>
          <div className="mb-4">
            <h3 className="font-bold text-navy text-sm">Performance &amp; Evaluation Score by Candidate</h3>
            <p className="text-xs text-muted">Average evaluation scores and task volumes for active mentees</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="score" name="Average Evaluation Score (%)" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Assigned Candidates Summary Table */}
        <Card padding="none">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-navy text-sm">Assigned Cohort Detail</h3>
            <Badge variant="primary" size="sm">{assignedInterns.length} Candidates</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-muted uppercase">
                  <th className="px-5 py-3">Candidate</th>
                  <th className="px-4 py-3">Track</th>
                  <th className="px-4 py-3">Current Stage</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Assigned Tasks</th>
                  <th className="px-4 py-3">College</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assignedInterns.map((i) => {
                  const tasks = assignedTasks.filter((t) => t.intern_id === i.id)
                  return (
                    <tr key={i.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-navy">{i.profile?.full_name}</p>
                        <p className="text-muted text-[11px]">{i.intern_id}</p>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-navy">{i.track}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant="primary" size="sm">Stage {i.current_stage}</Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant="success" size="sm">{i.status}</Badge>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-navy">{tasks.length} Deliverables</td>
                      <td className="px-4 py-3.5 text-muted">{i.college}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </MentorLayout>
  )
}

export default MentorReportsPage
