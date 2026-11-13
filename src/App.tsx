import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './pages/auth/LoginPage'
import AdminLoginPage from './pages/auth/AdminLoginPage'
import MentorLoginPage from './pages/auth/MentorLoginPage'
import InternLoginPage from './pages/auth/InternLoginPage'
import DashboardPage from './pages/admin/DashboardPage'
import InternsListPage from './pages/admin/interns/InternsListPage'
import AddInternPage from './pages/admin/interns/AddInternPage'
import InternDetailPage from './pages/admin/interns/InternDetailPage'
import MentorsListPage from './pages/admin/mentors/MentorsListPage'
import AddMentorPage from './pages/admin/mentors/AddMentorPage'
import MentorDetailPage from './pages/admin/mentors/MentorDetailPage'
import BatchesPage from './pages/admin/batches/BatchesPage'
import AssignmentsPage from './pages/admin/assignments/AssignmentsPage'
import ProgramOverviewPage from './pages/admin/program/ProgramOverviewPage'
import BaselinePage from './pages/admin/program/BaselinePage'
import AttendancePage from './pages/admin/program/AttendancePage'
import AttendanceAnalyticsPage from './pages/admin/program/AttendanceAnalyticsPage'
import KPIMonitoringPage from './pages/admin/program/KPIMonitoringPage'
import MonthlyReportsPage from './pages/admin/program/MonthlyReportsPage'
import TasksPage from './pages/admin/work/TasksPage'
import ProjectsPage from './pages/admin/work/ProjectsPage'
import CertificationsPage from './pages/admin/work/CertificationsPage'
import ImprovementPlansPage from './pages/admin/growth/ImprovementPlansPage'
import ProgressionPage from './pages/admin/growth/ProgressionPage'
import ReportsPage from './pages/admin/admin/ReportsPage'
import NotificationsPage from './pages/admin/admin/NotificationsPage'
import AuditLogsPage from './pages/admin/admin/AuditLogsPage'
import PermissionsPage from './pages/admin/admin/PermissionsPage'
import SettingsPage from './pages/admin/admin/SettingsPage'
import MentorDashboardPage from './pages/mentor/MentorDashboardPage'
import MentorInternsPage from './pages/mentor/MentorInternsPage'
import MentorInternDetailPage from './pages/mentor/MentorInternDetailPage'
import MentorTasksPage from './pages/mentor/MentorTasksPage'
import MentorEvaluationsPage from './pages/mentor/MentorEvaluationsPage'
import MentorLaunchPadPage from './pages/mentor/MentorLaunchPadPage'
import MentorFeedbackPage from './pages/mentor/MentorFeedbackPage'
import MentorReportsPage from './pages/mentor/MentorReportsPage'
import MentorProfilePage from './pages/mentor/MentorProfilePage'
import MentorNotificationsPage from './pages/mentor/MentorNotificationsPage'
import MentorBatchesPage from './pages/mentor/MentorBatchesPage'
import InternDashboardPage from './pages/intern/InternDashboardPage'
import InternLaunchPadPage from './pages/intern/InternLaunchPadPage'
import InternTasksPage from './pages/intern/InternTasksPage'
import InternCertificationsPage from './pages/intern/InternCertificationsPage'
import InternFeedbackPage from './pages/intern/InternFeedbackPage'
import InternProfilePage from './pages/intern/InternProfilePage'
import HomePage from './pages/public/HomePage'
import LoadingSpinner from './components/ui/LoadingSpinner'
import type { UserRole } from './types'

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({
  children,
  allowedRoles,
}) => {
  const { session, profile, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <LoadingSpinner size="lg" message="Loading..." />
      </div>
    )
  }
  if (!session) {
    if (allowedRoles?.includes('mentor')) return <Navigate to="/mentor/login" replace />
    if (allowedRoles?.includes('intern')) return <Navigate to="/intern/login" replace />
    return <Navigate to="/admin/login" replace />
  }

  const userRole = profile?.role ?? 'admin'
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (userRole === 'mentor') return <Navigate to="/mentor/dashboard" replace />
    if (userRole === 'intern') return <Navigate to="/intern/dashboard" replace />
    return <Navigate to="/admin" replace />
  }
  return <>{children}</>
}

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <LoadingSpinner size="lg" message="Loading..." />
      </div>
    )
  }
  return <>{children}</>
}

const AppRoutes: React.FC = () => (
  <Routes>
    {/* Dedicated Role-Based Login Portals */}
    <Route path="/admin/login" element={<PublicRoute><AdminLoginPage /></PublicRoute>} />
    <Route path="/login/admin" element={<Navigate to="/admin/login" replace />} />

    <Route path="/mentor/login" element={<PublicRoute><MentorLoginPage /></PublicRoute>} />
    <Route path="/login/mentor" element={<Navigate to="/mentor/login" replace />} />

    <Route path="/intern/login" element={<PublicRoute><InternLoginPage /></PublicRoute>} />
    <Route path="/login/intern" element={<Navigate to="/intern/login" replace />} />

    {/* Fallback Login */}
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

    {/* Admin - Protected */}
    <Route path="/admin" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />

    {/* Interns */}
    <Route path="/admin/interns" element={<ProtectedRoute><InternsListPage /></ProtectedRoute>} />
    <Route path="/admin/interns/add" element={<ProtectedRoute><AddInternPage /></ProtectedRoute>} />
    <Route path="/admin/interns/:id" element={<ProtectedRoute><InternDetailPage /></ProtectedRoute>} />

    {/* Mentors */}
    <Route path="/admin/mentors" element={<ProtectedRoute><MentorsListPage /></ProtectedRoute>} />
    <Route path="/admin/mentors/add" element={<ProtectedRoute><AddMentorPage /></ProtectedRoute>} />
    <Route path="/admin/mentors/:id" element={<ProtectedRoute><MentorDetailPage /></ProtectedRoute>} />

    {/* Program Management */}
    <Route path="/admin/batches" element={<ProtectedRoute><BatchesPage /></ProtectedRoute>} />
    <Route path="/admin/assignments" element={<ProtectedRoute><AssignmentsPage /></ProtectedRoute>} />
    <Route path="/admin/program" element={<ProtectedRoute><ProgramOverviewPage /></ProtectedRoute>} />
    <Route path="/admin/baseline" element={<ProtectedRoute><BaselinePage /></ProtectedRoute>} />
    <Route path="/admin/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
    <Route path="/admin/attendance/report" element={<ProtectedRoute><AttendanceAnalyticsPage /></ProtectedRoute>} />
    <Route path="/admin/kpi" element={<ProtectedRoute><KPIMonitoringPage /></ProtectedRoute>} />
    <Route path="/admin/reports/monthly" element={<ProtectedRoute><MonthlyReportsPage /></ProtectedRoute>} />

    {/* Work */}
    <Route path="/admin/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
    <Route path="/admin/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
    <Route path="/admin/certifications" element={<ProtectedRoute><CertificationsPage /></ProtectedRoute>} />

    {/* Growth */}
    <Route path="/admin/improvement-plans" element={<ProtectedRoute><ImprovementPlansPage /></ProtectedRoute>} />
    <Route path="/admin/progression" element={<ProtectedRoute><ProgressionPage /></ProtectedRoute>} />

    {/* Admin */}
    <Route path="/admin/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
    <Route path="/admin/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
    <Route path="/admin/audit-logs" element={<ProtectedRoute><AuditLogsPage /></ProtectedRoute>} />
    <Route path="/admin/permissions" element={<ProtectedRoute><PermissionsPage /></ProtectedRoute>} />
    <Route path="/admin/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

    {/* Mentor Portal */}
    <Route path="/mentor" element={<Navigate to="/mentor/dashboard" replace />} />
    <Route path="/mentor/dashboard" element={<ProtectedRoute allowedRoles={['mentor', 'admin']}><MentorDashboardPage /></ProtectedRoute>} />
    <Route path="/mentor/interns" element={<ProtectedRoute allowedRoles={['mentor', 'admin']}><MentorInternsPage /></ProtectedRoute>} />
    <Route path="/mentor/interns/:id" element={<ProtectedRoute allowedRoles={['mentor', 'admin']}><MentorInternDetailPage /></ProtectedRoute>} />
    <Route path="/mentor/tasks" element={<ProtectedRoute allowedRoles={['mentor', 'admin']}><MentorTasksPage /></ProtectedRoute>} />
    <Route path="/mentor/submissions" element={<Navigate to="/mentor/tasks" replace />} />
    <Route path="/mentor/evaluations" element={<ProtectedRoute allowedRoles={['mentor', 'admin']}><MentorEvaluationsPage /></ProtectedRoute>} />
    <Route path="/mentor/kpis" element={<Navigate to="/mentor/evaluations" replace />} />
    <Route path="/mentor/feedback" element={<ProtectedRoute allowedRoles={['mentor', 'admin']}><MentorFeedbackPage /></ProtectedRoute>} />
    <Route path="/mentor/launchpad" element={<ProtectedRoute allowedRoles={['mentor', 'admin']}><MentorLaunchPadPage /></ProtectedRoute>} />
    <Route path="/mentor/batches" element={<ProtectedRoute allowedRoles={['mentor', 'admin']}><MentorBatchesPage /></ProtectedRoute>} />
    <Route path="/mentor/assignments" element={<Navigate to="/mentor/interns" replace />} />
    <Route path="/mentor/reports" element={<ProtectedRoute allowedRoles={['mentor', 'admin']}><MentorReportsPage /></ProtectedRoute>} />
    <Route path="/mentor/notifications" element={<ProtectedRoute allowedRoles={['mentor', 'admin']}><MentorNotificationsPage /></ProtectedRoute>} />
    <Route path="/mentor/profile" element={<ProtectedRoute allowedRoles={['mentor', 'admin']}><MentorProfilePage /></ProtectedRoute>} />

    {/* Intern Portal */}
    <Route path="/intern" element={<Navigate to="/intern/dashboard" replace />} />
    <Route path="/intern/dashboard" element={<ProtectedRoute allowedRoles={['intern', 'admin']}><InternDashboardPage /></ProtectedRoute>} />
    <Route path="/intern/launchpad" element={<ProtectedRoute allowedRoles={['intern', 'admin']}><InternLaunchPadPage /></ProtectedRoute>} />
    <Route path="/intern/tasks" element={<ProtectedRoute allowedRoles={['intern', 'admin']}><InternTasksPage /></ProtectedRoute>} />
    <Route path="/intern/certifications" element={<ProtectedRoute allowedRoles={['intern', 'admin']}><InternCertificationsPage /></ProtectedRoute>} />
    <Route path="/intern/feedback" element={<ProtectedRoute allowedRoles={['intern', 'admin']}><InternFeedbackPage /></ProtectedRoute>} />
    <Route path="/intern/profile" element={<ProtectedRoute allowedRoles={['intern', 'admin']}><InternProfilePage /></ProtectedRoute>} />

    {/* Home & Fallback */}
    <Route path="/" element={<HomePage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
