import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Profile, AdminPermission, UserRole } from '../types'
import { accountService } from '../lib/accountService'
import { jwtAuth } from '../lib/jwtAuth'

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: Profile | null
  permissions: AdminPermission | null
  loading: boolean
  isDemoMode: boolean
  signIn: (email: string, password: string, roleHint?: UserRole) => Promise<{ error: Error | null; role?: UserRole }>
  signUp: (email: string, password: string, fullName: string, roleHint?: UserRole) => Promise<{ error: Error | null }>
  signInDemo: (email?: string, fullName?: string, role?: UserRole) => void
  switchRole: (role: UserRole) => void
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
}

const DEMO_STORAGE_KEY = 'internflow_demo_session'

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [permissions, setPermissions] = useState<AdminPermission | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)

  const activateDemoSession = (
    email = 'trial.admin@smartbridge.in',
    fullName = 'Trial Admin',
    role: UserRole = 'admin'
  ) => {
    const cleanEmail = email.trim().toLowerCase()
    const registered = accountService.authenticateAccount(cleanEmail)
    
    // Determine accurate effective role
    let effectiveRole: UserRole = role
    if (registered) {
      effectiveRole = registered.role
    } else if (cleanEmail.includes('mentor') || fullName.toLowerCase().includes('mentor')) {
      effectiveRole = 'mentor'
    } else if (cleanEmail.includes('intern') || fullName.toLowerCase().includes('intern')) {
      effectiveRole = 'intern'
    } else if (cleanEmail.includes('admin')) {
      effectiveRole = 'admin'
    }

    const effectiveName = registered ? registered.fullName : fullName
    const effectiveId = registered ? registered.entityId : `demo-${effectiveRole}-1`

    // Generate JWT token for joint authentication
    const jwtToken = jwtAuth.setActiveSession({
      id: effectiveId,
      email: cleanEmail,
      fullName: effectiveName,
      role: effectiveRole,
      portal: effectiveRole,
    })

    const demoUser = { id: effectiveId, email: cleanEmail } as User
    const demoSession = { user: demoUser, access_token: jwtToken } as Session
    const demoProfile: Profile = {
      id: effectiveId,
      email: cleanEmail,
      full_name: effectiveName,
      role: effectiveRole,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const demoPerms: AdminPermission = {
      id: 'demo-perm-1',
      profile_id: effectiveId,
      permission_group: effectiveRole === 'admin' ? 'super_admin' : 'management_viewer',
      permissions: { all: effectiveRole === 'admin' },
      created_at: new Date().toISOString(),
    }
    sessionStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify({ email: cleanEmail, fullName: effectiveName, role: effectiveRole }))
    setSession(demoSession)
    setUser(demoUser)
    setProfile(demoProfile)
    setPermissions(demoPerms)
    setIsDemoMode(true)
    setLoading(false)
  }

  useEffect(() => {
    // Check JWT session first for Joint authentication
    const activeJwt = jwtAuth.getActiveSession()
    if (activeJwt) {
      activateDemoSession(activeJwt.email, activeJwt.fullName, activeJwt.role)
      return
    }

    if (!isSupabaseConfigured) {
      const saved = sessionStorage.getItem(DEMO_STORAGE_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          let inferredRole: UserRole = parsed.role || 'admin'
          // Self-heal corrupted session roles
          if (parsed.email?.toLowerCase().includes('mentor') || parsed.fullName?.toLowerCase().includes('mentor')) {
            inferredRole = 'mentor'
          } else if (parsed.email?.toLowerCase().includes('intern') || parsed.fullName?.toLowerCase().includes('intern')) {
            inferredRole = 'intern'
          }
          activateDemoSession(parsed.email, parsed.fullName, inferredRole)
          return
        } catch {
          sessionStorage.removeItem(DEMO_STORAGE_KEY)
        }
      }
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setPermissions(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
      setProfile(data)
      if (data?.role === 'admin') {
        const { data: perms } = await supabase.from('admin_permissions').select('*').eq('profile_id', userId).single()
        setPermissions(perms)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (
    email: string,
    password: string,
    roleHint?: UserRole
  ): Promise<{ error: Error | null; role?: UserRole }> => {
    const cleanEmail = email.trim().toLowerCase()

    // Validate role compatibility for targeted portal
    const validation = jwtAuth.validateEmailForPortal(cleanEmail, roleHint || 'admin', false)
    if (!validation.isValid && validation.wrongPortal) {
      return {
        error: new Error(validation.message || 'This email belongs to another portal.'),
        role: validation.registeredRole,
      }
    }

    const registered = accountService.authenticateAccount(cleanEmail, password)

    let intendedRole: UserRole = roleHint || 'admin'
    let effectiveName = cleanEmail.split('@')[0]

    if (registered) {
      intendedRole = registered.role
      effectiveName = registered.fullName
    } else if (cleanEmail.includes('mentor')) {
      intendedRole = 'mentor'
    } else if (cleanEmail.includes('intern')) {
      intendedRole = 'intern'
    } else if (cleanEmail.includes('admin')) {
      intendedRole = 'admin'
    }

    if (!isSupabaseConfigured) {
      activateDemoSession(cleanEmail, effectiveName, intendedRole)
      return { error: null, role: intendedRole }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password })
      if (error) {
        activateDemoSession(cleanEmail, effectiveName, intendedRole)
        return { error: null, role: intendedRole }
      }
      if (data.user) {
        const { data: prof } = await supabase.from('profiles').select('role, full_name').eq('id', data.user.id).single()
        const userRole = (prof?.role as UserRole) || intendedRole
        const userName = prof?.full_name || effectiveName
        activateDemoSession(cleanEmail, userName, userRole)
        return { error: null, role: userRole }
      }
      return { error: null, role: intendedRole }
    } catch {
      activateDemoSession(cleanEmail, effectiveName, intendedRole)
      return { error: null, role: intendedRole }
    }
  }

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    roleHint: UserRole = 'intern'
  ) => {
    const cleanEmail = email.trim().toLowerCase()

    // Validate if email already exists
    const validation = jwtAuth.validateEmailForPortal(cleanEmail, roleHint, true)
    if (!validation.isValid && validation.alreadyEntered) {
      return {
        error: new Error(validation.message || 'Account already exists with this email. Please sign in instead.'),
      }
    }

    // Register user account so their info is preserved for sign in
    accountService.registerUserAccount({
      email: cleanEmail,
      password,
      fullName: fullName.trim(),
      role: roleHint,
    })

    if (!isSupabaseConfigured) {
      activateDemoSession(cleanEmail, fullName.trim() || 'User', roleHint)
      return { error: null }
    }
    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: { data: { full_name: fullName.trim(), role: roleHint } },
    })
    return { error: error as Error | null }
  }

  const signInDemo = (email?: string, fullName?: string, role: UserRole = 'admin') => {
    activateDemoSession(email, fullName, role)
  }

  // Deprecated/Disabled switchRole to enforce strict role separation
  const switchRole = (_targetRole: UserRole) => {
    console.warn('Switch role option has been completely removed to enforce role security.')
  }

  const signOut = async () => {
    jwtAuth.clearSession()
    sessionStorage.removeItem(DEMO_STORAGE_KEY)
    setIsDemoMode(false)
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    }
    setSession(null)
    setUser(null)
    setProfile(null)
    setPermissions(null)
  }

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured) {
      return { error: null }
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    return { error: error as Error | null }
  }

  return (
    <AuthContext.Provider value={{
      session, user, profile, permissions, loading, isDemoMode,
      signIn, signUp, signInDemo, switchRole, signOut, resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
