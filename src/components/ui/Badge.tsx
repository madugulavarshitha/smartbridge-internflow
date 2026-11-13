import React from 'react'

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'muted' | 'navy' | 'outline'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md'
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-blue-100 text-blue-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  muted: 'bg-slate-100 text-slate-600',
  navy: 'bg-navy/10 text-navy',
  outline: 'bg-transparent border border-gray-300 text-gray-600',
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className = '',
  size = 'sm',
}) => {
  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}

export function statusToBadgeVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    active: 'success',
    invited: 'primary',
    inactive: 'muted',
    on_hold: 'warning',
    completed: 'navy',
    withdrawn: 'danger',
    pending: 'warning',
    submitted: 'primary',
    reviewed: 'success',
    overdue: 'danger',
    approved: 'success',
    rejected: 'danger',
    verified: 'success',
  }
  return map[status] ?? 'default'
}

export default Badge

