import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Plus, Search, Eye, Edit2, Power, PowerOff, Layers,
  Users, MoreVertical, UserCheck, Clock, X, MapPin, GraduationCap,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import AdminLayout from '../../../components/layout/AdminLayout'
import Button from '../../../components/ui/Button'
import Badge, { statusToBadgeVariant } from '../../../components/ui/Badge'
import Card from '../../../components/ui/Card'
import Modal from '../../../components/ui/Modal'
import Input from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import EmptyState from '../../../components/ui/EmptyState'
import StatCard from '../../../components/ui/StatCard'
import { supabase, isSupabaseConfigured } from '../../../lib/supabase'
import type { Batch, BatchStatus } from '../../../types'

// ─── Track & Program Types ────────────────────────────────────────────────────
const TRACK_LIST = [
  'AI & Cloud',
  'Salesforce',
  'Software Engineering',
  'IoT & Robotics',
  'ServiceNow',
  'Business Intelligence',
] as const

interface ProgramRecord extends Batch {
  location?: string
  total_students?: number
  total_trainers?: number
  total_mentors?: number
}

interface TrackIntern {
  id: string
  intern_id: string
  name: string
  email: string
  track: string
  stage: number
  status: 'active' | 'completed' | 'invited' | 'on_hold' | 'inactive' | 'withdrawn'
}

interface TrackMentor {
  id: string
  employee_id: string
  name: string
  email: string
  domain: string
  designation: string
  status: 'active' | 'inactive'
}

const DEMO_PROGRAMS_KEY = 'internflow_demo_programs'

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_PROGRAMS: ProgramRecord[] = [
  { id: 'b1', name: 'AI & Cloud – LaunchPad Jan 2026', code: 'LP-AIC-26A', description: 'AWS, Azure & GenAI engineering program.', track: 'AI & Cloud', location: 'Online (Live Virtual)', total_students: 120, total_trainers: 6, total_mentors: 12, start_date: '2026-01-15', end_date: '2026-07-15', duration_weeks: 24, status: 'active', created_at: '2025-12-01T00:00:00Z' },
  { id: 'b2', name: 'AI & Cloud – LaunchPad Jul 2025', code: 'LP-AIC-25B', description: 'Completed cloud architecture cohort.', track: 'AI & Cloud', location: 'Hyderabad – SmartBridge HQ', total_students: 95, total_trainers: 5, total_mentors: 10, start_date: '2025-07-01', end_date: '2025-12-31', duration_weeks: 24, status: 'completed', created_at: '2025-06-01T00:00:00Z' },
  { id: 'b3', name: 'AI & Cloud – LaunchPad Dec 2026', code: 'LP-AIC-26C', description: 'Upcoming AI & Cloud batch.', track: 'AI & Cloud', location: 'Vijayawada – Partner Campus', total_students: 80, total_trainers: 4, total_mentors: 8, start_date: '2026-12-15', end_date: '2027-06-15', duration_weeks: 24, status: 'inactive', created_at: '2026-10-01T00:00:00Z' },
  { id: 'b4', name: 'Salesforce – Developer Bootcamp 2026', code: 'LP-SF-26A', description: 'Apex, LWC & CRM administration.', track: 'Salesforce', location: 'Online (Live Virtual)', total_students: 110, total_trainers: 5, total_mentors: 9, start_date: '2026-02-01', end_date: '2026-08-01', duration_weeks: 24, status: 'active', created_at: '2026-01-05T00:00:00Z' },
  { id: 'b5', name: 'Salesforce – Cohort Jul 2025', code: 'LP-SF-25B', description: 'Completed Salesforce cohort.', track: 'Salesforce', location: 'Bengaluru – Hybrid', total_students: 85, total_trainers: 4, total_mentors: 7, start_date: '2025-07-01', end_date: '2025-12-31', duration_weeks: 24, status: 'completed', created_at: '2025-06-01T00:00:00Z' },
  { id: 'b6', name: 'Software Engineering – Full Stack 2026', code: 'LP-SWE-26A', description: 'React, Node.js & system design.', track: 'Software Engineering', location: 'Hyderabad – SmartBridge HQ', total_students: 140, total_trainers: 7, total_mentors: 14, start_date: '2026-04-01', end_date: '2026-10-01', duration_weeks: 24, status: 'active', created_at: '2026-03-01T00:00:00Z' },
  { id: 'b7', name: 'IoT & Robotics – Edge Systems 2026', code: 'LP-IOT-26A', description: 'Embedded systems, ROS2 & edge telemetry.', track: 'IoT & Robotics', location: 'Visakhapatnam – Innovation Lab', total_students: 60, total_trainers: 4, total_mentors: 6, start_date: '2026-03-01', end_date: '2026-09-01', duration_weeks: 24, status: 'active', created_at: '2026-02-01T00:00:00Z' },
  { id: 'b8', name: 'ServiceNow – ITSM & Flow 2027', code: 'LP-SN-27A', description: 'ITSM & Flow Designer upcoming cohort.', track: 'ServiceNow', location: 'Online (Live Virtual)', total_students: 75, total_trainers: 3, total_mentors: 6, start_date: '2027-01-10', end_date: '2027-07-10', duration_weeks: 24, status: 'inactive', created_at: '2026-10-15T00:00:00Z' },
  { id: 'b9', name: 'Business Intelligence – Analytics 2026', code: 'LP-BI-26A', description: 'Power BI, SQL & data warehousing.', track: 'Business Intelligence', location: 'Chennai – Partner University', total_students: 90, total_trainers: 4, total_mentors: 8, start_date: '2026-03-15', end_date: '2026-09-15', duration_weeks: 24, status: 'active', created_at: '2026-02-15T00:00:00Z' },
]

