export type UserRole = 'admin' | 'mentor' | 'intern'
export type AdminPermissionGroup = 'super_admin' | 'hr_admin' | 'talent_accelerator' | 'delivery_lead' | 'management_viewer'
export type InternStatus = 'invited' | 'active' | 'inactive' | 'on_hold' | 'completed' | 'withdrawn'
export type MentorStatus = 'active' | 'inactive'
export type BatchStatus = 'active' | 'inactive' | 'completed'
export type TaskStatus = 'pending' | 'submitted' | 'reviewed' | 'overdue'
export type ProjectStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'revision_requested' | 'completed'
export type ReportStatus = 'not_submitted' | 'submitted' | 'under_review' | 'revision_requested' | 'reviewed' | 'approved'
export type CertVerificationStatus = 'pending' | 'verified' | 'rejected'
export type ProgressionDecision = 'approved' | 'return_for_evaluation' | 'improvement_required' | 'deferred'
export type ImprovementPlanStatus = 'open' | 'in_progress' | 'under_review' | 'completed' | 'escalated'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AdminPermission {
  id: string
  profile_id: string
  permission_group: AdminPermissionGroup
  permissions: Record<string, boolean>
  created_at: string
}

export interface Intern {
  id: string
  profile_id: string
  intern_id: string
  batch_id?: string
  joining_date?: string
  track?: string
  current_stage: number
  status: InternStatus
  college?: string
  degree?: string
  branch?: string
  grad_year?: number
  phone?: string
  notes?: string
  created_by?: string
  created_at: string
  updated_at: string
  profile?: Profile
  batch?: Batch
  mentor?: Mentor
}

export interface Mentor {
  id: string
  profile_id: string
  employee_id: string
  department?: string
  domain?: string
  expertise?: string[]
  designation?: string
  status: MentorStatus
  created_at: string
  updated_at: string
  profile?: Profile
  intern_count?: number
}

export interface Batch {
  id: string
  name: string
  code: string
  description?: string
  start_date?: string
  end_date?: string
  duration_weeks: number
  status: BatchStatus
  track?: string
  created_at: string
}

export interface MentorAssignment {
  id: string
  intern_id: string
  mentor_id: string
  assigned_by: string
  assigned_at: string
  effective_date?: string
  end_date?: string
  reason?: string
  is_current: boolean
  intern?: Intern
  mentor?: Mentor
}

export interface Task {
  id: string
  title: string
  description?: string
  mentor_id: string
  intern_id: string
  batch_id?: string
  stage?: number
  due_date?: string
  priority: 'low' | 'medium' | 'high'
  status: TaskStatus
  created_at: string
}

export interface MonthlyReport {
  id: string
  intern_id: string
  mentor_id?: string
  batch_id?: string
  report_month: string
  learn_score?: number
  build_score?: number
  share_score?: number
  showcase_score?: number
  overall_kpi?: number
  evidence?: Record<string, unknown>
  intern_notes?: string
  mentor_feedback?: string
  status: ReportStatus
  submitted_at?: string
  reviewed_at?: string
}

export interface StageEvaluation {
  id: string
  intern_id: string
  mentor_id: string
  stage_number: 1 | 2 | 3 | 4
  metric_scores: Record<string, number>
  total_score?: number
  comments?: string
  evidence?: Record<string, unknown>
  status: 'pending' | 'submitted' | 'reviewed'
  evaluated_at?: string
  created_at: string
}

export interface Certification {
  id: string
  intern_id: string
  mentor_id?: string
  milestone_week: 12 | 24
  cert_name?: string
  cert_issuer?: string
  issue_date?: string
  evidence_url?: string
  verification_status: CertVerificationStatus
  mentor_comments?: string
  verified_at?: string
  created_at: string
}

export interface ProgressionDecisionRecord {
  id: string
  intern_id: string
  from_stage: number
  to_stage?: number
  evaluation_id?: string
  decision: ProgressionDecision
  reason?: string
  decided_by: string
  decided_at: string
  mentor_recommendation?: string
  created_at: string
}

export interface ImprovementPlan {
  id: string
  intern_id: string
  mentor_id?: string
  stage?: number
  concerns?: string
  weak_pillars?: string[]
  objectives?: string
  action_items?: Array<{ item: string; due_date?: string; completed: boolean }>
  assigned_to?: string
  target_date?: string
  follow_up_date?: string
  status: ImprovementPlanStatus
  outcome?: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  recipient_id: string
  type: string
  title: string
  message: string
  related_entity?: string
  related_id?: string
  is_read: boolean
  created_at: string
}

export interface AuditLog {
  id: string
  actor_id: string
  actor_role: UserRole
  action: string
  entity_type: string
  entity_id?: string
  before_value?: Record<string, unknown>
  after_value?: Record<string, unknown>
  reason?: string
  created_at: string
  actor?: Profile
}

export interface DashboardStats {
  total_interns: number
  active_interns: number
  inactive_interns: number
  total_mentors: number
  active_mentors: number
  total_batches: number
  unassigned_interns: number
  pending_evaluations: number
  pending_certifications: number
  interns_requiring_attention: number
  completed_interns: number
  stage_distribution: Record<string, number>
}

