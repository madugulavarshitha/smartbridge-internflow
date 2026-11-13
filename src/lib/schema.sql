-- ============================================================
-- SMARTBRIDGE INTERNFLOW LaunchPad – Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL UNIQUE,
  full_name     TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('admin', 'mentor', 'intern')),
  avatar_url    TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ADMIN PERMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_permissions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  permission_group TEXT NOT NULL CHECK (permission_group IN ('super_admin','hr_admin','talent_accelerator','delivery_lead','management_viewer')),
  permissions      JSONB NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(profile_id)
);

-- ============================================================
-- BATCHES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.batches (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  code           TEXT NOT NULL UNIQUE,
  description    TEXT,
  start_date     DATE,
  end_date       DATE,
  duration_weeks INTEGER NOT NULL DEFAULT 24,
  status         TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','completed')),
  track          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- MENTORS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mentors (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  employee_id  TEXT NOT NULL UNIQUE,
  department   TEXT,
  domain       TEXT,
  expertise    TEXT[],
  designation  TEXT,
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INTERNS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.interns (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  intern_id     TEXT NOT NULL UNIQUE,
  batch_id      UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  joining_date  DATE,
  track         TEXT,
  current_stage INTEGER NOT NULL DEFAULT 0 CHECK (current_stage BETWEEN 0 AND 4),
  status        TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited','active','inactive','on_hold','completed','withdrawn')),
  college       TEXT,
  degree        TEXT,
  branch        TEXT,
  grad_year     INTEGER,
  phone         TEXT,
  notes         TEXT,
  created_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- MENTOR ASSIGNMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mentor_assignments (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  intern_id      UUID NOT NULL REFERENCES public.interns(id) ON DELETE CASCADE,
  mentor_id      UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  assigned_by    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  effective_date DATE,
  end_date       DATE,
  reason         TEXT,
  is_current     BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(intern_id, mentor_id, is_current)
);

-- ============================================================
-- TASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT,
  mentor_id   UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  intern_id   UUID NOT NULL REFERENCES public.interns(id) ON DELETE CASCADE,
  batch_id    UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  stage       INTEGER,
  due_date    DATE,
  priority    TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','submitted','reviewed','overdue')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- MONTHLY REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.monthly_reports (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  intern_id       UUID NOT NULL REFERENCES public.interns(id) ON DELETE CASCADE,
  mentor_id       UUID REFERENCES public.mentors(id) ON DELETE SET NULL,
  batch_id        UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  report_month    DATE NOT NULL,
  learn_score     NUMERIC(5,2) CHECK (learn_score BETWEEN 0 AND 100),
  build_score     NUMERIC(5,2) CHECK (build_score BETWEEN 0 AND 100),
  share_score     NUMERIC(5,2) CHECK (share_score BETWEEN 0 AND 100),
  showcase_score  NUMERIC(5,2) CHECK (showcase_score BETWEEN 0 AND 100),
  overall_kpi     NUMERIC(5,2) CHECK (overall_kpi BETWEEN 0 AND 100),
  evidence        JSONB DEFAULT '{}',
  intern_notes    TEXT,
  mentor_feedback TEXT,
  status          TEXT NOT NULL DEFAULT 'not_submitted' CHECK (status IN ('not_submitted','submitted','under_review','revision_requested','reviewed','approved')),
  submitted_at    TIMESTAMPTZ,
  reviewed_at     TIMESTAMPTZ,
  UNIQUE(intern_id, report_month)
);

-- ============================================================
-- STAGE EVALUATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.stage_evaluations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  intern_id     UUID NOT NULL REFERENCES public.interns(id) ON DELETE CASCADE,
  mentor_id     UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  stage_number  INTEGER NOT NULL CHECK (stage_number BETWEEN 1 AND 4),
  metric_scores JSONB NOT NULL DEFAULT '{}',
  total_score   NUMERIC(5,2),
  comments      TEXT,
  evidence      JSONB DEFAULT '{}',
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','submitted','reviewed')),
  evaluated_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- CERTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.certifications (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  intern_id           UUID NOT NULL REFERENCES public.interns(id) ON DELETE CASCADE,
  mentor_id           UUID REFERENCES public.mentors(id) ON DELETE SET NULL,
  milestone_week      INTEGER NOT NULL CHECK (milestone_week IN (12, 24)),
  cert_name           TEXT,
  cert_issuer         TEXT,
  issue_date          DATE,
  evidence_url        TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending','verified','rejected')),
  mentor_comments     TEXT,
  verified_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PROGRESSION DECISIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.progression_decisions (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  intern_id            UUID NOT NULL REFERENCES public.interns(id) ON DELETE CASCADE,
  from_stage           INTEGER NOT NULL,
  to_stage             INTEGER,
  evaluation_id        UUID REFERENCES public.stage_evaluations(id) ON DELETE SET NULL,
  decision             TEXT NOT NULL CHECK (decision IN ('approved','return_for_evaluation','improvement_required','deferred')),
  reason               TEXT,
  decided_by           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  decided_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  mentor_recommendation TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- IMPROVEMENT PLANS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.improvement_plans (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  intern_id      UUID NOT NULL REFERENCES public.interns(id) ON DELETE CASCADE,
  mentor_id      UUID REFERENCES public.mentors(id) ON DELETE SET NULL,
  stage          INTEGER,
  concerns       TEXT,
  weak_pillars   TEXT[],
  objectives     TEXT,
  action_items   JSONB DEFAULT '[]',
  assigned_to    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_date    DATE,
  follow_up_date DATE,
  status         TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','under_review','completed','escalated')),
  outcome        TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,
  title           TEXT NOT NULL,
  message         TEXT NOT NULL,
  related_entity  TEXT,
  related_id      UUID,
  is_read         BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_role   TEXT NOT NULL,
  action       TEXT NOT NULL,
  entity_type  TEXT NOT NULL,
  entity_id    UUID,
  before_value JSONB,
  after_value  JSONB,
  reason       TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_interns_profile_id ON public.interns(profile_id);
CREATE INDEX IF NOT EXISTS idx_interns_batch_id ON public.interns(batch_id);
CREATE INDEX IF NOT EXISTS idx_interns_status ON public.interns(status);
CREATE INDEX IF NOT EXISTS idx_interns_current_stage ON public.interns(current_stage);
CREATE INDEX IF NOT EXISTS idx_mentor_assignments_intern_id ON public.mentor_assignments(intern_id);
CREATE INDEX IF NOT EXISTS idx_mentor_assignments_mentor_id ON public.mentor_assignments(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_assignments_is_current ON public.mentor_assignments(is_current);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_intern_id ON public.monthly_reports(intern_id);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_month ON public.monthly_reports(report_month);
CREATE INDEX IF NOT EXISTS idx_stage_evaluations_intern_id ON public.stage_evaluations(intern_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON public.audit_logs(entity_type);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progression_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.improvement_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles: anyone can read their own; admins read all
CREATE POLICY "profiles_self_read" ON public.profiles FOR SELECT USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_admin_write" ON public.profiles FOR ALL USING (public.is_admin());

-- Batches: authenticated read; admin write
CREATE POLICY "batches_read" ON public.batches FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "batches_admin_write" ON public.batches FOR ALL USING (public.is_admin());

-- Mentors: authenticated read; admin write
CREATE POLICY "mentors_read" ON public.mentors FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "mentors_admin_write" ON public.mentors FOR ALL USING (public.is_admin());

-- Interns: admin full access; mentor read their interns
CREATE POLICY "interns_admin_all" ON public.interns FOR ALL USING (public.is_admin());
CREATE POLICY "interns_mentor_read" ON public.interns FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.mentor_assignments ma
    JOIN public.mentors m ON ma.mentor_id = m.id
    WHERE ma.intern_id = public.interns.id AND m.profile_id = auth.uid() AND ma.is_current = true
  )
);
CREATE POLICY "interns_self_read" ON public.interns FOR SELECT USING (profile_id = auth.uid());

-- Notifications: recipient reads their own
CREATE POLICY "notifications_own" ON public.notifications FOR ALL USING (recipient_id = auth.uid());

-- Audit logs: admin read
CREATE POLICY "audit_logs_admin_read" ON public.audit_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "audit_logs_insert" ON public.audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Monthly reports: intern own; mentor assigned; admin all
CREATE POLICY "monthly_reports_admin" ON public.monthly_reports FOR ALL USING (public.is_admin());
CREATE POLICY "monthly_reports_intern" ON public.monthly_reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.interns WHERE id = public.monthly_reports.intern_id AND profile_id = auth.uid())
);

-- Stage evaluations: mentor & admin
CREATE POLICY "stage_evals_admin" ON public.stage_evaluations FOR ALL USING (public.is_admin());
CREATE POLICY "stage_evals_mentor" ON public.stage_evaluations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.mentors WHERE id = public.stage_evaluations.mentor_id AND profile_id = auth.uid())
);

-- Improvement plans: admin & mentor
CREATE POLICY "improvement_plans_admin" ON public.improvement_plans FOR ALL USING (public.is_admin());

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER interns_updated_at BEFORE UPDATE ON public.interns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER mentors_updated_at BEFORE UPDATE ON public.mentors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER improvement_plans_updated_at BEFORE UPDATE ON public.improvement_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

