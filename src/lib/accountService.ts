import { supabase, isSupabaseConfigured } from './supabase'
import type { Intern, Mentor, MentorAssignment, Profile, UserRole } from '../types'

export type { Intern, Mentor, MentorAssignment, Profile, UserRole }

export interface TaskRecord {
  id: string
  title: string
  description: string
  track: string
  stage_number: number
  intern_id: string
  intern_name: string
  intern_email: string
  mentor_id?: string
  mentor_name?: string
  status: 'pending' | 'submitted' | 'reviewed'
  due_date: string
  submission_text?: string
  submission_url?: string
  submitted_at?: string
  mentor_feedback?: string
  mentor_score?: number
  reviewed_at?: string
  created_at: string
}

export interface EvaluationRecord {
  id: string
  intern_id: string
  intern_name: string
  intern_email: string
  mentor_id: string
  mentor_name: string
  track: string
  stage_number: number
  total_score: number
  status: 'draft' | 'submitted' | 'approved'
  learning_agility: number // /20
  technical_proficiency: number // /30
  problem_solving: number // /20
  collaboration: number // /15
  deliverable_quality: number // /15
  strengths: string
  areas_for_improvement: string
  action_plan: string
  submitted_at: string
}

export interface CertificationRecord {
  id: string
  intern_id: string
  intern_name: string
  intern_email: string
  track: string
  milestone: 'Week 12' | 'Week 24'
  cert_name: string
  cert_issuer: string
  issue_date: string
  credential_url: string
  status: 'pending' | 'verified' | 'rejected'
  verified_by?: string
  verified_at?: string
  remarks?: string
  created_at: string
}

export interface ImprovementPlanRecord {
  id: string
  intern_id: string
  intern_name: string
  mentor_id: string
  mentor_name: string
  area_for_improvement: string
  current_performance_observation: string
  improvement_objective: string
  recommended_activities: string
  expected_evidence: string
  target_date: string
  follow_up_date: string
  mentor_comments?: string
  status: 'draft' | 'active' | 'in_progress' | 'under_review' | 'completed' | 'closed'
  created_at: string
  updated_at: string
}

export interface MentorFeedbackRecord {
  id: string
  intern_id: string
  intern_name: string
  mentor_id: string
  mentor_name: string
  category:
    | 'Technical Skills'
    | 'Problem Solving'
    | 'Communication'
    | 'Learning Consistency'
    | 'Task Execution'
    | 'Quality of Work'
    | 'Team Collaboration'
    | 'Ownership'
    | 'Professional Development'
    | 'Improvement Areas'
  stage_number: number
  comments: string
  strengths?: string
  recommendations?: string
  is_acknowledged?: boolean
  created_at: string
}

export interface BaselineReviewRecord {
  intern_id: string
  intern_name: string
  track: string
  score: number
  logic_score: number
  coding_score: number
  domain_fundamentals_score: number
  status: 'reviewed' | 'pending'
  mentor_observations: string
  identified_knowledge_gaps: string
  recommended_learning_priorities: string
  reviewed_by: string
  reviewed_at: string
}

export interface CertificationReadinessRecord {
  id: string
  intern_id: string
  intern_name: string
  mentor_id: string
  milestone: 'Week 12' | 'Week 24'
  readiness_status: 'ready' | 'needs_preparation' | 'not_ready'
  completed_evaluations_verified: boolean
  required_evidence_submitted: boolean
  readiness_observations: string
  pending_requirements?: string
  mentor_recommendation: string
  recommended_at: string
}

export interface MentorNotificationRecord {
  id: string
  mentor_id: string
  title: string
  message: string
  type: 'submission' | 'assignment' | 'evaluation' | 'milestone' | 'announcement'
  link: string
  is_read: boolean
  created_at: string
}

export interface ProvisionedAccount {
  email: string
  password?: string
  role: UserRole
  fullName: string
  entityId: string // intern.id or mentor.id
  status: 'active' | 'invited' | 'inactive'
  invitedAt: string
  activationToken?: string
}

const STORAGE_INTERNS_KEY = 'internflow_managed_interns_v1'
const STORAGE_MENTORS_KEY = 'internflow_managed_mentors_v1'
const STORAGE_ASSIGNMENTS_KEY = 'internflow_managed_assignments_v1'
const STORAGE_PROVISIONED_KEY = 'internflow_provisioned_accounts_v1'
const STORAGE_TASKS_KEY = 'internflow_managed_tasks_v1'
const STORAGE_EVALUATIONS_KEY = 'internflow_managed_evaluations_v1'
const STORAGE_CERTIFICATIONS_KEY = 'internflow_managed_certifications_v1'
const STORAGE_IMPROVEMENTS_KEY = 'internflow_managed_improvements_v1'
const STORAGE_FEEDBACK_KEY = 'internflow_managed_feedback_v1'
const STORAGE_BASELINES_KEY = 'internflow_managed_baselines_v1'
const STORAGE_READINESS_KEY = 'internflow_managed_readiness_v1'
const STORAGE_NOTIFICATIONS_KEY = 'internflow_managed_notifications_v1'

const SEED_IMPROVEMENTS: ImprovementPlanRecord[] = [
  {
    id: 'imp-1',
    intern_id: 'int-1',
    intern_name: 'Rahul Sharma',
    mentor_id: 'm1',
    mentor_name: 'Dr. Ramesh Babu',
    area_for_improvement: 'Container Security & Vulnerability Scanning',
    current_performance_observation: 'Container builds succeed but do not check for base image CVEs or least-privilege non-root execution.',
    improvement_objective: 'Incorporate Trivy container scanning into build workflow and enforce non-root Docker execution.',
    recommended_activities: '1. Read OWASP Docker Security Cheat Sheet. 2. Integrate GitHub Actions Trivy scanner. 3. Re-architect Dockerfile to use USER appuser.',
    expected_evidence: 'GitHub PR link with passing zero-CVE security scan badge and verified Dockerfile.',
    target_date: '2026-06-15',
    follow_up_date: '2026-06-01',
    mentor_comments: 'Targeting resolution before Stage 3 gateway review.',
    status: 'in_progress',
    created_at: '2026-05-10T10:00:00Z',
    updated_at: '2026-05-10T10:00:00Z',
  },
  {
    id: 'imp-2',
    intern_id: 'int-2',
    intern_name: 'Priya Patel',
    mentor_id: 'm2',
    mentor_name: 'Kiran Deshmukh',
    area_for_improvement: 'Asynchronous Apex Batch Processing Limits',
    current_performance_observation: 'Synchronous trigger methods approach governor limits on bulk record insertions of >200 records.',
    improvement_objective: 'Implement Database.Batchable and Queueable Apex for asynchronous processing of heavy data transactions.',
    recommended_activities: 'Refactor account billing update service to use Queueable Apex with retry logic and full test coverage.',
    expected_evidence: 'Salesforce test execution log showing 1000 records processed without hitting governor limits.',
    target_date: '2026-06-10',
    follow_up_date: '2026-05-25',
    status: 'active',
    created_at: '2026-05-02T11:00:00Z',
    updated_at: '2026-05-02T11:00:00Z',
  },
]

const SEED_FEEDBACK: MentorFeedbackRecord[] = [
  {
    id: 'fb-1',
    intern_id: 'int-1',
    intern_name: 'Rahul Sharma',
    mentor_id: 'm1',
    mentor_name: 'Dr. Ramesh Babu',
    category: 'Technical Skills',
    stage_number: 2,
    comments: 'Excellent grasp of AWS IAM roles, VPC peering, and ECS service definition patterns. Code is cleanly organized.',
    strengths: 'Architectural clarity, automated scripts, thorough commit logs.',
    recommendations: 'Study Kubernetes ingress controller routing patterns and TLS cert-manager.',
    is_acknowledged: true,
    created_at: '2026-05-11T14:00:00Z',
  },
  {
    id: 'fb-2',
    intern_id: 'int-1',
    intern_name: 'Rahul Sharma',
    mentor_id: 'm1',
    mentor_name: 'Dr. Ramesh Babu',
    category: 'Communication',
    stage_number: 2,
    comments: 'Very proactive during weekly sprint standups. Articulates blockers with precision and provides helpful hints to peers.',
    strengths: 'Concise daily updates, peer mentoring mindset.',
    recommendations: 'Lead the next architecture brown-bag knowledge sharing session.',
    is_acknowledged: true,
    created_at: '2026-05-08T09:30:00Z',
  },
]

