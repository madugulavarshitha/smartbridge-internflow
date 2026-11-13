import React, { useState, useMemo } from 'react'
import {
  CheckSquare,
  Clock,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { accountService, type TaskRecord } from '../../lib/accountService'
import MentorLayout from '../../components/layout/MentorLayout'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'

const MentorTasksPage: React.FC = () => {
  const { user, profile } = useAuth()
  const [tasks, setTasks] = useState<TaskRecord[]>(() => accountService.getTasks())
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'submitted' | 'reviewed'>('all')
  const [search, setSearch] = useState('')
  const [selectedTask, setSelectedTask] = useState<TaskRecord | null>(null)

  // Review modal state
  const [reviewScore, setReviewScore] = useState<string>('')
  const [reviewFeedback, setReviewFeedback] = useState<string>('')
  const [reviewError, setReviewError] = useState<string>('')
  const [toast, setToast] = useState<string>('')

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

  // Get assigned intern IDs
  const assignedInternIds = useMemo(() => {
    if (!mentorRecord) return new Set<string>()
    const assigned = accountService.getAssignedInternsForMentor(mentorRecord.id)
    return new Set(assigned.map((i) => i.id))
  }, [mentorRecord])

  // Filter tasks belonging to mentor's interns or track
  const relevantTasks = useMemo(() => {
    return tasks.filter((t) => {
      const isAssigned =
        assignedInternIds.has(t.intern_id) ||
        t.mentor_id === mentorRecord?.id ||
        (mentorRecord?.domain && t.track.toLowerCase() === mentorRecord.domain.toLowerCase())

      if (!isAssigned && assignedInternIds.size > 0) return false

      if (statusFilter !== 'all' && t.status !== statusFilter) return false

      if (search.trim()) {
        const q = search.toLowerCase()
        const matches =
          t.title.toLowerCase().includes(q) ||
          t.intern_name.toLowerCase().includes(q) ||
          t.track.toLowerCase().includes(q)
        if (!matches) return false
      }

      return true
    })
  }, [tasks, assignedInternIds, mentorRecord, statusFilter, search])

  const openReviewModal = (task: TaskRecord) => {
    setSelectedTask(task)
    setReviewScore(task.mentor_score != null ? String(task.mentor_score) : '85')
    setReviewFeedback(task.mentor_feedback ?? '')
    setReviewError('')
  }

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTask) return

    const numScore = Number(reviewScore)
    if (isNaN(numScore) || numScore < 0 || numScore > 100) {
      setReviewError('Score must be a valid number between 0 and 100.')
      return
    }
    if (!reviewFeedback.trim()) {
      setReviewError('Please provide constructive mentor feedback.')
      return
    }

    try {
      accountService.reviewTask(selectedTask.id, {
        mentor_score: numScore,
        mentor_feedback: reviewFeedback.trim(),
      })
      setTasks(accountService.getTasks())
      setSelectedTask(null)
      setToast(`Deliverable review saved for ${selectedTask.intern_name}!`)
      setTimeout(() => setToast(''), 4000)
    } catch (err: unknown) {
      setReviewError(err instanceof Error ? err.message : 'Failed to save review')
    }
  }

  const pendingCount = relevantTasks.filter((t) => t.status === 'submitted').length

  return (
    <MentorLayout
      title="Task & Deliverable Reviews"
      subtitle={`${pendingCount} submissions awaiting mentor scoring & feedback`}
    >
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-navy text-white text-sm px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full sm:w-auto flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={17} />
              <input
                type="text"
                placeholder="Search tasks, interns, or deliverables..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-navy"
              />
            </div>
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
              {(['all', 'submitted', 'pending', 'reviewed'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    statusFilter === st
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-muted hover:text-navy hover:bg-gray-50'
                  }`}
                >
                  {st === 'submitted' ? 'Needs Review' : st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-bold text-muted uppercase tracking-wider">
                  <th className="px-5 py-3.5">Deliverable Title</th>
                  <th className="px-4 py-3.5">Intern</th>
                  <th className="px-4 py-3.5">Track / Stage</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Score</th>
                  <th className="px-4 py-3.5">Submission Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {relevantTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-muted">
                      <div className="flex flex-col items-center justify-center">
                        <CheckSquare className="w-10 h-10 text-gray-300 mb-2" />
                        <p className="font-semibold text-navy">No tasks found</p>
                        <p className="text-xs text-muted mt-1">
                          {statusFilter !== 'all' ? `No tasks with status "${statusFilter}".` : 'No tasks assigned yet.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  relevantTasks.map((t) => (
                    <tr key={t.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-navy leading-tight">{t.title}</p>
                        <p className="text-xs text-muted line-clamp-1 mt-0.5">{t.description}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-navy text-xs">{t.intern_name}</p>
                        <p className="text-[11px] text-muted">{t.intern_email}</p>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="primary" size="sm">Stage {t.stage_number}</Badge>
                        <p className="text-[11px] text-muted mt-0.5">{t.track}</p>
                      </td>
                      <td className="px-4 py-4">
                        {t.status === 'submitted' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock size={12} /> Needs Review
                          </span>
                        )}
                        {t.status === 'reviewed' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={12} /> Reviewed
                          </span>
                        )}
                        {t.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                            Pending Intern
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {t.mentor_score != null ? (
                          <span className="font-bold text-navy text-sm">{t.mentor_score} / 100</span>
                        ) : (
                          <span className="text-muted text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-xs text-muted">
                        {t.submitted_at ? new Date(t.submitted_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {t.status === 'submitted' ? (
                            <Button
                              variant="primary"
                              size="sm"
                              icon={<CheckSquare size={14} />}
                              onClick={() => openReviewModal(t)}
                            >
                              Review &amp; Score
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openReviewModal(t)}
                            >
                              {t.status === 'reviewed' ? 'Edit Review' : 'View Task'}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Review & Score Modal */}
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title={`Review Deliverable: ${selectedTask?.title ?? ''}`}
          size="lg"
        >
          {selectedTask && (
            <form onSubmit={handleSaveReview} className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Intern:</span>
                  <span className="font-bold text-navy">{selectedTask.intern_name} ({selectedTask.intern_email})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Track / Stage:</span>
                  <span className="font-semibold text-navy">{selectedTask.track} · Stage {selectedTask.stage_number}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Due Date:</span>
                  <span className="text-navy">{selectedTask.due_date}</span>
                </div>
              </div>

              {/* Submission Content */}
              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl space-y-2">
                <p className="text-xs font-bold text-navy uppercase tracking-wider">Intern Deliverable Submission</p>
                {selectedTask.submission_text ? (
                  <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-blue-100">
                    {selectedTask.submission_text}
                  </p>
                ) : (
                  <p className="text-xs text-muted italic">No text notes submitted.</p>
                )}
                {selectedTask.submission_url && (
                  <div className="pt-1">
                    <a
                      href={selectedTask.submission_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
                    >
                      <ExternalLink size={13} />
                      Open Project Repository / Submission Link
                    </a>
                  </div>
                )}
              </div>

              {/* Score & Feedback Form */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Deliverable Score (0 to 100) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={reviewScore}
                    onChange={(e) => setReviewScore(e.target.value)}
                    required
                    className="w-32 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-navy focus:border-primary focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Mentor Feedback &amp; Recommendations *
                  </label>
                  <textarea
                    rows={4}
                    value={reviewFeedback}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                    placeholder="Provide constructive feedback on architecture, code quality, edge cases, and areas to improve..."
                    required
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
                  />
                </div>

                {reviewError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle size={15} />
                    <span>{reviewError}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedTask(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" icon={<CheckSquare size={14} />}>
                  Save Review &amp; Notify Intern
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </MentorLayout>
  )
}

export default MentorTasksPage