const MOCK_TRACK_INTERNS: TrackIntern[] = [
  { id: '1', intern_id: 'INT-001', name: 'Rahul Sharma', email: 'rahul@example.com', track: 'AI & Cloud', stage: 2, status: 'active' },
  { id: '2', intern_id: 'INT-002', name: 'Priya Patel', email: 'priya@example.com', track: 'AI & Cloud', stage: 1, status: 'active' },
  { id: '3', intern_id: 'INT-005', name: 'Vikram Singh', email: 'vikram@example.com', track: 'AI & Cloud', stage: 4, status: 'completed' },
  { id: '4', intern_id: 'INT-009', name: 'Meera Nair', email: 'meera@example.com', track: 'AI & Cloud', stage: 0, status: 'invited' },
  { id: '5', intern_id: 'INT-003', name: 'Amit Kumar', email: 'amit@example.com', track: 'Software Engineering', stage: 3, status: 'active' },
  { id: '6', intern_id: 'INT-004', name: 'Sneha Reddy', email: 'sneha@example.com', track: 'Software Engineering', stage: 1, status: 'on_hold' },
  { id: '7', intern_id: 'INT-006', name: 'Karthik Rao', email: 'karthik@example.com', track: 'Salesforce', stage: 2, status: 'active' },
  { id: '8', intern_id: 'INT-007', name: 'Divya Iyer', email: 'divya@example.com', track: 'Salesforce', stage: 4, status: 'completed' },
  { id: '9', intern_id: 'INT-008', name: 'Arjun Das', email: 'arjun@example.com', track: 'IoT & Robotics', stage: 2, status: 'active' },
  { id: '10', intern_id: 'INT-010', name: 'Neha Verma', email: 'neha@example.com', track: 'ServiceNow', stage: 0, status: 'invited' },
  { id: '11', intern_id: 'INT-011', name: 'Rohan Joshi', email: 'rohan@example.com', track: 'Business Intelligence', stage: 3, status: 'active' },
]

