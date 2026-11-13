import React, { useState, useMemo } from 'react'
import {
  CheckSquare,
  Clock,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { accountService, type TaskRecord } from '../../lib/accountService'
import InternLayout from '../../components/layout/InternLayout'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'

const InternTasksPage: React.FC = () => {
  const { user, profile } = useAuth()
  const [tasks, setTasks] = useState<TaskRecord[]>(() => accountService.getTasks())
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'submitted' | 'reviewed'>('all')
  const [search, setSearch] = useState('')
  const [submitModalTask, setSubmitModalTask] = useState<TaskRecord | null>(null)

  // Submit modal inputs
  const [submissionText, setSubmissionText] = useState('')
  const [submissionUrl, setSubmissionUrl] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [toast, setToast] = useState('')

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

  // Get tasks for this intern
  const myTasks = useMemo(() => {
    if (!profile) return []
    const internId = internRecord?.id ?? ''
    const email = profile.email.toLowerCase()

    return tasks.filter((t) => {
      const isMine =
        t.intern_id === internId ||
        t.intern_email.toLowerCase() === email ||
        (internRecord?.track && t.track.toLowerCase() === internRecord.track.toLowerCase())

      if (!isMine) return false
      if (statusFilter !== 'all' && t.status !== statusFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        return t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      }
      return true
    })
  }, [tasks, profile, internRecord, statusFilter, search])

  const openSubmitModal = (task: TaskRecord) => {
    setSubmitModalTask(task)
    setSubmissionText(task.submission_text ?? '')
    setSubmissionUrl(task.submission_url ?? '')
    setSubmitError('')
  }

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!submitModalTask) return

    if (!submissionText.trim() && !submissionUrl.trim()) {
      setSubmitError('Please provide either deliverable notes or a repository / evidence link.')
      return
    }

    try {
      accountService.submitTask(submitModalTask.id, {
        submission_text: submissionText.trim(),
        submission_url: submissionUrl.trim() || undefined,
      })

      setTasks(accountService.getTasks())
      setSubmitModalTask(null)
      setToast('Deliverable submitted successfully! Your mentor has been notified for review.')
      setTimeout(() => setToast(''), 4500)
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed')
    }
  }

  return (
    <InternLayout
      title="My Deliverables &amp; Tasks"
      subtitle="Complete stage tasks, submit source code repositories, and view mentor evaluations"
    >
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-navy text-white text-sm px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full sm:w-auto flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={17} />
              <input
                type="text"
                placeholder="Search my deliverables..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-navy"
              />
            </div>
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
              {(['all', 'pending', 'submitted', 'reviewed'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    statusFilter === st
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-muted hover:text-navy hover:bg-gray-50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Task Cards */}
        <div className="space-y-4">
          {myTasks.length === 0 ? (
            <Card>
              <div className="py-12 text-center text-muted">
                <CheckSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="font-semibold text-navy">No tasks found</p>
                <p className="text-xs text-muted mt-1">
                  {statusFilter !== 'all' ? `No tasks with status "${statusFilter}".` : 'You have no assigned tasks right now.'}
                </p>
              </div>
            </Card>
          ) : (
            myTasks.map((t) => (
              <Card key={t.id}>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="primary" size="sm">Stage {t.stage_number}</Badge>
                      <span className="text-xs text-muted font-medium">Due: {t.due_date}</span>
                    </div>

                    <div>
                      {t.status === 'reviewed' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={13} /> Score: {t.mentor_score} / 100
                        </span>
                      )}
                      {t.status === 'submitted' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock size={13} /> Submitted (Awaiting Review)
                        </span>
                      )}
                      {t.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                          Pending Submission
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-navy text-base">{t.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{t.description}</p>
                  </div>

                  {/* If Reviewed: Show Score & Mentor Feedback */}
                  {t.status === 'reviewed' && t.mentor_feedback && (
                    <div className="p-3 bg-emerald-50/50 border border-emerald-200/70 rounded-xl space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-emerald-800 font-bold">
                        <span>Mentor Review &amp; Score Feedback</span>
                        <span>{t.mentor_score} / 100</span>
                      </div>
                      <p className="text-slate-700 italic">{t.mentor_feedback}</p>
                      {t.reviewed_at && (
                        <p className="text-[10px] text-muted text-right">
                          Reviewed on {new Date(t.reviewed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Submission Details */}
                  {t.submission_text && (
                    <div className="p-3 bg-gray-50 rounded-xl space-y-1 text-xs">
                      <p className="font-bold text-navy">Your Submission Deliverable:</p>
                      <p className="text-slate-700">{t.submission_text}</p>
                      {t.submission_url && (
                        <div className="pt-1">
                          <a
                            href={t.submission_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                          >
                            <ExternalLink size={12} />
                            {t.submission_url}
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                    <Button
                      variant={t.status === 'pending' ? 'primary' : 'outline'}
                      size="sm"
                      icon={<UploadCloud size={14} />}
                      onClick={() => openSubmitModal(t)}
                    >
                      {t.status === 'pending' ? 'Submit Deliverable' : 'Update Submission'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Submit Modal */}
        <Modal
          isOpen={!!submitModalTask}
          onClose={() => setSubmitModalTask(null)}
          title={`Submit Deliverable: ${submitModalTask?.title ?? ''}`}
          size="lg"
        >
          {submitModalTask && (
            <form onSubmit={handleSubmitTask} className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 text-xs">
                <p className="font-bold text-navy">{submitModalTask.title}</p>
                <p className="text-slate-600">{submitModalTask.description}</p>
                <p className="text-muted text-[11px]">Due Date: {submitModalTask.due_date}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  Deliverable Summary / Implementation Notes *
                </label>
                <textarea
                  rows={4}
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Describe your solution architecture, features built, test coverage, and key achievements..."
                  required
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  GitHub Repository / Live Deploy Link (Optional)
                </label>
                <input
                  type="url"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  placeholder="https://github.com/your-username/project-repo"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
                />
              </div>

              {submitError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setSubmitModalTask(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" icon={<UploadCloud size={14} />}>
                  Submit for Mentor Review
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </InternLayout>
  )
}

export default InternTasksPage
