import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, User, BookOpen, GraduationCap,
  KeyRound, CheckCircle2, UserCheck, Eye,
} from 'lucide-react'
import AdminLayout from '../../../components/layout/AdminLayout'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Card from '../../../components/ui/Card'
import Select from '../../../components/ui/Select'
import Modal from '../../../components/ui/Modal'
import { supabase, isSupabaseConfigured } from '../../../lib/supabase'
import { useAuth } from '../../../contexts/AuthContext'
import { accountService, type ProvisionedAccount } from '../../../lib/accountService'
import type { Intern } from '../../../types'

interface InternFormData {
  full_name: string
  email: string
  phone: string
  intern_id: string
  track: string
  batch_id: string
  joining_date: string
  college: string
  degree: string
  branch: string
  grad_year: string
  skills: string
  experience: string
  status: 'invited' | 'active' | 'on_hold'
  assigned_mentor_id: string
  password: string
  notes: string
}

const INITIAL: InternFormData = {
  full_name: '',
  email: '',
  phone: '',
  intern_id: '',
  track: 'AI & Cloud',
  batch_id: '',
  joining_date: new Date().toISOString().slice(0, 10),
  college: '',
  degree: 'B.Tech',
  branch: 'CSE',
  grad_year: '2026',
  skills: '',
  experience: '',
  status: 'active',
  assigned_mentor_id: '',
  password: 'Intern@123',
  notes: '',
}

const TRACKS = [
  { value: 'AI & Cloud', label: 'AI & Cloud' },
  { value: 'Salesforce', label: 'Salesforce' },
  { value: 'Software Engineering', label: 'Software Engineering' },
  { value: 'IoT & Robotics', label: 'IoT & Robotics' },
  { value: 'ServiceNow', label: 'ServiceNow' },
  { value: 'Business Intelligence', label: 'Business Intelligence' },
]

const DEGREES = [
  { value: 'B.Tech', label: 'B.Tech' },
  { value: 'B.E.', label: 'B.E.' },
  { value: 'M.Tech', label: 'M.Tech' },
  { value: 'MCA', label: 'MCA' },
  { value: 'BCA', label: 'BCA' },
  { value: 'B.Sc', label: 'B.Sc (CS/IT)' },
]

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active (Direct Access)' },
  { value: 'invited', label: 'Invited (Pending Activation)' },
  { value: 'on_hold', label: 'On Hold' },
]

const AddInternPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [form, setForm] = useState<InternFormData>(INITIAL)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [batchOptions, setBatchOptions] = useState<Array<{ value: string; label: string }>>([])
  const [mentorOptions, setMentorOptions] = useState<Array<{ value: string; label: string }>>([])
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [createdResult, setCreatedResult] = useState<{ intern: Intern; account: ProvisionedAccount } | null>(null)

  useEffect(() => {
    // Load batches
    void (async () => {
      try {
        const { data } = await supabase.from('batches').select('id, name, code').eq('status', 'active')
        if (data && data.length > 0) {
          setBatchOptions(
            data.map((b: { id: string; name: string; code: string }) => ({
              value: b.id,
              label: `${b.name} (${b.code})`,
            }))
          )
        } else {
          setBatchOptions([
            { value: 'b1', label: 'LaunchPad 2026-A' },
            { value: 'b2', label: 'LaunchPad 2026-B' },
          ])
        }
      } catch {
        setBatchOptions([
          { value: 'b1', label: 'LaunchPad 2026-A' },
          { value: 'b2', label: 'LaunchPad 2026-B' },
        ])
      }
    })()

    // Load active mentors for assignment
    const mentors = accountService.getMentors().filter((m) => m.status === 'active')
    setMentorOptions([
      { value: '', label: 'None (Assign Later)' },
      ...mentors.map((m) => ({
        value: m.id,
        label: `${m.profile?.full_name ?? 'Mentor'} (${m.domain ?? m.department ?? 'Track'})`,
      })),
    ])
  }, [])

  const set = (field: keyof InternFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!form.full_name.trim()) newErrors.full_name = 'Full name is required'
    if (!form.email.trim()) newErrors.email = 'Email address is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = 'Enter a valid email address'
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\+?[0-9\s-]{10,15}$/.test(form.phone.trim().replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Enter a valid phone number (at least 10 digits)'
    }

    if (!form.intern_id.trim()) newErrors.intern_id = 'Intern ID is required'
    if (!form.college.trim()) newErrors.college = 'College or institution name is required'
    if (!form.branch.trim()) newErrors.branch = 'Department or branch is required'

    if (form.grad_year && (Number(form.grad_year) < 2015 || Number(form.grad_year) > 2035)) {
      newErrors.grad_year = 'Enter a valid graduation year (2015–2035)'
    }

    if (form.password && form.password.length < 6) {
      newErrors.password = 'Initial password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setSubmitError('')

    try {
      // 1. Check existing records in Supabase (if online) and in accountService
      const emailClean = form.email.trim().toLowerCase()
      const internIdClean = form.intern_id.trim()

      if (isSupabaseConfigured) {
        const [{ data: existingEmail }, { data: existingId }] = await Promise.all([
          supabase.from('profiles').select('id').eq('email', emailClean).maybeSingle(),
          supabase.from('interns').select('id').eq('intern_id', internIdClean).maybeSingle(),
        ])
        if (existingEmail) {
          throw new Error(`An account with email "${emailClean}" already exists.`)
        }
        if (existingId) {
          throw new Error(`An intern with ID "${internIdClean}" already exists.`)
        }
      }

      // 2. Add intern via accountService (handles validation, storage persistence & Supabase sync)
      const res = accountService.addIntern({
        fullName: form.full_name,
        email: form.email,
        phone: form.phone,
        internId: form.intern_id,
        track: form.track,
        batchId: form.batch_id || undefined,
        joiningDate: form.joining_date,
        college: form.college,
        degree: form.degree,
        branch: form.branch,
        gradYear: form.grad_year ? parseInt(form.grad_year, 10) : undefined,
        skills: form.skills,
        experience: form.experience,
        status: form.status,
        assignedMentorId: form.assigned_mentor_id || undefined,
        password: form.password || 'Intern@123',
      })

      // 3. Log audit event
      if (user) {
        try {
          await supabase
            .from('audit_logs')
            .insert({
              actor_id: user.id,
              actor_role: profile?.role ?? 'admin',
              action: 'intern.created',
              entity_type: 'intern',
              entity_id: res.intern.id,
              after_value: { intern_id: form.intern_id, email: form.email, track: form.track },
            })
        } catch {
          // ignore audit error in offline mode
        }
      }

      setCreatedResult(res)
    } catch (err) {
      const e = err as Error
      setSubmitError(e.message || 'Failed to create intern account.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetForm = () => {
    setForm({
      ...INITIAL,
      intern_id: `INT-${Math.floor(100 + Math.random() * 900)}`,
    })
    setCreatedResult(null)
    setErrors({})
    setSubmitError('')
  }

  return (
    <AdminLayout title="Add Intern" subtitle="Register, provision, and invite a new intern to LaunchPad">
      <div className="max-w-3xl">
        <button
          onClick={() => navigate('/admin/interns')}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-navy mb-5 transition-colors"
        >
          <ArrowLeft size={15} /> Back to Interns
        </button>

        <form onSubmit={handleSubmit} className="space-y-5">
          {submitError && (
            <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-sm text-danger">
              {submitError}
            </div>
          )}

          {/* Personal Information */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <User size={18} className="text-primary" />
              <h3 className="font-semibold text-navy">Personal Details</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={form.full_name}
                onChange={(e) => set('full_name', e.target.value)}
                error={errors.full_name}
                required
                placeholder="e.g. Rahul Sharma"
              />
              <Input
                label="Email Address"
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                error={errors.email}
                required
                placeholder="intern@smartbridge.in"
                hint="Used as login username and invitation destination."
              />
              <Input
                label="Phone Number"
                type="tel"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                error={errors.phone}
                required
                placeholder="+91 98765 43210"
              />
              <Input
                label="Intern ID"
                value={form.intern_id}
                onChange={(e) => set('intern_id', e.target.value)}
                error={errors.intern_id}
                required
                placeholder="e.g. INT-007"
              />
            </div>
          </Card>

          {/* Academic Details */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap size={18} className="text-primary" />
              <h3 className="font-semibold text-navy">Academic Details</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="College / Institution"
                value={form.college}
                onChange={(e) => set('college', e.target.value)}
                error={errors.college}
                required
                placeholder="e.g. VIT Vellore"
              />
              <Select
                label="Qualification / Degree"
                options={DEGREES}
                value={form.degree}
                onChange={(e) => set('degree', e.target.value)}
              />
              <Input
                label="Department / Branch"
                value={form.branch}
                onChange={(e) => set('branch', e.target.value)}
                error={errors.branch}
                required
                placeholder="e.g. Computer Science & Engineering"
              />
              <Input
                label="Graduation Year"
                type="number"
                value={form.grad_year}
                onChange={(e) => set('grad_year', e.target.value)}
                error={errors.grad_year}
                placeholder="2026"
                min="2015"
                max="2035"
              />
            </div>
          </Card>

          {/* Program & Mentor Details */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={18} className="text-primary" />
              <h3 className="font-semibold text-navy">Program &amp; Mentor Details</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Track / Domain"
                options={TRACKS}
                value={form.track}
                onChange={(e) => set('track', e.target.value)}
              />
              <Select
                label="Batch"
                options={batchOptions}
                value={form.batch_id}
                onChange={(e) => set('batch_id', e.target.value)}
                placeholder="Select batch (optional)"
              />
              <Input
                label="Joining Date"
                type="date"
                value={form.joining_date}
                onChange={(e) => set('joining_date', e.target.value)}
              />
              <Select
                label="Program Status"
                options={STATUS_OPTIONS}
                value={form.status}
                onChange={(e) => set('status', e.target.value as 'invited' | 'active' | 'on_hold')}
              />
              <div className="sm:col-span-2">
                <Select
                  label="Assigned Mentor (Optional)"
                  options={mentorOptions}
                  value={form.assigned_mentor_id}
                  onChange={(e) => set('assigned_mentor_id', e.target.value)}
                  hint="Select an active mentor now or assign from Assignments page later."
                />
              </div>
            </div>
          </Card>

          {/* Technical Skills & Professional Details */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <UserCheck size={18} className="text-primary" />
              <h3 className="font-semibold text-navy">Professional Details &amp; Skills</h3>
            </div>
            <div className="space-y-4">
              <Input
                label="Technical Skills (comma-separated)"
                value={form.skills}
                onChange={(e) => set('skills', e.target.value)}
                placeholder="e.g. Python, AWS, Docker, React, PostgreSQL"
              />
              <Input
                label="Relevant Experience (if applicable)"
                value={form.experience}
                onChange={(e) => set('experience', e.target.value)}
                placeholder="e.g. 6-month college project on Cloud Telemetry, Hackathon winner"
              />
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Administrative Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  placeholder="Internal notes regarding onboarding, verification, or preferences..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
            </div>
          </Card>

          {/* Account Provisioning & Password */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <KeyRound size={18} className="text-primary" />
              <h3 className="font-semibold text-navy">Account Provisioning &amp; Login Credentials</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Initial Account Password"
                type="text"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                error={errors.password}
                required
                placeholder="Intern@123"
                hint="Intern can log in with this password from the Login page or reset it."
              />
              <div className="flex flex-col justify-center">
                <p className="text-xs font-semibold text-navy mb-1">Activation Status</p>
                <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 text-xs text-navy">
                  Account will be provisioned with role <strong>Intern</strong> and routed to <strong>/intern/dashboard</strong> upon sign in.
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/interns')}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} icon={<CheckCircle2 size={15} />}>
              Create &amp; Provision Intern Account
            </Button>
          </div>
        </form>
      </div>

      {/* Success Modal with Credentials & Direct Navigation */}
      <Modal
        isOpen={!!createdResult}
        onClose={() => navigate('/admin/interns')}
        title="Intern Account Created Successfully"
        size="md"
      >
        {createdResult && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
              <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-navy">Account Provisioned!</p>
                <p className="text-xs text-emerald-800 mt-0.5">
                  The intern profile has been registered and their individual authentication account has been provisioned.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Full Name:</span>
                <strong className="text-navy">{createdResult.intern.profile?.full_name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Intern ID:</span>
                <strong className="text-navy font-mono">{createdResult.intern.intern_id}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Login Email:</span>
                <strong className="text-primary">{createdResult.account.email}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Initial Password:</span>
                <strong className="text-navy font-mono">{createdResult.account.password}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Track:</span>
                <span className="font-semibold text-navy">{createdResult.intern.track}</span>
              </div>
              {createdResult.intern.mentor && (
                <div className="flex justify-between">
                  <span className="text-muted">Assigned Mentor:</span>
                  <span className="font-semibold text-emerald-700">
                    {createdResult.intern.mentor.profile?.full_name}
                  </span>
                </div>
              )}
            </div>

            <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100 text-xs text-navy">
              💡 <strong>Login Tip:</strong> The intern can immediately log in from the login page (`/login`) with their email and password, which directs them straight to the Intern Portal (`/intern/dashboard`).
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <Button type="button" variant="outline" size="sm" onClick={handleResetForm}>
                Add Another Intern
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                icon={<Eye size={14} />}
                onClick={() => navigate(`/admin/interns/${createdResult.intern.id}`)}
              >
                View Profile
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  )
}

export default AddInternPage
