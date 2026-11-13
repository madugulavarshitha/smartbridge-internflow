import React, { useState, useMemo } from 'react'
import {
  Briefcase,
  CheckCircle2,
  Edit2,
  Users,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { accountService } from '../../lib/accountService'
import MentorLayout from '../../components/layout/MentorLayout'
import Card from '../../components/ui/Card'
import Badge, { statusToBadgeVariant } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'

const MentorProfilePage: React.FC = () => {
  const { user, profile } = useAuth()
  const [toast, setToast] = useState('')
  const [isEditOpen, setIsEditOpen] = useState(false)

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

  // Edit form state
  const [editName, setEditName] = useState(profile?.full_name ?? '')
  const [editDesignation, setEditDesignation] = useState(mentorRecord?.designation ?? '')
  const [editDepartment, setEditDepartment] = useState(mentorRecord?.department ?? '')
  const [editSkills, setEditSkills] = useState(mentorRecord?.expertise?.join(', ') ?? '')

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!mentorRecord) return

    try {
      accountService.updateMentorSelfProfile(mentorRecord.id, {
        fullName: editName.trim(),
        designation: editDesignation.trim(),
        department: editDepartment.trim(),
        expertise: editSkills.split(',').map((s) => s.trim()).filter(Boolean),
      })
      setIsEditOpen(false)
      setToast('Mentor profile updated successfully!')
      setTimeout(() => setToast(''), 4000)
    } catch {
      setToast('Failed to update profile')
    }
  }

  return (
    <MentorLayout
      title="Mentor Profile"
      subtitle="Industry mentor credentials, track specialization, and current mentoring allocation"
    >
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-navy text-white text-sm px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Profile Card Header */}
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-2xl">
                {profile?.full_name?.[0] ?? 'M'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-navy">{profile?.full_name}</h2>
                  <Badge variant={statusToBadgeVariant(mentorRecord?.status ?? 'active')} size="sm">
                    {mentorRecord?.status ?? 'active'}
                  </Badge>
                </div>
                <p className="text-xs text-muted mt-0.5">{profile?.email}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                  <span className="font-semibold text-navy">Designation:</span>
                  <span className="text-slate-700">{mentorRecord?.designation ?? 'Senior Mentor'}</span>
                  <span className="text-muted ml-2">Employee ID:</span>
                  <span className="font-mono font-bold text-primary">{mentorRecord?.employee_id ?? 'EMP-001'}</span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={<Edit2 size={14} />}
              onClick={() => {
                setEditName(profile?.full_name ?? '')
                setEditDesignation(mentorRecord?.designation ?? '')
                setEditDepartment(mentorRecord?.department ?? '')
                setEditSkills(mentorRecord?.expertise?.join(', ') ?? '')
                setIsEditOpen(true)
              }}
            >
              Edit Profile
            </Button>
          </div>
        </Card>

        {/* Professional Details & Program Scope */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <div className="space-y-3.5">
              <h3 className="font-bold text-navy text-sm flex items-center gap-2">
                <Briefcase className="text-primary" size={16} />
                Professional Credentials
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-muted">Department:</span>
                  <span className="font-semibold text-navy">{mentorRecord?.department ?? 'Engineering'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-muted">Domain Specialization:</span>
                  <Badge variant="primary" size="sm">{mentorRecord?.domain ?? 'Technology Track'}</Badge>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-muted">Role Permissions:</span>
                  <span className="font-semibold text-navy">Industry Mentor</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted">Account Status:</span>
                  <Badge variant="success" size="sm">Active</Badge>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">Technical Skills &amp; Architecture</p>
                <div className="flex flex-wrap gap-1.5">
                  {mentorRecord?.expertise?.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-navy"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-3.5">
              <h3 className="font-bold text-navy text-sm flex items-center gap-2">
                <Users className="text-primary" size={16} />
                Mentoring Allocation &amp; Capacity
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-muted">Assigned Interns Count:</span>
                  <span className="font-bold text-primary">{assignedInterns.length} Candidates</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-muted">Recommended Max Capacity:</span>
                  <span className="font-semibold text-navy">5 Candidates</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-muted">Assigned Cohort Batches:</span>
                  <span className="font-semibold text-navy">{mentorRecord?.domain ?? 'LaunchPad 2026'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted">Mentoring Modality:</span>
                  <span className="font-semibold text-navy">Bi-Weekly 1:1 Reviews &amp; Lab Defense</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs space-y-1">
                <p className="font-bold text-primary">Organizational Authority</p>
                <p className="text-slate-600 leading-relaxed">
                  Mentors conduct Stage 1–4 competency reviews, grade weekly tasks, initiate improvement plans, and submit certification recommendations. Official credential issuance is finalized by Admin committee.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="Edit Mentor Profile Details"
          size="md"
        >
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Full Name *</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Designation *</label>
              <input
                type="text"
                value={editDesignation}
                onChange={(e) => setEditDesignation(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Department *</label>
              <input
                type="text"
                value={editDepartment}
                onChange={(e) => setEditDepartment(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Technical Skills (comma-separated)</label>
              <input
                type="text"
                value={editSkills}
                onChange={(e) => setEditSkills(e.target.value)}
                placeholder="AWS, Docker, Kubernetes, React"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </MentorLayout>
  )
}

export default MentorProfilePage
