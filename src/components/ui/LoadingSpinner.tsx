import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'full'
  message?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', message }) => {
  if (size === 'full') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 size={36} className="animate-spin text-primary" />
        {message && <p className="text-sm text-muted">{message}</p>}
      </div>
    )
  }

  const iconSize = size === 'sm' ? 16 : size === 'md' ? 24 : 32

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <Loader2 size={iconSize} className="animate-spin text-primary" />
      {message && <span className="text-sm text-muted">{message}</span>}
    </div>
  )
}

export default LoadingSpinner

