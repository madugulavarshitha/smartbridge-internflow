import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  ExternalLink,
  CheckCheck,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { accountService, type MentorNotificationRecord } from '../../lib/accountService'
import MentorLayout from '../../components/layout/MentorLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const MentorNotificationsPage: React.FC = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  // Mentor record
  const mentorRecord = useMemo(() => {
    if (!profile) return null
    return (
      accountService.getMentors().find(
        (m) =>
          m.profile_id === profile.id ||
          m.profile?.email.toLowerCase() === profile.email.toLowerCase() ||
          m.id === user?.id
      ) ?? null
    )
  }, [profile, user])

  const [notifications, setNotifications] = useState<MentorNotificationRecord[]>(() => {
    return accountService.getNotificationsForMentor(mentorRecord?.id ?? 'm1')
  })

  const filtered = useMemo(() => {
    if (filter === 'unread') return notifications.filter((n) => !n.is_read)
    return notifications
  }, [notifications, filter])

  const handleMarkAsRead = (id: string) => {
    accountService.markNotificationRead(id)
    setNotifications(accountService.getNotificationsForMentor(mentorRecord?.id ?? 'm1'))
  }

  const handleMarkAllRead = () => {
    notifications.forEach((n) => accountService.markNotificationRead(n.id))
    setNotifications(accountService.getNotificationsForMentor(mentorRecord?.id ?? 'm1'))
  }

  return (
    <MentorLayout
      title="Mentor Notifications"
      subtitle="Real-time alerts for deliverable submissions, evaluation milestones, and program events"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-muted hover:text-navy hover:bg-gray-50'
              }`}
            >
              All Notifications ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'unread'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-muted hover:text-navy hover:bg-gray-50'
              }`}
            >
              Unread ({notifications.filter((n) => !n.is_read).length})
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={<CheckCheck size={14} />}
            onClick={handleMarkAllRead}
          >
            Mark All as Read
          </Button>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <Card>
              <div className="py-12 text-center text-muted">
                <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="font-semibold text-navy">No notifications</p>
                <p className="text-xs text-muted mt-1">You are all caught up!</p>
              </div>
            </Card>
          ) : (
            filtered.map((n) => (
              <Card key={n.id}>
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        n.type === 'submission'
                          ? 'bg-blue-50 text-primary'
                          : n.type === 'evaluation'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      <Bell size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-navy text-sm">{n.title}</h4>
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-slate-600 mt-0.5">{n.message}</p>
                      <p className="text-[11px] text-muted mt-1">
                        {new Date(n.created_at).toLocaleDateString()} at{' '}
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<ExternalLink size={13} />}
                      onClick={() => {
                        handleMarkAsRead(n.id)
                        navigate(n.link)
                      }}
                    >
                      Open
                    </Button>
                    {!n.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(n.id)}
                      >
                        Mark Read
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </MentorLayout>
  )
}

export default MentorNotificationsPage
