# SMARTBRIDGE INTERNFLOW – LAUNCHPAD MANAGEMENT SYSTEM

## Overview
**INTERNFLOW** is the unified software platform managing the **LAUNCHPAD** 24-week intern development and evaluation framework across three interconnected portals (Admin, Mentor, Intern) backed by a single React + TypeScript + Vite frontend and a shared Supabase (PostgreSQL, Auth, Storage, Edge Functions) backend.

## Tech Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Charts & Icons:** Recharts, Lucide React
- **Backend:** Supabase (PostgreSQL, Auth, Row Level Security, Edge Functions)

## Admin Portal Modules
All modules are wired in `src/App.tsx` and accessible from `src/components/layout/Sidebar.tsx`:
- **Dashboard** (`/admin`): Real-time KPI cards, stage distribution, proposed KPI band breakdown, monthly KPI trend, recent activity, interns requiring attention, and quick actions.
- **People Management:**
  - Interns (`/admin/interns`, `/admin/interns/add`, `/admin/interns/:id` with 13+ detail tabs)
  - Mentors (`/admin/mentors`, `/admin/mentors/add`, `/admin/mentors/:id` with assigned interns, evaluations, tasks, certifications, and activity tabs)
  - Batches (`/admin/batches`)
  - Mentor Assignments (`/admin/assignments`)
- **LAUNCHPAD Program:**
  - Program Overview (`/admin/program`)
  - Baseline Assessments (`/admin/baseline`)
  - Stage Evaluations (`/admin/evaluations`)
  - KPI Monitoring (`/admin/kpi`) — uses official weights: Learn 25%, Build 45%, Share 15%, Showcase 15%
  - Monthly Reports (`/admin/reports/monthly`)
- **Work:**
  - Tasks (`/admin/tasks`)
  - Projects (`/admin/projects`)
  - Certifications (`/admin/certifications`)
- **Growth:**
  - Improvement Plans (`/admin/improvement-plans`)
  - Progression Decisions (`/admin/progression`)
- **Administration:**
  - Reports & Analytics (`/admin/reports`)
  - Notifications (`/admin/notifications`)
  - Audit Logs (`/admin/audit-logs`) — immutable read-only log viewer
  - Permissions (`/admin/permissions`) — configurable permission groups within the `admin` role
  - Settings (`/admin/settings`)

## Security & Architecture Rules
- Three primary login roles: `admin`, `mentor`, `intern`. Admin sub-roles (`super_admin`, `hr_admin`, `talent_accelerator`, `delivery_lead`, `management_viewer`) are managed in `public.admin_permissions`.
- No `service_role` keys or permanent passwords in frontend code. Account invitations use the server-side `invite-user` Supabase Edge Function.
- Row Level Security (RLS) is enabled across all tables in `src/lib/schema.sql`.

## Environment Variables
Create a `.env` file in `launchpad/` with:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Scripts
```bash
npm run dev      # Start development server
npm run lint     # Run Oxlint
npm run build    # TypeScript check + Vite production build
```