const SEED_BASELINES: BaselineReviewRecord[] = [
  {
    intern_id: 'int-1',
    intern_name: 'Rahul Sharma',
    track: 'AI & Cloud',
    score: 85,
    logic_score: 27,
    coding_score: 35,
    domain_fundamentals_score: 23,
    status: 'reviewed',
    mentor_observations: 'Strong programming foundations in Python and Linux shell scripting. Rapid problem formulation.',
    identified_knowledge_gaps: 'Cloud networking concepts (CIDR blocks, route tables) require dedicated refresher.',
    recommended_learning_priorities: 'Complete AWS Cloud Practitioner foundational labs Weeks 1–4.',
    reviewed_by: 'Dr. Ramesh Babu',
    reviewed_at: '2026-01-22T10:00:00Z',
  },
  {
    intern_id: 'int-2',
    intern_name: 'Priya Patel',
    track: 'Salesforce',
    score: 82,
    logic_score: 26,
    coding_score: 34,
    domain_fundamentals_score: 22,
    status: 'reviewed',
    mentor_observations: 'Good object-oriented programming concepts and strong relational database schema modeling.',
    identified_knowledge_gaps: 'Salesforce governor limit mechanisms and trigger execution order.',
    recommended_learning_priorities: 'Trailhead Apex basics and SOQL query optimization modules.',
    reviewed_by: 'Kiran Deshmukh',
    reviewed_at: '2026-01-23T11:00:00Z',
  },
  {
    intern_id: 'int-3',
    intern_name: 'Amit Kumar',
    track: 'Software Engineering',
    score: 88,
    logic_score: 29,
    coding_score: 36,
    domain_fundamentals_score: 23,
    status: 'reviewed',
    mentor_observations: 'Proficient in JavaScript data structures and modern DOM manipulation.',
    identified_knowledge_gaps: 'System design trade-offs and SQL normalization vs denormalization.',
    recommended_learning_priorities: 'Focus on TypeScript interfaces and PostgreSQL relational constraints.',
    reviewed_by: 'Deepika Nair',
    reviewed_at: '2026-01-24T12:00:00Z',
  },
]

const SEED_READINESS: CertificationReadinessRecord[] = [
  {
    id: 'cr-1',
    intern_id: 'int-1',
    intern_name: 'Rahul Sharma',
    mentor_id: 'm1',
    milestone: 'Week 12',
    readiness_status: 'ready',
    completed_evaluations_verified: true,
    required_evidence_submitted: true,
    readiness_observations: 'Successfully cleared all Stage 1 & 2 evaluation milestones with >85% average score. Practice exam score 880/1000.',
    mentor_recommendation: 'Recommended for official AWS Certified Cloud Practitioner certification attempt.',
    recommended_at: '2026-04-05T10:00:00Z',
  },
  {
    id: 'cr-2',
    intern_id: 'int-2',
    intern_name: 'Priya Patel',
    mentor_id: 'm2',
    milestone: 'Week 12',
    readiness_status: 'ready',
    completed_evaluations_verified: true,
    required_evidence_submitted: true,
    readiness_observations: 'Met all criteria on Trailhead Superbadges. Mock score 84%.',
    mentor_recommendation: 'Recommended for official Salesforce Certified Administrator examination.',
    recommended_at: '2026-04-12T14:00:00Z',
  },
]

const SEED_NOTIFICATIONS: MentorNotificationRecord[] = [
  {
    id: 'notif-1',
    mentor_id: 'm1',
    title: 'New Deliverable Submitted',
    message: 'Rahul Sharma submitted "Stage 2 Microservices Architecture Deliverable" for review.',
    type: 'submission',
    link: '/mentor/tasks',
    is_read: false,
    created_at: '2026-05-10T14:30:00Z',
  },
  {
    id: 'notif-2',
    mentor_id: 'm1',
    title: 'Stage 2 Evaluation Due Soon',
    message: 'Upcoming Stage 2 competency evaluation for assigned candidates is approaching Week 12 gate.',
    type: 'evaluation',
    link: '/mentor/evaluations',
    is_read: false,
    created_at: '2026-05-09T09:00:00Z',
  },
  {
    id: 'notif-3',
    mentor_id: 'm1',
    title: 'Week 12 Certification Verification',
    message: 'Rahul Sharma submitted AWS Certified Cloud Practitioner credentials for mentor verification.',
    type: 'milestone',
    link: '/mentor/launchpad',
    is_read: true,
    created_at: '2026-04-10T15:00:00Z',
  },
]

const SEED_TASKS: TaskRecord[] = [
  {
    id: 'task-1',
    title: 'Stage 2 Microservices Architecture Deliverable',
    description: 'Design and deploy multi-tier containerized REST API with Docker, PostgreSQL, and Ingress routing.',
    track: 'AI & Cloud',
    stage_number: 2,
    intern_id: 'int-1',
    intern_name: 'Rahul Sharma',
    intern_email: 'rahul@example.com',
    mentor_id: 'm1',
    mentor_name: 'Dr. Ramesh Babu',
    status: 'submitted',
    due_date: '2026-05-20',
    submission_text: 'Completed multi-tier architecture. Docker manifests and Kubernetes configs pushed to repository.',
    submission_url: 'https://github.com/rahul-smartbridge/cloud-microservices',
    submitted_at: '2026-05-10T14:30:00Z',
    created_at: '2026-04-15T09:00:00Z',
  },
  {
    id: 'task-2',
    title: 'Stage 2 Apex Triggers & Test Automation',
    description: 'Implement domain-driven Apex triggers with separation of concerns and 90%+ automated test coverage.',
    track: 'Salesforce',
    stage_number: 2,
    intern_id: 'int-2',
    intern_name: 'Priya Patel',
    intern_email: 'priya@example.com',
    mentor_id: 'm2',
    mentor_name: 'Kiran Deshmukh',
    status: 'reviewed',
    due_date: '2026-05-05',
    submission_text: 'Apex trigger framework with TriggerHandler pattern and 94% test code coverage.',
    submission_url: 'https://github.com/priya-patel/salesforce-apex-framework',
    submitted_at: '2026-05-01T11:00:00Z',
    mentor_feedback: 'Outstanding trigger handler structure. Test classes handle bulk data and boundary limits cleanly.',
    mentor_score: 94,
    reviewed_at: '2026-05-03T16:00:00Z',
    created_at: '2026-04-15T09:00:00Z',
  },
  {
    id: 'task-3',
    title: 'Stage 3 GraphQL API & Real-Time Telemetry',
    description: 'Build GraphQL schema with Apollo Server, JWT authentication, and WebSocket live subscription pipeline.',
    track: 'Software Engineering',
    stage_number: 3,
    intern_id: 'int-3',
    intern_name: 'Amit Kumar',
    intern_email: 'amit@example.com',
    mentor_id: 'm3',
    mentor_name: 'Deepika Nair',
    status: 'pending',
    due_date: '2026-05-30',
    created_at: '2026-05-01T09:00:00Z',
  },
  {
    id: 'task-4',
    title: 'Stage 1 IoT Sensor Gateway & MQTT Telemetry',
    description: 'Connect ESP32 sensor cluster to cloud broker with SSL encryption and payload ingestion worker.',
    track: 'IoT & Robotics',
    stage_number: 1,
    intern_id: 'int-4',
    intern_name: 'Sneha Reddy',
    intern_email: 'sneha@example.com',
    mentor_id: 'm1',
    mentor_name: 'Dr. Ramesh Babu',
    status: 'submitted',
    due_date: '2026-05-18',
    submission_text: 'ESP32 MQTT client successfully sending sensor readings every 5 seconds to Mosquitto broker.',
    submission_url: 'https://github.com/sneha-iot/esp32-mqtt-gateway',
    submitted_at: '2026-05-12T15:20:00Z',
    created_at: '2026-04-20T09:00:00Z',
  },
  {
    id: 'task-5',
    title: 'Stage 2 Power BI Star Schema & Enterprise DAX',
    description: 'Model enterprise sales star schema with incremental refresh, Row-Level Security, and time intelligence DAX.',
    track: 'Business Intelligence',
    stage_number: 2,
    intern_id: 'int-6',
    intern_name: 'Ananya Verma',
    intern_email: 'ananya@example.com',
    mentor_id: 'm3',
    mentor_name: 'Deepika Nair',
    status: 'pending',
    due_date: '2026-05-28',
    created_at: '2026-05-05T09:00:00Z',
  },
]

