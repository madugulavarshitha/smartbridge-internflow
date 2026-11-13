import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useAuth } from '../../contexts/AuthContext'

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, subtitle }) => {
  const { profile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      if (profile.role === 'mentor') navigate('/mentor/dashboard')
      else if (profile.role === 'intern') navigate('/intern/dashboard')
    }
  }, [profile, navigate])

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Topbar title={title} subtitle={subtitle} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout

