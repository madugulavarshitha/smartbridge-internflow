import type { UserRole } from '../types'
import { accountService } from './accountService'

export interface JWTPayload {
  sub: string
  email: string
  name: string
  role: UserRole
  portal: string
  iat: number
  exp: number
  iss: string
}

const JWT_STORAGE_KEY = 'internflow_jwt_token'
const ACTIVE_SESSION_KEY = 'internflow_active_session'
const JWT_SECRET = 'smartbridge-internflow-secret-key-2026'

// Base64URL encode/decode helper
function base64UrlEncode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function base64UrlDecode(str: string): string {
  let output = str.replace(/-/g, '+').replace(/_/g, '/')
  switch (output.length % 4) {
    case 0:
      break
    case 2:
      output += '=='
      break
    case 3:
      output += '='
      break
    default:
      throw new Error('Illegal base64url string!')
  }
  return decodeURIComponent(escape(atob(output)))
}

// Generate simple hash signature for token authenticity
function createSignature(data: string, secret: string): string {
  let hash = 0
  const combined = data + secret
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0 // Convert to 32bit integer
  }
  return base64UrlEncode(`sig_${Math.abs(hash)}_${combined.length}`)
}

export const jwtAuth = {
  /**
   * Create a standard JWT token for authenticated user
   */
  createToken(user: { id: string; email: string; fullName: string; role: UserRole; portal: string }): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    }
    const now = Math.floor(Date.now() / 1000)
    const payload: JWTPayload = {
      sub: user.id,
      email: user.email.toLowerCase().trim(),
      name: user.fullName,
      role: user.role,
      portal: user.portal,
      iat: now,
      exp: now + 7 * 24 * 60 * 60, // 7 days validity
      iss: 'smartbridge-internflow',
    }

    const encodedHeader = base64UrlEncode(JSON.stringify(header))
    const encodedPayload = base64UrlEncode(JSON.stringify(payload))
    const signature = createSignature(`${encodedHeader}.${encodedPayload}`, JWT_SECRET)

    return `${encodedHeader}.${encodedPayload}.${signature}`
  },

  /**
   * Verify and decode a JWT token
   */
  verifyToken(token: string): { valid: boolean; payload?: JWTPayload; error?: string } {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        return { valid: false, error: 'Malformed JWT token structure' }
      }
      const [encodedHeader, encodedPayload, signature] = parts
      const expectedSig = createSignature(`${encodedHeader}.${encodedPayload}`, JWT_SECRET)
      if (signature !== expectedSig) {
        return { valid: false, error: 'Invalid JWT signature' }
      }
      const payload: JWTPayload = JSON.parse(base64UrlDecode(encodedPayload))
      const now = Math.floor(Date.now() / 1000)
      if (payload.exp && payload.exp < now) {
        return { valid: false, error: 'JWT token has expired' }
      }
      return { valid: true, payload }
    } catch (e) {
      return { valid: false, error: (e as Error).message }
    }
  },

  /**
   * Get active logged in JWT session
   */
  getActiveSession(): { email: string; role: UserRole; portal: string; token: string; fullName: string; id: string } | null {
    try {
      const raw = localStorage.getItem(ACTIVE_SESSION_KEY) || sessionStorage.getItem(ACTIVE_SESSION_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      const token = parsed.token || localStorage.getItem(JWT_STORAGE_KEY) || sessionStorage.getItem(JWT_STORAGE_KEY)
      if (token) {
        const verify = this.verifyToken(token)
        if (!verify.valid || !verify.payload) {
          this.clearSession()
          return null
        }
      }
      return parsed
    } catch {
      return null
    }
  },

  /**
   * Set active logged in session with JWT token
   */
  setActiveSession(user: { id: string; email: string; fullName: string; role: UserRole; portal: string }): string {
    const token = this.createToken(user)
    const sessionData = {
      id: user.id,
      email: user.email.toLowerCase().trim(),
      fullName: user.fullName,
      role: user.role,
      portal: user.portal,
      token,
      loggedInAt: new Date().toISOString(),
    }
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(sessionData))
    localStorage.setItem(JWT_STORAGE_KEY, token)
    sessionStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(sessionData))
    sessionStorage.setItem(JWT_STORAGE_KEY, token)
    return token
  },

  /**
   * Clear session upon sign out
   */
  clearSession(): void {
    localStorage.removeItem(ACTIVE_SESSION_KEY)
    localStorage.removeItem(JWT_STORAGE_KEY)
    sessionStorage.removeItem(ACTIVE_SESSION_KEY)
    sessionStorage.removeItem(JWT_STORAGE_KEY)
  },

  /**
   * Check if an email is already logged into any portal
   */
  isEmailAlreadyLoggedIn(email: string): boolean {
    const active = this.getActiveSession()
    if (!active) return false
    return active.email.toLowerCase().trim() === email.toLowerCase().trim()
  },

  /**
   * Check email registration and portal compatibility
   * Fulfills: "once one mail login into any portal if again same email enter should show alredy entered"
   */
  validateEmailForPortal(
    email: string,
    portalRole: UserRole,
    isSignUp = false
  ): {
    isValid: boolean
    alreadyEntered: boolean
    alreadyLoggedIn: boolean
    wrongPortal: boolean
    registeredRole?: UserRole
    message?: string
  } {
    const cleanEmail = email.toLowerCase().trim()
    if (!cleanEmail) {
      return { isValid: false, alreadyEntered: false, alreadyLoggedIn: false, wrongPortal: false }
    }

    const accounts = accountService.getProvisionedAccounts()
    const existing = accounts.find((a) => a.email.toLowerCase() === cleanEmail)

    if (isSignUp) {
      // Sign Up: If email is already in the system, show "already exists"
      if (existing) {
        return {
          isValid: false,
          alreadyEntered: true,
          alreadyLoggedIn: false,
          wrongPortal: false,
          registeredRole: existing.role,
          message: 'Account already exists with this email. Please sign in instead.',
        }
      }
    } else {
      // Sign In: User can sign in normally. Only block if registered under a different portal
      if (existing && existing.role !== portalRole) {
        return {
          isValid: false,
          alreadyEntered: true,
          alreadyLoggedIn: false,
          wrongPortal: true,
          registeredRole: existing.role,
          message: `This email is registered for the ${existing.role.toUpperCase()} Portal. Please use the ${existing.role.charAt(0).toUpperCase() + existing.role.slice(1)} Portal.`,
        }
      }
    }

    return {
      isValid: true,
      alreadyEntered: false,
      alreadyLoggedIn: false,
      wrongPortal: false,
      registeredRole: existing?.role,
    }
  },
}