const MOCK_TRACK_MENTORS: TrackMentor[] = [
  { id: 'm1', employee_id: 'EMP-001', name: 'Ananya Deshmukh', email: 'ananya@smartbridge.in', domain: 'AI & Cloud', designation: 'Cloud Architect', status: 'active' },
  { id: 'm2', employee_id: 'EMP-002', name: 'Suresh Menon', email: 'suresh@smartbridge.in', domain: 'AI & Cloud', designation: 'Principal ML Engineer', status: 'active' },
  { id: 'm3', employee_id: 'EMP-003', name: 'Raju Nair', email: 'raju@smartbridge.in', domain: 'Software Engineering', designation: 'Tech Lead', status: 'active' },
  { id: 'm4', employee_id: 'EMP-004', name: 'Kavitha Rao', email: 'kavitha@smartbridge.in', domain: 'Salesforce', designation: 'Salesforce Lead', status: 'active' },
  { id: 'm5', employee_id: 'EMP-005', name: 'Deepak Kulkarni', email: 'deepak@smartbridge.in', domain: 'IoT & Robotics', designation: 'Embedded Lead', status: 'active' },
  { id: 'm6', employee_id: 'EMP-006', name: 'Pooja Sharma', email: 'pooja@smartbridge.in', domain: 'ServiceNow', designation: 'ServiceNow Architect', status: 'active' },
  { id: 'm7', employee_id: 'EMP-007', name: 'Manish Gupta', email: 'manish@smartbridge.in', domain: 'Business Intelligence', designation: 'BI Lead', status: 'active' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const batchStatusVariant = (s: BatchStatus) => {
  if (s === 'active') return 'success'
  if (s === 'completed') return 'primary'
  return 'muted'
}

const getProgramPhase = (b: ProgramRecord): 'active' | 'completed' | 'yet_to_start' => {
  if (b.status === 'completed') return 'completed'
  if (b.status === 'active') return 'active'
  return 'yet_to_start'
}

const programPhaseLabel = (b: ProgramRecord) => {
  const phase = getProgramPhase(b)
  if (phase === 'active') return 'Active'
  if (phase === 'completed') return 'Completed'
  return 'Yet to Start'
}

const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

// ─── Types for form ────────────────────────────────────────────────────────────
interface ProgramForm {
  name: string
  code: string
  description: string
  track: string
  location: string
  total_students: string
  total_trainers: string
  total_mentors: string
  start_date: string
  end_date: string
  status: BatchStatus
}

const EMPTY_FORM: ProgramForm = {
  name: '', code: '', description: '', track: '', location: '',
  total_students: '', total_trainers: '', total_mentors: '',
  start_date: '', end_date: '', status: 'active',
}

const TRACK_OPTIONS = [
  { value: '', label: 'Select track' },
  ...TRACK_LIST.map(t => ({ value: t, label: t })),
]

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Yet to Start' },
  { value: 'completed', label: 'Completed' },
]

// ─── Component ────────────────────────────────────────────────────────────────
const BatchesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [programs, setPrograms] = useState<ProgramRecord[]>([])
  const [interns, setInterns] = useState<TrackIntern[]>(MOCK_TRACK_INTERNS)
  const [mentors, setMentors] = useState<TrackMentor[]>(MOCK_TRACK_MENTORS)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<BatchStatus | ''>('')
  const [trackFilter, setTrackFilter] = useState('')
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  // Modal state
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editTarget, setEditTarget] = useState<ProgramRecord | null>(null)
  const [form, setForm] = useState<ProgramForm>(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<Partial<ProgramForm>>({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // Open New Program modal automatically if ?new=1
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setForm(EMPTY_FORM)
      setFormErrors({})
      setShowCreate(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchPrograms = useCallback(async () => {
    setLoading(true)
    try {
      if (!isSupabaseConfigured) {
        const saved = sessionStorage.getItem(DEMO_PROGRAMS_KEY)
        setPrograms(saved ? JSON.parse(saved) : MOCK_PROGRAMS)
        setInterns(MOCK_TRACK_INTERNS)
        setMentors(MOCK_TRACK_MENTORS)
        return
      }
      const [{ data: batchData, error }, { data: internData }, { data: mentorData }] = await Promise.all([
        supabase.from('batches').select('*').order('created_at', { ascending: false }),
        supabase.from('interns').select('id, intern_id, track, current_stage, status, profile:profiles(full_name, email)'),
        supabase.from('mentors').select('id, employee_id, domain, designation, status, profile:profiles(full_name, email)'),
      ])
      if (error || !batchData || batchData.length === 0) {
        setPrograms(MOCK_PROGRAMS)
      } else {
        setPrograms(batchData as ProgramRecord[])
      }
      if (internData && internData.length > 0) {
        setInterns(internData.map((i: Record<string, unknown>) => {
          const p = i.profile as { full_name?: string; email?: string } | null
          return {
            id: String(i.id),
            intern_id: String(i.intern_id),
            name: p?.full_name ?? 'Intern',
            email: p?.email ?? '',
            track: String(i.track ?? ''),
            stage: Number(i.current_stage ?? 0),
            status: (i.status as TrackIntern['status']) ?? 'active',
          }
        }))
      }
      if (mentorData && mentorData.length > 0) {
        setMentors(mentorData.map((m: Record<string, unknown>) => {
          const p = m.profile as { full_name?: string; email?: string } | null
          return {
            id: String(m.id),
            employee_id: String(m.employee_id),
            name: p?.full_name ?? 'Mentor',
            email: p?.email ?? '',
            domain: String(m.domain ?? ''),
            designation: String(m.designation ?? ''),
            status: (m.status as TrackMentor['status']) ?? 'active',
          }
        }))
      }
    } catch {
      setPrograms(MOCK_PROGRAMS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPrograms() }, [fetchPrograms])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalPrograms = programs.length
  const totalStudents = programs.reduce((sum, p) => sum + (p.total_students ?? 0), 0)
  const totalTrainers = programs.reduce((sum, p) => sum + (p.total_trainers ?? 0), 0)
  const totalMentors = programs.reduce((sum, p) => sum + (p.total_mentors ?? 0), 0)

  const getTrackStats = (trackName: string) => {
    const trackPrograms = programs.filter(b => b.track === trackName)
    const trackInterns = interns.filter(i => i.track === trackName)
    const trackMentors = mentors.filter(m => m.domain === trackName)
    return {
      programs: trackPrograms,
      interns: trackInterns,
      mentors: trackMentors,
      totalPrograms: trackPrograms.length,
      activePrograms: trackPrograms.filter(b => getProgramPhase(b) === 'active').length,
      completedPrograms: trackPrograms.filter(b => getProgramPhase(b) === 'completed').length,
      yetToStartPrograms: trackPrograms.filter(b => getProgramPhase(b) === 'yet_to_start').length,
      studentsCount: trackPrograms.reduce((s, p) => s + (p.total_students ?? 0), 0) || trackInterns.length,
      trainersCount: trackPrograms.reduce((s, p) => s + (p.total_trainers ?? 0), 0),
      mentorsCount: trackPrograms.reduce((s, p) => s + (p.total_mentors ?? 0), 0) || trackMentors.length,
    }
  }

  const handleSelectTrack = (trackName: string) => {
    if (selectedTrack === trackName) {
      setSelectedTrack(null)
      setTrackFilter('')
    } else {
      setSelectedTrack(trackName)
      setTrackFilter(trackName)
    }
  }

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = programs.filter(b => {
    const matchSearch = !search ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.code.toLowerCase().includes(search.toLowerCase()) ||
      (b.location ?? '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || b.status === statusFilter
    const matchTrack = !trackFilter || b.track === trackFilter
    return matchSearch && matchStatus && matchTrack
  })

  // ── Form helpers ───────────────────────────────────────────────────────────
  const setField = (k: keyof ProgramForm, v: string) =>
    setForm(f => ({ ...f, [k]: k === 'code' ? v.toUpperCase() : v }))

  const validate = (): boolean => {
    const errs: Partial<ProgramForm> = {}
    if (!form.name.trim()) errs.name = 'Program name is required'
    if (!form.code.trim()) errs.code = 'Program code is required'
    else if (!/^[A-Z0-9\-]+$/.test(form.code)) errs.code = 'Only uppercase letters, numbers and hyphens'
    if (!form.location.trim()) errs.location = 'Location / mode is required'
    const dup = programs.find(b => b.code === form.code && b.id !== editTarget?.id)
    if (dup) errs.code = 'A program with this code already exists'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, track: selectedTrack ?? '' })
    setFormErrors({})
    setShowCreate(true)
  }

  const openEdit = (b: ProgramRecord) => {
    setEditTarget(b)
    setForm({
      name: b.name,
      code: b.code,
      description: b.description ?? '',
      track: b.track ?? '',
      location: b.location ?? '',
      total_students: b.total_students != null ? String(b.total_students) : '',
      total_trainers: b.total_trainers != null ? String(b.total_trainers) : '',
      total_mentors: b.total_mentors != null ? String(b.total_mentors) : '',
      start_date: b.start_date ?? '',
      end_date: b.end_date ?? '',
      status: b.status,
    })
    setFormErrors({})
    setShowEdit(true)
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    const studentsNum = form.total_students ? parseInt(form.total_students, 10) : 0
    const trainersNum = form.total_trainers ? parseInt(form.total_trainers, 10) : 0
    const mentorsNum = form.total_mentors ? parseInt(form.total_mentors, 10) : 0

    try {
      if (isSupabaseConfigured) {
        const payload = {
          name: form.name, code: form.code, description: form.description,
          track: form.track, start_date: form.start_date || null,
          end_date: form.end_date || null, status: form.status,
          duration_weeks: 24,
        }
        const { error } = showCreate
          ? await supabase.from('batches').insert([payload])
          : await supabase.from('batches').update(payload).eq('id', editTarget!.id)

        if (error) throw error
        await fetchPrograms()
      } else {
        if (showCreate) {
          const newProgram: ProgramRecord = {
            id: `prog-${Date.now()}`,
            name: form.name,
            code: form.code,
            description: form.description,
            track: form.track,
            location: form.location,
            total_students: studentsNum,
            total_trainers: trainersNum,
            total_mentors: mentorsNum,
            start_date: form.start_date,
            end_date: form.end_date,
            status: form.status,
            duration_weeks: 24,
            created_at: new Date().toISOString(),
          }
          setPrograms(prev => {
            const updated = [newProgram, ...prev]
            sessionStorage.setItem(DEMO_PROGRAMS_KEY, JSON.stringify(updated))
            return updated
          })
        } else if (editTarget) {
          setPrograms(prev => {
            const updated = prev.map(b =>
              b.id === editTarget.id
                ? {
                    ...b,
                    name: form.name,
                    code: form.code,
                    description: form.description,
                    track: form.track,
                    location: form.location,
                    total_students: studentsNum,
                    total_trainers: trainersNum,
                    total_mentors: mentorsNum,
                    start_date: form.start_date,
                    end_date: form.end_date,
                    status: form.status,
                  }
                : b
            )
            sessionStorage.setItem(DEMO_PROGRAMS_KEY, JSON.stringify(updated))
            return updated
          })
        }
      }
      setToast({ type: 'success', msg: showCreate ? 'New program added!' : 'Program updated!' })
      setShowCreate(false)
      setShowEdit(false)
    } catch (err) {
      setToast({ type: 'error', msg: (err as Error).message || 'Failed to save program.' })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (b: ProgramRecord) => {
    const next: BatchStatus = b.status === 'active' ? 'inactive' : 'active'
    if (isSupabaseConfigured) {
      try { await supabase.from('batches').update({ status: next }).eq('id', b.id) } catch { /* ignore */ }
    }
    setPrograms(prev => {
      const updated = prev.map(x => x.id === b.id ? { ...x, status: next } : x)
      if (!isSupabaseConfigured) sessionStorage.setItem(DEMO_PROGRAMS_KEY, JSON.stringify(updated))
      return updated
    })
    setToast({ type: 'success', msg: `Program marked ${next === 'active' ? 'Active' : 'Yet to Start'}` })
    setOpenMenuId(null)
  }

  const activeTrackStats = selectedTrack ? getTrackStats(selectedTrack) : null

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AdminLayout title="SmartBridge Programs & Tracks" subtitle="All SmartBridge programs, locations, students, trainers, and mentoring details">

      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white transition-all
          ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Programs" value={totalPrograms} icon={Layers} iconColor="text-primary" iconBg="bg-blue-50" loading={loading} />
        <StatCard title="Total Students" value={totalStudents} icon={Users} iconColor="text-success" iconBg="bg-green-50" loading={loading} subtitle="enrolled across programs" />
        <StatCard title="Total Trainers" value={totalTrainers} icon={GraduationCap} iconColor="text-warning" iconBg="bg-amber-50" loading={loading} subtitle="conducting sessions" />
        <StatCard title="Total Mentors" value={totalMentors} icon={UserCheck} iconColor="text-navy" iconBg="bg-indigo-50" loading={loading} subtitle="mentoring students" />
      </div>

      {/* Program Tracks Interactive Graphs */}
      {(() => {
        const trackGraphData = TRACK_LIST.map((trackName) => {
          const st = getTrackStats(trackName)
          return {
            track: trackName,
            shortTrack: trackName.replace('Software Engineering', 'Software Eng.').replace('Business Intelligence', 'Business Intel.'),
            students: st.studentsCount,
            trainers: st.trainersCount,
            mentors: st.mentorsCount,
            active: st.activePrograms,
            completed: st.completedPrograms,
            yetToStart: st.yetToStartPrograms,
            totalPrograms: st.totalPrograms,
          }
        })

        return (
          <div className="mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <h2 className="text-sm font-semibold text-navy uppercase tracking-wider">
                Program Tracks (Click a track or bar for full details)
              </h2>
              {selectedTrack && (
                <button
                  onClick={() => { setSelectedTrack(null); setTrackFilter('') }}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <X size={12} /> Clear Track Selection
                </button>
              )}
            </div>

            {/* Quick Track Selector Pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {trackGraphData.map((t) => {
                const isSelected = selectedTrack === t.track
                return (
                  <button
                    key={t.track}
                    type="button"
                    onClick={() => handleSelectTrack(t.track)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-white text-navy border-gray-200 hover:border-primary/40 hover:bg-blue-50/40'
                    }`}
                  >
                    {t.track} ({t.totalPrograms})
                  </button>
                )
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <div className="mb-3">
                  <h3 className="text-base font-semibold text-navy">Students, Trainers &amp; Mentors by Track</h3>
                  <p className="text-xs text-muted">Click any bar to inspect that track</p>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={trackGraphData}
                    margin={{ top: 8, right: 12, left: -12, bottom: 4 }}
                    onClick={(state) => {
                      const idx = state?.activeTooltipIndex
                      if (typeof idx === 'number' && trackGraphData[idx]) {
                        handleSelectTrack(trackGraphData[idx].track)
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="shortTrack" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="students" name="Students" fill="#2563EB" radius={[4, 4, 0, 0]} cursor="pointer" />
                    <Bar dataKey="trainers" name="Trainers" fill="#F59E0B" radius={[4, 4, 0, 0]} cursor="pointer" />
                    <Bar dataKey="mentors" name="Mentors" fill="#6366F1" radius={[4, 4, 0, 0]} cursor="pointer" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card>
                <div className="mb-3">
                  <h3 className="text-base font-semibold text-navy">Programs Status by Track</h3>
                  <p className="text-xs text-muted">Active, Completed, and Yet to Start programs</p>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={trackGraphData}
                    margin={{ top: 8, right: 12, left: -12, bottom: 4 }}
                    onClick={(state) => {
                      const idx = state?.activeTooltipIndex
                      if (typeof idx === 'number' && trackGraphData[idx]) {
                        handleSelectTrack(trackGraphData[idx].track)
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="shortTrack" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="active" name="Active" stackId="p" fill="#16A34A" cursor="pointer" />
                    <Bar dataKey="completed" name="Completed" stackId="p" fill="#2563EB" cursor="pointer" />
                    <Bar dataKey="yetToStart" name="Yet to Start" stackId="p" fill="#94A3B8" radius={[4, 4, 0, 0]} cursor="pointer" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </div>
        )
      })()}

      {/* Selected Track Detailed Breakdown */}
      {selectedTrack && activeTrackStats && (
        <Card className="mb-6 border-primary/30">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-navy">{selectedTrack} – Track Breakdown</h3>
              <p className="text-xs text-muted">
                {activeTrackStats.studentsCount} Students · {activeTrackStats.trainersCount} Trainers · {activeTrackStats.mentorsCount} Mentors · {activeTrackStats.totalPrograms} Programs
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="success">Active: {activeTrackStats.activePrograms}</Badge>
              <Badge variant="primary">Completed: {activeTrackStats.completedPrograms}</Badge>
              <Badge variant="muted">Yet to Start: {activeTrackStats.yetToStartPrograms}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Users size={13} className="text-primary" /> Enrolled Interns ({activeTrackStats.interns.length})
              </h4>
              {activeTrackStats.interns.length === 0 ? (
                <p className="text-xs text-muted py-4 bg-surface rounded-lg text-center">No individual intern profiles listed under {selectedTrack} yet.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {activeTrackStats.interns.map(i => (
                    <div key={i.id} className="flex items-center justify-between p-2.5 bg-surface rounded-lg text-xs">
                      <div>
                        <p className="font-medium text-navy">{i.name} <span className="font-mono text-muted">({i.intern_id})</span></p>
                        <p className="text-muted">{i.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="muted">Stage {i.stage}</Badge>
                        <Badge variant={statusToBadgeVariant(i.status)}>
                          {i.status === 'invited' ? 'Yet to Start' : i.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <UserCheck size={13} className="text-navy" /> Assigned Mentors ({activeTrackStats.mentors.length})
              </h4>
              {activeTrackStats.mentors.length === 0 ? (
                <p className="text-xs text-muted py-4 bg-surface rounded-lg text-center">No mentors listed under {selectedTrack} yet.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {activeTrackStats.mentors.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-2.5 bg-surface rounded-lg text-xs">
                      <div>
                        <p className="font-medium text-navy">{m.name} <span className="font-mono text-muted">({m.employee_id})</span></p>
                        <p className="text-muted">{m.designation || m.domain} · {m.email}</p>
                      </div>
                      <Badge variant={statusToBadgeVariant(m.status)}>{m.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Main Programs Table */}
      <Card padding="none">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-gray-100">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search program, code or location…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 w-64"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as BatchStatus | '')}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="inactive">Yet to Start</option>
            </select>
            <select
              value={trackFilter}
              onChange={e => { setTrackFilter(e.target.value); setSelectedTrack(e.target.value || null) }}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All Tracks</option>
              {TRACK_OPTIONS.filter(t => t.value).map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <Button size="sm" icon={<Plus size={14} />} onClick={openCreate}>
            New Program
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Program', 'Track', 'Where Conducted', 'Students', 'Trainers', 'Mentors', 'Dates', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <EmptyState
                      icon={Layers}
                      title="No programs found"
                      description="Add a new SmartBridge program or adjust the filters above."
                      action={<Button size="sm" icon={<Plus size={14} />} onClick={openCreate}>New Program</Button>}
                    />
                  </td>
                </tr>
              ) : (
                filtered.map(program => (
                  <tr
                    key={program.id}
                    onClick={() => program.track && handleSelectTrack(program.track)}
                    className="bg-white hover:bg-surface transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Layers size={15} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-navy">{program.name}</p>
                          <p className="text-xs font-mono text-muted">{program.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {program.track ? <Badge variant="primary">{program.track}</Badge> : '—'}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-navy">
                        <MapPin size={13} className="text-muted flex-shrink-0" />
                        <span>{program.location || 'Online (Virtual)'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-semibold text-navy">{program.total_students ?? 0}</td>
                    <td className="px-4 py-4 font-semibold text-navy">{program.total_trainers ?? 0}</td>
                    <td className="px-4 py-4 font-semibold text-navy">{program.total_mentors ?? 0}</td>
                    <td className="px-4 py-4 text-xs text-muted whitespace-nowrap">
                      {fmt(program.start_date)} – {fmt(program.end_date)}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={batchStatusVariant(program.status)}>
                        {program.status === 'inactive' && <Clock size={11} className="mr-1" />}
                        {programPhaseLabel(program)}
                      </Badge>
                    </td>
                    <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === program.id ? null : program.id)}
                          className="p-1.5 rounded hover:bg-gray-100 text-muted transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openMenuId === program.id && (
                          <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-100 z-20 py-1">
                            <button
                              onClick={() => { openEdit(program); setOpenMenuId(null) }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                            >
                              <Eye size={13} /> View / Edit
                            </button>
                            <button
                              onClick={() => { openEdit(program); setOpenMenuId(null) }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                            >
                              <Edit2 size={13} /> Edit Details
                            </button>
                            <button
                              onClick={() => handleToggleStatus(program)}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 ${program.status === 'active' ? 'text-warning' : 'text-success'}`}
                            >
                              {program.status === 'active'
                                ? <><PowerOff size={13} /> Mark Yet to Start</>
                                : <><Power size={13} /> Activate</>
                              }
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {openMenuId && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
      )}

      {(showCreate || showEdit) && (
        <Modal
          isOpen={showCreate || showEdit}
          onClose={() => { setShowCreate(false); setShowEdit(false) }}
          title={showCreate ? 'Add New SmartBridge Program' : 'Edit Program Details'}
          size="lg"
          footer={
            <>
              <Button variant="outline" onClick={() => { setShowCreate(false); setShowEdit(false) }}>
                Cancel
              </Button>
              <Button loading={saving} onClick={handleSave}>
                {showCreate ? 'Create Program' : 'Save Changes'}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Program Name"
                required
                placeholder="e.g. AI & Cloud – LaunchPad Jan 2026"
                value={form.name}
                onChange={e => setField('name', e.target.value)}
                error={formErrors.name}
              />
              <Input
                label="Program Code"
                required
                placeholder="e.g. LP-AIC-26A"
                value={form.code}
                onChange={e => setField('code', e.target.value)}
                error={formErrors.code}
                hint="Auto-uppercased. Must be unique."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Track"
                options={TRACK_OPTIONS}
                value={form.track}
                onChange={e => setField('track', e.target.value)}
              />
              <Input
                label="Where Program is Conducted"
                required
                placeholder="e.g. Online (Live Virtual) / Hyderabad HQ"
                value={form.location}
                onChange={e => setField('location', e.target.value)}
                error={formErrors.location}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Total Students"
                type="number"
                min="0"
                placeholder="e.g. 120"
                value={form.total_students}
                onChange={e => setField('total_students', e.target.value)}
              />
              <Input
                label="Total Trainers"
                type="number"
                min="0"
                placeholder="e.g. 6"
                value={form.total_trainers}
                onChange={e => setField('total_trainers', e.target.value)}
              />
              <Input
                label="Total Mentors"
                type="number"
                min="0"
                placeholder="e.g. 12"
                value={form.total_mentors}
                onChange={e => setField('total_mentors', e.target.value)}
              />
            </div>
            <Input
              label="Description"
              placeholder="Brief overview of this SmartBridge program…"
              value={form.description}
              onChange={e => setField('description', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={form.start_date}
                onChange={e => setField('start_date', e.target.value)}
              />
              <Input
                label="End Date"
                type="date"
                value={form.end_date}
                onChange={e => setField('end_date', e.target.value)}
              />
            </div>
            <Select
              label="Program Status"
              required
              options={STATUS_OPTIONS}
              value={form.status}
              onChange={e => setField('status', e.target.value as BatchStatus)}
            />
          </div>
        </Modal>
      )}
    </AdminLayout>
  )
}

export default BatchesPage
