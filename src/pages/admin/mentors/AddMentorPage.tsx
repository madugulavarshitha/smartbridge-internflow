import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Briefcase,
  KeyRound,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react'
import AdminLayout from '../../../components/layout/AdminLayout'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Card from '../../../components/ui/Card'
import Select from '../../../components/ui/Select'
import { accountService, type Mentor, type ProvisionedAccount } from '../../../lib/accountService'

interface MentorFormData {
  full_name: string
  email: string
  phone: string
  employee_id: string
  department: string
  domain: string
  designation: string
  expertise: string
  status: 'active' | 'inactive'
  password: string
}

const INITIAL: MentorFormData = {
  full_name: '',
  email: '',
  phone: '',
  employee_id: '',
  department: '',
  domain: 'AI & Cloud',
  designation: '',
  expertise: '',
  status: 'active',
  password: 'Mentor@123',
}

const DOMAINS = [
  { value: 'AI & Cloud', label: 'AI & Cloud' },
  { value: 'Salesforce', label: 'Salesforce' },
  { value: 'Software Engineering', label: 'Software Engineering' },
  { value: 'IoT & Robotics', label: 'IoT & Robotics' },
  { value: 'ServiceNow', label: 'ServiceNow' },
  { value: 'Business Intelligence', label: 'Business Intelligence' },
]

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active (Direct Login Access)' },
  { value: 'inactive', label: 'Inactive' },
]