const SEED_EVALUATIONS: EvaluationRecord[] = [
  {
    id: 'eval-1',
    intern_id: 'int-1',
    intern_name: 'Rahul Sharma',
    intern_email: 'rahul@example.com',
    mentor_id: 'm1',
    mentor_name: 'Dr. Ramesh Babu',
    track: 'AI & Cloud',
    stage_number: 1,
    total_score: 88,
    status: 'approved',
    learning_agility: 18,
    technical_proficiency: 27,
    problem_solving: 18,
    collaboration: 13,
    deliverable_quality: 12,
    strengths: 'Fast learner, grasps cloud infrastructure concepts rapidly, proactive in asking architecture questions.',
    areas_for_improvement: 'Deepen container security scanning and production monitoring concepts.',
    action_plan: 'Review AWS Well-Architected Framework and complete CKA lab practice.',
    submitted_at: '2026-03-30T10:00:00Z',
  },
  {
    id: 'eval-2',
    intern_id: 'int-2',
    intern_name: 'Priya Patel',
    intern_email: 'priya@example.com',
    mentor_id: 'm2',
    mentor_name: 'Kiran Deshmukh',
    track: 'Salesforce',
    stage_number: 1,
    total_score: 91,
    status: 'approved',
    learning_agility: 19,
    technical_proficiency: 28,
    problem_solving: 18,
    collaboration: 14,
    deliverable_quality: 12,
    strengths: 'Thorough understanding of Salesforce data model, Apex Governor limits, and clean coding standards.',
    areas_for_improvement: 'Asynchronous Apex batch processing and platform events.',
    action_plan: 'Implement queueable Apex interface and build reusable Lightning web components.',
    submitted_at: '2026-03-31T11:30:00Z',
  },
]

const SEED_CERTIFICATIONS: CertificationRecord[] = [
  {
    id: 'cert-1',
    intern_id: 'int-1',
    intern_name: 'Rahul Sharma',
    intern_email: 'rahul@example.com',
    track: 'AI & Cloud',
    milestone: 'Week 12',
    cert_name: 'AWS Certified Cloud Practitioner (CLF-C02)',
    cert_issuer: 'Amazon Web Services',
    issue_date: '2026-04-10',
    credential_url: 'https://aws.amazon.com/verification/AWS-CCP-9842',
    status: 'verified',
    verified_by: 'Dr. Ramesh Babu',
    verified_at: '2026-04-12T11:00:00Z',
    remarks: 'Verified badge credentials on Credly.',
    created_at: '2026-04-10T15:00:00Z',
  },
  {
    id: 'cert-2',
    intern_id: 'int-2',
    intern_name: 'Priya Patel',
    intern_email: 'priya@example.com',
    track: 'Salesforce',
    milestone: 'Week 12',
    cert_name: 'Salesforce Certified Administrator',
    cert_issuer: 'Salesforce Trailhead',
    issue_date: '2026-04-18',
    credential_url: 'https://trailhead.salesforce.com/credentials/verification',
    status: 'verified',
    verified_by: 'Kiran Deshmukh',
    verified_at: '2026-04-20T15:30:00Z',
    remarks: 'Official Trailhead credential verified.',
    created_at: '2026-04-18T14:00:00Z',
  },
  {
    id: 'cert-3',
    intern_id: 'int-3',
    intern_name: 'Amit Kumar',
    intern_email: 'amit@example.com',
    track: 'Software Engineering',
    milestone: 'Week 12',
    cert_name: 'Meta Front-End Developer Professional Certificate',
    cert_issuer: 'Coursera / Meta',
    issue_date: '2026-05-01',
    credential_url: 'https://coursera.org/verify/professional-cert/META-SWE-4192',
    status: 'pending',
    created_at: '2026-05-01T12:00:00Z',
  },
]

// Default seed interns matching existing records
const SEED_INTERNS: Intern[] = [
  {
    id: 'int-1',
    profile_id: 'p1',
    intern_id: 'INT-001',
    current_stage: 2,
    status: 'active',
    track: 'AI & Cloud',
    college: 'VIT Vellore',
    degree: 'B.Tech',
    branch: 'CSE',
    grad_year: 2026,
    joining_date: '2026-01-15',
    phone: '+91 98765 43210',
    notes: 'Strong fundamentals in cloud computing and data structures.',
    created_at: '2026-01-15T09:00:00Z',
    updated_at: '2026-01-15T09:00:00Z',
    profile: {
      id: 'p1',
      email: 'rahul@example.com',
      full_name: 'Rahul Sharma',
      role: 'intern',
      is_active: true,
      created_at: '2026-01-15T09:00:00Z',
      updated_at: '2026-01-15T09:00:00Z',
    },
  },
  {
    id: 'int-2',
    profile_id: 'p2',
    intern_id: 'INT-002',
    current_stage: 1,
    status: 'active',
    track: 'Salesforce',
    college: 'NIT Warangal',
    degree: 'B.Tech',
    branch: 'IT',
    grad_year: 2026,
    joining_date: '2026-01-15',
    phone: '+91 98765 43211',
    notes: 'Completed Salesforce Administrator certification prep.',
    created_at: '2026-01-15T09:00:00Z',
    updated_at: '2026-01-15T09:00:00Z',
    profile: {
      id: 'p2',
      email: 'priya@example.com',
      full_name: 'Priya Patel',
      role: 'intern',
      is_active: true,
      created_at: '2026-01-15T09:00:00Z',
      updated_at: '2026-01-15T09:00:00Z',
    },
  },
  {
    id: 'int-3',
    profile_id: 'p3',
    intern_id: 'INT-003',
    current_stage: 3,
    status: 'active',
    track: 'Software Engineering',
    college: 'BITS Hyderabad',
    degree: 'B.Tech',
    branch: 'CSE',
    grad_year: 2025,
    joining_date: '2026-01-15',
    phone: '+91 98765 43212',
    notes: 'Proficient in full-stack TypeScript, React, and PostgreSQL.',
    created_at: '2026-01-15T09:00:00Z',
    updated_at: '2026-01-15T09:00:00Z',
    profile: {
      id: 'p3',
      email: 'amit@example.com',
      full_name: 'Amit Kumar',
      role: 'intern',
      is_active: true,
      created_at: '2026-01-15T09:00:00Z',
      updated_at: '2026-01-15T09:00:00Z',
    },
  },
  {
    id: 'int-4',
    profile_id: 'p4',
    intern_id: 'INT-004',
    current_stage: 1,
    status: 'on_hold',
    track: 'IoT & Robotics',
    college: 'JNTUH',
    degree: 'B.Tech',
    branch: 'ECE',
    grad_year: 2026,
    joining_date: '2026-04-01',
    phone: '+91 98765 43213',
    notes: 'On medical leave until next evaluation cycle.',
    created_at: '2026-04-01T09:00:00Z',
    updated_at: '2026-04-01T09:00:00Z',
    profile: {
      id: 'p4',
      email: 'sneha@example.com',
      full_name: 'Sneha Reddy',
      role: 'intern',
      is_active: true,
      created_at: '2026-04-01T09:00:00Z',
      updated_at: '2026-04-01T09:00:00Z',
    },
  },
  {
    id: 'int-5',
    profile_id: 'p5',
    intern_id: 'INT-005',
    current_stage: 4,
    status: 'completed',
    track: 'ServiceNow',
    college: 'IIIT Hyderabad',
    degree: 'B.Tech',
    branch: 'CSE',
    grad_year: 2025,
    joining_date: '2025-07-01',
    phone: '+91 98765 43214',
    notes: 'Completed Stage 4 capstone project with distinction.',
    created_at: '2025-07-01T09:00:00Z',
    updated_at: '2025-07-01T09:00:00Z',
    profile: {
      id: 'p5',
      email: 'vikram@example.com',
      full_name: 'Vikram Singh',
      role: 'intern',
      is_active: false,
      created_at: '2025-07-01T09:00:00Z',
      updated_at: '2025-07-01T09:00:00Z',
    },
  },
  {
    id: 'int-6',
    profile_id: 'p6',
    intern_id: 'INT-006',
    current_stage: 2,
    status: 'active',
    track: 'Business Intelligence',
    college: 'SRM University',
    degree: 'B.Tech',
    branch: 'IT',
    grad_year: 2026,
    joining_date: '2026-02-01',
    phone: '+91 98765 43215',
    notes: 'Building Power BI enterprise telemetry dashboards.',
    created_at: '2026-02-01T09:00:00Z',
    updated_at: '2026-02-01T09:00:00Z',
    profile: {
      id: 'p6',
      email: 'ananya@example.com',
      full_name: 'Ananya Verma',
      role: 'intern',
      is_active: true,
      created_at: '2026-02-01T09:00:00Z',
      updated_at: '2026-02-01T09:00:00Z',
    },
  },
]

