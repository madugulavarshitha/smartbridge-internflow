import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Percent, Users, UserCheck, Laptop, CalendarOff,
  ArrowLeft, Download,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts'
import AdminLayout from '../../../components/layout/AdminLayout'
import Card from '../../../components/ui/Card'
import StatCard from '../../../components/ui/StatCard'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'

type RoleType = 'intern' | 'mentor'
type AttendanceStatus = 'present' | 'wfh' | 'late' | 'absent' | 'on_leave'
type AttendancePeriod = 'day' | 'week' | 'month'

interface AttendanceRecord {
  id: string
  person_id: string
  code: string
  name: string
  email: string
  role: RoleType
  track: string
  session: string
  date: string
  check_in: string
  status: AttendanceStatus
  monthly_rate: number
}

const STANDARD_TRACKS = [
  'AI & Cloud',
  'Salesforce',
  'Software Engineering',
  'IoT & Robotics',
  'ServiceNow',
  'Business Intelligence',
]

const TODAY = new Date().toISOString().slice(0, 10)
const STORAGE_KEY = 'internflow_attendance_records_v1'

const FALLBACK_RECORDS: AttendanceRecord[] = [
  { id: 'att-1', person_id: 'i1', code: 'INT-001', name: 'Rahul Sharma', email: 'rahul@example.com', role: 'intern', track: 'AI & Cloud', session: 'Cloud Architecture Lab', date: TODAY, check_in: '09:02 AM', status: 'present', monthly_rate: 94 },
  { id: 'att-2', person_id: 'i2', code: 'INT-002', name: 'Priya Patel', email: 'priya@example.com', role: 'intern', track: 'Salesforce', session: 'Apex & LWC Workshop', date: TODAY, check_in: '09:05 AM', status: 'present', monthly_rate: 96 },
  { id: 'att-3', person_id: 'i3', code: 'INT-003', name: 'Amit Kumar', email: 'amit@example.com', role: 'intern', track: 'Software Engineering', session: 'System Design Sprint', date: TODAY, check_in: '09:24 AM', status: 'late', monthly_rate: 86 },
  { id: 'att-4', person_id: 'i4', code: 'INT-004', name: 'Sneha Reddy', email: 'sneha@example.com', role: 'intern', track: 'IoT & Robotics', session: 'Embedded Sensors Lab', date: TODAY, check_in: '—', status: 'on_leave', monthly_rate: 82 },
  { id: 'att-5', person_id: 'i5', code: 'INT-005', name: 'Vikram Singh', email: 'vikram@example.com', role: 'intern', track: 'ServiceNow', session: 'ITSM Workflow Review', date: TODAY, check_in: '08:58 AM', status: 'present', monthly_rate: 92 },
  { id: 'att-6', person_id: 'i6', code: 'INT-006', name: 'Ananya Verma', email: 'ananya@example.com', role: 'intern', track: 'Business Intelligence', session: 'Power BI DAX Modeling', date: TODAY, check_in: '09:04 AM', status: 'present', monthly_rate: 91 },
  { id: 'att-7', person_id: 'i7', code: 'INT-007', name: 'Karthik Nair', email: 'karthik@example.com', role: 'intern', track: 'AI & Cloud', session: 'LLM Fine-Tuning Sync', date: TODAY, check_in: '—', status: 'absent', monthly_rate: 74 },
  { id: 'att-8', person_id: 'i8', code: 'INT-008', name: 'Meera Iyer', email: 'meera@example.com', role: 'intern', track: 'Salesforce', session: 'Apex & LWC Workshop', date: TODAY, check_in: '09:01 AM', status: 'wfh', monthly_rate: 95 },
  { id: 'att-9', person_id: 'i9', code: 'INT-009', name: 'Rohan Das', email: 'rohan@example.com', role: 'intern', track: 'Software Engineering', session: 'System Design Sprint', date: TODAY, check_in: '09:00 AM', status: 'present', monthly_rate: 90 },
  { id: 'att-10', person_id: 'i10', code: 'INT-010', name: 'Divya Joshi', email: 'divya@example.com', role: 'intern', track: 'IoT & Robotics', session: 'Embedded Sensors Lab', date: TODAY, check_in: '09:10 AM', status: 'wfh', monthly_rate: 89 },
  { id: 'att-m1', person_id: 'm1', code: 'MNT-001', name: 'Dr. Ramesh Babu', email: 'ramesh@smartbridge.in', role: 'mentor', track: 'AI & Cloud', session: 'Cloud Architecture Lab', date: TODAY, check_in: '08:50 AM', status: 'present', monthly_rate: 98 },
  { id: 'att-m2', person_id: 'm2', code: 'MNT-002', name: 'Kiran Deshmukh', email: 'kiran@smartbridge.in', role: 'mentor', track: 'Salesforce', session: 'Apex & LWC Workshop', date: TODAY, check_in: '08:55 AM', status: 'wfh', monthly_rate: 95 },
  { id: 'att-m3', person_id: 'm3', code: 'MNT-003', name: 'Deepika Nair', email: 'deepika@smartbridge.in', role: 'mentor', track: 'Software Engineering', session: 'System Design Sprint', date: TODAY, check_in: '09:00 AM', status: 'present', monthly_rate: 97 },
  { id: 'att-m4', person_id: 'm4', code: 'MNT-004', name: 'Suresh Menon', email: 'suresh@smartbridge.in', role: 'mentor', track: 'IoT & Robotics', session: 'Embedded Sensors Lab', date: TODAY, check_in: '09:18 AM', status: 'late', monthly_rate: 88 },
  { id: 'att-m5', person_id: 'm5', code: 'MNT-005', name: 'Kavita Rao', email: 'kavita@smartbridge.in', role: 'mentor', track: 'ServiceNow', session: 'ITSM Workflow Review', date: TODAY, check_in: '08:52 AM', status: 'present', monthly_rate: 96 },
  { id: 'att-m6', person_id: 'm6', code: 'MNT-006', name: 'Arjun Malhotra', email: 'arjun@smartbridge.in', role: 'mentor', track: 'Business Intelligence', session: 'Power BI DAX Modeling', date: TODAY, check_in: '—', status: 'on_leave', monthly_rate: 91 },
]

