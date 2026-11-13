import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, UserCheck, Grid3X3, AlertCircle, Award,
  CheckSquare, ArrowUpCircle, FileText, BarChart3, Plus,
  UserPlus, FolderKanban, Clock, Rocket, Link2, GraduationCap,
  TrendingUp, ArrowRight,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, ReferenceLine,
} from 'recharts'
import AdminLayout from '../../components/layout/AdminLayout'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import type { DashboardStats } from '../../types'
import { LAUNCHPAD_STAGES, getScoreBand } from '../../lib/constants'

// ── Track-specific Mock Dataset ──────────────────────────────────────────────
interface TrackDataset {
  stats: DashboardStats
  kpi: Array<{ name: string; value: number; color: string }>
  trend: Array<{ month: string; avg_kpi: number }>
  programs: { total: number; active: number; completed: number; yetToStart: number; students: number; trainers: number; mentors: number }
}

const STAGE_COLORS = ['#64748B', '#2563EB', '#F59E0B', '#16A34A', '#172B4D']

const TRACK_DATASETS: Record<string, TrackDataset> = {
  'AI & Cloud': {
    stats: {
      total_interns: 12, active_interns: 10, inactive_interns: 2, total_mentors: 3, active_mentors: 3,
      total_batches: 3, unassigned_interns: 1, pending_evaluations: 2, pending_certifications: 2,
      interns_requiring_attention: 1, completed_interns: 3,
      stage_distribution: { '0': 1, '1': 3, '2': 4, '3': 2, '4': 2 },
    },
    kpi: [
      { name: 'L3 (85+)', value: 5, color: '#16A34A' },
      { name: 'L2 (70–84)', value: 4, color: '#2563EB' },
      { name: 'L1 (60–69)', value: 2, color: '#F59E0B' },
      { name: 'Dev Required', value: 1, color: '#DC2626' },
    ],
    trend: [
      { month: 'Jun', avg_kpi: 65 }, { month: 'Jul', avg_kpi: 69 }, { month: 'Aug', avg_kpi: 73 },
      { month: 'Sep', avg_kpi: 76 }, { month: 'Oct', avg_kpi: 79 }, { month: 'Nov', avg_kpi: 82 },
    ],
    programs: { total: 3, active: 1, completed: 1, yetToStart: 1, students: 295, trainers: 15, mentors: 30 },
  },
  'Salesforce': {
    stats: {
      total_interns: 8, active_interns: 7, inactive_interns: 1, total_mentors: 2, active_mentors: 2,
      total_batches: 2, unassigned_interns: 0, pending_evaluations: 1, pending_certifications: 1,
      interns_requiring_attention: 1, completed_interns: 2,
      stage_distribution: { '0': 0, '1': 3, '2': 2, '3': 2, '4': 1 },
    },
    kpi: [
      { name: 'L3 (85+)', value: 3, color: '#16A34A' },
      { name: 'L2 (70–84)', value: 3, color: '#2563EB' },
      { name: 'L1 (60–69)', value: 1, color: '#F59E0B' },
      { name: 'Dev Required', value: 1, color: '#DC2626' },
    ],
    trend: [
      { month: 'Jun', avg_kpi: 63 }, { month: 'Jul', avg_kpi: 67 }, { month: 'Aug', avg_kpi: 70 },
      { month: 'Sep', avg_kpi: 72 }, { month: 'Oct', avg_kpi: 75 }, { month: 'Nov', avg_kpi: 77 },
    ],
    programs: { total: 2, active: 1, completed: 1, yetToStart: 0, students: 195, trainers: 9, mentors: 16 },
  },
  'Software Engineering': {
    stats: {
      total_interns: 11, active_interns: 10, inactive_interns: 1, total_mentors: 3, active_mentors: 2,
      total_batches: 1, unassigned_interns: 1, pending_evaluations: 2, pending_certifications: 1,
      interns_requiring_attention: 1, completed_interns: 2,
      stage_distribution: { '0': 1, '1': 4, '2': 2, '3': 3, '4': 1 },
    },
    kpi: [
      { name: 'L3 (85+)', value: 3, color: '#16A34A' },
      { name: 'L2 (70–84)', value: 5, color: '#2563EB' },
      { name: 'L1 (60–69)', value: 2, color: '#F59E0B' },
      { name: 'Dev Required', value: 1, color: '#DC2626' },
    ],
    trend: [
      { month: 'Jun', avg_kpi: 64 }, { month: 'Jul', avg_kpi: 68 }, { month: 'Aug', avg_kpi: 71 },
      { month: 'Sep', avg_kpi: 74 }, { month: 'Oct', avg_kpi: 75 }, { month: 'Nov', avg_kpi: 78 },
    ],
    programs: { total: 1, active: 1, completed: 0, yetToStart: 0, students: 140, trainers: 7, mentors: 14 },
  },
  'IoT & Robotics': {
    stats: {
      total_interns: 6, active_interns: 5, inactive_interns: 1, total_mentors: 1, active_mentors: 1,
      total_batches: 1, unassigned_interns: 0, pending_evaluations: 1, pending_certifications: 0,
      interns_requiring_attention: 0, completed_interns: 0,
      stage_distribution: { '0': 1, '1': 2, '2': 2, '3': 1, '4': 0 },
    },
    kpi: [
      { name: 'L3 (85+)', value: 1, color: '#16A34A' },
      { name: 'L2 (70–84)', value: 3, color: '#2563EB' },
      { name: 'L1 (60–69)', value: 2, color: '#F59E0B' },
      { name: 'Dev Required', value: 0, color: '#DC2626' },
    ],
    trend: [
      { month: 'Jun', avg_kpi: 60 }, { month: 'Jul', avg_kpi: 63 }, { month: 'Aug', avg_kpi: 66 },
      { month: 'Sep', avg_kpi: 69 }, { month: 'Oct', avg_kpi: 71 }, { month: 'Nov', avg_kpi: 73 },
    ],
    programs: { total: 1, active: 1, completed: 0, yetToStart: 0, students: 60, trainers: 4, mentors: 6 },
  },
  'ServiceNow': {
    stats: {
      total_interns: 5, active_interns: 4, inactive_interns: 1, total_mentors: 1, active_mentors: 1,
      total_batches: 1, unassigned_interns: 0, pending_evaluations: 0, pending_certifications: 1,
      interns_requiring_attention: 1, completed_interns: 0,
      stage_distribution: { '0': 1, '1': 2, '2': 1, '3': 1, '4': 0 },
    },
    kpi: [
      { name: 'L3 (85+)', value: 1, color: '#16A34A' },
      { name: 'L2 (70–84)', value: 1, color: '#2563EB' },
      { name: 'L1 (60–69)', value: 2, color: '#F59E0B' },
      { name: 'Dev Required', value: 1, color: '#DC2626' },
    ],
    trend: [
      { month: 'Jun', avg_kpi: 58 }, { month: 'Jul', avg_kpi: 61 }, { month: 'Aug', avg_kpi: 64 },
      { month: 'Sep', avg_kpi: 67 }, { month: 'Oct', avg_kpi: 70 }, { month: 'Nov', avg_kpi: 72 },
    ],
    programs: { total: 1, active: 0, completed: 0, yetToStart: 1, students: 75, trainers: 3, mentors: 6 },
  },
  'Business Intelligence': {
    stats: {
      total_interns: 6, active_interns: 6, inactive_interns: 0, total_mentors: 2, active_mentors: 2,
      total_batches: 1, unassigned_interns: 0, pending_evaluations: 1, pending_certifications: 0,
      interns_requiring_attention: 0, completed_interns: 1,
      stage_distribution: { '0': 0, '1': 1, '2': 1, '3': 2, '4': 2 },
    },
    kpi: [
      { name: 'L3 (85+)', value: 1, color: '#16A34A' },
      { name: 'L2 (70–84)', value: 2, color: '#2563EB' },
      { name: 'L1 (60–69)', value: 1, color: '#F59E0B' },
      { name: 'Dev Required', value: 2, color: '#DC2626' },
    ],
    trend: [
      { month: 'Jun', avg_kpi: 61 }, { month: 'Jul', avg_kpi: 65 }, { month: 'Aug', avg_kpi: 68 },
      { month: 'Sep', avg_kpi: 71 }, { month: 'Oct', avg_kpi: 74 }, { month: 'Nov', avg_kpi: 75 },
    ],
    programs: { total: 1, active: 1, completed: 0, yetToStart: 0, students: 90, trainers: 4, mentors: 8 },
  },
}

