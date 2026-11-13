import React, { useMemo } from 'react'
import {
  MessageSquare,
  Award,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { accountService } from '../../lib/accountService'
import InternLayout from '../../components/layout/InternLayout'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'

const InternFeedbackPage: React.FC = () => {
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

  // Get tasks and evaluations
  const myTasks = useMemo(() => {
    if (!profile) return []
    const internId = internRecord?.id ?? ''
    const email = profile.email.toLowerCase()
    return accountService
      .getTasks()
      .filter((t) => (t.intern_id === internId || t.intern_email.toLowerCase() === email) && t.status === 'reviewed')
  }, [profile, internRecord])

  const myEvaluations = useMemo(() => {
    if (!profile) return []
    const internId = internRecord?.id ?? ''
    const email = profile.email.toLowerCase()
    return accountService
      .getEvaluations()
      .filter((e) => e.intern_id === internId || e.intern_email.toLowerCase() === email)
  }, [profile, internRecord])

  return (
    <InternLayout
      title="Mentor Feedback &amp; Evaluations"
      subtitle="Detailed qualitative assessment, task reviews, and action plans from your industry mentor"
    >
      <div className="space-y-6">
        {/* Stage Competency Evaluations */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-navy flex items-center gap-2">
            <Award className="text-primary" size={18} />
            Official Stage Competency Reviews
          </h2>

          {myEvaluations.length === 0 ? (
            <Card>
              <div className="py-8 text-center text-muted text-xs">
                No formal stage evaluations recorded yet. Evaluations occur at the conclusion of each stage.
              </div>
            </Card>
          ) : (
            myEvaluations.map((ev) => (
              <Card key={ev.id}>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                        S{ev.stage_number}
                      </div>
                      <div>
                        <h3 className="font-bold text-navy text-sm">Stage {ev.stage_number} Assessment</h3>
                        <p className="text-xs text-muted">Evaluated by {ev.mentor_name} on {new Date(ev.submitted_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-navy">Score: {ev.total_score} / 100</span>
                      <Badge variant="success" size="sm">Approved</Badge>
                    </div>
                  </div>

                  {/* 5-Metric Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <p className="text-muted text-[11px]">Learning Agility</p>
                      <p className="font-bold text-navy">{ev.learning_agility} / 20</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <p className="text-muted text-[11px]">Technical Proficiency</p>
                      <p className="font-bold text-navy">{ev.technical_proficiency} / 30</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <p className="text-muted text-[11px]">Problem Solving</p>
                      <p className="font-bold text-navy">{ev.problem_solving} / 20</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <p className="text-muted text-[11px]">Collaboration</p>
                      <p className="font-bold text-navy">{ev.collaboration} / 15</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <p className="text-muted text-[11px]">Deliverables</p>
                      <p className="font-bold text-navy">{ev.deliverable_quality} / 15</p>
                    </div>
                  </div>

                  {/* Detailed Comments */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-1">
                      <p className="font-bold text-emerald-800">Demonstrated Strengths</p>
                      <p className="text-slate-700">{ev.strengths}</p>
                    </div>
                    <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl space-y-1">
                      <p className="font-bold text-amber-800">Areas For Improvement</p>
                      <p className="text-slate-700">{ev.areas_for_improvement}</p>
                    </div>
                  </div>

                  {ev.action_plan && (
                    <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-xs space-y-1">
                      <p className="font-bold text-primary">Recommended Action Plan</p>
                      <p className="text-slate-700">{ev.action_plan}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Task Reviews */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-navy flex items-center gap-2">
            <MessageSquare className="text-primary" size={18} />
            Deliverable Reviews
          </h2>

          {myTasks.length === 0 ? (
            <Card>
              <div className="py-8 text-center text-muted text-xs">
                No task reviews recorded yet. Submit deliverables on the Tasks page to receive mentor reviews.
              </div>
            </Card>
          ) : (
            myTasks.map((t) => (
              <Card key={t.id}>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-navy text-sm">{t.title}</h4>
                      <p className="text-muted text-[11px]">Reviewed on {t.reviewed_at ? new Date(t.reviewed_at).toLocaleDateString() : '—'}</p>
                    </div>
                    <Badge variant="success" size="sm">Score: {t.mentor_score} / 100</Badge>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                    <p className="font-semibold text-navy">Mentor Feedback:</p>
                    <p className="text-slate-700 italic">{t.mentor_feedback}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </InternLayout>
  )
}

export default InternFeedbackPage
