import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Rocket,
  AlertCircle,
  Shield,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { jwtAuth } from '../../lib/jwtAuth'

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()

  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin')
  const [email, setEmail] = useState('admin@smartbridge.in')
  const [password, setPassword] = useState('Password@123')
  const [fullName, setFullName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const emailValidation = email.trim()
    ? jwtAuth.validateEmailForPortal(email, 'admin', mode === 'signup')
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
      const { error: signInErr } = await signIn(email, password, 'admin')
      if (signInErr) {
        setError(signInErr.message || 'Invalid administrator credentials.')
      } else {
        navigate('/admin')
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
    if (emailValidation && !emailValidation.isValid) {
      setError(emailValidation.message || 'This email has already been entered.')
      return
    }
    setLoading(true)
    try {
      const { error: signUpErr } = await signUp(email.trim(), password, fullName.trim(), 'admin')
      if (signUpErr) {
        setError(signUpErr.message || 'Registration failed.')
      } else {
        navigate('/admin')
      }
    } catch {
      setError('Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex font-sans bg-surface">
      {/* Left Admin Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

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
              <span className="text-blue-200 text-xs font-semibold tracking-wider uppercase">LaunchPad Admin Portal</span>
            </div>
          </div>
        </div>

        <div className="my-auto py-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold mb-4 border border-white/10">
            <Shield size={13} className="text-primary-light" />
            Program Governance &amp; Executive Analytics
          </span>
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Accelerating<br />Intern Excellence
          </h2>
          <p className="text-blue-200 text-sm leading-relaxed mb-8 max-w-md">
            Centralized administrator console for cohort governance, intern &amp; mentor provisioning, track-wise attendance analytics, and exit-gate certifications.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            {[
              { label: 'Active Interns', value: '42 Active' },
              { label: 'Program Stages', value: '4 Stages' },
              { label: 'KPI Framework', value: 'L-B-S-S' },
              { label: 'Total Duration', value: '24 Weeks' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-4 border border-white/5 backdrop-blur-xs">
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-blue-200 text-xs mt-0.5">{stat.label}</p>
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
            <ArrowLeft size={14} /> Back to Home
          </button>
          <span className="text-xs font-semibold text-navy ml-auto bg-navy/5 px-2.5 py-1 rounded-full">
            Admin Authentication
          </span>
        </div>

        <div className="w-full max-w-md mx-auto my-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-xl bg-navy text-white flex items-center justify-center font-bold shadow-sm">
                <Shield size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-navy leading-tight">Admin Portal Sign In</h2>
                <p className="text-xs text-muted">Cohort operations, intern/mentor creation &amp; analytics</p>
              </div>
            </div>

            {/* Mode switch */}
            {mode !== 'reset' && (
              <div className="grid grid-cols-2 gap-1 p-1 bg-surface rounded-lg mb-6">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(''); setSuccessMsg('') }}
                  className={`py-2 text-xs font-bold rounded-md transition-colors ${
                    mode === 'signin' ? 'bg-white text-navy shadow-xs' : 'text-muted hover:text-navy'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup')
                    setError('')
                    setSuccessMsg('')
                    setEmail('')
                    setPassword('')
                    setConfirmPassword('')
                  }}
                  className={`py-2 text-xs font-bold rounded-md transition-colors ${
                    mode === 'signup' ? 'bg-white text-navy shadow-xs' : 'text-muted hover:text-navy'
                  }`}
                >
                  Create Admin
                </button>
              </div>
            )}

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
                    Administrator Email Address
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@smartbridge.in"
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
                  className="w-full justify-center bg-navy hover:bg-navy/90 text-white font-bold py-2.5 shadow-sm"
                >
                  Sign In to Admin Dashboard
                </Button>
              </form>
            )}

            {mode === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Program Administrator"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@smartbridge.in"
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    leftIcon={<Lock size={16} />}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    leftIcon={<Lock size={16} />}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  loading={loading}
                  className="w-full justify-center bg-navy hover:bg-navy/90 text-white font-bold py-2.5"
                >
                  Create Admin Account
                </Button>
              </form>
            )}

            {mode === 'reset' && (
              <div className="space-y-4">
                <p className="text-xs text-muted">
                  Enter your admin email to receive reset instructions.
                </p>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@smartbridge.in"
                  leftIcon={<Mail size={16} />}
                />
                <Button
                  onClick={() => {
                    setSuccessMsg('Password reset link sent to ' + email)
                    setMode('signin')
                  }}
                  className="w-full justify-center bg-navy hover:bg-navy/90 text-white font-bold"
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

export default AdminLoginPage