const TRACK_TARGETS: Record<string, number> = {
  'AI & Cloud': 82,
  'Salesforce': 80,
  'Software Engineering': 85,
  'IoT & Robotics': 78,
  'ServiceNow': 80,
  'Business Intelligence': 80,
}
const DEFAULT_KPI_TARGET = 80

const ALL_MOCK_STATS: DashboardStats = {
  total_interns: 48,
  active_interns: 42,
  inactive_interns: 6,
  total_mentors: 12,
  active_mentors: 11,
  total_batches: 9,
  unassigned_interns: 2,
  pending_evaluations: 7,
  pending_certifications: 5,
  interns_requiring_attention: 4,
  completed_interns: 8,
  stage_distribution: { '0': 4, '1': 15, '2': 12, '3': 11, '4': 6 },
}

const KPI_MOCK = [
  { name: 'L3 (85+)', value: 14, color: '#16A34A' },
  { name: 'L2 (70–84)', value: 18, color: '#2563EB' },
  { name: 'L1 (60–69)', value: 10, color: '#F59E0B' },
  { name: 'Dev Required', value: 6, color: '#DC2626' },
]

const MONTHLY_TREND_MOCK = [
  { month: 'Jun', avg_kpi: 62 },
  { month: 'Jul', avg_kpi: 66 },
  { month: 'Aug', avg_kpi: 69 },
  { month: 'Sep', avg_kpi: 72 },
  { month: 'Oct', avg_kpi: 74 },
  { month: 'Nov', avg_kpi: 76 },
]