function getStoredAttendance(): AttendanceRecord[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AttendanceRecord[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // ignore storage errors
  }
  return FALLBACK_RECORDS
}

const STATUS_META: Record<AttendanceStatus, { label: string; variant: 'success' | 'primary' | 'warning' | 'danger'; color: string }> = {
  present: { label: 'Present (In-Office)', variant: 'success', color: '#16A34A' },
  wfh: { label: 'Work From Home', variant: 'primary', color: '#0EA5E9' },
  late: { label: 'Late', variant: 'warning', color: '#F59E0B' },
  on_leave: { label: 'On Leave', variant: 'primary', color: '#6366F1' },
  absent: { label: 'Absent', variant: 'danger', color: '#DC2626' },
}

const isAttended = (s: AttendanceStatus) => s === 'present' || s === 'wfh' || s === 'late'

const AttendanceAnalyticsPage: React.FC = () => {
  const navigate = useNavigate()
  const [records] = useState<AttendanceRecord[]>(getStoredAttendance)
  const [periodFilter, setPeriodFilter] = useState<AttendancePeriod>('day')
  const [roleFilter, setRoleFilter] = useState<'all' | RoleType>('all')
  const [trackFilter, setTrackFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'' | AttendanceStatus>('')

  const totals = useMemo(() => {
    const total = records.length || 1
    const interns = records.filter((r) => r.role === 'intern')
    const mentors = records.filter((r) => r.role === 'mentor')
    const attended = records.filter((r) => isAttended(r.status)).length
    const internAttended = interns.filter((r) => isAttended(r.status)).length
    const mentorAttended = mentors.filter((r) => isAttended(r.status)).length
    const wfhCount = records.filter((r) => r.status === 'wfh').length
    const leaveCount = records.filter((r) => r.status === 'on_leave').length
    const absentCount = records.filter((r) => r.status === 'absent').length

    return {
      total: records.length,
      overallPct: Math.round((attended / total) * 100),
      internPct: interns.length ? Math.round((internAttended / interns.length) * 100) : 0,
      internCount: `${internAttended}/${interns.length}`,
      mentorPct: mentors.length ? Math.round((mentorAttended / mentors.length) * 100) : 0,
      mentorCount: `${mentorAttended}/${mentors.length}`,
      wfhPct: Math.round((wfhCount / total) * 100),
      wfhCount,
      leaveAbsentPct: Math.round(((leaveCount + absentCount) / total) * 100),
      leaveCount,
      absentCount,
    }
  }, [records])

  const trackMatrix = useMemo(() => {
    const multiplier = periodFilter === 'day' ? 1 : periodFilter === 'week' ? 5 : 22
    return STANDARD_TRACKS.map((track) => {
      const rows = records.filter((r) => r.track === track)
      const interns = rows.filter((r) => r.role === 'intern')
      const mentors = rows.filter((r) => r.role === 'mentor')
      const present = rows.filter((r) => r.status === 'present').length * multiplier
      const wfh = rows.filter((r) => r.status === 'wfh').length * multiplier
      const late = rows.filter((r) => r.status === 'late').length * multiplier
      const onLeave = rows.filter((r) => r.status === 'on_leave').length * multiplier
      const absent = rows.filter((r) => r.status === 'absent').length * multiplier
      const total = rows.length * multiplier
      const attended = present + wfh + late
      const internPct = interns.length ? Math.round((interns.filter((r) => isAttended(r.status)).length / interns.length) * 100) : 0
      const mentorPct = mentors.length ? Math.round((mentors.filter((r) => isAttended(r.status)).length / mentors.length) * 100) : 0
      const overallPct = total ? Math.round((attended / total) * 100) : 0

      return {
        track,
        shortTrack: track.replace('Software Engineering', 'Software Eng.').replace('Business Intelligence', 'Business Intel.'),
        total,
        internPct,
        mentorPct,
        present,
        wfh,
        late,
        onLeave,
        absent,
        overallPct,
      }
    })
  }, [records, periodFilter])

  const pieData = useMemo(() => {
    return (['present', 'wfh', 'late', 'on_leave', 'absent'] as AttendanceStatus[]).map((key) => ({
      name: STATUS_META[key].label,
      value: records.filter((r) => r.status === key).length,
      color: STATUS_META[key].color,
    })).filter((d) => d.value > 0)
  }, [records])

  const filteredPeople = useMemo(() => {
    return records.filter((r) => {
      if (roleFilter !== 'all' && r.role !== roleFilter) return false
      if (trackFilter && r.track !== trackFilter) return false
      if (statusFilter && r.status !== statusFilter) return false
      return true
    })
  }, [records, roleFilter, trackFilter, statusFilter])

  const exportReport = () => {
    const headers = ['Track', 'Total', 'Interns %', 'Mentors %', 'Present', 'WFH', 'Late', 'On Leave', 'Absent', 'Overall %']
    const rows = trackMatrix.map((t) => [
      t.track, String(t.total), `${t.internPct}%`, `${t.mentorPct}%`,
      String(t.present), String(t.wfh), String(t.late), String(t.onLeave), String(t.absent), `${t.overallPct}%`,
    ])
    const csv = [headers, ...rows].map((row) => row.map((v) => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance-percentage-report-${TODAY}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AdminLayout
      title="Attendance % & Breakdown Report"
      subtitle="Comprehensive track-wise percentages for Interns, Mentors, Work From Home, Leave & Absent"
    >
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <Button variant="outline" size="sm" icon={<ArrowLeft size={14} />} onClick={() => navigate('/admin/attendance')}>
          Back to Daily Attendance
        </Button>
        <Button variant="outline" size="sm" icon={<Download size={14} />} onClick={exportReport}>
          Export Track Report CSV
        </Button>
      </div>

      {/* Top Percentage Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard
          title="Overall Attendance %"
          value={`${totals.overallPct}%`}
          subtitle={`${totals.total} total people`}
          icon={Percent}
          iconColor="text-primary"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Interns Attendance %"
          value={`${totals.internPct}%`}
          subtitle={`${totals.internCount} attended`}
          icon={Users}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Mentors Attendance %"
          value={`${totals.mentorPct}%`}
          subtitle={`${totals.mentorCount} attended`}
          icon={UserCheck}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <StatCard
          title="Work From Home %"
          value={`${totals.wfhPct}%`}
          subtitle={`${totals.wfhCount} remote today`}
          icon={Laptop}
          iconColor="text-sky-600"
          iconBg="bg-sky-50"
        />
        <StatCard
          title="Leave & Absent %"
          value={`${totals.leaveAbsentPct}%`}
          subtitle={`${totals.leaveCount} leave • ${totals.absentCount} absent`}
          icon={CalendarOff}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card>
            <h3 className="text-base font-semibold text-navy mb-1">Track-wise Attendance Mode &amp; Status</h3>
            <p className="text-xs text-muted mb-4">Present (In-Office), Work From Home, Late, On Leave, and Absent across all 6 tracks</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={trackMatrix} margin={{ top: 8, right: 12, left: -12, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="shortTrack" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="present" name="Present" stackId="a" fill="#16A34A" />
                <Bar dataKey="wfh" name="Work From Home" stackId="a" fill="#0EA5E9" />
                <Bar dataKey="late" name="Late" stackId="a" fill="#F59E0B" />
                <Bar dataKey="onLeave" name="On Leave" stackId="a" fill="#6366F1" />
                <Bar dataKey="absent" name="Absent" stackId="a" fill="#DC2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card>
          <h3 className="text-base font-semibold text-navy mb-1">Mode Distribution</h3>
          <p className="text-xs text-muted mb-4">Overall share by attendance type</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="46%" innerRadius={52} outerRadius={82} paddingAngle={3} dataKey="value">
                {pieData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Track-wise Percentage Matrix Table */}
      <Card padding="none" className="mb-6">
        <div className="p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-navy">Track-wise Percentage Breakdown</h3>
            <p className="text-xs text-muted mt-0.5">
              Clear view of Interns %, Mentors %, In-Office, Work From Home, Late, Leave, and Absent per track ({periodFilter === 'day' ? 'Day-wise' : periodFilter === 'week' ? 'Week-wise · 5 days' : 'Monthly-wise · 22 days'})
            </p>
          </div>
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value as AttendancePeriod)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white font-medium text-navy focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="day">Day-wise</option>
            <option value="week">Week-wise</option>
            <option value="month">Monthly-wise</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted uppercase">Track</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-muted uppercase">Headcount</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-muted uppercase">Interns %</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-muted uppercase">Mentors %</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-emerald-700 uppercase">Present</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-sky-700 uppercase">WFH</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-amber-700 uppercase">Late</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-indigo-700 uppercase">On Leave</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-red-700 uppercase">Absent</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted uppercase">Overall %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {trackMatrix.map((t) => (
                <tr
                  key={t.track}
                  onClick={() => setTrackFilter(trackFilter === t.track ? '' : t.track)}
                  className={`cursor-pointer transition-colors ${trackFilter === t.track ? 'bg-blue-50/60' : 'bg-white hover:bg-surface'}`}
                >
                  <td className="px-5 py-3.5 font-semibold text-navy">{t.track}</td>
                  <td className="px-3 py-3.5 text-center font-medium text-navy">{t.total}</td>
                  <td className="px-3 py-3.5 text-center font-semibold text-emerald-700">{t.internPct}%</td>
                  <td className="px-3 py-3.5 text-center font-semibold text-indigo-700">{t.mentorPct}%</td>
                  <td className="px-3 py-3.5 text-center font-medium text-emerald-700">{t.present}</td>
                  <td className="px-3 py-3.5 text-center font-medium text-sky-700">{t.wfh}</td>
                  <td className="px-3 py-3.5 text-center font-medium text-amber-700">{t.late}</td>
                  <td className="px-3 py-3.5 text-center font-medium text-indigo-700">{t.onLeave}</td>
                  <td className="px-3 py-3.5 text-center font-medium text-red-700">{t.absent}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${t.overallPct >= 85 ? 'bg-emerald-500' : t.overallPct >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${t.overallPct}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-navy">{t.overallPct}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Individual Percentage & Mode Table */}
      <Card padding="none">
        <div className="p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-navy">Individual Attendance % &amp; Work Mode</h3>
            <p className="text-xs text-muted mt-0.5">Interns &amp; Mentors with monthly attendance percentage and work mode</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'all' | RoleType)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
            >
              <option value="all">All Roles</option>
              <option value="intern">Interns Only</option>
              <option value="mentor">Mentors Only</option>
            </select>
            <select
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
            >
              <option value="">All Tracks</option>
              {STANDARD_TRACKS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as '' | AttendanceStatus)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
            >
              <option value="">All Modes / Status</option>
              <option value="present">Present (In-Office)</option>
              <option value="wfh">Work From Home</option>
              <option value="late">Late</option>
              <option value="on_leave">On Leave</option>
              <option value="absent">Absent</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Track</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Work Mode / Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Check-in</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted uppercase">Monthly Attendance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPeople.map((p) => {
                const meta = STATUS_META[p.status]
                return (
                  <tr key={p.id} className="bg-white hover:bg-surface">
                    <td className="px-5 py-3">
                      <p className="font-medium text-navy">{p.name}</p>
                      <p className="text-xs text-muted">{p.code} · {p.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded ${
                        p.role === 'mentor' ? 'bg-indigo-50 text-indigo-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {p.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-navy">{p.track}</td>
                    <td className="px-4 py-3">
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">{p.check_in}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              p.monthly_rate >= 90 ? 'bg-emerald-500' : p.monthly_rate >= 80 ? 'bg-blue-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${p.monthly_rate}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-navy">{p.monthly_rate}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminLayout>
  )
}

export default AttendanceAnalyticsPage

