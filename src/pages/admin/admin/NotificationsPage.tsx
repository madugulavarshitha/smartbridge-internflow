import React, { useState, useEffect, useCallback } from 'react'
import { Bell, CheckCheck, UserPlus, CheckSquare, Award, ArrowUpCircle, FileText, Info } from 'lucide-react'
import AdminLayout from '../../../components/layout/AdminLayout'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import StatCard from '../../../components/ui/StatCard'
import EmptyState from '../../../components/ui/EmptyState'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../contexts/AuthContext'
import type { Notification } from '../../../types'

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', recipient_id: 'admin1', type: 'intern_added', title: 'New Intern Onboarded', message: 'Rahul Sharma (INT-001) has activated their LaunchPad account.', related_entity: 'intern', is_read: false, created_at: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: 'n2', recipient_id: 'admin1', type: 'evaluation_submitted', title: 'Stage 2 Evaluation Submitted', message: 'Mentor Arjun Reddy submitted Stage 2 evaluation for Priya Patel.', related_entity: 'stage_evaluation', is_read: false, created_at: new Date(Date.now() - 45 * 60000).toISOString() },
  { id: 'n3', recipient_id: 'admin1', type: 'cert_uploaded', title: 'Certification Pending Verification', message: 'Amit Kumar uploaded Week 24 Google Cloud Engineer certificate.', related_entity: 'certification', is_read: false, created_at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 'n4', recipient_id: 'admin1', type: 'report_submitted', title: 'Monthly KPI Report Submitted', message: 'Sneha Reddy submitted May 2026 monthly KPI report.', related_entity: 'monthly_report', is_read: true, created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: 'n5', recipient_id: 'admin1', type: 'stage_progression', title: 'Progression Decision Recorded', message: 'Vikram Singh progressed from Stage 1 to Stage 2.', related_entity: 'progression_decision', is_read: true, created_at: new Date(Date.now() - 24 * 3600000).toISOString() },
  { id: 'n6', recipient_id: 'admin1', type: 'system', title: 'Batch LP-APR26 Started', message: 'LaunchPad Apr 2026 batch is now active with 18 interns.', related_entity: 'batch', is_read: true, created_at: new Date(Date.now() - 48 * 3600000).toISOString() },
]

const typeIcon = (type: string) => {
  switch (type) {
    case 'intern_added': return UserPlus
    case 'evaluation_submitted': return CheckSquare
    case 'cert_uploaded': return Award
    case 'stage_progression': return ArrowUpCircle
    case 'report_submitted': return FileText
    default: return Info
  }
}

const fmtTime = (d: string) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

const NotificationsPage: React.FC = () => {
  const { user } = useAuth()
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [readFilter, setReadFilter] = useState<'' | 'unread' | 'read'>('')

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase.from('notifications').select('*').order('created_at', { ascending: false })
      if (user?.id) query = query.eq('recipient_id', user.id)
      const { data, error } = await query
      if (error || !data || data.length === 0) setItems(MOCK_NOTIFICATIONS)
      else setItems(data as Notification[])
    } catch {
      setItems(MOCK_NOTIFICATIONS)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  const markAsRead = async (id: string) => {
    setItems(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    try { await supabase.from('notifications').update({ is_read: true }).eq('id', id) } catch { /* ignore */ }
  }

  const markAllRead = async () => {
    setItems(prev => prev.map(n => ({ ...n, is_read: true })))
    if (user?.id) {
      try { await supabase.from('notifications').update({ is_read: true }).eq('recipient_id', user.id) } catch { /* ignore */ }
    }
  }

  const filtered = items.filter(n => {
    const matchType = !typeFilter || n.type === typeFilter
    const matchRead = !readFilter || (readFilter === 'unread' ? !n.is_read : n.is_read)
    return matchType && matchRead
  })

  const unreadCount = items.filter(n => !n.is_read).length
  const todayCount = items.filter(n => new Date(n.created_at).toDateString() === new Date().toDateString()).length

  return (
    <AdminLayout title="Notifications" subtitle="System alerts and activity notifications">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Notifications" value={items.length} icon={Bell} iconColor="text-primary" iconBg="bg-blue-50" loading={loading} />
        <StatCard title="Unread" value={unreadCount} icon={Bell} iconColor="text-warning" iconBg="bg-amber-50" loading={loading} />
        <StatCard title="Today" value={todayCount} icon={CheckCheck} iconColor="text-success" iconBg="bg-green-50" loading={loading} />
      </div>

      <Card padding="none">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-3">
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
              <option value="">All Types</option>
              <option value="intern_added">Intern Added</option>
              <option value="evaluation_submitted">Evaluation</option>
              <option value="cert_uploaded">Certification</option>
              <option value="report_submitted">Monthly Report</option>
              <option value="stage_progression">Progression</option>
              <option value="system">System</option>
            </select>
            <select value={readFilter} onChange={e => setReadFilter(e.target.value as '' | 'unread' | 'read')} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
              <option value="">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
          {unreadCount > 0 && (
            <Button size="sm" variant="outline" icon={<CheckCheck size={14} />} onClick={markAllRead}>
              Mark All Read
            </Button>
          )}
        </div>

        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={Bell} title="No notifications" description="You are all caught up!" />
          ) : (
            filtered.map(n => {
              const Icon = typeIcon(n.type)
              return (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && markAsRead(n.id)}
                  className={`flex items-start gap-4 px-5 py-4 transition-colors cursor-pointer ${!n.is_read ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'bg-white hover:bg-surface'}`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${!n.is_read ? 'bg-primary/15 text-primary' : 'bg-gray-100 text-muted'}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-navy">{n.title}</p>
                      {!n.is_read && <Badge variant="primary">New</Badge>}
                    </div>
                    <p className="text-sm text-muted mt-0.5">{n.message}</p>
                  </div>
                  <span className="text-xs text-muted flex-shrink-0">{fmtTime(n.created_at)}</span>
                </div>
              )
            })
          )}
        </div>
      </Card>
    </AdminLayout>
  )
}

export default NotificationsPage