const RECENT_ACTIVITY_MOCK = [
  { id: '1', action: 'New intern registered', name: 'Rahul Sharma', time: '2 min ago', type: 'intern', icon: UserPlus },
  { id: '2', action: 'Stage evaluation submitted', name: 'Priya Patel', time: '15 min ago', type: 'evaluation', icon: CheckSquare },
  { id: '3', action: 'Progressed to Stage 3', name: 'Amit Kumar', time: '1 hr ago', type: 'progression', icon: ArrowUpCircle },
  { id: '4', action: 'Monthly report reviewed', name: 'Sneha Reddy', time: '2 hr ago', type: 'report', icon: FileText },
  { id: '5', action: 'Certificate verified', name: 'Vikram Singh', time: '3 hr ago', type: 'certification', icon: Award },
  { id: '6', action: 'Task submitted', name: 'Neha Gupta', time: '4 hr ago', type: 'task', icon: FolderKanban },
  { id: '7', action: 'Mentor assigned', name: 'Arjun Nair', time: '5 hr ago', type: 'assignment', icon: Link2 },
  { id: '8', action: 'Improvement plan created', name: 'Kavya Menon', time: '6 hr ago', type: 'improvement', icon: AlertCircle },
]

const ATTENTION_MOCK = [
  { id: '1', name: 'Ravi Shankar', intern_id: 'INT-015', track: 'AI & Cloud', reason: 'KPI below 60 for 2 consecutive months', stage: 2, kpi: 54 },
  { id: '2', name: 'Deepa Raj', intern_id: 'INT-023', track: 'Software Engineering', reason: 'No monthly report submitted for Oct', stage: 1, kpi: 58 },
  { id: '3', name: 'Mohan Das', intern_id: 'INT-031', track: 'Salesforce', reason: 'Stage evaluation score below threshold', stage: 3, kpi: 61 },
  { id: '4', name: 'Sita Verma', intern_id: 'INT-042', track: 'ServiceNow', reason: 'Certification deadline approaching', stage: 2, kpi: 65 },
]

const activityTypeColors: Record<string, string> = {
  intern: 'bg-blue-100 text-blue-600',
  evaluation: 'bg-green-100 text-green-600',
  progression: 'bg-purple-100 text-purple-600',
  report: 'bg-amber-100 text-amber-600',
  certification: 'bg-teal-100 text-teal-600',
  task: 'bg-indigo-100 text-indigo-600',
  assignment: 'bg-cyan-100 text-cyan-600',
  improvement: 'bg-red-100 text-red-600',
}