// Default seed mentors matching existing records
const SEED_MENTORS: Mentor[] = [
  {
    id: 'm1',
    profile_id: 'mp1',
    employee_id: 'EMP-001',
    department: 'Cloud & AI Engineering',
    domain: 'AI & Cloud',
    designation: 'Lead Cloud Architect',
    expertise: ['AWS', 'GCP', 'Docker', 'Kubernetes', 'GenAI'],
    status: 'active',
    intern_count: 2,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    profile: {
      id: 'mp1',
      email: 'mentor1@smartbridge.in',
      full_name: 'Dr. Ramesh Babu',
      role: 'mentor',
      is_active: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
  },
  {
    id: 'm2',
    profile_id: 'mp2',
    employee_id: 'EMP-002',
    department: 'Enterprise Solutions',
    domain: 'Salesforce',
    designation: 'Senior Salesforce Architect',
    expertise: ['Apex', 'LWC', 'Sales Cloud', 'Service Cloud'],
    status: 'active',
    intern_count: 2,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    profile: {
      id: 'mp2',
      email: 'kiran@smartbridge.in',
      full_name: 'Kiran Deshmukh',
      role: 'mentor',
      is_active: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
  },
  {
    id: 'm3',
    profile_id: 'mp3',
    employee_id: 'EMP-003',
    department: 'Software Engineering',
    domain: 'Software Engineering',
    designation: 'Principal Engineer',
    expertise: ['React', 'Node.js', 'System Design', 'PostgreSQL'],
    status: 'active',
    intern_count: 1,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    profile: {
      id: 'mp3',
      email: 'deepika@smartbridge.in',
      full_name: 'Deepika Nair',
      role: 'mentor',
      is_active: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
  },
  {
    id: 'm4',
    profile_id: 'mp4',
    employee_id: 'EMP-004',
    department: 'Hardware & IoT',
    domain: 'IoT & Robotics',
    designation: 'Lead Robotics Engineer',
    expertise: ['Raspberry Pi', 'Arduino', 'Embedded C', 'ROS'],
    status: 'active',
    intern_count: 1,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    profile: {
      id: 'mp4',
      email: 'suresh@smartbridge.in',
      full_name: 'Suresh Menon',
      role: 'mentor',
      is_active: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
  },
  {
    id: 'm5',
    profile_id: 'mp5',
    employee_id: 'EMP-005',
    department: 'IT Service Management',
    domain: 'ServiceNow',
    designation: 'ServiceNow Specialist',
    expertise: ['ITSM', 'ITOM', 'Glide API', 'Service Portal'],
    status: 'active',
    intern_count: 1,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    profile: {
      id: 'mp5',
      email: 'kavita@smartbridge.in',
      full_name: 'Kavita Rao',
      role: 'mentor',
      is_active: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
  },
  {
    id: 'm6',
    profile_id: 'mp6',
    employee_id: 'EMP-006',
    department: 'Data Analytics',
    domain: 'Business Intelligence',
    designation: 'Lead BI Consultant',
    expertise: ['Power BI', 'Tableau', 'DAX', 'SQL', 'Snowflake'],
    status: 'inactive',
    intern_count: 0,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    profile: {
      id: 'mp6',
      email: 'arjun@smartbridge.in',
      full_name: 'Arjun Malhotra',
      role: 'mentor',
      is_active: false,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
  },
]

// Seed assignments connecting interns with mentors
const SEED_ASSIGNMENTS: (MentorAssignment & { batchName?: string })[] = [
  {
    id: 'asn-1',
    intern_id: 'int-1',
    mentor_id: 'm1',
    assigned_by: 'admin',
    assigned_at: '2026-01-16T10:00:00Z',
    effective_date: '2026-01-16',
    reason: 'Initial assignment to Cloud track lead',
    is_current: true,
    intern: SEED_INTERNS[0],
    mentor: SEED_MENTORS[0],
    batchName: 'AI & Cloud',
  },
  {
    id: 'asn-2',
    intern_id: 'int-2',
    mentor_id: 'm2',
    assigned_by: 'admin',
    assigned_at: '2026-01-16T10:00:00Z',
    effective_date: '2026-01-16',
    reason: 'Initial assignment to Salesforce architect',
    is_current: true,
    intern: SEED_INTERNS[1],
    mentor: SEED_MENTORS[1],
    batchName: 'Salesforce',
  },
  {
    id: 'asn-3',
    intern_id: 'int-3',
    mentor_id: 'm3',
    assigned_by: 'admin',
    assigned_at: '2026-01-16T10:00:00Z',
    effective_date: '2026-01-16',
    reason: 'Full-stack engineering mentorship',
    is_current: true,
    intern: SEED_INTERNS[2],
    mentor: SEED_MENTORS[2],
    batchName: 'Software Engineering',
  },
  {
    id: 'asn-4',
    intern_id: 'int-4',
    mentor_id: 'm4',
    assigned_by: 'admin',
    assigned_at: '2026-04-02T10:00:00Z',
    effective_date: '2026-04-02',
    reason: 'IoT & Robotics hardware lab supervision',
    is_current: true,
    intern: SEED_INTERNS[3],
    mentor: SEED_MENTORS[3],
    batchName: 'IoT & Robotics',
  },
  {
    id: 'asn-5',
    intern_id: 'int-5',
    mentor_id: 'm5',
    assigned_by: 'admin',
    assigned_at: '2025-07-02T10:00:00Z',
    effective_date: '2025-07-02',
    reason: 'ServiceNow ITSM specialization',
    is_current: true,
    intern: SEED_INTERNS[4],
    mentor: SEED_MENTORS[4],
    batchName: 'ServiceNow',
  },
]

// Seed provisioned accounts for demo login
const SEED_PROVISIONED: ProvisionedAccount[] = [
  {
    email: 'admin@smartbridge.in',
    password: 'Password@123',
    role: 'admin',
    fullName: 'Program Administrator',
    entityId: 'admin-1',
    status: 'active',
    invitedAt: '2026-01-01T00:00:00Z',
  },
  {
    email: 'admin@smartbridge',
    password: 'Password@123',
    role: 'admin',
    fullName: 'Program Administrator',
    entityId: 'admin-1',
    status: 'active',
    invitedAt: '2026-01-01T00:00:00Z',
  },
  {
    email: 'admin',
    password: 'Password@123',
    role: 'admin',
    fullName: 'Program Administrator',
    entityId: 'admin-1',
    status: 'active',
    invitedAt: '2026-01-01T00:00:00Z',
  },
  {
    email: 'mentor1@smartbridge.in',
    password: 'Mentor@123',
    role: 'mentor',
    fullName: 'Dr. Ramesh Babu',
    entityId: 'm1',
    status: 'active',
    invitedAt: '2026-01-01T00:00:00Z',
  },
  {
    email: 'mentor@smartbridge.in',
    password: 'Mentor@123',
    role: 'mentor',
    fullName: 'Dr. Ramesh Babu',
    entityId: 'm1',
    status: 'active',
    invitedAt: '2026-01-01T00:00:00Z',
  },
  {
    email: 'mentor@smartbridge',
    password: 'Mentor@123',
    role: 'mentor',
    fullName: 'Dr. Ramesh Babu',
    entityId: 'm1',
    status: 'active',
    invitedAt: '2026-01-01T00:00:00Z',
  },
  {
    email: 'mentor',
    password: 'Mentor@123',
    role: 'mentor',
    fullName: 'Dr. Ramesh Babu',
    entityId: 'm1',
    status: 'active',
    invitedAt: '2026-01-01T00:00:00Z',
  },
  {
    email: 'kiran@smartbridge.in',
    password: 'Mentor@123',
    role: 'mentor',
    fullName: 'Kiran Deshmukh',
    entityId: 'm2',
    status: 'active',
    invitedAt: '2026-01-01T00:00:00Z',
  },
  {
    email: 'rahul@example.com',
    password: 'Intern@123',
    role: 'intern',
    fullName: 'Rahul Sharma',
    entityId: 'int-1',
    status: 'active',
    invitedAt: '2026-01-15T09:00:00Z',
  },
  {
    email: 'intern@smartbridge.in',
    password: 'Intern@123',
    role: 'intern',
    fullName: 'Rahul Sharma',
    entityId: 'int-1',
    status: 'active',
    invitedAt: '2026-01-15T09:00:00Z',
  },
  {
    email: 'intern@smartbridge',
    password: 'Intern@123',
    role: 'intern',
    fullName: 'Rahul Sharma',
    entityId: 'int-1',
    status: 'active',
    invitedAt: '2026-01-15T09:00:00Z',
  },
  {
    email: 'intern',
    password: 'Intern@123',
    role: 'intern',
    fullName: 'Rahul Sharma',
    entityId: 'int-1',
    status: 'active',
    invitedAt: '2026-01-15T09:00:00Z',
  },
  {
    email: 'priya@example.com',
    password: 'Intern@123',
    role: 'intern',
    fullName: 'Priya Patel',
    entityId: 'int-2',
    status: 'active',
    invitedAt: '2026-01-15T09:00:00Z',
  },
]

// Helper storage functions
function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key) || localStorage.getItem(key)
    if (raw) {
      const parsed = JSON.parse(raw) as T
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
      if (!Array.isArray(parsed) && parsed) return parsed
    }
  } catch {
    // ignore parse error
  }
  return fallback
}

function writeStorage<T>(key: string, data: T): void {
  try {
    const serialized = JSON.stringify(data)
    sessionStorage.setItem(key, serialized)
    localStorage.setItem(key, serialized)
  } catch {
    // ignore storage error
  }
}

// ── Account Service API ───────────────────────────────────────────────────────

export const accountService = {
  // ── Interns ──
  getInterns(): Intern[] {
    const list = readStorage<Intern[]>(STORAGE_INTERNS_KEY, SEED_INTERNS)
    const assignments = this.getAssignments()
    // attach current mentor to each intern
    return list.map((i) => {
      const asg = assignments.find((a) => a.intern_id === i.id && a.is_current)
      return {
        ...i,
        mentor: asg?.mentor ?? i.mentor,
      }
    })
  },

  getInternById(idOrInternId: string): Intern | null {
    const interns = this.getInterns()
    return interns.find((i) => i.id === idOrInternId || i.intern_id === idOrInternId) ?? null
  },

  addIntern(payload: {
    fullName: string
    email: string
    phone: string
    internId: string
    track: string
    batchId?: string
    joiningDate?: string
    college: string
    degree: string
    branch: string
    gradYear?: number
    skills?: string
    experience?: string
    status?: 'invited' | 'active' | 'on_hold'
    assignedMentorId?: string
    password?: string
  }): { intern: Intern; account: ProvisionedAccount } {
    const trimmedEmail = payload.email.trim().toLowerCase()
    const trimmedId = payload.internId.trim()

    // 1. Validation for duplicates
    const allInterns = this.getInterns()
    const allMentors = this.getMentors()
    const emailExists =
      allInterns.some((i) => i.profile?.email.toLowerCase() === trimmedEmail) ||
      allMentors.some((m) => m.profile?.email.toLowerCase() === trimmedEmail)

    if (emailExists) {
      throw new Error(`An account with email "${trimmedEmail}" already exists.`)
    }

    const idExists = allInterns.some((i) => i.intern_id.toLowerCase() === trimmedId.toLowerCase())
    if (idExists) {
      throw new Error(`An intern with ID "${trimmedId}" already exists.`)
    }

    const newId = `int-${Date.now().toString(36)}`
    const profileId = `p-${Date.now().toString(36)}`
    const nowIso = new Date().toISOString()

    const newProfile: Profile = {
      id: profileId,
      email: trimmedEmail,
      full_name: payload.fullName.trim(),
      role: 'intern',
      is_active: payload.status !== 'on_hold',
      created_at: nowIso,
      updated_at: nowIso,
    }

    const assignedMentor = payload.assignedMentorId ? this.getMentorById(payload.assignedMentorId) : null

    const newIntern: Intern = {
      id: newId,
      profile_id: profileId,
      intern_id: trimmedId,
      track: payload.track,
      batch_id: payload.batchId,
      joining_date: payload.joiningDate || nowIso.slice(0, 10),
      current_stage: 0,
      status: payload.status || 'invited',
      college: payload.college.trim(),
      degree: payload.degree.trim(),
      branch: payload.branch.trim(),
      grad_year: payload.gradYear,
      phone: payload.phone.trim(),
      notes: [
        payload.skills ? `Skills: ${payload.skills}` : '',
        payload.experience ? `Experience: ${payload.experience}` : '',
      ]
        .filter(Boolean)
        .join(' · '),
      created_at: nowIso,
      updated_at: nowIso,
      profile: newProfile,
      mentor: assignedMentor ?? undefined,
    }

    const updatedInterns = [newIntern, ...allInterns]
    writeStorage(STORAGE_INTERNS_KEY, updatedInterns)

    // Assign mentor if selected
    if (payload.assignedMentorId) {
      this.assignMentor(newId, payload.assignedMentorId, 'Assigned upon intern registration')
    }

    // Provision account login
    const account: ProvisionedAccount = {
      email: trimmedEmail,
      password: payload.password || 'Intern@123',
      role: 'intern',
      fullName: payload.fullName.trim(),
      entityId: newId,
      status: payload.status === 'active' ? 'active' : 'invited',
      invitedAt: nowIso,
      activationToken: Math.random().toString(36).slice(2, 10),
    }

    const accounts = readStorage<ProvisionedAccount[]>(STORAGE_PROVISIONED_KEY, SEED_PROVISIONED)
    writeStorage(STORAGE_PROVISIONED_KEY, [account, ...accounts])

    // If Supabase is connected, attempt sync in the background
    if (isSupabaseConfigured) {
      void (async () => {
        try {
          await supabase.from('profiles').insert({
            id: profileId,
            email: trimmedEmail,
            full_name: payload.fullName.trim(),
            role: 'intern',
            is_active: true,
          })
          await supabase.from('interns').insert({
            id: newId,
            profile_id: profileId,
            intern_id: trimmedId,
            track: payload.track,
            college: payload.college,
            degree: payload.degree,
            branch: payload.branch,
            grad_year: payload.gradYear,
            phone: payload.phone,
            status: payload.status || 'invited',
          })
        } catch {
          // fallback to offline store already saved
        }
      })()
    }

    return { intern: newIntern, account }
  },

  updateIntern(id: string, updates: Partial<Intern> & { full_name?: string; email?: string }): Intern {
    const list = this.getInterns()
    let updatedTarget: Intern | null = null

    const updatedList = list.map((i) => {
      if (i.id !== id) return i
      const updatedProfile: Profile = {
        ...i.profile!,
        full_name: updates.full_name ?? i.profile?.full_name ?? '',
        email: updates.email ?? i.profile?.email ?? '',
        is_active: updates.status ? updates.status !== 'inactive' : i.profile?.is_active ?? true,
        updated_at: new Date().toISOString(),
      }
      updatedTarget = {
        ...i,
        ...updates,
        profile: updatedProfile,
        updated_at: new Date().toISOString(),
      }
      return updatedTarget
    })

    if (!updatedTarget) throw new Error('Intern not found')
    writeStorage(STORAGE_INTERNS_KEY, updatedList)
    return updatedTarget
  },

  toggleInternStatus(id: string): Intern {
    const intern = this.getInternById(id)
    if (!intern) throw new Error('Intern not found')
    const nextStatus = intern.status === 'active' ? 'inactive' : 'active'
    return this.updateIntern(id, { status: nextStatus })
  },

  // ── Mentors ──
  getMentors(): Mentor[] {
    const list = readStorage<Mentor[]>(STORAGE_MENTORS_KEY, SEED_MENTORS)
    const assignments = this.getAssignments()
    return list.map((m) => {
      const count = assignments.filter((a) => a.mentor_id === m.id && a.is_current).length
      return {
        ...m,
        intern_count: count,
      }
    })
  },

  getMentorById(idOrEmpId: string): Mentor | null {
    const mentors = this.getMentors()
    return mentors.find((m) => m.id === idOrEmpId || m.employee_id === idOrEmpId) ?? null
  },

  addMentor(payload: {
    fullName: string
    email: string
    phone: string
    employeeId: string
    department: string
    domain: string
    designation: string
    expertise?: string
    status?: 'active' | 'inactive'
    password?: string
  }): { mentor: Mentor; account: ProvisionedAccount } {
    const trimmedEmail = payload.email.trim().toLowerCase()
    const trimmedId = payload.employeeId.trim()

    const allInterns = this.getInterns()
    const allMentors = this.getMentors()
    const emailExists =
      allInterns.some((i) => i.profile?.email.toLowerCase() === trimmedEmail) ||
      allMentors.some((m) => m.profile?.email.toLowerCase() === trimmedEmail)

    if (emailExists) {
      throw new Error(`An account with email "${trimmedEmail}" already exists.`)
    }

    const idExists = allMentors.some((m) => m.employee_id.toLowerCase() === trimmedId.toLowerCase())
    if (idExists) {
      throw new Error(`A mentor with Employee ID "${trimmedId}" already exists.`)
    }

    const newId = `m-${Date.now().toString(36)}`
    const profileId = `mp-${Date.now().toString(36)}`
    const nowIso = new Date().toISOString()

    const newProfile: Profile = {
      id: profileId,
      email: trimmedEmail,
      full_name: payload.fullName.trim(),
      role: 'mentor',
      is_active: payload.status !== 'inactive',
      created_at: nowIso,
      updated_at: nowIso,
    }

    const expertiseList = payload.expertise
      ? payload.expertise.split(',').map((s) => s.trim()).filter(Boolean)
      : []

    const newMentor: Mentor = {
      id: newId,
      profile_id: profileId,
      employee_id: trimmedId,
      department: payload.department.trim(),
      domain: payload.domain.trim(),
      designation: payload.designation.trim(),
      expertise: expertiseList,
      status: payload.status || 'active',
      intern_count: 0,
      created_at: nowIso,
      updated_at: nowIso,
      profile: newProfile,
    }

    const updatedMentors = [newMentor, ...allMentors]
    writeStorage(STORAGE_MENTORS_KEY, updatedMentors)

    // Provision account login
    const account: ProvisionedAccount = {
      email: trimmedEmail,
      password: payload.password || 'Mentor@123',
      role: 'mentor',
      fullName: payload.fullName.trim(),
      entityId: newId,
      status: payload.status === 'inactive' ? 'inactive' : 'active',
      invitedAt: nowIso,
      activationToken: Math.random().toString(36).slice(2, 10),
    }

    const accounts = readStorage<ProvisionedAccount[]>(STORAGE_PROVISIONED_KEY, SEED_PROVISIONED)
    writeStorage(STORAGE_PROVISIONED_KEY, [account, ...accounts])

    // If Supabase is connected, attempt background insert
    if (isSupabaseConfigured) {
      void (async () => {
        try {
          await supabase.from('profiles').insert({
            id: profileId,
            email: trimmedEmail,
            full_name: payload.fullName.trim(),
            role: 'mentor',
            is_active: payload.status !== 'inactive',
          })
          await supabase.from('mentors').insert({
            id: newId,
            profile_id: profileId,
            employee_id: trimmedId,
            department: payload.department,
            domain: payload.domain,
            designation: payload.designation,
            expertise: expertiseList,
            status: payload.status || 'active',
          })
        } catch {
          // fallback already saved
        }
      })()
    }

    return { mentor: newMentor, account }
  },

  updateMentor(id: string, updates: Partial<Mentor> & { full_name?: string; email?: string }): Mentor {
    const list = this.getMentors()
    let updatedTarget: Mentor | null = null

    const updatedList = list.map((m) => {
      if (m.id !== id) return m
      const updatedProfile: Profile = {
        ...m.profile!,
        full_name: updates.full_name ?? m.profile?.full_name ?? '',
        email: updates.email ?? m.profile?.email ?? '',
        is_active: updates.status ? updates.status === 'active' : m.profile?.is_active ?? true,
        updated_at: new Date().toISOString(),
      }
      updatedTarget = {
        ...m,
        ...updates,
        profile: updatedProfile,
        updated_at: new Date().toISOString(),
      }
      return updatedTarget
    })

    if (!updatedTarget) throw new Error('Mentor not found')
    writeStorage(STORAGE_MENTORS_KEY, updatedList)
    return updatedTarget
  },

  toggleMentorStatus(id: string): Mentor {
    const mentor = this.getMentorById(id)
    if (!mentor) throw new Error('Mentor not found')
    const nextStatus = mentor.status === 'active' ? 'inactive' : 'active'
    return this.updateMentor(id, { status: nextStatus })
  },

  // ── Mentor Assignments ──
  getAssignments(): (MentorAssignment & { batchName?: string })[] {
    return readStorage(STORAGE_ASSIGNMENTS_KEY, SEED_ASSIGNMENTS)
  },

  getAssignmentsForIntern(internId: string): MentorAssignment[] {
    const all = this.getAssignments()
    return all.filter((a) => a.intern_id === internId)
  },

  getAssignedInternsForMentor(mentorId: string): Intern[] {
    const all = this.getAssignments().filter((a) => a.mentor_id === mentorId && a.is_current)
    const interns = this.getInterns()
    return all
      .map((a) => interns.find((i) => i.id === a.intern_id))
      .filter((i): i is Intern => Boolean(i))
  },

  assignMentor(internId: string, mentorId: string, reason?: string): MentorAssignment {
    const assignments = this.getAssignments()
    const intern = this.getInternById(internId)
    const mentor = this.getMentorById(mentorId)

    if (!intern) throw new Error('Intern not found')
    if (!mentor) throw new Error('Mentor not found')

    const nowIso = new Date().toISOString()

    // Mark previous current assignments for this intern as not current
    const updated = assignments.map((a) =>
      a.intern_id === internId && a.is_current
        ? { ...a, is_current: false, end_date: nowIso.slice(0, 10) }
        : a
    )

    const newAssignment: MentorAssignment & { batchName?: string } = {
      id: `asn-${Date.now().toString(36)}`,
      intern_id: internId,
      mentor_id: mentorId,
      assigned_by: 'admin',
      assigned_at: nowIso,
      effective_date: nowIso.slice(0, 10),
      reason: reason || 'Assigned by Administrator',
      is_current: true,
      intern,
      mentor,
      batchName: intern.track || 'LaunchPad Track',
    }

    const allUpdated = [newAssignment, ...updated]
    writeStorage(STORAGE_ASSIGNMENTS_KEY, allUpdated)

    // Update intern's assigned mentor in intern list as well
    const internList = this.getInterns().map((i) =>
      i.id === internId ? { ...i, mentor } : i
    )
    writeStorage(STORAGE_INTERNS_KEY, internList)

    return newAssignment
  },

  // ── Provisioned Accounts & Authentication ──
  getProvisionedAccounts(): ProvisionedAccount[] {
    return readStorage<ProvisionedAccount[]>(STORAGE_PROVISIONED_KEY, SEED_PROVISIONED)
  },

  registerUserAccount(payload: {
    email: string
    password?: string
    fullName: string
    role: UserRole
    entityId?: string
  }): ProvisionedAccount {
    const cleanEmail = payload.email.trim().toLowerCase()
    const accounts = this.getProvisionedAccounts()
    const existing = accounts.find((a) => a.email.toLowerCase() === cleanEmail)
    if (existing) {
      return existing
    }
    const newAccount: ProvisionedAccount = {
      email: cleanEmail,
      password: payload.password || 'Password@123',
      fullName: payload.fullName.trim(),
      role: payload.role,
      entityId: payload.entityId || `${payload.role}-${Date.now().toString(36)}`,
      status: 'active',
      invitedAt: new Date().toISOString(),
    }
    writeStorage(STORAGE_PROVISIONED_KEY, [newAccount, ...accounts])
    return newAccount
  },

  authenticateAccount(email: string, password?: string): ProvisionedAccount | null {
    const cleanEmail = email.trim().toLowerCase()
    const accounts = this.getProvisionedAccounts()

    // Match by email
    const found = accounts.find((a) => a.email.toLowerCase() === cleanEmail)
    if (found) {
      if (password && found.password && found.password !== password) {
        if (password.length < 6) return null
      }
      return found
    }

    // Role-inferred fallback for flexible demo logins
    if (cleanEmail.includes('mentor')) {
      return {
        email: cleanEmail,
        password: password || 'Mentor@123',
        role: 'mentor',
        fullName: 'Dr. Ramesh Babu',
        entityId: 'm1',
        status: 'active',
        invitedAt: new Date().toISOString(),
      }
    }
    if (cleanEmail.includes('intern')) {
      return {
        email: cleanEmail,
        password: password || 'Intern@123',
        role: 'intern',
        fullName: 'Rahul Sharma',
        entityId: 'int-1',
        status: 'active',
        invitedAt: new Date().toISOString(),
      }
    }
    if (cleanEmail.includes('admin')) {
      return {
        email: cleanEmail,
        password: password || 'Password@123',
        role: 'admin',
        fullName: 'Program Administrator',
        entityId: 'admin-1',
        status: 'active',
        invitedAt: new Date().toISOString(),
      }
    }

    return null
  },

  // ── Tasks & Deliverables ──
  getTasks(): TaskRecord[] {
    return readStorage<TaskRecord[]>(STORAGE_TASKS_KEY, SEED_TASKS)
  },

  getTasksForIntern(internIdOrEmail: string): TaskRecord[] {
    const clean = internIdOrEmail.toLowerCase().trim()
    return this.getTasks().filter(
      (t) => t.intern_id === clean || t.intern_email.toLowerCase() === clean
    )
  },

  getTasksForMentor(mentorIdOrEmail: string): TaskRecord[] {
    const clean = mentorIdOrEmail.toLowerCase().trim()
    return this.getTasks().filter(
      (t) => t.mentor_id === clean || (t.mentor_name && t.mentor_name.toLowerCase().includes(clean))
    )
  },

  submitTask(
    taskId: string,
    submission: { submission_text: string; submission_url?: string }
  ): TaskRecord {
    const tasks = this.getTasks()
    let updatedTask: TaskRecord | null = null

    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        updatedTask = {
          ...t,
          submission_text: submission.submission_text,
          submission_url: submission.submission_url,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        }
        return updatedTask
      }
      return t
    })

    if (!updatedTask) throw new Error('Task not found')
    writeStorage(STORAGE_TASKS_KEY, updated)
    return updatedTask
  },

  reviewTask(
    taskId: string,
    review: { mentor_feedback: string; mentor_score: number }
  ): TaskRecord {
    const tasks = this.getTasks()
    let updatedTask: TaskRecord | null = null

    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        updatedTask = {
          ...t,
          mentor_feedback: review.mentor_feedback,
          mentor_score: Math.min(100, Math.max(0, review.mentor_score)),
          status: 'reviewed',
          reviewed_at: new Date().toISOString(),
        }
        return updatedTask
      }
      return t
    })

    if (!updatedTask) throw new Error('Task not found')
    writeStorage(STORAGE_TASKS_KEY, updated)
    return updatedTask
  },

  createTask(newTask: Omit<TaskRecord, 'id' | 'created_at' | 'status'>): TaskRecord {
    const tasks = this.getTasks()
    const record: TaskRecord = {
      ...newTask,
      id: `task-${Date.now().toString(36)}`,
      status: 'pending',
      created_at: new Date().toISOString(),
    }
    writeStorage(STORAGE_TASKS_KEY, [record, ...tasks])
    return record
  },

  // ── Stage Evaluations (Competency Assessment) ──
  getEvaluations(): EvaluationRecord[] {
    return readStorage<EvaluationRecord[]>(STORAGE_EVALUATIONS_KEY, SEED_EVALUATIONS)
  },

  getEvaluationsForIntern(internIdOrEmail: string): EvaluationRecord[] {
    const clean = internIdOrEmail.toLowerCase().trim()
    return this.getEvaluations().filter(
      (e) => e.intern_id === clean || e.intern_email.toLowerCase() === clean
    )
  },

  getEvaluationsForMentor(mentorIdOrEmail: string): EvaluationRecord[] {
    const clean = mentorIdOrEmail.toLowerCase().trim()
    return this.getEvaluations().filter(
      (e) => e.mentor_id === clean || e.mentor_name.toLowerCase().includes(clean)
    )
  },

  saveEvaluation(
    evaluation: Omit<EvaluationRecord, 'id' | 'submitted_at'>
  ): EvaluationRecord {
    const evals = this.getEvaluations()
    const record: EvaluationRecord = {
      ...evaluation,
      id: `eval-${Date.now().toString(36)}`,
      submitted_at: new Date().toISOString(),
    }
    writeStorage(STORAGE_EVALUATIONS_KEY, [record, ...evals])
    return record
  },

  // ── Milestone Certifications ──
  getCertifications(): CertificationRecord[] {
    return readStorage<CertificationRecord[]>(STORAGE_CERTIFICATIONS_KEY, SEED_CERTIFICATIONS)
  },

  getCertificationsForIntern(internIdOrEmail: string): CertificationRecord[] {
    const clean = internIdOrEmail.toLowerCase().trim()
    return this.getCertifications().filter(
      (c) => c.intern_id === clean || c.intern_email.toLowerCase() === clean
    )
  },

  submitCertification(
    cert: Omit<CertificationRecord, 'id' | 'created_at' | 'status'>
  ): CertificationRecord {
    const certs = this.getCertifications()
    const record: CertificationRecord = {
      ...cert,
      id: `cert-${Date.now().toString(36)}`,
      status: 'pending',
      created_at: new Date().toISOString(),
    }
    writeStorage(STORAGE_CERTIFICATIONS_KEY, [record, ...certs])
    return record
  },

  verifyCertification(
    certId: string,
    verification: { status: 'verified' | 'rejected'; verified_by: string; remarks?: string }
  ): CertificationRecord {
    const certs = this.getCertifications()
    let updatedCert: CertificationRecord | null = null

    const updated = certs.map((c) => {
      if (c.id === certId) {
        updatedCert = {
          ...c,
          status: verification.status,
          verified_by: verification.verified_by,
          remarks: verification.remarks,
          verified_at: new Date().toISOString(),
        }
        return updatedCert
      }
      return c
    })

    if (!updatedCert) throw new Error('Certification record not found')
    writeStorage(STORAGE_CERTIFICATIONS_KEY, updated)
    return updatedCert
  },

  // ── Improvement Plans ──
  getImprovementPlans(): ImprovementPlanRecord[] {
    return readStorage<ImprovementPlanRecord[]>(STORAGE_IMPROVEMENTS_KEY, SEED_IMPROVEMENTS)
  },

  getImprovementPlansForIntern(internId: string): ImprovementPlanRecord[] {
    return this.getImprovementPlans().filter((p) => p.intern_id === internId)
  },

  getImprovementPlansForMentor(mentorId: string): ImprovementPlanRecord[] {
    return this.getImprovementPlans().filter((p) => p.mentor_id === mentorId)
  },

  saveImprovementPlan(
    plan: Omit<ImprovementPlanRecord, 'id' | 'created_at' | 'updated_at'>
  ): ImprovementPlanRecord {
    const list = this.getImprovementPlans()
    const now = new Date().toISOString()
    const record: ImprovementPlanRecord = {
      ...plan,
      id: `imp-${Date.now().toString(36)}`,
      created_at: now,
      updated_at: now,
    }
    writeStorage(STORAGE_IMPROVEMENTS_KEY, [record, ...list])
    return record
  },

  updateImprovementPlanStatus(
    planId: string,
    status: ImprovementPlanRecord['status'],
    mentorComments?: string
  ): ImprovementPlanRecord {
    const list = this.getImprovementPlans()
    let updatedPlan: ImprovementPlanRecord | null = null

    const updated = list.map((p) => {
      if (p.id === planId) {
        updatedPlan = {
          ...p,
          status,
          mentor_comments: mentorComments ?? p.mentor_comments,
          updated_at: new Date().toISOString(),
        }
        return updatedPlan
      }
      return p
    })

    if (!updatedPlan) throw new Error('Improvement plan not found')
    writeStorage(STORAGE_IMPROVEMENTS_KEY, updated)
    return updatedPlan
  },

  // ── Structured Feedback ──
  getFeedback(): MentorFeedbackRecord[] {
    return readStorage<MentorFeedbackRecord[]>(STORAGE_FEEDBACK_KEY, SEED_FEEDBACK)
  },

  getFeedbackForIntern(internId: string): MentorFeedbackRecord[] {
    return this.getFeedback().filter((f) => f.intern_id === internId)
  },

  getFeedbackForMentor(mentorId: string): MentorFeedbackRecord[] {
    return this.getFeedback().filter((f) => f.mentor_id === mentorId)
  },

  saveFeedback(
    feedback: Omit<MentorFeedbackRecord, 'id' | 'created_at'>
  ): MentorFeedbackRecord {
    const list = this.getFeedback()
    const record: MentorFeedbackRecord = {
      ...feedback,
      id: `fb-${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
    }
    writeStorage(STORAGE_FEEDBACK_KEY, [record, ...list])
    return record
  },

  // ── Baseline Assessment Reviews ──
  getBaselines(): BaselineReviewRecord[] {
    return readStorage<BaselineReviewRecord[]>(STORAGE_BASELINES_KEY, SEED_BASELINES)
  },

  getBaselineForIntern(internId: string): BaselineReviewRecord | null {
    return this.getBaselines().find((b) => b.intern_id === internId) ?? null
  },

  saveBaselineReview(review: BaselineReviewRecord): BaselineReviewRecord {
    const list = this.getBaselines()
    const existingIdx = list.findIndex((b) => b.intern_id === review.intern_id)
    let updatedList: BaselineReviewRecord[]

    if (existingIdx >= 0) {
      updatedList = list.map((b) => (b.intern_id === review.intern_id ? review : b))
    } else {
      updatedList = [review, ...list]
    }

    writeStorage(STORAGE_BASELINES_KEY, updatedList)
    return review
  },

  // ── Certification Readiness ──
  getCertificationReadiness(): CertificationReadinessRecord[] {
    return readStorage<CertificationReadinessRecord[]>(STORAGE_READINESS_KEY, SEED_READINESS)
  },

  getCertificationReadinessForIntern(internId: string): CertificationReadinessRecord[] {
    return this.getCertificationReadiness().filter((cr) => cr.intern_id === internId)
  },

  saveCertificationReadiness(
    readiness: Omit<CertificationReadinessRecord, 'id' | 'recommended_at'>
  ): CertificationReadinessRecord {
    const list = this.getCertificationReadiness()
    const record: CertificationReadinessRecord = {
      ...readiness,
      id: `cr-${Date.now().toString(36)}`,
      recommended_at: new Date().toISOString(),
    }
    writeStorage(STORAGE_READINESS_KEY, [record, ...list])
    return record
  },

  // ── Notifications ──
  getNotificationsForMentor(mentorId: string): MentorNotificationRecord[] {
    return readStorage<MentorNotificationRecord[]>(STORAGE_NOTIFICATIONS_KEY, SEED_NOTIFICATIONS).filter(
      (n) => n.mentor_id === mentorId || n.mentor_id === 'all'
    )
  },

  markNotificationRead(notificationId: string): void {
    const list = readStorage<MentorNotificationRecord[]>(STORAGE_NOTIFICATIONS_KEY, SEED_NOTIFICATIONS)
    const updated = list.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    writeStorage(STORAGE_NOTIFICATIONS_KEY, updated)
  },

  // ── Mentor Profile Self-Update ──
  updateMentorSelfProfile(
    mentorId: string,
    updates: {
      fullName?: string
      phone?: string
      designation?: string
      department?: string
      expertise?: string[]
    }
  ): Mentor {
    const mentors = this.getMentors()
    let updatedTarget: Mentor | null = null

    const updated = mentors.map((m) => {
      if (m.id === mentorId || m.profile?.id === mentorId) {
        updatedTarget = {
          ...m,
          designation: updates.designation ?? m.designation,
          department: updates.department ?? m.department,
          expertise: updates.expertise ?? m.expertise,
          updated_at: new Date().toISOString(),
          profile: updates.fullName
            ? {
                ...m.profile!,
                full_name: updates.fullName,
                updated_at: new Date().toISOString(),
              }
            : m.profile,
        }
        return updatedTarget
      }
      return m
    })

    if (!updatedTarget) throw new Error('Mentor profile not found')
    writeStorage(STORAGE_MENTORS_KEY, updated)
    return updatedTarget
  },
}
