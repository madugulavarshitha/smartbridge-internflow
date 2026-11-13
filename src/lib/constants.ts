export const KPI_WEIGHTS = { LEARN: 0.25, BUILD: 0.45, SHARE: 0.15, SHOWCASE: 0.15 } as const

export interface StageDefinition {
  id: number
  name: string
  weeks: string
  color: string
  description: string
  minScore: number
  exitGate: string
  deliverables: string[]
}

export const LAUNCHPAD_STAGES: readonly StageDefinition[] = [
  {
    id: 0,
    name: 'Week 0 – Baseline Assessment',
    weeks: '0',
    color: 'muted',
    description: 'Initial diagnostic test across logic, programming fundamentals, and chosen track essentials.',
    minScore: 60,
    exitGate: 'Minimum diagnostic baseline score and track orientation completion',
    deliverables: ['Baseline Technical MCQ Test', 'Development Environment Setup'],
  },
  {
    id: 1,
    name: 'Stage 1 – Learner',
    weeks: '1–6',
    color: 'primary',
    description: 'Core fundamentals, track architecture basics, hands-on guided labs, and daily standups.',
    minScore: 70,
    exitGate: 'Passing Stage 1 competency evaluation and foundational lab submissions',
    deliverables: ['Module Practice Exercises', 'Architecture Diagram', 'Stage 1 Quiz'],
  },
  {
    id: 2,
    name: 'Stage 2 – Practitioner',
    weeks: '7–12',
    color: 'warning',
    description: 'Intermediate specialization, mini-project sprint, test-driven code, and Week 12 certification.',
    minScore: 75,
    exitGate: 'Foundational Industry Certification (AWS, Salesforce, etc.) and Mini-Project',
    deliverables: ['Mini-Project Codebase', 'Week 12 Industry Certificate', 'Unit Test Suite'],
  },
  {
    id: 3,
    name: 'Stage 3 – Developer',
    weeks: '13–18',
    color: 'success',
    description: 'Enterprise integration, API contracts, CI/CD pipelines, and collaborative agile teamwork.',
    minScore: 80,
    exitGate: 'Live integration demo, code review defense, and automated pipeline execution',
    deliverables: ['Integrated Full-Stack Service', 'CI/CD Pipeline Manifest', 'Architecture Walkthrough'],
  },
  {
    id: 4,
    name: 'Stage 4 – Professional',
    weeks: '19–24',
    color: 'navy',
    description: 'Capstone project, security hardening, load testing, final defense, and placement readiness.',
    minScore: 85,
    exitGate: 'Final Capstone Project Defense and Week 24 Role Specialization Certification',
    deliverables: ['Production Capstone Solution', 'Week 24 Advanced Certification', 'Final Project Defense Demo'],
  },
] as const

export const L1_L2_L3_BANDS_PROPOSED = {
  DEVELOPMENT_REQUIRED: { min: 0, max: 59, label: 'Development Required', approved: false },
  L1: { min: 60, max: 69, label: 'L1', approved: false },
  L2: { min: 70, max: 84, label: 'L2', approved: false },
  L3: { min: 85, max: 100, label: 'L3', approved: false },
}

export const STAGE_EVAL_METRICS = {
  STAGE_1: [
    { metric: 'Technical Fundamentals and Learning Assessments', weight: 25 },
    { metric: 'Research and Conceptual Understanding', weight: 15 },
    { metric: 'Practical Exercises and Lab Completion', weight: 30 },
    { metric: 'Communication, Active KT Participation and Peer Mentoring Receptivity', weight: 15 },
    { metric: 'Introductory Presentation and Knowledge Sharing Explanation', weight: 15 },
  ],
  STAGE_2: [
    { metric: 'Technical Knowledge and Case-study Research', weight: 20 },
    { metric: 'Practical Assignments and Implementation', weight: 30 },
    { metric: 'Troubleshooting and Independent Application', weight: 20 },
    { metric: 'Communication, Collaboration and Foundational Peer Mentoring / KT Sharing', weight: 15 },
    { metric: 'Technical Presentation and Practical Demonstration', weight: 15 },
  ],
  STAGE_3: [
    { metric: 'Real-world Problem Research and Analysis', weight: 20 },
    { metric: 'Problem Definition and Solution Design', weight: 15 },
    { metric: 'Development and Implementation', weight: 30 },
    { metric: 'Testing, Validation and Documentation', weight: 20 },
    { metric: 'Team Coordination, Ownership, Structured Peer KT and Project Mentoring', weight: 15 },
  ],
  STAGE_4: [
    { metric: 'Technical Depth and Solution Quality', weight: 25 },
    { metric: 'Testing, Validation and Improvement', weight: 20 },
    { metric: 'Documentation and Handover Readiness', weight: 20 },
    { metric: 'Lead KT Workshops, Student Mentoring and Leadership Ownership', weight: 15 },
    { metric: 'Final Project Demonstration and Defence', weight: 20 },
  ],
}

export function calculateKPIScore(learn: number, build: number, share: number, showcase: number): number {
  return Math.round((learn * 0.25) + (build * 0.45) + (share * 0.15) + (showcase * 0.15))
}

export function getScoreBand(score: number): string {
  if (score >= 85) return 'L3'
  if (score >= 70) return 'L2'
  if (score >= 60) return 'L1'
  return 'Development Required'
}

