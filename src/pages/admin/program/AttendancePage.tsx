import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarCheck, Users, UserCheck, Clock, AlertCircle,
  Search, Download, CheckCircle2, BarChart3, Laptop,
} from 'lucide-react'
import AdminLayout from '../../../components/layout/AdminLayout'
import Card from '../../../components/ui/Card'
import StatCard from '../../../components/ui/StatCard'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import { supabase, isSupabaseConfigured } from '../../../lib/supabase'

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
  remarks?: string
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

const SEED_RECORDS: AttendanceRecord[] = [
  // Interns across all 6 tracks
  { id: 'att-1', person_id: 'i1', code: 'INT-001', name: 'Rahul Sharma', email: 'rahul@example.com', role: 'intern', track: 'AI & Cloud', session: 'Cloud Architecture Lab', date: TODAY, check_in: '09:02 AM', status: 'present', monthly_rate: 94 },
  { id: 'att-2', person_id: 'i2', code: 'INT-002', name: 'Priya Patel', email: 'priya@example.com', role: 'intern', track: 'Salesforce', session: 'Apex & LWC Workshop', date: TODAY, check_in: '09:05 AM', status: 'present', monthly_rate: 96 },
  { id: 'att-3', person_id: 'i3', code: 'INT-003', name: 'Amit Kumar', email: 'amit@example.com', role: 'intern', track: 'Software Engineering', session: 'System Design Sprint', date: TODAY, check_in: '09:24 AM', status: 'late', monthly_rate: 86 },
  { id: 'att-4', person_id: 'i4', code: 'INT-004', name: 'Sneha Reddy', email: 'sneha@example.com', role: 'intern', track: 'IoT & Robotics', session: 'Embedded Sensors Lab', date: TODAY, check_in: '—', status: 'on_leave', monthly_rate: 82, remarks: 'Medical leave approved' },
  { id: 'att-5', person_id: 'i5', code: 'INT-005', name: 'Vikram Singh', email: 'vikram@example.com', role: 'intern', track: 'ServiceNow', session: 'ITSM Workflow Review', date: TODAY, check_in: '08:58 AM', status: 'present', monthly_rate: 92 },
  { id: 'att-6', person_id: 'i6', code: 'INT-006', name: 'Ananya Verma', email: 'ananya@example.com', role: 'intern', track: 'Business Intelligence', session: 'Power BI DAX Modeling', date: TODAY, check_in: '09:04 AM', status: 'present', monthly_rate: 91 },
  { id: 'att-7', person_id: 'i7', code: 'INT-007', name: 'Karthik Nair', email: 'karthik@example.com', role: 'intern', track: 'AI & Cloud', session: 'LLM Fine-Tuning Sync', date: TODAY, check_in: '—', status: 'absent', monthly_rate: 74 },
  { id: 'att-8', person_id: 'i8', code: 'INT-008', name: 'Meera Iyer', email: 'meera@example.com', role: 'intern', track: 'Salesforce', session: 'Apex & LWC Workshop', date: TODAY, check_in: '09:01 AM', status: 'wfh', monthly_rate: 95 },
  { id: 'att-9', person_id: 'i9', code: 'INT-009', name: 'Rohan Das', email: 'rohan@example.com', role: 'intern', track: 'Software Engineering', session: 'System Design Sprint', date: TODAY, check_in: '09:00 AM', status: 'present', monthly_rate: 90 },
  { id: 'att-10', person_id: 'i10', code: 'INT-010', name: 'Divya Joshi', email: 'divya@example.com', role: 'intern', track: 'IoT & Robotics', session: 'Embedded Sensors Lab', date: TODAY, check_in: '09:10 AM', status: 'wfh', monthly_rate: 89 },

  // Mentors across all 6 tracks
  { id: 'att-m1', person_id: 'm1', code: 'MNT-001', name: 'Dr. Ramesh Babu', email: 'ramesh@smartbridge.in', role: 'mentor', track: 'AI & Cloud', session: 'Cloud Architecture Lab', date: TODAY, check_in: '08:50 AM', status: 'present', monthly_rate: 98 },
  { id: 'att-m2', person_id: 'm2', code: 'MNT-002', name: 'Kiran Deshmukh', email: 'kiran@smartbridge.in', role: 'mentor', track: 'Salesforce', session: 'Apex & LWC Workshop', date: TODAY, check_in: '08:55 AM', status: 'wfh', monthly_rate: 95 },
  { id: 'att-m3', person_id: 'm3', code: 'MNT-003', name: 'Deepika Nair', email: 'deepika@smartbridge.in', role: 'mentor', track: 'Software Engineering', session: 'System Design Sprint', date: TODAY, check_in: '09:00 AM', status: 'present', monthly_rate: 97 },
  { id: 'att-m4', person_id: 'm4', code: 'MNT-004', name: 'Suresh Menon', email: 'suresh@smartbridge.in', role: 'mentor', track: 'IoT & Robotics', session: 'Embedded Sensors Lab', date: TODAY, check_in: '09:18 AM', status: 'late', monthly_rate: 88 },
  { id: 'att-m5', person_id: 'm5', code: 'MNT-005', name: 'Kavita Rao', email: 'kavita@smartbridge.in', role: 'mentor', track: 'ServiceNow', session: 'ITSM Workflow Review', date: TODAY, check_in: '08:52 AM', status: 'present', monthly_rate: 96 },
  { id: 'att-m6', person_id: 'm6', code: 'MNT-006', name: 'Arjun Malhotra', email: 'arjun@smartbridge.in', role: 'mentor', track: 'Business Intelligence', session: 'Power BI DAX Modeling', date: TODAY, check_in: '—', status: 'on_leave', monthly_rate: 91, remarks: 'Conference travel' },
]