const AddMentorPage: React.FC = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState<MentorFormData>(INITIAL)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [copied, setCopied] = useState(false)
  const [createdResult, setCreatedResult] = useState<{ mentor: Mentor; account: ProvisionedAccount } | null>(null)

  const set = (field: keyof MentorFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!form.full_name.trim()) newErrors.full_name = 'Full name is required'
    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = 'Enter a valid email address'
    }

    if (form.phone.trim()) {
      const cleanPhone = form.phone.replace(/[\s-]/g, '')
      if (!/^\+?[0-9]{10,13}$/.test(cleanPhone)) {
        newErrors.phone = 'Enter a valid 10-digit phone number'
      }
    }

    if (!form.employee_id.trim()) {
      newErrors.employee_id = 'Employee ID is required (e.g. EMP-007)'
    }

    if (!form.designation.trim()) {
      newErrors.designation = 'Designation is required'
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
      const result = accountService.addMentor({
        fullName: form.full_name,
        email: form.email,
        phone: form.phone,
        employeeId: form.employee_id,
        department: form.department || 'Technology',
        domain: form.domain,
        designation: form.designation,
        expertise: form.expertise,
        status: form.status,
        password: form.password || 'Mentor@123',
      })

      setCreatedResult(result)
    } catch (err) {
      const e = err as Error
      setSubmitError(e.message || 'Failed to register mentor account.')
    } finally {
      setLoading(false)
    }
  }

  const copyCredentials = () => {
    if (!createdResult) return
    const text = `SmartBridge InternFlow - Mentor Account Credentials\nName: ${createdResult.mentor.profile?.full_name}\nRole: Mentor\nPortal: Mentor Portal\nEmail: ${createdResult.account.email}\nInitial Password: ${createdResult.account.password}\nLogin URL: ${window.location.origin}/login`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <AdminLayout title="Add Mentor" subtitle="Register and provision a mentor in the LaunchPad program">
      <div className="max-w-3xl">
        <button
          onClick={() => navigate('/admin/mentors')}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-navy mb-5 transition-colors"
        >
          <ArrowLeft size={15} /> Back to Mentors
        </button>

        {submitError && (
          <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-danger flex items-start gap-3">
            <ShieldAlert size={18} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Creation Failed</p>
              <p>{submitError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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
                onChange={e => set('full_name', e.target.value)}
                error={errors.full_name}
                required
                placeholder="e.g. Dr. Ramesh Babu"
              />
              <Input
                label="Email Address"
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                error={errors.email}
                required
                placeholder="mentor@smartbridge.in"
                hint="Used for login and notifications"
              />
              <Input
                label="Phone Number"
                type="tel"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                error={errors.phone}
                placeholder="+91 98765 43210"
              />
              <Input
                label="Employee ID"
                value={form.employee_id}
                onChange={e => set('employee_id', e.target.value)}
                error={errors.employee_id}
                required
                placeholder="e.g. EMP-007"
              />
            </div>
          </Card>

          {/* Professional Details */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Briefcase size={18} className="text-primary" />
              <h3 className="font-semibold text-navy">Professional Information & Domain</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Primary Domain / Track"
                options={DOMAINS}
                value={form.domain}
                onChange={e => set('domain', e.target.value)}
              />
              <Input
                label="Designation"
                value={form.designation}
                onChange={e => set('designation', e.target.value)}
                error={errors.designation}
                required
                placeholder="e.g. Senior Solutions Architect"
              />
              <Input
                label="Department"
                value={form.department}
                onChange={e => set('department', e.target.value)}
                placeholder="e.g. Enterprise AI Division"
              />
              <Select
                label="Account Status"
                options={STATUS_OPTIONS}
                value={form.status}
                onChange={e => set('status', e.target.value as 'active' | 'inactive')}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Technical Expertise & Skills (comma-separated)"
                  value={form.expertise}
                  onChange={e => set('expertise', e.target.value)}
                  placeholder="e.g. Python, TensorFlow, Azure AI, Docker, Kubernetes"
                  hint="These tags help match mentors with relevant tracks and interns"
                />
              </div>
            </div>
          </Card>

          {/* Provisioning & Login Credentials */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <KeyRound size={18} className="text-primary" />
              <h3 className="font-semibold text-navy">Account Provisioning & Security</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Initial Account Password"
                type="text"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder="Mentor@123"
                hint="Mentor can log in immediately from the common login page"
              />
              <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 flex flex-col justify-center text-xs text-blue-900">
                <p className="font-semibold mb-1">Seamless Multi-Role Access</p>
                <p className="text-blue-700 leading-relaxed">
                  Upon submission, this account is securely provisioned. The mentor can sign in directly at{' '}
                  <code className="bg-white/80 px-1 py-0.5 rounded font-mono">/login</code> and will automatically land on the Mentor Dashboard.
                </p>
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/mentors')}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create & Provision Mentor Account
            </Button>
          </div>
        </form>

        {/* Success Modal */}
        {createdResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 text-emerald-600 mb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 size={26} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy">Mentor Account Created Successfully!</h3>
                  <p className="text-xs text-muted">Profile and login credentials have been provisioned</p>
                </div>
              </div>

              <div className="bg-surface rounded-xl p-4 border border-gray-100 text-xs space-y-2 mb-4 font-mono">
                <div className="flex justify-between py-1 border-b border-gray-200/60">
                  <span className="text-muted">Mentor Name:</span>
                  <span className="font-semibold text-navy">{createdResult.mentor.profile?.full_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200/60">
                  <span className="text-muted">Employee ID:</span>
                  <span className="font-semibold text-navy">{createdResult.mentor.employee_id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200/60">
                  <span className="text-muted">Domain / Track:</span>
                  <span className="font-semibold text-primary">{createdResult.mentor.domain}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200/60">
                  <span className="text-muted">Login Email:</span>
                  <span className="font-semibold text-navy">{createdResult.account.email}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted">Initial Password:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {createdResult.account.password}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 mb-5">
                <p className="font-semibold">Ready for Login:</p>
                <p className="text-amber-800 mt-0.5">
                  The mentor can now log in at <strong>/login</strong> using these credentials. Their dashboard will display all assigned interns and evaluations.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <Button
                  variant="outline"
                  className="flex-1 text-xs"
                  icon={<Copy size={14} />}
                  onClick={copyCredentials}
                >
                  {copied ? 'Copied to Clipboard!' : 'Copy Credentials'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => {
                    setCreatedResult(null)
                    setForm(INITIAL)
                  }}
                >
                  Add Another Mentor
                </Button>
                <Button
                  className="flex-1 text-xs"
                  icon={<ExternalLink size={14} />}
                  onClick={() => navigate(`/admin/mentors/${createdResult.mentor.id}`)}
                >
                  View Profile
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AddMentorPage