// ── Component ────────────────────────────────────────────────────────────────
const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const [liveStats, setLiveStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterTrack, setFilterTrack] = useState('')
  const [filterStage, setFilterStage] = useState('')
  const [liveKpi, setLiveKpi] = useState<typeof KPI_MOCK | null>(null)
  const [recentActivity, setRecentActivity] = useState(RECENT_ACTIVITY_MOCK)
  const [trackDisplayMode, setTrackDisplayMode] = useState<'cards' | 'graph'>('cards')

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      if (!isSupabaseConfigured) {
        setLiveStats(null)
        setLiveKpi(null)
        return
      }

      let internQ = supabase.from('interns').select('*', { count: 'exact', head: true })
      let activeInternQ = supabase.from('interns').select('*', { count: 'exact', head: true }).eq('status', 'active')
      let stageQ = supabase.from('interns').select('current_stage').eq('status', 'active')
      let mentorQ = supabase.from('mentors').select('*', { count: 'exact', head: true })
      let activeMentorQ = supabase.from('mentors').select('*', { count: 'exact', head: true }).eq('status', 'active')
      let batchQ = supabase.from('batches').select('*', { count: 'exact', head: true })

      if (filterTrack) {
        internQ = internQ.eq('track', filterTrack)
        activeInternQ = activeInternQ.eq('track', filterTrack)
        stageQ = stageQ.eq('track', filterTrack)
        mentorQ = mentorQ.eq('domain', filterTrack)
        activeMentorQ = activeMentorQ.eq('domain', filterTrack)
        batchQ = batchQ.eq('track', filterTrack)
      }
      if (filterStage) {
        internQ = internQ.eq('current_stage', Number(filterStage))
        activeInternQ = activeInternQ.eq('current_stage', Number(filterStage))
        stageQ = stageQ.eq('current_stage', Number(filterStage))
      }

      const [
        { count: totalInterns },
        { count: activeInterns },
        { count: totalMentors },
        { count: activeMentors },
        { count: totalBatches },
        { count: pendingEvals },
        { count: pendingCerts },
        { data: internStages },
        { data: unassignedData },
        { data: kpiData },
      ] = await Promise.all([
        internQ,
        activeInternQ,
        mentorQ,
        activeMentorQ,
        batchQ,
        supabase.from('stage_evaluations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('certifications').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
        stageQ,
        supabase.from('interns').select('id').eq('status', 'active').not('id', 'in', `(select intern_id from mentor_assignments where is_current = true)`),
        supabase.from('monthly_reports').select('overall_kpi').not('overall_kpi', 'is', null),
      ])

      if (totalInterns !== null) {
        const stageDist: Record<string, number> = { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0 }
        if (internStages) {
          for (const intern of internStages) {
            stageDist[String(intern.current_stage)] = (stageDist[String(intern.current_stage)] || 0) + 1
          }
        }
        if (kpiData && kpiData.length > 0) {
          let l3 = 0, l2 = 0, l1 = 0, dev = 0
          for (const r of kpiData) {
            const band = getScoreBand(Number(r.overall_kpi))
            if (band === 'L3') l3++
            else if (band === 'L2') l2++
            else if (band === 'L1') l1++
            else dev++
          }
          setLiveKpi([
            { name: 'L3 (85+)', value: l3, color: '#16A34A' },
            { name: 'L2 (70–84)', value: l2, color: '#2563EB' },
            { name: 'L1 (60–69)', value: l1, color: '#F59E0B' },
            { name: 'Dev Required', value: dev, color: '#DC2626' },
          ])
        }
        const inactiveCount = (totalInterns || 0) - (activeInterns || 0)
        const completedCount = internStages?.filter(i => i.current_stage === 4).length || 0
        setLiveStats({
          total_interns: totalInterns || 0,
          active_interns: activeInterns || 0,
          inactive_interns: inactiveCount,
          total_mentors: totalMentors || 0,
          active_mentors: activeMentors || 0,
          total_batches: totalBatches || 0,
          unassigned_interns: unassignedData?.length || 0,
          pending_evaluations: pendingEvals || 0,
          pending_certifications: pendingCerts || 0,
          interns_requiring_attention: 0,
          completed_interns: completedCount,
          stage_distribution: stageDist,
        })
      }

      const { data: auditData } = await supabase
        .from('audit_logs')
        .select('*, actor:profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(8)

      if (auditData && auditData.length > 0) {
        const mapped = auditData.map((log: Record<string, unknown>) => {
          const actor = log.actor as { full_name?: string } | null
          return {
            id: String(log.id),
            action: String(log.action).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            name: actor?.full_name || 'System',
            time: timeAgo(String(log.created_at)),
            type: String(log.entity_type) || 'system',
            icon: ArrowUpCircle,
          }
        })
        setRecentActivity(mapped)
      }
    } catch {
      setLiveStats(null)
    } finally {
      setLoading(false)
    }
  }, [filterTrack, filterStage])

  useEffect(() => { fetchDashboardData() }, [fetchDashboardData])

  // Compute filtered view for Trial / Mock Mode (or fallback)
  const activeDataset = useMemo(() => {
    if (liveStats) {
      return {
        stats: liveStats,
        kpi: liveKpi ?? KPI_MOCK,
        trend: MONTHLY_TREND_MOCK,
        programs: filterTrack ? TRACK_DATASETS[filterTrack]?.programs : null,
      }
    }

    const base = filterTrack && TRACK_DATASETS[filterTrack]
      ? TRACK_DATASETS[filterTrack]
      : { stats: ALL_MOCK_STATS, kpi: KPI_MOCK, trend: MONTHLY_TREND_MOCK, programs: null }

    if (!filterStage) return base

    // Narrow down stats when a specific stage is selected
    const stageCount = base.stats.stage_distribution[filterStage] ?? 0
    const filteredDist: Record<string, number> = { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0 }
    filteredDist[filterStage] = stageCount
    const ratio = base.stats.total_interns > 0 ? stageCount / base.stats.total_interns : 0

    return {
      ...base,
      stats: {
        ...base.stats,
        total_interns: stageCount,
        active_interns: Math.max(0, Math.round(base.stats.active_interns * ratio)),
        unassigned_interns: Math.round(base.stats.unassigned_interns * ratio),
        pending_evaluations: Math.round(base.stats.pending_evaluations * ratio),
        pending_certifications: Math.round(base.stats.pending_certifications * ratio),
        completed_interns: filterStage === '4' ? stageCount : 0,
        stage_distribution: filteredDist,
      },
    }
  }, [liveStats, liveKpi, filterTrack, filterStage])

  const { stats, kpi: kpiDistribution, trend: monthlyTrend, programs: trackPrograms } = activeDataset

  const filteredAttention = useMemo(() => {
    return ATTENTION_MOCK.filter(item => {
      const matchTrack = !filterTrack || item.track === filterTrack
      const matchStage = !filterStage || String(item.stage) === filterStage
      return matchTrack && matchStage
    })
  }, [filterTrack, filterStage])

  const stageChartData = LAUNCHPAD_STAGES.map((s) => ({
    name: `Stage ${s.id}`,
    fullName: s.name,
    count: stats.stage_distribution[String(s.id)] ?? 0,
    color: STAGE_COLORS[s.id],
  }))

  const statCards = [
    { title: 'Total Interns', value: stats.total_interns, icon: Users, iconColor: 'text-primary', iconBg: 'bg-blue-50', subtitle: `${stats.active_interns} active` },
    { title: 'Active Interns', value: stats.active_interns, icon: UserCheck, iconColor: 'text-success', iconBg: 'bg-green-50' },
    { title: 'Active Mentors', value: stats.active_mentors, icon: UserCheck, iconColor: 'text-navy', iconBg: 'bg-slate-50', subtitle: `${stats.total_mentors} total` },
    { title: 'Active Programs', value: stats.total_batches, icon: Grid3X3, iconColor: 'text-warning', iconBg: 'bg-amber-50' },
    { title: 'Unassigned Interns', value: stats.unassigned_interns, icon: AlertCircle, iconColor: 'text-danger', iconBg: 'bg-red-50' },
    { title: 'Pending Evaluations', value: stats.pending_evaluations, icon: CheckSquare, iconColor: 'text-warning', iconBg: 'bg-amber-50' },
    { title: 'Pending Certs', value: stats.pending_certifications, icon: Award, iconColor: 'text-primary', iconBg: 'bg-blue-50' },
    { title: 'Completed Program', value: stats.completed_interns, icon: Rocket, iconColor: 'text-success', iconBg: 'bg-green-50' },
  ]

  return (
    <AdminLayout title="Dashboard" subtitle={filterTrack ? `SMARTBRIDGE LaunchPad – ${filterTrack}` : 'SMARTBRIDGE LaunchPad Overview'}>
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterTrack}
            onChange={(e) => setFilterTrack(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">All Tracks</option>
            <option value="AI & Cloud">AI & Cloud</option>
            <option value="Salesforce">Salesforce</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="IoT & Robotics">IoT & Robotics</option>
            <option value="ServiceNow">ServiceNow</option>
            <option value="Business Intelligence">Business Intelligence</option>
          </select>
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">All Stages</option>
            {LAUNCHPAD_STAGES.map((s) => (
              <option key={s.id} value={String(s.id)}>{s.name}</option>
            ))}
          </select>
          {(filterTrack || filterStage) && (
            <button
              onClick={() => { setFilterTrack(''); setFilterStage('') }}
              className="text-xs text-primary hover:underline px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button size="sm" icon={<UserPlus size={14} />} onClick={() => navigate('/admin/interns/add')}>
            Add Intern
          </Button>
          <Button size="sm" variant="outline" icon={<Plus size={14} />} onClick={() => navigate('/admin/batches?new=1')}>
            New Program
          </Button>
        </div>
      </div>

      {/* Selected Track Summary Banner */}
      {filterTrack && trackPrograms && (
        <Card className="mb-6 border-primary/30 bg-blue-50/30">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-bold text-navy">{filterTrack}</h3>
                <Badge variant="primary">{trackPrograms.total} Programs</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                <span className="flex items-center gap-1"><Users size={13} className="text-primary" /> <strong className="text-navy">{trackPrograms.students}</strong> Total Students</span>
                <span className="flex items-center gap-1"><GraduationCap size={13} className="text-warning" /> <strong className="text-navy">{trackPrograms.trainers}</strong> Total Trainers</span>
                <span className="flex items-center gap-1"><UserCheck size={13} className="text-navy" /> <strong className="text-navy">{trackPrograms.mentors}</strong> Total Mentors</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="success">Active: {trackPrograms.active}</Badge>
              <Badge variant="primary">Completed: {trackPrograms.completed}</Badge>
              <Badge variant="muted">Yet to Start: {trackPrograms.yetToStart}</Badge>
              <Button size="sm" variant="outline" onClick={() => navigate('/admin/batches')}>
                View Programs
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          <StatCard key={card.title} loading={loading} {...card} />
        ))}
      </div>

      {/* Program Tracks (Click a track for full details) - Cards & Graph */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-navy uppercase tracking-wider">
            PROGRAM TRACKS (CLICK A TRACK FOR FULL DETAILS)
          </h2>
          <div className="flex items-center gap-1 bg-white border border-gray-200 p-0.5 rounded-lg text-xs shadow-2xs">
            <button
              onClick={() => setTrackDisplayMode('cards')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                trackDisplayMode === 'cards'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-600 hover:text-navy'
              }`}
            >
              Cards View
            </button>
            <button
              onClick={() => setTrackDisplayMode('graph')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                trackDisplayMode === 'graph'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-600 hover:text-navy'
              }`}
            >
              Graph View
            </button>
          </div>
        </div>

        {trackDisplayMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(TRACK_DATASETS).map(([trackName, data]) => {
              const isSelected = filterTrack === trackName
              return (
                <div
                  key={trackName}
                  onClick={() => setFilterTrack(isSelected ? '' : trackName)}
                  className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/20 bg-blue-50/20'
                      : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-navy">{trackName}</h3>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {data.programs.total} {data.programs.total === 1 ? 'Program' : 'Programs'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center mb-4">
                    <div className="bg-blue-50/70 rounded-xl py-2 px-1">
                      <p className="text-lg font-extrabold text-navy">{data.programs.students}</p>
                      <p className="text-[11px] text-muted font-medium">Students</p>
                    </div>
                    <div className="bg-amber-50/70 rounded-xl py-2 px-1">
                      <p className="text-lg font-extrabold text-navy">{data.programs.trainers}</p>
                      <p className="text-[11px] text-muted font-medium">Trainers</p>
                    </div>
                    <div className="bg-indigo-50/70 rounded-xl py-2 px-1">
                      <p className="text-lg font-extrabold text-navy">{data.programs.mentors}</p>
                      <p className="text-[11px] text-muted font-medium">Mentors</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      Active: {data.programs.active}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      Completed: {data.programs.completed}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
                      Yet to Start: {data.programs.yetToStart}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-navy">Track Distribution Comparison Graph</h3>
                <p className="text-xs text-muted">Comparative breakdown of Students, Trainers, and Mentors across all tracks</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={Object.entries(TRACK_DATASETS).map(([name, data]) => ({
                  name,
                  Students: data.programs.students,
                  Trainers: data.programs.trainers,
                  Mentors: data.programs.mentors,
                }))}
                margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} angle={-10} textAnchor="end" height={40} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: 10 }} />
                <Bar dataKey="Students" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Mentors" fill="#172B4D" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Trainers" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <h3 className="text-base font-semibold text-navy mb-4">Stage Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stageChartData} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
              <Tooltip
                formatter={(val) => [val, 'Interns']}
                labelFormatter={(label) => stageChartData.find(d => d.name === label)?.fullName ?? label}
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {stageChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-navy">KPI Performance Bands</h3>
            <span className="text-xs text-muted bg-amber-50 px-2 py-0.5 rounded">Proposed bands</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={kpiDistribution}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {kpiDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span style={{ fontSize: 12, color: '#64748B' }}>{value}</span>}
              />
              <Tooltip
                formatter={(val) => [val, 'Interns']}
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Monthly KPI Trend & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-stretch">
        <div className="lg:col-span-2 flex">
          <Card className="w-full h-full flex flex-col justify-between">
            {(() => {
              const activeTarget = filterTrack ? (TRACK_TARGETS[filterTrack] ?? DEFAULT_KPI_TARGET) : DEFAULT_KPI_TARGET
              const firstKpi = monthlyTrend[0]?.avg_kpi ?? 0
              const latestKpi = monthlyTrend[monthlyTrend.length - 1]?.avg_kpi ?? 0
              const delta = latestKpi - firstKpi
              const avgKpi = monthlyTrend.length
                ? Math.round(monthlyTrend.reduce((sum, m) => sum + m.avg_kpi, 0) / monthlyTrend.length)
                : 0
              const peakItem = monthlyTrend.reduce(
                (best, cur) => (cur.avg_kpi > best.avg_kpi ? cur : best),
                monthlyTrend[0] ?? { month: '-', avg_kpi: 0 }
              )
              const trackBenchmarks = Object.entries(TRACK_DATASETS).map(([trackName, dataset]) => {
                const trackAvg = Math.round(
                  dataset.trend.reduce((sum, m) => sum + m.avg_kpi, 0) / dataset.trend.length
                )
                const trackLatest = dataset.trend[dataset.trend.length - 1]?.avg_kpi ?? 0
                const trackTarget = TRACK_TARGETS[trackName] ?? DEFAULT_KPI_TARGET
                return {
                  trackName,
                  avg: trackAvg,
                  latest: trackLatest,
                  target: trackTarget,
                  gap: trackAvg - trackTarget,
                }
              })
              return (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-navy">Monthly KPI Trend</h3>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <TrendingUp size={12} />
                          {delta >= 0 ? `+${delta}%` : `${delta}%`} vs {monthlyTrend[0]?.month ?? 'Start'}
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        6-month performance trajectory • {filterTrack || 'All Tracks'} • Target {activeTarget}%
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100 text-right">
                        <p className="text-[10px] uppercase tracking-wide text-blue-600 font-semibold">Latest</p>
                        <p className="text-sm font-bold text-navy">{latestKpi}%</p>
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100 text-right">
                        <p className="text-[10px] uppercase tracking-wide text-muted font-semibold">Avg</p>
                        <p className="text-sm font-bold text-navy">{avgKpi}%</p>
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-right">
                        <p className="text-[10px] uppercase tracking-wide text-emerald-700 font-semibold">Target</p>
                        <p className="text-sm font-bold text-emerald-700">{activeTarget}%</p>
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-right">
                        <p className="text-[10px] uppercase tracking-wide text-indigo-700 font-semibold">Peak ({peakItem.month})</p>
                        <p className="text-sm font-bold text-indigo-700">{peakItem.avg_kpi}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-h-[210px]">
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={monthlyTrend} margin={{ top: 12, right: 16, left: -12, bottom: 4 }}>
                        <defs>
                          <linearGradient id="kpiAreaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.28} />
                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#64748B', fontWeight: 500 }}
                        />
                        <YAxis
                          domain={[40, 100]}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(val) => `${val}%`}
                          tick={{ fontSize: 12, fill: '#64748B' }}
                        />
                        <Tooltip
                          formatter={(val) => [`${val}% (Target: ${activeTarget}%)`, 'Avg KPI']}
                          contentStyle={{
                            borderRadius: 10,
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 8px 20px rgba(15, 23, 42, 0.08)',
                            fontSize: 12,
                          }}
                        />
                        <ReferenceLine
                          y={activeTarget}
                          stroke="#10B981"
                          strokeDasharray="5 5"
                          strokeWidth={1.5}
                          label={{ value: `Target ${activeTarget}%`, position: 'insideTopRight', fill: '#059669', fontSize: 11, fontWeight: 600 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="avg_kpi"
                          stroke="#2563EB"
                          strokeWidth={3}
                          fill="url(#kpiAreaGradient)"
                          dot={{ r: 4.5, fill: '#2563EB', stroke: '#ffffff', strokeWidth: 2 }}
                          activeDot={{ r: 6.5, fill: '#1D4ED8', stroke: '#ffffff', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3 pt-3 border-t border-gray-100">
                    {monthlyTrend.map((m) => {
                      const onTarget = m.avg_kpi >= activeTarget
                      return (
                        <div
                          key={m.month}
                          className={`rounded-lg px-2.5 py-1.5 text-center border ${
                            onTarget
                              ? 'bg-emerald-50/70 border-emerald-100'
                              : 'bg-slate-50/80 border-gray-100'
                          }`}
                        >
                          <p className="text-[11px] font-medium text-muted">{m.month}</p>
                          <p className={`text-sm font-bold ${onTarget ? 'text-emerald-700' : 'text-navy'}`}>
                            {m.avg_kpi}%
                          </p>
                        </div>
                      )
                    })}
                  </div>

                  {/* Track-wise Avg vs Target Breakdown */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2.5">
                      <p className="text-xs font-semibold text-navy uppercase tracking-wide">
                        Track-wise Avg &amp; Target
                      </p>
                      <span className="text-[11px] text-muted">Click a track to filter chart</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                      {trackBenchmarks.map((tb) => {
                        const isSelected = filterTrack === tb.trackName
                        const met = tb.avg >= tb.target
                        return (
                          <button
                            key={tb.trackName}
                            type="button"
                            onClick={() => setFilterTrack(isSelected ? '' : tb.trackName)}
                            className={`text-left rounded-lg border px-3 py-2 transition-all ${
                              isSelected
                                ? 'border-primary bg-blue-50/60 ring-1 ring-primary/30'
                                : 'border-gray-100 bg-gray-50/60 hover:bg-gray-100/70'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-xs font-semibold text-navy truncate">{tb.trackName}</span>
                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                                  met
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {tb.gap >= 0 ? `+${tb.gap}%` : `${tb.gap}%`}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-muted mb-1.5">
                              <span>Avg: <strong className="text-navy">{tb.avg}%</strong></span>
                              <span>Target: <strong className="text-emerald-700">{tb.target}%</strong></span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${met ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                style={{ width: `${Math.min(100, Math.round((tb.avg / tb.target) * 100))}%` }}
                              />
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </>
              )
            })()}
          </Card>
        </div>

        {/* Quick Actions Flashcards */}
        <Card className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-navy">Quick Actions</h3>
              <p className="text-xs text-muted mt-0.5">One-click admin workflows</p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
              6 Shortcuts
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
            {[
              {
                label: 'Add New Intern',
                subtitle: 'Onboard to a track',
                icon: UserPlus,
                to: '/admin/interns/add',
                iconClass: 'text-blue-600 bg-blue-100/80',
                cardClass: 'bg-blue-50/40 border-blue-100 hover:border-blue-300 hover:bg-blue-50/80',
              },
              {
                label: 'Assign Mentors',
                subtitle: `${stats.unassigned_interns} unassigned`,
                icon: Link2,
                to: '/admin/assignments',
                iconClass: 'text-emerald-600 bg-emerald-100/80',
                cardClass: 'bg-emerald-50/40 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/80',
              },
              {
                label: 'Track Attendance',
                subtitle: 'Interns, mentors & tracks',
                icon: Clock,
                to: '/admin/attendance',
                iconClass: 'text-amber-600 bg-amber-100/80',
                cardClass: 'bg-amber-50/40 border-amber-100 hover:border-amber-300 hover:bg-amber-50/80',
              },
              {
                label: 'Verify Certifications',
                subtitle: `${stats.pending_certifications} awaiting`,
                icon: Award,
                to: '/admin/certifications',
                iconClass: 'text-purple-600 bg-purple-100/80',
                cardClass: 'bg-purple-50/40 border-purple-100 hover:border-purple-300 hover:bg-purple-50/80',
              },
              {
                label: 'View KPI Reports',
                subtitle: 'Monthly scorecards',
                icon: BarChart3,
                to: '/admin/kpi',
                iconClass: 'text-teal-600 bg-teal-100/80',
                cardClass: 'bg-teal-50/40 border-teal-100 hover:border-teal-300 hover:bg-teal-50/80',
              },
              {
                label: 'Manage Programs',
                subtitle: `${trackPrograms ? trackPrograms.active : stats.total_batches} active programs`,
                icon: Grid3X3,
                to: '/admin/batches',
                iconClass: 'text-indigo-600 bg-indigo-100/80',
                cardClass: 'bg-indigo-50/40 border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/80',
              },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.to)}
                className={`group rounded-xl border p-3.5 text-left transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between gap-3 ${action.cardClass}`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${action.iconClass}`}>
                    <action.icon size={17} />
                  </div>
                  <ArrowRight
                    size={15}
                    className="text-muted opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy leading-snug">{action.label}</p>
                  <p className="text-xs text-muted mt-0.5">{action.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Row: Activity + Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-navy">Recent Activity</h3>
            <button
              onClick={() => navigate('/admin/audit-logs')}
              className="text-xs text-primary hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-1">
            {recentActivity.slice(0, 8).map((item) => {
              const Icon = item.icon || ArrowUpCircle
              const colorClass = activityTypeColors[item.type] || 'bg-gray-100 text-gray-600'
              return (
                <div key={item.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy">{item.action}</p>
                    <p className="text-xs text-muted">{item.name}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Clock size={11} className="text-muted" />
                    <span className="text-xs text-muted">{item.time}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-navy">
              <AlertCircle size={16} className="inline mr-1.5 text-danger" />
              Interns Requiring Attention
            </h3>
            <Badge variant="danger">{filteredAttention.length}</Badge>
          </div>
          {filteredAttention.length === 0 ? (
            <p className="text-sm text-muted text-center py-8">All interns in this filter are on track!</p>
          ) : (
            <div className="space-y-3">
              {filteredAttention.map((intern) => (
                <div
                  key={intern.id}
                  className="flex items-start gap-3 p-3 bg-red-50/50 rounded-lg border border-red-100 cursor-pointer hover:bg-red-50 transition-colors"
                  onClick={() => navigate(`/admin/interns/${intern.id}`)}
                >
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertCircle size={14} className="text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-navy">{intern.name}</p>
                      <span className="text-xs text-muted font-mono">{intern.intern_id}</span>
                    </div>
                    <p className="text-xs text-muted mt-0.5">{intern.reason}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="primary" size="sm">{intern.track}</Badge>
                      <Badge variant="muted" size="sm">Stage {intern.stage}</Badge>
                      <Badge variant={intern.kpi < 60 ? 'danger' : 'warning'} size="sm">
                        KPI: {intern.kpi}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  )
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default DashboardPage
