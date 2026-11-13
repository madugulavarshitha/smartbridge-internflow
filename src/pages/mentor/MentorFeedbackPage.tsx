import React, { useState, useMemo } from 'react'
import {
  MessageSquare,
  AlertCircle,
  Plus,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import {
  accountService,
  type MentorFeedbackRecord,
  type ImprovementPlanRecord,
} from '../../lib/accountService'
import MentorLayout from '../../components/layout/MentorLayout'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'

const MentorFeedbackPage: React.FC = () => {
  const { user, profile } = useAuth()
  const [tab, setTab] = useState<'feedback' | 'improvements'>('feedback')
  const [toast, setToast] = useState('')

  // Modals
  const [isAddFbOpen, setIsAddFbOpen] = useState(false)
  const [isAddImpOpen, setIsAddImpOpen] = useState(false)

  // Feedback form
  const [fbInternId, setFbInternId] = useState('')
  const [fbCategory, setFbCategory] = useState<MentorFeedbackRecord['category']>('Technical Skills')
  const [fbComments, setFbComments] = useState('')
  const [fbStrengths, setFbStrengths] = useState('')
  const [fbRecs, setFbRecs] = useState('')

  // Improvement form
  const [impInternId, setImpInternId] = useState('')
  const [impArea, setImpArea] = useState('')
  const [impObs, setImpObs] = useState('')
  const [impObj, setImpObj] = useState('')
  const [impActivities, setImpActivities] = useState('')
  const [impEvidence, setImpEvidence] = useState('')
  const [impTargetDate, setImpTargetDate] = useState('2026-06-30')
  const [impFollowUp, setImpFollowUp] = useState('2026-06-15')

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

  // Assigned interns
  const assignedInterns = useMemo(() => {
    if (!mentorRecord) return []
    return accountService.getAssignedInternsForMentor(mentorRecord.id)
  }, [mentorRecord])

  const assignedInternIds = useMemo(() => {
    return new Set(assignedInterns.map((i) => i.id))
  }, [assignedInterns])

  // Filtered feedback and improvements
  const [feedbackList, setFeedbackList] = useState<MentorFeedbackRecord[]>(() =>
    accountService.getFeedback()
  )
  const [improvementsList, setImprovementsList] = useState<ImprovementPlanRecord[]>(() =>
    accountService.getImprovementPlans()
  )

  const relevantFeedback = useMemo(() => {
    return feedbackList.filter(
      (f) => assignedInternIds.has(f.intern_id) || f.mentor_id === mentorRecord?.id
    )
  }, [feedbackList, assignedInternIds, mentorRecord])

  const relevantImprovements = useMemo(() => {
    return improvementsList.filter(
      (i) => assignedInternIds.has(i.intern_id) || i.mentor_id === mentorRecord?.id
    )
  }, [improvementsList, assignedInternIds, mentorRecord])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  const handleSaveFeedback = (e: React.FormEvent) => {
    e.preventDefault()
    const targetIntern = assignedInterns.find((i) => i.id === fbInternId)
    if (!targetIntern) return

    accountService.saveFeedback({
      intern_id: targetIntern.id,
      intern_name: targetIntern.profile?.full_name ?? 'Intern',
      mentor_id: mentorRecord?.id ?? 'm1',
      mentor_name: profile?.full_name ?? 'Mentor',
      category: fbCategory,
      stage_number: targetIntern.current_stage || 1,
      comments: fbComments.trim(),
      strengths: fbStrengths.trim() || undefined,
      recommendations: fbRecs.trim() || undefined,
      is_acknowledged: false,
    })

    setFeedbackList(accountService.getFeedback())
    setIsAddFbOpen(false)
    setFbComments('')
    setFbStrengths('')
    setFbRecs('')
    showToast(`Feedback logged for ${targetIntern.profile?.full_name}!`)
  }

  const handleSaveImprovement = (e: React.FormEvent) => {
    e.preventDefault()
    const targetIntern = assignedInterns.find((i) => i.id === impInternId)
    if (!targetIntern) return

    accountService.saveImprovementPlan({
      intern_id: targetIntern.id,
      intern_name: targetIntern.profile?.full_name ?? 'Intern',
      mentor_id: mentorRecord?.id ?? 'm1',
      mentor_name: profile?.full_name ?? 'Mentor',
      area_for_improvement: impArea.trim(),
      current_performance_observation: impObs.trim(),
      improvement_objective: impObj.trim(),
      recommended_activities: impActivities.trim(),
      expected_evidence: impEvidence.trim(),
      target_date: impTargetDate,
      follow_up_date: impFollowUp,
      status: 'active',
    })

    setImprovementsList(accountService.getImprovementPlans())
    setIsAddImpOpen(false)
    setImpArea('')
    setImpObs('')
    setImpObj('')
    setImpActivities('')
    setImpEvidence('')
    showToast(`Improvement plan initiated for ${targetIntern.profile?.full_name}!`)
  }

  const handleUpdateImpStatus = (planId: string, nextStatus: ImprovementPlanRecord['status']) => {
    accountService.updateImprovementPlanStatus(planId, nextStatus)
    setImprovementsList(accountService.getImprovementPlans())
    showToast(`Improvement plan status updated to ${nextStatus}!`)
  }

  return (
    <MentorLayout
      title="Feedback &amp; Improvement Plans"
      subtitle="Coaching observations, performance feedback, and targeted skill remediation plans"
    >
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-navy text-white text-sm px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Top Controls & Tab Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1">
            <button
              onClick={() => setTab('feedback')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                tab === 'feedback'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-muted hover:text-navy hover:bg-gray-50'
              }`}
            >
              <MessageSquare size={14} />
              <span>Structured Feedback ({relevantFeedback.length})</span>
            </button>
            <button
              onClick={() => setTab('improvements')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                tab === 'improvements'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-muted hover:text-navy hover:bg-gray-50'
              }`}
            >
              <AlertCircle size={14} />
              <span>Improvement Plans ({relevantImprovements.length})</span>
            </button>
          </div>

          <div>
            {tab === 'feedback' ? (
              <Button
                variant="primary"
                size="sm"
                icon={<Plus size={14} />}
                onClick={() => {
                  if (assignedInterns.length > 0 && !fbInternId) {
                    setFbInternId(assignedInterns[0].id)
                  }
                  setIsAddFbOpen(true)
                }}
              >
                Log Feedback
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                icon={<Plus size={14} />}
                onClick={() => {
                  if (assignedInterns.length > 0 && !impInternId) {
                    setImpInternId(assignedInterns[0].id)
                  }
                  setIsAddImpOpen(true)
                }}
              >
                Initiate Improvement Plan
              </Button>
            )}
          </div>
        </div>

        {/* Tab 1: Structured Feedback */}
        {tab === 'feedback' && (
          <div className="space-y-3">
            {relevantFeedback.length === 0 ? (
              <Card>
                <div className="py-12 text-center text-muted">
                  <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="font-semibold text-navy">No feedback logged yet</p>
                  <p className="text-xs text-muted mt-1">
                    Click &quot;Log Feedback&quot; to write structured mentoring observations.
                  </p>
                </div>
              </Card>
            ) : (
              relevantFeedback.map((fb) => (
                <Card key={fb.id}>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-navy text-sm">{fb.intern_name}</span>
                        <Badge variant="primary" size="sm">{fb.category}</Badge>
                        <span className="text-muted">Stage {fb.stage_number}</span>
                      </div>
                      <span className="text-muted">{new Date(fb.created_at).toLocaleDateString()}</span>
                    </div>

                    <p className="text-slate-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                      {fb.comments}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      {fb.strengths && (
                        <span className="text-emerald-700">
                          <strong>Strengths:</strong> {fb.strengths}
                        </span>
                      )}
                      {fb.recommendations && (
                        <span className="text-primary font-semibold">
                          <strong>Recommendation:</strong> {fb.recommendations}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Improvement Plans */}
        {tab === 'improvements' && (
          <div className="space-y-3">
            {relevantImprovements.length === 0 ? (
              <Card>
                <div className="py-12 text-center text-muted">
                  <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="font-semibold text-navy">No active improvement plans</p>
                  <p className="text-xs text-muted mt-1">
                    All candidates in your cohort are on track.
                  </p>
                </div>
              </Card>
            ) : (
              relevantImprovements.map((imp) => (
                <Card key={imp.id}>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-navy text-sm">{imp.intern_name}</span>
                        <span className="font-semibold text-primary">{imp.area_for_improvement}</span>
                      </div>
                      <Badge variant={imp.status === 'completed' ? 'success' : 'warning'} size="sm">
                        {imp.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                        <p className="font-bold text-navy">Performance Observation:</p>
                        <p className="text-slate-700">{imp.current_performance_observation}</p>
                      </div>
                      <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-1">
                        <p className="font-bold text-primary">Improvement Objective:</p>
                        <p className="text-slate-700">{imp.improvement_objective}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                      <p className="font-bold text-navy">Recommended Remediation Activities:</p>
                      <p className="text-slate-700">{imp.recommended_activities}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-muted text-[11px]">
                        <span>Target: {imp.target_date}</span>
                        <span>Follow-Up: {imp.follow_up_date}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {imp.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateImpStatus(imp.id, 'under_review')}
                          >
                            Mark Under Review
                          </Button>
                        )}
                        {imp.status === 'under_review' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleUpdateImpStatus(imp.id, 'completed')}
                          >
                            Approve &amp; Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Add Feedback Modal */}
        <Modal
          isOpen={isAddFbOpen}
          onClose={() => setIsAddFbOpen(false)}
          title="Log Mentoring Coaching Feedback"
          size="md"
        >
          <form onSubmit={handleSaveFeedback} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Select Candidate *</label>
              <select
                value={fbInternId}
                onChange={(e) => setFbInternId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              >
                <option value="">-- Choose Assigned Intern --</option>
                {assignedInterns.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.profile?.full_name} ({i.intern_id}) - Stage {i.current_stage}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy mb-1">Feedback Category *</label>
              <select
                value={fbCategory}
                onChange={(e) => setFbCategory(e.target.value as MentorFeedbackRecord['category'])}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              >
                <option value="Technical Skills">Technical Skills</option>
                <option value="Problem Solving">Problem Solving</option>
                <option value="Communication">Communication</option>
                <option value="Learning Consistency">Learning Consistency</option>
                <option value="Task Execution">Task Execution</option>
                <option value="Quality of Work">Quality of Work</option>
                <option value="Team Collaboration">Team Collaboration</option>
                <option value="Ownership">Ownership</option>
                <option value="Professional Development">Professional Development</option>
                <option value="Improvement Areas">Improvement Areas</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy mb-1">Observations &amp; Comments *</label>
              <textarea
                rows={3}
                value={fbComments}
                onChange={(e) => setFbComments(e.target.value)}
                placeholder="Specific qualitative feedback observed during this mentoring cycle..."
                required
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy mb-1">Identified Strengths</label>
              <input
                type="text"
                value={fbStrengths}
                onChange={(e) => setFbStrengths(e.target.value)}
                placeholder="e.g. Rapid debugging, clean code style"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy mb-1">Recommended Next Steps</label>
              <input
                type="text"
                value={fbRecs}
                onChange={(e) => setFbRecs(e.target.value)}
                placeholder="e.g. Review AWS Well-Architected Reliability Pillar"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddFbOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Feedback
              </Button>
            </div>
          </form>
        </Modal>

        {/* Add Improvement Plan Modal */}
        <Modal
          isOpen={isAddImpOpen}
          onClose={() => setIsAddImpOpen(false)}
          title="Initiate Performance Improvement Plan"
          size="md"
        >
          <form onSubmit={handleSaveImprovement} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Candidate *</label>
              <select
                value={impInternId}
                onChange={(e) => setImpInternId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              >
                <option value="">-- Choose Assigned Intern --</option>
                {assignedInterns.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.profile?.full_name} ({i.intern_id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Development Area *</label>
              <input
                type="text"
                value={impArea}
                onChange={(e) => setImpArea(e.target.value)}
                placeholder="e.g. Test Coverage &amp; Bulk Execution"
                required
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Current Performance Observation *</label>
              <textarea
                rows={2}
                value={impObs}
                onChange={(e) => setImpObs(e.target.value)}
                placeholder="Describe the specific gap observed..."
                required
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Target Objective *</label>
              <input
                type="text"
                value={impObj}
                onChange={(e) => setImpObj(e.target.value)}
                placeholder="Clear measurable target outcome..."
                required
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Recommended Activities *</label>
              <textarea
                rows={2}
                value={impActivities}
                onChange={(e) => setImpActivities(e.target.value)}
                placeholder="Required tutorials, documentation, and exercises..."
                required
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Expected Deliverable Evidence *</label>
              <input
                type="text"
                value={impEvidence}
                onChange={(e) => setImpEvidence(e.target.value)}
                placeholder="PR link, passed test suite report, or demo URL"
                required
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-navy mb-1">Target Date</label>
                <input
                  type="date"
                  value={impTargetDate}
                  onChange={(e) => setImpTargetDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy mb-1">Follow-Up Date</label>
                <input
                  type="date"
                  value={impFollowUp}
                  onChange={(e) => setImpFollowUp(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddImpOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save &amp; Activate Plan
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </MentorLayout>
  )
}

export default MentorFeedbackPage
