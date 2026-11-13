import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Rocket,
  AlertCircle,
  User,
  Shield,
  UserCheck,
  GraduationCap,
  ArrowLeft,
  Building,
  Briefcase,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { accountService } from '../../lib/accountService'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'

type AuthMode = 'signin' | 'signup' | 'reset'
type RoleType = 'admin' | 'mentor' | 'intern'

const STANDARD_TRACKS = [
  { value: 'AI & Cloud', label: 'AI & Cloud' },
  { value: 'Salesforce', label: 'Salesforce' },
  { value: 'Software Engineering', label: 'Software Engineering' },
  { value: 'IoT & Robotics', label: 'IoT & Robotics' },
  { value: 'ServiceNow', label: 'ServiceNow' },
  { value: 'Business Intelligence', label: 'Business Intelligence' },
]

const LoginPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialRole = (searchParams.get('role') as RoleType) || 'admin'

  const [role, setRole] = useState<RoleType>(initialRole)
  const [mode, setMode] = useState<AuthMode>('signin')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState(
    initialRole === 'admin'
      ? 'admin@smartbridge.in'
      : initialRole === 'mentor'
      ? 'mentor@smartbridge.in'
      : 'intern@smartbridge.in'
  )
  const [password, setPassword] = useState(
    initialRole === 'admin' ? 'Password@123' : initialRole === 'mentor' ? 'Mentor@123' : 'Intern@123'
  )
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  // Extra signup fields
  const [college, setCollege] = useState('')
  const [track, setTrack] = useState('AI & Cloud')
  const [designation, setDesignation] = useState('')

  const { signIn, signUp, signInDemo, resetPassword } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const r = (searchParams.get('role') as RoleType) || 'admin'
    if (['admin', 'mentor', 'intern'].includes(r)) {
      setRole(r)
      if (r === 'admin') {
        setEmail('admin@smartbridge.in')
        setPassword('Password@123')
      } else if (r === 'mentor') {
        setEmail('mentor@smartbridge.in')
        setPassword('Mentor@123')
      } else {
        setEmail('intern@smartbridge.in')
        setPassword('Intern@123')
      }
    }
  }, [searchParams])

  const handleRoleChange = (newRole: RoleType) => {
    setRole(newRole)
    setSearchParams({ role: newRole })
    if (newRole === 'admin') {
      setEmail('admin@smartbridge.in')
      setPassword('Password@123')
    } else if (newRole === 'mentor') {
      setEmail('mentor@smartbridge.in')
      setPassword('Mentor@123')
    } else {
      setEmail('intern@smartbridge.in')
      setPassword('Intern@123')
    }
    setError('')
    setSuccessMsg('')
  }

  const switchMode = (next: AuthMode) => {
    setMode(next)
    setError('')
    setSuccessMsg('')
    setResetSent(false)
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: signInErr, role: userRole } = await signIn(email, password, role)
      if (signInErr) {
        setError(signInErr.message || 'Invalid email or password.')
      } else {
        const effectiveRole = userRole || role
        const target = effectiveRole === 'mentor' ? '/mentor/dashboard' : effectiveRole === 'intern' ? '/intern/dashboard' : '/admin'
        navigate(target)
      }
    } catch {
      setError('An unexpected error occurred during sign in.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!fullName.trim()) {
      setError('Full name is required.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      if (role === 'intern') {
        const randomId = `INT-${Math.floor(100 + Math.random() * 900)}`
        accountService.addIntern({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: '',
          internId: randomId,
          track: track,
          college: college.trim() || 'Engineering College',
          degree: 'B.Tech',
          branch: 'CSE',
          gradYear: 2026,
          status: 'active',
          password: password,
        })
        signInDemo(email.trim(), fullName.trim(), 'intern')
        navigate('/intern/dashboard')
      } else if (role === 'mentor') {
        const randomEmpId = `EMP-${Math.floor(100 + Math.random() * 900)}`
        accountService.addMentor({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: '',
          employeeId: randomEmpId,
          department: 'Engineering',
          domain: track,
          designation: designation.trim() || 'Technical Mentor',
          status: 'active',
          password: password,
        })
        signInDemo(email.trim(), fullName.trim(), 'mentor')
        navigate('/mentor/dashboard')
      } else {
        const { error: signUpErr } = await signUp(email, password, fullName.trim())
        if (signUpErr) {
          setError(signUpErr.message || 'Unable to register account.')
        } else {
          signInDemo(email.trim(), fullName.trim(), 'admin')
          navigate('/admin')
        }
      }
    } catch (err) {
      const e = err as Error
      setError(e.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: rErr } = await resetPassword(email)
      if (rErr) setError(rErr.message)
      else setResetSent(true)
    } catch {
      setError('Unable to send password reset email.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoSignIn = (selectedRole: RoleType) => {
    if (selectedRole === 'admin') {
      signInDemo('admin@smartbridge.in', 'Program Administrator', 'admin')
      navigate('/admin')
    } else if (selectedRole === 'mentor') {
      signInDemo('mentor1@smartbridge.in', 'Dr. Ramesh Babu', 'mentor')
      navigate('/mentor/dashboard')
    } else {
      signInDemo('rahul@example.com', 'Rahul Sharma', 'intern')
      navigate('/intern/dashboard')
    }
  }

  const roleMeta = {
    admin: {
      title: 'Admin Portal',
      subtitle: 'Cohort operations, intern/mentor creation & analytics',
      icon: Shield,
      emailPlaceholder: 'admin@smartbridge.in',
      badgeClass: 'bg-navy text-white',
    },
    mentor: {
      title: 'Mentor Portal',
      subtitle: 'Assigned interns, stage reviews & technical guidance',
      icon: UserCheck,
      emailPlaceholder: 'mentor@smartbridge.in',
      badgeClass: 'bg-primary text-white',
    },
    intern: {
      title: 'Intern Portal',
      subtitle: 'Dedicated mentor, 24-week stage roadmap & tasks',
      icon: GraduationCap,
      emailPlaceholder: 'intern@smartbridge.in',
      badgeClass: 'bg-emerald-600 text-white',
    },
  }[role]

  const RoleIcon = roleMeta.icon

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left Branding Panel (Identical Admin Navy Reference) */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy flex-col justify-between p-12">
        <div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-xs font-semibold text-blue-200 hover:text-white transition-colors mb-10 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to SmartBridge Home</span>
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <Rocket size={22} className="text-white" />
            </div>
            <div>
              <span className="text-white font-extrabold text-xl block leading-tight tracking-tight">INTERNFLOW</span>
              <span className="text-blue-200 text-xs font-medium">SmartBridge LaunchPad Platform</span>
            </div>
          </div>
        </div>

        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold mb-4">
            Academic Year 2026–2027
          </span>
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Accelerating<br />Intern Excellence
          </h2>
          <p className="text-blue-200 text-base leading-relaxed mb-8 max-w-md">
            One application connecting students, enterprise mentors, and academic administrators across 24 weeks of experiential learning.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            {[
              { label: 'Active Interns', value: '855+' },
              { label: 'Program Stages', value: '4 Stages' },
              { label: 'KPI Framework', value: 'L-B-S-S' },
              { label: 'Duration', value: '24 Weeks' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-4 border border-white/5">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-blue-200 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-300 text-xs">
          © 2026 SMARTBRIDGE Educational Services Pvt. Ltd. All rights reserved.
        </p>
      </div>

      {/* Right Login / Register Panel */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 bg-surface overflow-y-auto">
        <div className="flex items-center justify-between max-w-md w-full mx-auto mb-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-navy transition-colors lg:hidden"
          >
            <ArrowLeft size={14} /> Back to Home
          </button>
          <span className="text-xs text-muted ml-auto">LaunchPad 2026–2027</span>
        </div>

        <div className="w-full max-w-md mx-auto my-auto">
          {/* Three Role Selector Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-gray-200/70 rounded-xl mb-5">
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg transition-all ${
                role === 'admin'
                  ? 'bg-navy text-white shadow-sm'
                  : 'text-slate-600 hover:text-navy hover:bg-white/50'
              }`}
            >
              <Shield size={14} />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('mentor')}
              className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg transition-all ${
                role === 'mentor'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-600 hover:text-navy hover:bg-white/50'
              }`}
            >
              <UserCheck size={14} />
              <span>Mentor</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('intern')}
              className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg transition-all ${
                role === 'intern'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-navy hover:bg-white/50'
              }`}
            >
              <GraduationCap size={14} />
              <span>Intern</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            {/* Header info for selected role */}
            <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${roleMeta.badgeClass}`}>
                  <RoleIcon size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-navy leading-tight">{roleMeta.title}</h2>
                  <p className="text-xs text-muted">{roleMeta.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Mode switch (Sign In / Sign Up) */}
            {mode !== 'reset' && (
              <div className="grid grid-cols-2 gap-1 p-1 bg-surface rounded-lg mb-6">
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className={`py-2 text-xs font-bold rounded-md transition-colors ${
                    mode === 'signin' ? 'bg-white text-navy shadow-xs' : 'text-muted hover:text-navy'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className={`py-2 text-xs font-bold rounded-md transition-colors ${
                    mode === 'signup' ? 'bg-white text-navy shadow-xs' : 'text-muted hover:text-navy'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Error & Success alerts */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 mb-4 text-xs text-danger">
                <AlertCircle size={15} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2.5 mb-4 text-xs text-emerald-700">
                {successMsg}
              </div>
            )}

            {/* SIGN IN FORM */}
            {mode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail size={16} />}
                  placeholder={roleMeta.emailPlaceholder}
                  required
                />
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock size={16} />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="pointer-events-auto text-muted hover:text-navy"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                  placeholder="••••••••"
                  required
                />

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => switchMode('reset')}
                    className="text-primary hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" fullWidth loading={loading} size="lg">
                  Sign In to {roleMeta.title}
                </Button>
              </form>
            )}

            {/* SIGN UP FORM */}
            {mode === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-3.5">
                <Input
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  leftIcon={<User size={16} />}
                  placeholder="Your full name"
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail size={16} />}
                  placeholder={roleMeta.emailPlaceholder}
                  required
                />

                {role === 'intern' && (
                  <>
                    <Input
                      label="College / Institution"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      leftIcon={<Building size={16} />}
                      placeholder="e.g. VIT / JNTU / IIIT"
                      required
                    />
                    <Select
                      label="Program Track"
                      options={STANDARD_TRACKS}
                      value={track}
                      onChange={(e) => setTrack(e.target.value)}
                    />
                  </>
                )}

                {role === 'mentor' && (
                  <>
                    <Input
                      label="Designation"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      leftIcon={<Briefcase size={16} />}
                      placeholder="e.g. Senior Software Architect"
                      required
                    />
                    <Select
                      label="Domain Expertise"
                      options={STANDARD_TRACKS}
                      value={track}
                      onChange={(e) => setTrack(e.target.value)}
                    />
                  </>
                )}

                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock size={16} />}
                  placeholder="At least 6 characters"
                  required
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  leftIcon={<Lock size={16} />}
                  placeholder="Repeat password"
                  required
                />

                <Button type="submit" fullWidth loading={loading} size="lg">
                  Create {roleMeta.title} Account
                </Button>
              </form>
            )}

            {/* RESET PASSWORD */}
            {mode === 'reset' && (
              <div>
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="flex items-center gap-1 text-xs text-muted hover:text-navy mb-4"
                >
                  <ArrowLeft size={13} /> Back to Sign In
                </button>
                <h3 className="font-bold text-navy text-base mb-1">Reset Password</h3>
                <p className="text-xs text-muted mb-4">
                  Enter your email address to receive password reset instructions.
                </p>
                {resetSent ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-2">
                    <p className="font-bold">Reset link dispatched</p>
                    <p>Check your email for instructions to reset your password.</p>
                  </div>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <Input
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Button type="submit" fullWidth loading={loading}>
                      Send Reset Link
                    </Button>
                  </form>
                )}
              </div>
            )}

            {/* Quick Demo Preview Switcher */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2 text-center">
                Instant Role Demo Access
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoSignIn('admin')}
                  className="py-1.5 px-2 rounded-lg bg-navy/5 hover:bg-navy hover:text-white text-navy font-bold text-xs transition-colors"
                >
                  Admin View
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoSignIn('mentor')}
                  className="py-1.5 px-2 rounded-lg bg-primary/10 hover:bg-primary hover:text-white text-primary font-bold text-xs transition-colors"
                >
                  Mentor View
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoSignIn('intern')}
                  className="py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-bold text-xs transition-colors"
                >
                  Intern View
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-muted mt-6">
          Need assistance? Contact <a href="mailto:support@smartbridge.in" className="text-primary hover:underline">support@smartbridge.in</a>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
