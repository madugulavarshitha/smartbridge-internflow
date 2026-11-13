import React, { useState, useEffect } from 'react'
import {
  FolderOpen, FileText, ThumbsUp, PlayCircle, CheckCircle2,
  XCircle, Eye, ChevronLeft, ChevronRight, Info, ExternalLink,
  GitBranch
} from 'lucide-react'
import AdminLayout from '../../../components/layout/AdminLayout'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'

// ─── Types ───────────────────────────────────────────────────────────────────

type PSStatus = 'pending' | 'approved' | 'revision_requested'
type ProjStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'revision_requested' | 'completed'

interface Milestone {
  title: string
  due_date: string
  completed: boolean
}

interface ReviewEvent {
  event: string
  date: string
  by: string
  note?: string
}

interface ProjectRecord {
  id: string
  title: string
  domain: string
  intern_name: string
  intern_id: string
  mentor_name: string
  batch: string
  stage: number
  ps_status: PSStatus
  status: ProjStatus
  problem_statement: string
  objectives: string[]
  proposed_solution: string
  tech_stack: string[]
  milestones: Milestone[]
  repo_url?: string
  demo_url?: string
  review_history: ReviewEvent[]
  created_at: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_PROJECTS: ProjectRecord[] = [
  {
    id: 'p1', title: 'AI-Powered Resume Screening Tool', domain: 'Machine Learning',
    intern_name: 'Aanya Sharma', intern_id: 'INT-2024-001', mentor_name: 'Rajesh Kumar',
    batch: 'AI & Cloud', stage: 3, ps_status: 'approved', status: 'in_progress' as any,
    problem_statement: 'Manual resume screening is time-consuming and prone to bias. This project aims to automate the process using NLP and ML techniques.',
    objectives: ['Parse and vectorize resumes', 'Train classification model on labeled data', 'Build REST API for scoring'],
    proposed_solution: 'Use spaCy for NLP parsing, scikit-learn for classification, and FastAPI for the endpoint layer.',
    tech_stack: ['Python', 'spaCy', 'scikit-learn', 'FastAPI', 'PostgreSQL'],
    milestones: [
      { title: 'Data collection & preprocessing', due_date: '2024-08-15', completed: true },
      { title: 'Model training', due_date: '2024-09-01', completed: true },
      { title: 'API development', due_date: '2024-09-20', completed: false },
    ],
    repo_url: 'https://github.com/aanya/resume-screener',
    review_history: [
      { event: 'Problem Statement Submitted', date: '2024-07-20', by: 'Aanya Sharma' },
      { event: 'Problem Statement Approved', date: '2024-07-22', by: 'Rajesh Kumar', note: 'Clear scope and feasible timeline.' },
    ],
    created_at: '2024-07-15',
  },
  {
    id: 'p2', title: 'Real-Time Inventory Management System', domain: 'Full Stack Web',
    intern_name: 'Ravi Patel', intern_id: 'INT-2024-002', mentor_name: 'Priya Nair',
    batch: 'Salesforce', stage: 3, ps_status: 'approved', status: 'completed',
    problem_statement: 'Small businesses lack affordable inventory management with real-time tracking and low-stock alerts.',
    objectives: ['Real-time stock updates', 'Low-stock email alerts', 'Reporting dashboard'],
    proposed_solution: 'React frontend with Node.js/Socket.IO backend and MongoDB for data persistence.',
    tech_stack: ['React', 'Node.js', 'Socket.IO', 'MongoDB', 'Tailwind CSS'],
    milestones: [
      { title: 'Backend API', due_date: '2024-08-10', completed: true },
      { title: 'Frontend UI', due_date: '2024-08-25', completed: true },
      { title: 'Testing & deployment', due_date: '2024-09-05', completed: true },
    ],
    repo_url: 'https://github.com/ravi/inventory-sys',
    demo_url: 'https://ravi-inventory.netlify.app',
    review_history: [
      { event: 'Problem Statement Submitted', date: '2024-07-10', by: 'Ravi Patel' },
      { event: 'Problem Statement Approved', date: '2024-07-12', by: 'Priya Nair' },
      { event: 'Project Completed & Reviewed', date: '2024-09-10', by: 'Priya Nair', note: 'Excellent delivery.' },
    ],
    created_at: '2024-07-08',
  },
  {
    id: 'p3', title: 'IoT Smart Home Dashboard', domain: 'IoT / Embedded',
    intern_name: 'Meera Joshi', intern_id: 'INT-2024-003', mentor_name: 'Suresh Verma',
    batch: 'Software Engineering', stage: 2, ps_status: 'revision_requested', status: 'revision_requested',
    problem_statement: 'Home owners need a central dashboard to monitor and control IoT devices.',
    objectives: ['Connect to MQTT broker', 'Display sensor data', 'Remote device control'],
    proposed_solution: 'Next.js dashboard consuming MQTT data via WebSockets with InfluxDB for time series.',
    tech_stack: ['Next.js', 'MQTT', 'InfluxDB', 'Grafana'],
    milestones: [],
    review_history: [
      { event: 'Problem Statement Submitted', date: '2024-08-05', by: 'Meera Joshi' },
      { event: 'Revision Requested', date: '2024-08-08', by: 'Suresh Verma', note: 'Scope too broad. Please narrow to 3 device types.' },
    ],
    created_at: '2024-08-01',
  },
  {
    id: 'p4', title: 'E-Learning Platform with Progress Tracking', domain: 'Full Stack Web',
    intern_name: 'Karthik Rao', intern_id: 'INT-2024-004', mentor_name: 'Anita Desai',
    batch: 'IoT & Robotics', stage: 3, ps_status: 'approved', status: 'under_review',
    problem_statement: 'Students lack a personalized learning platform that tracks their progress across courses.',
    objectives: ['Course content management', 'Quiz engine', 'Progress analytics'],
    proposed_solution: 'MERN stack application with JWT auth and Redis caching.',
    tech_stack: ['React', 'Express', 'MongoDB', 'Redis', 'JWT'],
    milestones: [
      { title: 'Auth & user management', due_date: '2024-08-20', completed: true },
      { title: 'Course module', due_date: '2024-09-05', completed: true },
      { title: 'Analytics dashboard', due_date: '2024-09-20', completed: false },
    ],
    repo_url: 'https://github.com/karthik/elearn',
    review_history: [
      { event: 'Problem Statement Submitted', date: '2024-07-28', by: 'Karthik Rao' },
      { event: 'Problem Statement Approved', date: '2024-07-30', by: 'Anita Desai' },
      { event: 'Project Submitted for Review', date: '2024-09-15', by: 'Karthik Rao' },
    ],
    created_at: '2024-07-25',
  },
  {
    id: 'p5', title: 'Blockchain-Based Credential Verification', domain: 'Blockchain',
    intern_name: 'Divya Krishnan', intern_id: 'INT-2024-005', mentor_name: 'Rajesh Kumar',
    batch: 'ServiceNow', stage: 4, ps_status: 'approved', status: 'approved',
    problem_statement: 'Educational credentials are frequently forged. Blockchain can provide immutable verification.',
    objectives: ['Smart contract for credential issuance', 'Verification portal', 'Admin dashboard'],
    proposed_solution: 'Ethereum smart contracts with Solidity; React frontend using ethers.js.',
    tech_stack: ['Solidity', 'Ethereum', 'React', 'ethers.js', 'IPFS'],
    milestones: [
      { title: 'Smart contract development', due_date: '2024-08-25', completed: true },
      { title: 'Frontend integration', due_date: '2024-09-10', completed: true },
    ],
    repo_url: 'https://github.com/divya/blockchain-creds',
    review_history: [
      { event: 'Problem Statement Submitted', date: '2024-07-18', by: 'Divya Krishnan' },
      { event: 'Problem Statement Approved', date: '2024-07-20', by: 'Rajesh Kumar' },
      { event: 'Project Approved', date: '2024-09-15', by: 'Rajesh Kumar', note: 'Innovative and well-implemented.' },
    ],
    created_at: '2024-07-15',
  },
  {
    id: 'p6', title: 'Microservices Order Management', domain: 'Backend / Cloud',
    intern_name: 'Arjun Mehta', intern_id: 'INT-2024-006', mentor_name: 'Priya Nair',
    batch: 'Business Intelligence', stage: 3, ps_status: 'pending', status: 'draft',
    problem_statement: 'Monolithic order management systems are hard to scale. This project proposes a microservices architecture.',
    objectives: ['Service decomposition', 'API gateway', 'Inter-service messaging'],
    proposed_solution: 'Docker + Kubernetes with RabbitMQ for async messaging.',
    tech_stack: ['Node.js', 'Docker', 'Kubernetes', 'RabbitMQ', 'API Gateway'],
    milestones: [],
    review_history: [
      { event: 'Problem Statement Submitted', date: '2024-09-02', by: 'Arjun Mehta' },
    ],
    created_at: '2024-09-01',
  },
  {
    id: 'p7', title: 'NLP-Based Customer Support Chatbot', domain: 'Machine Learning',
    intern_name: 'Sneha Reddy', intern_id: 'INT-2024-007', mentor_name: 'Suresh Verma',
    batch: 'AI & Cloud', stage: 4, ps_status: 'approved', status: 'submitted',
    problem_statement: 'Customer support teams are overwhelmed with repetitive queries that an AI chatbot can handle.',
    objectives: ['Intent classification', 'FAQ retrieval', 'Escalation to human agent'],
    proposed_solution: 'Rasa NLU + custom knowledge base with React chat widget.',
    tech_stack: ['Python', 'Rasa', 'React', 'Redis', 'PostgreSQL'],
    milestones: [
      { title: 'Intent model training', due_date: '2024-08-30', completed: true },
      { title: 'Chat widget', due_date: '2024-09-10', completed: true },
      { title: 'Integration testing', due_date: '2024-09-20', completed: false },
    ],
    repo_url: 'https://github.com/sneha/support-bot',
    review_history: [
      { event: 'Problem Statement Submitted', date: '2024-07-25', by: 'Sneha Reddy' },
      { event: 'Problem Statement Approved', date: '2024-07-27', by: 'Suresh Verma' },
      { event: 'Project Submitted', date: '2024-09-18', by: 'Sneha Reddy' },
    ],
    created_at: '2024-07-22',
  },
  {
    id: 'p8', title: 'Smart Parking System', domain: 'IoT / Full Stack',
    intern_name: 'Vikram Singh', intern_id: 'INT-2024-008', mentor_name: 'Anita Desai',
    batch: 'Salesforce', stage: 2, ps_status: 'approved', status: 'in_progress' as any,
    problem_statement: 'Urban parking is chaotic. A sensor-integrated system can show real-time slot availability.',
    objectives: ['Sensor data ingestion', 'Real-time map view', 'Slot reservation'],
    proposed_solution: 'Raspberry Pi sensors with MQTT → Node.js → React map view.',
    tech_stack: ['Raspberry Pi', 'MQTT', 'Node.js', 'React', 'Leaflet.js'],
    milestones: [
      { title: 'Hardware setup & data ingestion', due_date: '2024-08-18', completed: true },
      { title: 'Map UI', due_date: '2024-09-05', completed: false },
    ],
    review_history: [
      { event: 'Problem Statement Submitted', date: '2024-08-01', by: 'Vikram Singh' },
      { event: 'Problem Statement Approved', date: '2024-08-03', by: 'Anita Desai' },
    ],
    created_at: '2024-07-28',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function psBadge(s: PSStatus) {
  if (s === 'approved') return 'success'
  if (s === 'revision_requested') return 'danger'
  return 'warning'
}

function projBadge(s: string) {
  const map: Record<string, string> = {
    draft: 'muted', submitted: 'primary', under_review: 'warning',
    approved: 'success', revision_requested: 'danger', completed: 'success', in_progress: 'primary',
  }
  return (map[s] ?? 'default') as any
}

function fmt(date?: string) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function psLabel(s: PSStatus) {
  if (s === 'revision_requested') return 'Revision Requested'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ─── Component ────────────────────────────────────────────────────────────────

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  const [filterBatch, setFilterBatch] = useState('')
  const [filterMentor, setFilterMentor] = useState('')
  const [filterIntern, setFilterIntern] = useState('')
  const [filterStage, setFilterStage] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDomain, setFilterDomain] = useState('')

  const [selectedProject, setSelectedProject] = useState<ProjectRecord | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setProjects(MOCK_PROJECTS)
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  const batches = [
    'AI & Cloud',
    'Salesforce',
    'Software Engineering',
    'IoT & Robotics',
    'ServiceNow',
    'Business Intelligence',
  ]
  const mentors = [...new Set(projects.map(p => p.mentor_name))]
  const domains = [...new Set(projects.map(p => p.domain))]

  const filtered = projects.filter(p => {
    if (filterBatch && p.batch !== filterBatch) return false
    if (filterMentor && p.mentor_name !== filterMentor) return false
    if (filterIntern && !p.intern_name.toLowerCase().includes(filterIntern.toLowerCase())) return false
    if (filterStage && String(p.stage) !== filterStage) return false
    if (filterStatus && p.status !== filterStatus) return false
    if (filterDomain && p.domain !== filterDomain) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const total = projects.length
  const psPending = projects.filter(p => p.ps_status === 'pending').length
  const psApproved = projects.filter(p => p.ps_status === 'approved').length
  const inProgress = projects.filter(p => ['submitted', 'under_review', 'approved'].includes(p.status) || (p.status as any) === 'in_progress').length
  const completed = projects.filter(p => p.status === 'completed').length
  const rejected = projects.filter(p => p.status === 'revision_requested').length

  const summaryCards = [
    { label: 'Total Projects', value: total, icon: FolderOpen, color: 'text-navy' },
    { label: 'PS Pending', value: psPending, icon: FileText, color: 'text-warning' },
    { label: 'PS Approved', value: psApproved, icon: ThumbsUp, color: 'text-success' },
    { label: 'In Progress', value: inProgress, icon: PlayCircle, color: 'text-primary' },
    { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-success' },
    { label: 'Revision Requested', value: rejected, icon: XCircle, color: 'text-danger' },
  ]

  return (
    <AdminLayout title="Projects" subtitle="Monitoring intern projects across all tracks">
      {/* Info note */}
      <div className="mb-4 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
        <Info size={16} className="mt-0.5 shrink-0 text-blue-500" />
        <span>Projects require problem statement approval before development proceeds. Admin monitors but does not bypass the approval workflow.</span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        {summaryCards.map(c => (
          <Card key={c.label} padding="md">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-50">
                <c.icon size={18} className={c.color} />
              </div>
              <div>
                <p className="text-xs text-muted leading-tight">{c.label}</p>
                <p className="text-xl font-bold text-navy">{loading ? '—' : c.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card padding="md" className="mb-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <select value={filterBatch} onChange={e => { setFilterBatch(e.target.value); setPage(1) }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">All Tracks</option>
            {batches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={filterMentor} onChange={e => { setFilterMentor(e.target.value); setPage(1) }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">All Mentors</option>
            {mentors.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <input placeholder="Search intern…" value={filterIntern} onChange={e => { setFilterIntern(e.target.value); setPage(1) }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <select value={filterStage} onChange={e => { setFilterStage(e.target.value); setPage(1) }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">All Stages</option>
            {[1, 2, 3, 4].map(s => <option key={s} value={s}>Stage {s}</option>)}
          </select>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="revision_requested">Revision Requested</option>
            <option value="completed">Completed</option>
          </select>
          <select value={filterDomain} onChange={e => { setFilterDomain(e.target.value); setPage(1) }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">All Domains</option>
            {domains.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Project Title', 'Intern', 'Mentor', 'Domain', 'Stage', 'PS Status', 'Project Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-muted">
                    <FolderOpen size={36} className="mx-auto mb-2 opacity-30" />
                    <p>No projects found matching the current filters.</p>
                  </td>
                </tr>
              ) : paged.map(proj => (
                <tr key={proj.id} className="border-b border-gray-50 hover:bg-surface transition-colors">
                  <td className="px-4 py-3 font-medium text-navy max-w-[200px] truncate">{proj.title}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-navy">{proj.intern_name}</div>
                    <div className="text-xs text-muted">{proj.intern_id}</div>
                  </td>
                  <td className="px-4 py-3 text-navy whitespace-nowrap">{proj.mentor_name}</td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap text-xs">{proj.domain}</td>
                  <td className="px-4 py-3 text-center font-medium text-navy">{proj.stage}</td>
                  <td className="px-4 py-3">
                    <Badge variant={psBadge(proj.ps_status) as any}>{psLabel(proj.ps_status)}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={projBadge(proj.status)}>{proj.status.replace('_', ' ')}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="ghost" icon={<Eye size={14} />} onClick={() => setSelectedProject(proj)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-sm text-muted">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" icon={<ChevronLeft size={14} />} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
              <span className="text-sm font-medium text-navy">{page} / {totalPages}</span>
              <Button size="sm" variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Next <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedProject} onClose={() => setSelectedProject(null)} title={selectedProject?.title ?? ''} size="full">
        {selectedProject && (
          <div className="space-y-5">
            {/* Meta grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div><span className="text-muted">Intern:</span> <span className="font-medium text-navy">{selectedProject.intern_name} ({selectedProject.intern_id})</span></div>
              <div><span className="text-muted">Mentor:</span> <span className="font-medium text-navy">{selectedProject.mentor_name}</span></div>
              <div><span className="text-muted">Batch:</span> <span className="font-medium text-navy">{selectedProject.batch}</span></div>
              <div><span className="text-muted">Domain:</span> <span className="font-medium text-navy">{selectedProject.domain}</span></div>
              <div><span className="text-muted">Stage:</span> <span className="font-medium text-navy">{selectedProject.stage}</span></div>
              <div className="flex items-center gap-2"><span className="text-muted">PS Status:</span> <Badge variant={psBadge(selectedProject.ps_status) as any}>{psLabel(selectedProject.ps_status)}</Badge></div>
            </div>

            {/* Problem Statement */}
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Problem Statement</h4>
              <p className="text-sm text-navy">{selectedProject.problem_statement}</p>
            </div>

            {/* Objectives */}
            <div>
              <h4 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Objectives</h4>
              <ul className="list-disc list-inside space-y-1">
                {selectedProject.objectives.map((o, i) => <li key={i} className="text-sm text-navy">{o}</li>)}
              </ul>
            </div>

            {/* Proposed Solution */}
            <div>
              <h4 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Proposed Solution</h4>
              <p className="text-sm text-navy">{selectedProject.proposed_solution}</p>
            </div>

            {/* Tech Stack */}
            <div>
              <h4 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Technology Stack</h4>
              <div className="flex flex-wrap gap-2">
                {selectedProject.tech_stack.map(t => (
                  <span key={t} className="bg-gray-100 text-navy text-xs px-2 py-1 rounded-md font-medium">{t}</span>
                ))}
              </div>
            </div>

            {/* Milestones */}
            {selectedProject.milestones.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Milestones</h4>
                <div className="space-y-2">
                  {selectedProject.milestones.map((m, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center ${m.completed ? 'bg-success' : 'bg-gray-200'}`}>
                        {m.completed && <span className="text-white text-xs">✓</span>}
                      </span>
                      <span className={`text-sm ${m.completed ? 'line-through text-muted' : 'text-navy'}`}>{m.title}</span>
                      <span className="text-xs text-muted ml-auto">{fmt(m.due_date)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            {(selectedProject.repo_url || selectedProject.demo_url) && (
              <div className="flex gap-3">
                {selectedProject.repo_url && (
                  <a href={selectedProject.repo_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary underline">
                    <GitBranch size={14} /> Repository
                  </a>
                )}
                {selectedProject.demo_url && (
                  <a href={selectedProject.demo_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary underline">
                    <ExternalLink size={14} /> Live Demo
                  </a>
                )}
              </div>
            )}

            {/* Review Timeline */}
            <div>
              <h4 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Review History</h4>
              <div className="relative pl-5 border-l-2 border-gray-200 space-y-3">
                {selectedProject.review_history.map((ev, i) => (
                  <div key={i} className="relative">
                    <span className="absolute -left-[21px] w-3 h-3 rounded-full bg-primary border-2 border-white" />
                    <p className="text-xs text-muted">{ev.event} · {fmt(ev.date)} · by <span className="font-medium">{ev.by}</span></p>
                    {ev.note && <p className="text-sm text-navy mt-0.5 italic">"{ev.note}"</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  )
}

export default ProjectsPage
