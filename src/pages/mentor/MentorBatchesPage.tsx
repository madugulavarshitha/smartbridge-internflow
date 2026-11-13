import React, { useMemo } from 'react'
import { Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { accountService } from '../../lib/accountService'
import MentorLayout from '../../components/layout/MentorLayout'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

const MentorBatchesPage: React.FC = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

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

  const assignedInterns = useMemo(() => {
    if (!mentorRecord) return []
    return accountService.getAssignedInternsForMentor(mentorRecord.id)
  }, [mentorRecord])

  const domain = mentorRecord?.domain ?? 'AI & Cloud'

  const batches = [
    {
      id: 'batch-2026a',
      name: `${domain} – Cohort 2026A`,
      code: `LP-${domain.slice(0, 3).toUpperCase()}-26A`,
      status: 'active',
      startDate: '2026-01-15',
      endDate: '2026-07-15',
      internCount: assignedInterns.length,
      currentWeek: 'Week 11 (Stage 2 Practitioner)',
    },
    {
      id: 'batch-2025b',
      name: `${domain} – Graduate Cohort 2025B`,
      code: `LP-${domain.slice(0, 3).toUpperCase()}-25B`,
      status: 'completed',
      startDate: '2025-07-01',
      endDate: '2025-12-31',
      internCount: 6,
      currentWeek: 'Graduated (Week 24 Gate Passed)',
    },
  ]

  return (
    <MentorLayout
      title="Assigned Batches &amp; Cohorts"
      subtitle={`Mentoring cohorts in ${domain} across the 24-week LaunchPad framework`}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {batches.map((b) => (
            <Card key={b.id}>
              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-primary bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {b.code}
                  </span>
                  <Badge variant={b.status === 'active' ? 'primary' : 'muted'} size="sm">
                    {b.status.toUpperCase()}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-bold text-navy text-base">{b.name}</h3>
                  <p className="text-muted mt-0.5">{b.currentWeek}</p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted">Assigned Candidates:</span>
                    <span className="font-bold text-navy">{b.internCount} Interns</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Start Date:</span>
                    <span className="text-navy">{b.startDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Scheduled End Date:</span>
                    <span className="text-navy">{b.endDate}</span>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Users size={13} />}
                    onClick={() => navigate('/mentor/interns')}
                  >
                    View Cohort Interns
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MentorLayout>
  )
}

export default MentorBatchesPage
