import React, { useState, useMemo } from 'react'
import {
  ClipboardList,
  Award,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { accountService, type EvaluationRecord } from '../../lib/accountService'
import MentorLayout from '../../components/layout/MentorLayout'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'

const MentorEvaluationsPage: React.FC = () => {
  const { user, profile } = useAuth()
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>(() => accountService.getEvaluations())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [toast, setToast] = useState('')

  // Form state
  const [selectedInternId, setSelectedInternId] = useState('')
  const [stageNumber, setStageNumber] = useState<number>(1)
  const [learningAgility, setLearningAgility] = useState<number>(18)
  const [techProficiency, setTechProficiency] = useState<number>(25)
  const [problemSolving, setProblemSolving] = useState<number>(17)
  const [collaboration, setCollaboration] = useState<number>(13)
  const [deliverableQuality, setDeliverableQuality] = useState<number>(12)
  const [strengths, setStrengths] = useState('')
  const [improvements, setImprovements] = useState('')
  const [actionPlan, setActionPlan] = useState('')
  const [formError, setFormError] = useState('')

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

  // Total calculated score
  const totalScore =
    learningAgility + techProficiency + problemSolving + collaboration + deliverableQuality

  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInternId) {
      setFormError('Please select an intern to evaluate.')
      return
    }

    const intern = assignedInterns.find((i) => i.id === selectedInternId)
    if (!intern) {
      setFormError('Intern not found among assigned candidates.')
      return
    }

    if (!strengths.trim() || !improvements.trim()) {
      setFormError('Please fill in both key strengths and areas for improvement.')
      return
    }

    try {
      const newEval = accountService.saveEvaluation({
        intern_id: intern.id,
        intern_name: intern.profile?.full_name ?? 'Intern',
        intern_email: intern.profile?.email ?? '',
        mentor_id: mentorRecord?.id ?? 'm1',
        mentor_name: profile?.full_name ?? 'Mentor',
        track: intern.track || 'Technology Track',
        stage_number: stageNumber,
        total_score: totalScore,
        status: 'approved',
        learning_agility: learningAgility,
        technical_proficiency: techProficiency,
        problem_solving: problemSolving,
        collaboration: collaboration,
        deliverable_quality: deliverableQuality,
        strengths: strengths.trim(),
        areas_for_improvement: improvements.trim(),
        action_plan: actionPlan.trim(),
      })

      setEvaluations(accountService.getEvaluations())
      setIsModalOpen(false)
      setToast(`Stage ${stageNumber} evaluation recorded for ${newEval.intern_name}!`)
      setTimeout(() => setToast(''), 4000)

      // Reset form
      setStrengths('')
      setImprovements('')
      setActionPlan('')
      setFormError('')
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save evaluation')
    }
  }

  return (
    <MentorLayout
      title="Stage Evaluations"
      subtitle="Comprehensive Stage 1–4 competency assessments based on the L-B-S-S performance rubric"
    >
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-navy text-white text-sm px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Top Header & New Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-navy">Competency Evaluation Records</h2>
            <p className="text-xs text-muted">
              Official evaluations determine intern stage progression and readiness for certification.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={15} />}
            onClick={() => {
              if (assignedInterns.length > 0 && !selectedInternId) {
                setSelectedInternId(assignedInterns[0].id)
              }
              setIsModalOpen(true)
            }}
          >
            Conduct New Evaluation
          </Button>
        </div>

        {/* Evaluation History Table */}
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-bold text-muted uppercase tracking-wider">
                  <th className="px-5 py-3.5">Intern Name</th>
                  <th className="px-4 py-3.5">Stage</th>
                  <th className="px-4 py-3.5">Track</th>
                  <th className="px-4 py-3.5">Total Score</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Key Strengths</th>
                  <th className="px-4 py-3.5">Evaluation Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {evaluations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-muted">
                      <div className="flex flex-col items-center justify-center">
                        <ClipboardList className="w-10 h-10 text-gray-300 mb-2" />
                        <p className="font-semibold text-navy">No evaluations recorded yet</p>
                        <p className="text-xs text-muted mt-1">
                          Click &quot;Conduct New Evaluation&quot; to submit a stage assessment.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  evaluations.map((ev) => (
                    <tr key={ev.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-navy">{ev.intern_name}</p>
                        <p className="text-xs text-muted">{ev.intern_email}</p>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="primary" size="sm">Stage {ev.stage_number}</Badge>
                      </td>
                      <td className="px-4 py-4 text-xs font-medium text-navy">{ev.track}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-navy text-sm">{ev.total_score} / 100</span>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              ev.total_score >= 80
                                ? 'bg-emerald-500'
                                : ev.total_score >= 60
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="success" size="sm">
                          {ev.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-xs text-slate-700 line-clamp-1 max-w-xs">{ev.strengths}</p>
                      </td>
                      <td className="px-4 py-4 text-xs text-muted">
                        {new Date(ev.submitted_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Conduct Evaluation Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Conduct Stage Competency Evaluation"
          size="lg"
        >
          <form onSubmit={handleSubmitEvaluation} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy mb-1">Select Intern *</label>
                <select
                  value={selectedInternId}
                  onChange={(e) => setSelectedInternId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
                >
                  <option value="">-- Choose Candidate --</option>
                  {assignedInterns.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.profile?.full_name} ({i.intern_id}) - {i.track}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">Program Stage *</label>
                <select
                  value={stageNumber}
                  onChange={(e) => setStageNumber(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
                >
                  <option value={1}>Stage 1: Learner (Weeks 1–6)</option>
                  <option value={2}>Stage 2: Practitioner (Weeks 7–12)</option>
                  <option value={3}>Stage 3: Developer (Weeks 13–18)</option>
                  <option value={4}>Stage 4: Professional (Weeks 19–24)</option>
                </select>
              </div>
            </div>

            {/* Rubric Metrics Breakdown */}
            <div className="p-3 bg-gray-50 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="text-xs font-bold text-navy uppercase tracking-wider">
                  L-B-S-S Weighted Performance Metrics
                </span>
                <span className="text-sm font-bold text-primary">
                  Total Score: {totalScore} / 100
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-navy">Learning Agility &amp; Speed</span>
                    <span className="font-bold text-primary">{learningAgility}/20</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={learningAgility}
                    onChange={(e) => setLearningAgility(Number(e.target.value))}
                    className="w-full cursor-pointer accent-primary"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-navy">Technical Proficiency</span>
                    <span className="font-bold text-primary">{techProficiency}/30</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={techProficiency}
                    onChange={(e) => setTechProficiency(Number(e.target.value))}
                    className="w-full cursor-pointer accent-primary"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-navy">Problem Solving &amp; Architecture</span>
                    <span className="font-bold text-primary">{problemSolving}/20</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={problemSolving}
                    onChange={(e) => setProblemSolving(Number(e.target.value))}
                    className="w-full cursor-pointer accent-primary"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-navy">Professional Collaboration</span>
                    <span className="font-bold text-primary">{collaboration}/15</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={collaboration}
                    onChange={(e) => setCollaboration(Number(e.target.value))}
                    className="w-full cursor-pointer accent-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-navy">Deliverable Quality &amp; Presentation</span>
                    <span className="font-bold text-primary">{deliverableQuality}/15</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={deliverableQuality}
                    onChange={(e) => setDeliverableQuality(Number(e.target.value))}
                    className="w-full cursor-pointer accent-primary"
                  />
                </div>
              </div>
            </div>

            {/* Qualitative Feedback */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-navy mb-1">Demonstrated Strengths *</label>
                <textarea
                  rows={2}
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="Key competencies, code structure, initiative demonstrated during this stage..."
                  required
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">Areas for Improvement *</label>
                <textarea
                  rows={2}
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  placeholder="Specific topics where candidate needs more practice or conceptual clarity..."
                  required
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">Action Plan for Next Milestone</label>
                <input
                  type="text"
                  value={actionPlan}
                  onChange={(e) => setActionPlan(e.target.value)}
                  placeholder="E.g., Complete AWS certification exam by Week 12, implement test automation suite."
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
                />
              </div>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" icon={<Award size={14} />}>
                Save Official Evaluation
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </MentorLayout>
  )
}

export default MentorEvaluationsPage
