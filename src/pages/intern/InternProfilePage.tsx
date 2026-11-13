import React, { useMemo } from 'react'
import {
  Mail,
  GraduationCap,
  Building,
  Briefcase,
  Users,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { accountService } from '../../lib/accountService'
import InternLayout from '../../components/layout/InternLayout'
import Card from '../../components/ui/Card'
import Badge, { statusToBadgeVariant } from '../../components/ui/Badge'
import { LAUNCHPAD_STAGES } from '../../lib/constants'

const InternProfilePage: React.FC = () => {
  const { user, profile } = useAuth()

  // Intern record
  const internRecord = useMemo(() => {
    if (!profile) return null
    return (
      accountService.getInterns().find(
        (i) =>
          i.profile_id === profile.id ||
          i.profile?.email.toLowerCase() === profile.email.toLowerCase() ||
          i.id === user?.id
      ) ?? null
    )
  }, [profile, user])

  // Assigned mentor
  const mentor = internRecord?.mentor ?? null
  const stage = internRecord ? LAUNCHPAD_STAGES.find((s) => s.id === internRecord.current_stage) : null

  return (
    <InternLayout
      title="My Profile &amp; Mentorship"
      subtitle="Candidate academic credentials, track enrollment, and assigned industry mentor details"
    >
      <div className="space-y-6">
        {/* Profile Header */}
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center text-emerald-600 font-bold text-2xl">
                {profile?.full_name?.[0] ?? 'I'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-navy">{profile?.full_name}</h2>
                  <Badge variant={statusToBadgeVariant(internRecord?.status ?? 'active')} size="sm">
                    {internRecord?.status ?? 'active'}
                  </Badge>
                </div>
                <p className="text-xs text-muted mt-0.5">{profile?.email}</p>
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <span className="font-semibold text-navy">Candidate ID:</span>
                  <span className="font-mono text-primary font-bold">{internRecord?.intern_id ?? 'INT-001'}</span>
                  <span className="text-muted ml-3">Enrolled Track:</span>
                  <Badge variant="primary" size="sm">{internRecord?.track ?? 'AI & Cloud'}</Badge>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-center">
              <p className="text-[11px] text-muted font-bold uppercase tracking-wider">Current Stage</p>
              <p className="font-bold text-navy text-sm mt-0.5">{stage?.name ?? 'Stage 1: Learner'}</p>
              <p className="text-[10px] text-primary font-semibold">Weeks {stage?.weeks ?? '1–6'}</p>
            </div>
          </div>
        </Card>

        {/* Academic & Program Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <div className="space-y-3.5">
              <h3 className="font-bold text-navy text-sm flex items-center gap-2">
                <GraduationCap className="text-primary" size={16} />
                Academic Information
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="text-muted">College / Institution:</span>
                  <span className="font-semibold text-navy">{internRecord?.college || '—'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="text-muted">Degree:</span>
                  <span className="font-semibold text-navy">{internRecord?.degree || 'B.Tech'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="text-muted">Branch / Department:</span>
                  <span className="font-semibold text-navy">{internRecord?.branch || 'CSE / IT'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Graduation Year:</span>
                  <span className="font-semibold text-navy">{internRecord?.grad_year || 2026}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-3.5">
              <h3 className="font-bold text-navy text-sm flex items-center gap-2">
                <Building className="text-primary" size={16} />
                Program Enrollment
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="text-muted">Technology Track:</span>
                  <span className="font-semibold text-navy">{internRecord?.track || 'AI & Cloud'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="text-muted">Joining Date:</span>
                  <span className="font-semibold text-navy">{internRecord?.joining_date || '2026-01-15'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="text-muted">Phone Number:</span>
                  <span className="font-semibold text-navy">{internRecord?.phone || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Account Status:</span>
                  <Badge variant="success" size="sm">Active</Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Assigned Industry Mentor */}
        <Card>
          <div className="space-y-3.5">
            <h3 className="font-bold text-navy text-sm flex items-center gap-2">
              <Users className="text-primary" size={16} />
              Assigned Industry Mentor
            </h3>

            {mentor ? (
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary font-bold text-lg flex items-center justify-center">
                    {mentor.profile?.full_name?.[0] ?? 'M'}
                  </div>
                  <div>
                    <h4 className="font-bold text-navy text-base">{mentor.profile?.full_name}</h4>
                    <p className="text-xs text-muted">{mentor.designation ?? 'Senior Industry Mentor'} · {mentor.department ?? 'Engineering'}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Mail size={12} /> {mentor.profile?.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase size={12} /> Domain: {mentor.domain}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <Badge variant="primary" size="sm">Active Mentor</Badge>
                  <p className="text-[11px] text-muted mt-1">Conducts bi-weekly 1:1 reviews</p>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-muted text-xs">
                No mentor currently assigned. The program administrator will allocate an industry mentor for your cohort.
              </div>
            )}
          </div>
        </Card>
      </div>
    </InternLayout>
  )
}

export default InternProfilePage