const STATUS_BADGE: Record<AttendanceStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'primary' }> = {
  present: { label: 'Present', variant: 'success' },
  wfh: { label: 'WFH', variant: 'primary' },
  late: { label: 'Late', variant: 'warning' },
  absent: { label: 'Absent', variant: 'danger' },
  on_leave: { label: 'On Leave', variant: 'primary' },
}

function loadStoredRecords(): AttendanceRecord[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AttendanceRecord[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // ignore storage errors
  }
  return SEED_RECORDS
}

const AttendancePage: React.FC = () => {
  const navigate = useNavigate()
  const [records, setRecords] = useState<AttendanceRecord[]>(loadStoredRecords)
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(TODAY)
  const [periodFilter, setPeriodFilter] = useState<AttendancePeriod>('day')
  const [roleTab, setRoleTab] = useState<'all' | RoleType>('all')
  const [trackFilter, setTrackFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const fetchAttendance = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setRecords(loadStoredRecords())
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', selectedDate)
        .order('role', { ascending: true })
      if (!error && data && data.length > 0) {
        setRecords(data as unknown as AttendanceRecord[])
      } else {
        setRecords(loadStoredRecords())
      }
    } catch {
      setRecords(loadStoredRecords())
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    fetchAttendance()
  }, [fetchAttendance])

  const persistRecords = (updated: AttendanceRecord[]) => {
    setRecords(updated)
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {
      // ignore storage errors
    }
  }

  const updateStatus = async (id: string, nextStatus: AttendanceStatus) => {
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const updated = records.map((r) => {
      if (r.id !== id) return r
      return {
        ...r,
        status: nextStatus,
        check_in: nextStatus === 'absent' || nextStatus === 'on_leave' ? '—' : (r.check_in === '—' ? nowTime : r.check_in),
      }
    })
    persistRecords(updated)

    if (isSupabaseConfigured) {
      await supabase.from('attendance').update({ status: nextStatus }).eq('id', id)
    }
    showToast(`Marked as ${STATUS_BADGE[nextStatus].label}`)
  }

  const markAllPresent = () => {
    const visibleIds = new Set(filteredRecords.map((r) => r.id))
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const updated = records.map((r) =>
      visibleIds.has(r.id)
        ? { ...r, status: 'present' as AttendanceStatus, check_in: r.check_in === '—' ? nowTime : r.check_in }
        : r
    )
    persistRecords(updated)
    showToast(`Marked ${visibleIds.size} visible record(s) Present`)
  }

  // Summary metrics
  const summary = useMemo(() => {
    const interns = records.filter((r) => r.role === 'intern')
    const mentors = records.filter((r) => r.role === 'mentor')
    const isAttended = (r: AttendanceRecord) => r.status === 'present' || r.status === 'wfh' || r.status === 'late'

    const internPresent = interns.filter(isAttended).length
    const mentorPresent = mentors.filter(isAttended).length
    const wfhCount = records.filter((r) => r.status === 'wfh').length
    const totalPresent = internPresent + mentorPresent
    const absentOrLeave = records.filter((r) => r.status === 'absent' || r.status === 'on_leave').length

    return {
      total: records.length,
      overallPct: records.length ? Math.round((totalPresent / records.length) * 100) : 0,
      internPresent,
      internTotal: interns.length,
      internPct: interns.length ? Math.round((internPresent / interns.length) * 100) : 0,
      mentorPresent,
      mentorTotal: mentors.length,
      mentorPct: mentors.length ? Math.round((mentorPresent / mentors.length) * 100) : 0,
      wfhCount,
      absentOrLeave,
    }
  }, [records])

  // Track-wise summary (both Intern & Mentor breakdown per track, supports Day / Week / Monthly)
  const trackSummaries = useMemo(() => {
    const isAttended = (r: AttendanceRecord) => r.status === 'present' || r.status === 'wfh' || r.status === 'late'
    const workDays = periodFilter === 'day' ? 1 : periodFilter === 'week' ? 5 : 22

    return STANDARD_TRACKS.map((track) => {
      const trackRows = records.filter((r) => r.track === track)
      const interns = trackRows.filter((r) => r.role === 'intern')
      const mentors = trackRows.filter((r) => r.role === 'mentor')

      if (periodFilter === 'day') {
        const internAttended = interns.filter(isAttended).length
        const mentorAttended = mentors.filter(isAttended).length
        const totalAttended = internAttended + mentorAttended
        const pct = trackRows.length ? Math.round((totalAttended / trackRows.length) * 100) : 0
        return {
          track,
          total: trackRows.length,
          pct,
          internAttended,
          internTotal: interns.length,
          mentorAttended,
          mentorTotal: mentors.length,
        }
      }

      const avgRate = (list: AttendanceRecord[]) =>
        list.length ? Math.round(list.reduce((s, r) => s + r.monthly_rate, 0) / list.length) : 0

      const internBasePct = avgRate(interns)
      const mentorBasePct = avgRate(mentors)
      const weekAdjust = periodFilter === 'week' ? 2 : 0
      const internTotalDays = interns.length * workDays
      const mentorTotalDays = mentors.length * workDays
      const internAttended = Math.min(internTotalDays, Math.round((internTotalDays * Math.min(100, internBasePct + weekAdjust)) / 100))
      const mentorAttended = Math.min(mentorTotalDays, Math.round((mentorTotalDays * Math.min(100, mentorBasePct + weekAdjust)) / 100))
      const totalDays = internTotalDays + mentorTotalDays
      const pct = totalDays ? Math.round(((internAttended + mentorAttended) / totalDays) * 100) : 0

      return {
        track,
        total: totalDays,
        pct,
        internAttended,
        internTotal: internTotalDays,
        mentorAttended,
        mentorTotal: mentorTotalDays,
      }
    })
  }, [records, periodFilter])

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchRole = roleTab === 'all' || r.role === roleTab
      const matchTrack = !trackFilter || r.track === trackFilter
      const matchStatus = !statusFilter || r.status === statusFilter
      const q = search.trim().toLowerCase()
      const matchSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q)
      return matchRole && matchTrack && matchStatus && matchSearch
    })
  }, [records, roleTab, trackFilter, statusFilter, search])

  const exportCsv = () => {
    const headers = ['Code', 'Name', 'Email', 'Role', 'Track', 'Date', 'Check-in', 'Status', 'Monthly Rate (%)']
    const rows = filteredRecords.map((r) => [
      r.code, r.name, r.email, r.role, r.track, selectedDate, r.check_in, r.status, String(r.monthly_rate),
    ])
    const csv = [headers, ...rows].map((row) => row.map((v) => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance-${selectedDate}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AdminLayout title="Attendance" subtitle="Track daily & monthly attendance for Interns, Mentors, and Tracks">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-navy text-white text-sm px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-400" />
          {toast}
        </div>
      )}

      {/* Top Banner Link to Separate Percentage & Breakdown Page */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-blue-50/70 border border-blue-100 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2.5 text-sm text-navy">
          <BarChart3 size={18} className="text-primary flex-shrink-0" />
          <span>
            Want full <strong>Attendance % Analytics</strong> (Track-wise, Interns, Mentors, WFH, Leave &amp; Absent)?
          </span>
        </div>
        <Button size="sm" icon={<BarChart3 size={14} />} onClick={() => navigate('/admin/attendance/report')}>
          Open Attendance % Report
        </Button>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard
          title="Overall Attendance"
          value={`${summary.overallPct}%`}
          subtitle={`${summary.total} tracked today`}
          icon={CalendarCheck}
          iconColor="text-primary"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Intern Attendance"
          value={`${summary.internPct}%`}
          subtitle={`${summary.internPresent} / ${summary.internTotal} active`}
          icon={Users}
          iconColor="text-success"
          iconBg="bg-green-50"
        />
        <StatCard
          title="Mentor Attendance"
          value={`${summary.mentorPct}%`}
          subtitle={`${summary.mentorPresent} / ${summary.mentorTotal} active`}
          icon={UserCheck}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <StatCard
          title="Work From Home"
          value={summary.wfhCount}
          subtitle="Remote check-ins"
          icon={Laptop}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Absent / On Leave"
          value={summary.absentOrLeave}
          subtitle="Requires follow-up"
          icon={AlertCircle}
          iconColor="text-warning"
          iconBg="bg-amber-50"
        />
      </div>

      {/* Track-wise Attendance Summary Cards */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-semibold text-navy">Track-wise Attendance</h3>
            <p className="text-xs text-muted">
              Intern &amp; Mentor attendance across all 6 tracks ({periodFilter === 'day' ? 'Day-wise' : periodFilter === 'week' ? 'Week-wise · 5 days' : 'Monthly-wise · 22 days'}) — click a track to filter
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as AttendancePeriod)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white font-medium text-navy focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="day">Day-wise</option>
              <option value="week">Week-wise</option>
              <option value="month">Monthly-wise</option>
            </select>
            {trackFilter && (
              <button
                type="button"
                onClick={() => setTrackFilter('')}
                className="text-xs font-medium text-primary hover:underline"
              >
                Show All Tracks
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {trackSummaries.map((ts) => {
            const active = trackFilter === ts.track
            return (
              <button
                key={ts.track}
                type="button"
                onClick={() => setTrackFilter(active ? '' : ts.track)}
                className={`text-left rounded-xl border p-3.5 transition-all ${
                  active
                    ? 'border-primary bg-blue-50/60 ring-1 ring-primary/30 shadow-sm'
                    : 'border-gray-100 bg-gray-50/50 hover:bg-gray-100/70'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-sm font-semibold text-navy truncate">{ts.track}</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      ts.pct >= 85
                        ? 'bg-emerald-100 text-emerald-700'
                        : ts.pct >= 70
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {ts.pct}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted mb-2">
                  <span>
                    Interns: <strong className="text-navy">{ts.internAttended}/{ts.internTotal}</strong>
                  </span>
                  <span>
                    Mentors: <strong className="text-navy">{ts.mentorAttended}/{ts.mentorTotal}</strong>
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${ts.pct >= 85 ? 'bg-emerald-500' : ts.pct >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${ts.pct}%` }}
                  />
                </div>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Main Attendance Roster Table */}
      <Card padding="none">
        {/* Role Tabs + Toolbar */}
        <div className="p-5 border-b border-gray-100 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-lg bg-gray-100 p-1">
              {[
                { key: 'all', label: `All (${summary.total})` },
                { key: 'intern', label: `Interns (${summary.internTotal})` },
                { key: 'mentor', label: `Mentors (${summary.mentorTotal})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setRoleTab(tab.key as 'all' | RoleType)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    roleTab === tab.key
                      ? 'bg-white text-navy shadow-sm'
                      : 'text-muted hover:text-navy'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <Button variant="outline" size="sm" icon={<CheckCircle2 size={14} />} onClick={markAllPresent}>
                Mark Visible Present
              </Button>
              <Button variant="outline" size="sm" icon={<Download size={14} />} onClick={exportCsv}>
                Export CSV
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search name, ID or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 w-64"
              />
            </div>

            <select
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All Tracks</option>
              {STANDARD_TRACKS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All Status</option>
              <option value="present">Present</option>
              <option value="wfh">Work From Home</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Person</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">ID &amp; Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Track</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Session</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Check-in</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Monthly %</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Mark Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    {Array.from({ length: 8 }).map((__, colIdx) => (
                      <td key={colIdx} className="px-5 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted">
                    No attendance records match your filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const statusMeta = STATUS_BADGE[rec.status]
                  return (
                    <tr key={rec.id} className="bg-white hover:bg-surface transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            rec.role === 'mentor' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {rec.name[0]}
                          </div>
                          <div>
                            <p className="font-medium text-navy">{rec.name}</p>
                            <p className="text-xs text-muted">{rec.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-mono text-xs font-semibold text-navy">{rec.code}</p>
                        <span className={`inline-block mt-0.5 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                          rec.role === 'mentor' ? 'bg-indigo-50 text-indigo-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {rec.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-medium text-navy">{rec.track}</td>
                      <td className="px-4 py-3.5 text-xs text-muted">{rec.session}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 text-xs text-navy">
                          <Clock size={12} className="text-muted" />
                          <span>{rec.check_in}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                rec.monthly_rate >= 90 ? 'bg-emerald-500' : rec.monthly_rate >= 80 ? 'bg-blue-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${rec.monthly_rate}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-navy">{rec.monthly_rate}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="inline-flex items-center gap-1">
                          {(
                            [
                              { key: 'present', short: 'P', active: 'bg-emerald-600 text-white border-emerald-600' },
                              { key: 'wfh', short: 'WFH', active: 'bg-sky-600 text-white border-sky-600' },
                              { key: 'late', short: 'L', active: 'bg-amber-500 text-white border-amber-500' },
                              { key: 'absent', short: 'A', active: 'bg-red-600 text-white border-red-600' },
                              { key: 'on_leave', short: 'LV', active: 'bg-blue-600 text-white border-blue-600' },
                            ] as const
                          ).map((btn) => (
                            <button
                              key={btn.key}
                              type="button"
                              title={STATUS_BADGE[btn.key].label}
                              onClick={() => updateStatus(rec.id, btn.key)}
                              className={`px-2 py-1 text-[11px] font-semibold rounded border transition-colors ${
                                rec.status === btn.key
                                  ? btn.active
                                  : 'bg-white text-muted border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              {btn.short}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminLayout>
  )
}

export default AttendancePage
