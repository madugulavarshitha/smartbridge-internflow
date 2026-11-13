import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Rocket,
  AlertCircle,
  UserCheck,
  ArrowLeft,
  CheckCircle2,
  Users,
  Compass,
  Award,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { jwtAuth } from '../../lib/jwtAuth'

const MentorLoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const [mode, setMode] = useState<'signin' | 'reset'>('signin')
  const [email, setEmail] = useState('mentor@smartbridge.in')
  const [password, setPassword] = useState('Mentor@123')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const emailValidation = email.trim()
    ? jwtAuth.validateEmailForPortal(email, 'mentor', false)
    : null

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (emailValidation && !emailValidation.isValid) {
      setError(emailValidation.message || 'This email is already entered.')
      return
    }
    setLoading(true)
    try {
      const { error: signInErr } = await signIn(email, password, 'mentor')
      if (signInErr) {
        setError(signInErr.message || 'Invalid mentor credentials.')
      } else {
        navigate('/mentor/dashboard')
      }
    } catch {
      setError('An unexpected error occurred during sign in.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex font-sans bg-surface">
      {/* Left Mentor Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0d2b45] flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        <div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-xs font-semibold text-blue-200 hover:text-white transition-colors mb-10 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to SmartBridge Home</span>
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Rocket size={24} className="text-white" />
            </div>
            <div>
              <span className="text-white font-extrabold text-2xl block leading-tight tracking-tight">INTERNFLOW</span>
              <span className="text-blue-200 text-xs font-semibold tracking-wider uppercase">LaunchPad Mentor Workspace</span>
            </div>
          </div>
        </div>

        <div className="my-auto py-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold mb-4 border border-white/10">
            <UserCheck size={13} className="text-primary-light" />
            Cohort Guidance, Reviews &amp; Evaluations
          </span>
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Empower &amp; Elevate<br />Next-Gen Talent
          </h2>
          <p className="text-blue-200 text-sm leading-relaxed mb-8 max-w-md">
            Dedicated workspace for technical mentors to review weekly deliverables, submit stage evaluations, monitor intern KPIs, and build industry readiness across the 24-week LaunchPad framework.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            {[
              { label: 'Assigned Interns', value: 'Active Roster', icon: Users },
              { label: 'Review Stage', value: '4 Milestones', icon: Compass },
              { label: 'Rubric Criteria', value: '5 Dimensions', icon: UserCheck },
              { label: 'Certification', value: 'Exit Gates', icon: Award },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-4 border border-white/5 backdrop-blur-xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <stat.icon size={18} className="text-blue-200" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{stat.value}</p>
                  <p className="text-blue-200 text-[11px]">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-300 text-xs">
          © 2026 SMARTBRIDGE Educational Services Pvt. Ltd. All rights reserved.
        </p>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 overflow-y-auto">
        <div className="flex items-center justify-between max-w-md w-full mx-auto mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-navy transition-colors lg:hidden"
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </button>
          <span className="text-xs font-semibold text-primary ml-auto bg-primary/10 px-2.5 py-1 rounded-full">
            Mentor Portal
          </span>
        </div>

        <div className="w-full max-w-md mx-auto my-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-sm">
                <UserCheck size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-navy leading-tight">Mentor Portal Sign In</h2>
                <p className="text-xs text-muted">Weekly deliverables review, evaluations &amp; guidance</p>
              </div>
            </div>

            {/* Admin Provisioned Notice */}
            <div className="mb-6 p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5">
              <UserCheck size={16} className="text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong className="text-navy font-semibold">Admin Provisioned Access:</strong> Mentor accounts are assigned by the Program Administrator. Sign in using your administrator-provided credentials.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-danger">
                <AlertCircle size={15} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-xs text-success">
                <CheckCircle2 size={15} className="flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {mode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Mentor Email Address
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mentor@smartbridge.in"
                    leftIcon={<Mail size={16} />}
                    required
                  />
                  {emailValidation && !emailValidation.isValid && (
                    <div className="mt-1.5 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-1.5 font-medium">
                      <AlertCircle size={14} className="text-amber-600 shrink-0" />
                      <span>{emailValidation.message}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      leftIcon={<Lock size={16} />}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-navy"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-gray-600">Remember credentials</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-primary hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full justify-center bg-primary hover:bg-primary-dark text-white font-bold py-2.5 shadow-sm"
                >
                  Sign In to Mentor Workspace
                </Button>
              </form>
            )}

            {mode === 'reset' && (
              <div className="space-y-4">
                <p className="text-xs text-muted">
                  Enter your mentor email to receive password reset instructions.
                </p>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mentor@smartbridge.in"
                  leftIcon={<Mail size={16} />}
                />
                <Button
                  onClick={() => {
                    setSuccessMsg('Password reset link sent to ' + email)
                    setMode('signin')
                  }}
                  className="w-full justify-center bg-primary hover:bg-primary-dark text-white font-bold"
                >
                  Send Reset Link
                </Button>
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="w-full text-center text-xs text-primary hover:underline font-semibold"
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="text-center text-xs text-muted">
          LaunchPad 2026–2027 · Production System
        </div>
      </div>
    </div>
  )
}

export default MentorLoginPage
