import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Search,
  Mail,
  Phone,
  GraduationCap,
  ClipboardList,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { accountService, type Intern } from '../../lib/accountService'
import MentorLayout from '../../components/layout/MentorLayout'
import Card from '../../components/ui/Card'
import Badge, { statusToBadgeVariant } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { LAUNCHPAD_STAGES } from '../../lib/constants'

const MentorInternsPage: React.FC = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [selectedIntern, setSelectedIntern] = useState<Intern | null>(null)

  // Find mentor record
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

  // Get assigned interns
  const assignedInterns = useMemo(() => {
    if (!mentorRecord) return []
    return accountService.getAssignedInternsForMentor(mentorRecord.id)
  }, [mentorRecord])

  // Filter
  const filteredInterns = useMemo(() => {
    return assignedInterns.filter((intern) => {
      const q = search.toLowerCase()
      const matchesSearch =
        intern.profile?.full_name.toLowerCase().includes(q) ||
        intern.intern_id.toLowerCase().includes(q) ||
        (intern.college && intern.college.toLowerCase().includes(q)) ||
        (intern.track && intern.track.toLowerCase().includes(q))
      const matchesStage = stageFilter === 'all' || String(intern.current_stage) === stageFilter
      return matchesSearch && matchesStage
    })
  }, [assignedInterns, search, stageFilter])

  return (
    <MentorLayout
      title="Assigned Interns"
      subtitle={`Mentoring ${assignedInterns.length} active candidates in ${mentorRecord?.domain ?? 'Technology Track'}`}
    >
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full sm:w-auto flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={17} />
              <input
                type="text"
                placeholder="Search by name, ID, college, or track..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-navy"
              />
            </div>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-navy focus:outline-hidden focus:border-primary"
            >
              <option value="all">All Stages (0–4)</option>
              <option value="0">Week 0 (Baseline)</option>
              <option value="1">Stage 1: Learner</option>
              <option value="2">Stage 2: Practitioner</option>
              <option value="3">Stage 3: Developer</option>
              <option value="4">Stage 4: Professional</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={<ClipboardList size={15} />}
              onClick={() => navigate('/mentor/evaluations')}
            >
              New Stage Evaluation
            </Button>
          </div>
        </div>

        {/* Interns Table */}
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-bold text-muted uppercase tracking-wider">
                  <th className="px-5 py-3.5">Intern Name / ID</th>
                  <th className="px-4 py-3.5">Track</th>
                  <th className="px-4 py-3.5">College &amp; Degree</th>
                  <th className="px-4 py-3.5">Current Stage</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Contact</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredInterns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-muted">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="w-10 h-10 text-gray-300 mb-2" />
                        <p className="font-semibold text-navy">No assigned interns found</p>
                        <p className="text-xs text-muted mt-1">
                          {search ? 'Try adjusting your search criteria.' : 'Admin will assign interns to your profile.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInterns.map((intern) => {
                    const stg = LAUNCHPAD_STAGES.find((s) => s.id === intern.current_stage)
                    return (
                      <tr key={intern.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0">
                              {intern.profile?.full_name?.[0] ?? 'I'}
                            </div>
                            <div>
                              <p className="font-semibold text-navy leading-tight">{intern.profile?.full_name}</p>
                              <p className="text-xs font-mono text-muted">{intern.intern_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant="primary" size="sm">{intern.track || 'Track'}</Badge>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-navy font-medium text-xs truncate max-w-[180px]">{intern.college || '—'}</p>
                          <p className="text-[11px] text-muted">{intern.degree} {intern.branch ? `· ${intern.branch}` : ''}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-primary border border-blue-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {stg ? stg.name : `Stage ${intern.current_stage}`}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant={statusToBadgeVariant(intern.status)} size="sm">
                            {intern.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-xs text-navy truncate max-w-[160px]">{intern.profile?.email}</p>
                          <p className="text-[11px] text-muted">{intern.phone || '—'}</p>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/mentor/interns/${intern.id}`)}
                            >
                              View Details
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => navigate(`/mentor/interns/${intern.id}`)}
                            >
                              Evaluate
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Intern Details Modal */}
        <Modal
          isOpen={!!selectedIntern}
          onClose={() => setSelectedIntern(null)}
          title={`Intern Profile: ${selectedIntern?.profile?.full_name ?? ''}`}
          size="lg"
        >
          {selectedIntern && (
            <div className="space-y-5">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary font-bold text-lg flex items-center justify-center">
                  {selectedIntern.profile?.full_name?.[0] ?? 'I'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-navy text-base">{selectedIntern.profile?.full_name}</h3>
                    <Badge variant={statusToBadgeVariant(selectedIntern.status)} size="sm">
                      {selectedIntern.status}
                    </Badge>
                  </div>
                  <p className="text-xs font-mono text-muted">{selectedIntern.intern_id} · Track: {selectedIntern.track}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-muted font-medium mb-1">Email Address</p>
                  <p className="text-navy font-semibold flex items-center gap-1.5">
                    <Mail size={13} className="text-muted" /> {selectedIntern.profile?.email}
                  </p>
                </div>
                <div>
                  <p className="text-muted font-medium mb-1">Phone</p>
                  <p className="text-navy font-semibold flex items-center gap-1.5">
                    <Phone size={13} className="text-muted" /> {selectedIntern.phone || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-muted font-medium mb-1">College / University</p>
                  <p className="text-navy font-semibold flex items-center gap-1.5">
                    <GraduationCap size={13} className="text-muted" /> {selectedIntern.college || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-muted font-medium mb-1">Degree &amp; Grad Year</p>
                  <p className="text-navy font-semibold">
                    {selectedIntern.degree} {selectedIntern.branch} ({selectedIntern.grad_year})
                  </p>
                </div>
              </div>

              {selectedIntern.notes && (
                <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg text-xs">
                  <p className="font-bold text-navy mb-1">Mentor Notes / Skills Profile</p>
                  <p className="text-slate-700">{selectedIntern.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button variant="outline" size="sm" onClick={() => setSelectedIntern(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<ClipboardList size={14} />}
                  onClick={() => {
                    setSelectedIntern(null)
                    navigate('/mentor/evaluations')
                  }}
                >
                  Conduct Evaluation
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </MentorLayout>
  )
}

export default MentorInternsPage
