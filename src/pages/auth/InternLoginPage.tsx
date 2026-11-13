import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Rocket,
  AlertCircle,
  GraduationCap,
  ArrowLeft,
  CheckCircle2,
  Layers,
  Award,
  CheckSquare,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { jwtAuth } from '../../lib/jwtAuth'

const InternLoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const [mode, setMode] = useState<'signin' | 'reset'>('signin')
  const [email, setEmail] = useState('intern@smartbridge.in')
  const [password, setPassword] = useState('Intern@123')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const emailValidation = email.trim()
    ? jwtAuth.validateEmailForPortal(email, 'intern', false)
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
      const { error: signInErr } = await signIn(email, password, 'intern')
      if (signInErr) {
        setError(signInErr.message || 'Invalid intern credentials.')
      } else {
        navigate('/intern/dashboard')
      }
    } catch {
      setError('An unexpected error occurred during sign in.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex font-sans bg-surface">
      {/* Left Intern Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0c392c] flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-xs font-semibold text-emerald-200 hover:text-white transition-colors mb-10 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to SmartBridge Home</span>
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Rocket size={24} className="text-white" />
            </div>
            <div>
              <span className="text-white font-extrabold text-2xl block leading-tight tracking-tight">INTERNFLOW</span>
              <span className="text-emerald-200 text-xs font-semibold tracking-wider uppercase">LaunchPad Intern Learning Hub</span>
            </div>
          </div>
        </div>

        <div className="my-auto py-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold mb-4 border border-white/10">
            <GraduationCap size={13} className="text-emerald-300" />
            24-Week Stage Journey &amp; Milestones
          </span>
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Transform Into<br />an Industry Pro
          </h2>
          <p className="text-emerald-200 text-sm leading-relaxed mb-8 max-w-md">
            Your personalized internship portal: work through real-world technology tracks, submit verified deliverables, receive feedback from assigned mentors, and unlock Week 12 and Week 24 industry certifications.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            {[
              { label: '4 Stages', value: 'Learner → Pro', icon: Layers },
              { label: 'Deliverables', value: 'Weekly Tasks', icon: CheckSquare },
              { label: 'Mentorship', value: 'Direct Reviews', icon: GraduationCap },
              { label: 'Certification', value: 'Dual Milestone', icon: Award },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-4 border border-white/5 backdrop-blur-xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <stat.icon size={18} className="text-emerald-200" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{stat.value}</p>
                  <p className="text-emerald-200 text-[11px]">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-emerald-300 text-xs">
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
          <span className="text-xs font-semibold text-emerald-700 ml-auto bg-emerald-50 px-2.5 py-1 rounded-full">
            Intern Hub
          </span>
        </div>

        <div className="w-full max-w-md mx-auto my-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
                <GraduationCap size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-navy leading-tight">Intern Portal Sign In</h2>
                <p className="text-xs text-muted">Dedicated mentor, 24-week stage roadmap &amp; tasks</p>
              </div>
            </div>

            {/* Admin Provisioned Notice */}
            <div className="mb-6 p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-2.5">
              <GraduationCap size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong className="text-navy font-semibold">Admin Provisioned Account:</strong> Intern enrollment accounts are created and distributed by the Program Administrator. Sign in using your administrator-provided credentials.
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
                    Intern Email Address
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="intern@smartbridge.in"
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
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-600"
                    />
                    <span className="text-gray-600">Remember credentials</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-emerald-700 hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 shadow-sm"
                >
                  Sign In to Intern Hub
                </Button>
              </form>
            )}

            {mode === 'reset' && (
              <div className="space-y-4">
                <p className="text-xs text-muted">
                  Enter your intern email to receive password reset instructions.
                </p>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="intern@smartbridge.in"
                  leftIcon={<Mail size={16} />}
                />
                <Button
                  onClick={() => {
                    setSuccessMsg('Password reset link sent to ' + email)
                    setMode('signin')
                  }}
                  className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Send Reset Link
                </Button>
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="w-full text-center text-xs text-emerald-700 hover:underline font-semibold"
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

export default InternLoginPage
