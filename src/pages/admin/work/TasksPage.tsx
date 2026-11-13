import React, { useState, useEffect } from 'react'
import {
  CheckSquare, Clock, Upload, CheckCircle, AlertTriangle,
  Eye, ChevronLeft, ChevronRight, Info
} from 'lucide-react'
import AdminLayout from '../../../components/layout/AdminLayout'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import { accountService } from '../../../lib/accountService'

// ─── Types ───────────────────────────────────────────────────────────────────

interface TaskRecord {
  id: string
  title: string
  description: string
  intern_name: string
  intern_id: string
  mentor_name: string
  batch: string
  stage: number
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'submitted' | 'reviewed' | 'overdue'
  due_date: string
  submitted_at?: string
  reviewed_at?: string
  created_at: string
  submission_text?: string
  file_links?: string[]
  mentor_feedback?: string
  mentor_score?: number
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_TASKS: TaskRecord[] = [
  {
    id: 't1', title: 'Build REST API with Node.js', description: 'Create a fully functional REST API implementing CRUD operations for a blog application using Node.js and Express.',
    intern_name: 'Aanya Sharma', intern_id: 'INT-2024-001', mentor_name: 'Rajesh Kumar', batch: 'AI & Cloud', stage: 2,
    priority: 'high', status: 'reviewed', due_date: '2024-08-15', submitted_at: '2024-08-13', reviewed_at: '2024-08-16',
    created_at: '2024-07-20', submission_text: 'Implemented REST API with Express, JWT auth, and MongoDB.',
    file_links: ['https://github.com/aanya/rest-api', 'https://drive.google.com/file/d/xyz'],
    mentor_feedback: 'Excellent work. Clean code and good error handling.', mentor_score: 88,
  },
  {
    id: 't2', title: 'React Dashboard UI', description: 'Design and build a responsive admin dashboard using React with charts and data tables.',
    intern_name: 'Ravi Patel', intern_id: 'INT-2024-002', mentor_name: 'Priya Nair', batch: 'Salesforce', stage: 3,
    priority: 'high', status: 'submitted', due_date: '2024-09-01', submitted_at: '2024-08-30',
    created_at: '2024-08-01', submission_text: 'Dashboard built with Recharts and Tailwind CSS.',
    file_links: ['https://github.com/ravi/dashboard'],
  },
  {
    id: 't3', title: 'SQL Query Optimization', description: 'Analyze and optimize slow SQL queries in the provided sample database.',
    intern_name: 'Meera Joshi', intern_id: 'INT-2024-003', mentor_name: 'Suresh Verma', batch: 'Software Engineering', stage: 1,
    priority: 'medium', status: 'pending', due_date: '2024-09-10',
    created_at: '2024-08-25',
  },
  {
    id: 't4', title: 'Docker Containerization', description: 'Containerize an existing Node.js application using Docker and docker-compose.',
    intern_name: 'Karthik Rao', intern_id: 'INT-2024-004', mentor_name: 'Anita Desai', batch: 'IoT & Robotics', stage: 3,
    priority: 'high', status: 'overdue', due_date: '2024-08-05',
    created_at: '2024-07-10',
  },
  {
    id: 't5', title: 'Python Data Analysis', description: 'Perform EDA on the provided dataset using pandas and matplotlib.',
    intern_name: 'Divya Krishnan', intern_id: 'INT-2024-005', mentor_name: 'Rajesh Kumar', batch: 'ServiceNow', stage: 2,
    priority: 'medium', status: 'reviewed', due_date: '2024-08-20', submitted_at: '2024-08-18', reviewed_at: '2024-08-22',
    created_at: '2024-07-28', submission_text: 'EDA with 5 visualizations and key insights summarized.',
    mentor_feedback: 'Good analysis. Need to improve data cleaning steps.', mentor_score: 74,
  },
  {
    id: 't6', title: 'JWT Authentication Module', description: 'Implement JWT-based authentication in the provided Express boilerplate.',
    intern_name: 'Arjun Mehta', intern_id: 'INT-2024-006', mentor_name: 'Priya Nair', batch: 'Business Intelligence', stage: 2,
    priority: 'high', status: 'overdue', due_date: '2024-08-10',
    created_at: '2024-07-15',
  },
  {
    id: 't7', title: 'CI/CD Pipeline Setup', description: 'Set up a CI/CD pipeline using GitHub Actions for automated testing and deployment.',
    intern_name: 'Sneha Reddy', intern_id: 'INT-2024-007', mentor_name: 'Suresh Verma', batch: 'AI & Cloud', stage: 4,
    priority: 'medium', status: 'submitted', due_date: '2024-09-05', submitted_at: '2024-09-04',
    created_at: '2024-08-10', submission_text: 'Pipeline with lint, test, and deploy stages configured.',
    file_links: ['https://github.com/sneha/cicd-demo'],
  },
  {
    id: 't8', title: 'Unit Testing with Jest', description: 'Write comprehensive unit tests for the provided utility functions.',
    intern_name: 'Vikram Singh', intern_id: 'INT-2024-008', mentor_name: 'Anita Desai', batch: 'Salesforce', stage: 1,
    priority: 'low', status: 'pending', due_date: '2024-09-15',
    created_at: '2024-09-01',
  },
  {
    id: 't9', title: 'AWS S3 File Upload', description: 'Implement file upload functionality using AWS S3 SDK in the backend.',
    intern_name: 'Pooja Iyer', intern_id: 'INT-2024-009', mentor_name: 'Rajesh Kumar', batch: 'Software Engineering', stage: 3,
    priority: 'medium', status: 'reviewed', due_date: '2024-08-28', submitted_at: '2024-08-27', reviewed_at: '2024-08-30',
    created_at: '2024-08-05', submission_text: 'S3 upload with presigned URLs implemented and tested.',
    mentor_feedback: 'Solid implementation with good error handling.', mentor_score: 82,
  },
  {
    id: 't10', title: 'WebSocket Chat Feature', description: 'Add real-time chat using Socket.IO to the existing application.',
    intern_name: 'Nikhil Gupta', intern_id: 'INT-2024-010', mentor_name: 'Priya Nair', batch: 'IoT & Robotics', stage: 4,
    priority: 'high', status: 'pending', due_date: '2024-09-20',
    created_at: '2024-09-05',
  },
  {
    id: 't11', title: 'GraphQL API Migration', description: 'Migrate REST endpoints to GraphQL schema and resolvers.',
    intern_name: 'Lavanya Reddy', intern_id: 'INT-2024-011', mentor_name: 'Suresh Verma', batch: 'ServiceNow', stage: 4,
    priority: 'medium', status: 'overdue', due_date: '2024-08-18',
    created_at: '2024-07-25',
  },
  {
    id: 't12', title: 'Database Schema Design', description: 'Design a normalized database schema for an e-commerce application.',
    intern_name: 'Rahul Nair', intern_id: 'INT-2024-012', mentor_name: 'Anita Desai', batch: 'Business Intelligence', stage: 1,
    priority: 'low', status: 'submitted', due_date: '2024-09-08', submitted_at: '2024-09-07',
    created_at: '2024-08-20', submission_text: 'ER diagram and normalized schema with indexing strategy.',
    file_links: ['https://drive.google.com/file/d/schema-doc'],
  },
]

// ─── Helper functions ─────────────────────────────────────────────────────────

function priorityBadgeVariant(p: string) {
  if (p === 'high') return 'danger'
  if (p === 'medium') return 'warning'
  return 'muted'
}

function statusBadgeVariant(s: string) {
  if (s === 'reviewed') return 'success'
  if (s === 'submitted') return 'primary'
  if (s === 'overdue') return 'danger'
  return 'muted'
}

function isOverdue(dueDate: string, status: string) {
  return status === 'overdue' || (new Date(dueDate) < new Date() && status === 'pending')
}

function fmt(date?: string) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Component ────────────────────────────────────────────────────────────────

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  // Filters
  const [filterBatch, setFilterBatch] = useState('')
  const [filterMentor, setFilterMentor] = useState('')
  const [filterIntern, setFilterIntern] = useState('')
  const [filterStage, setFilterStage] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Modal
  const [selectedTask, setSelectedTask] = useState<TaskRecord | null>(null)

  useEffect(() => {
    // Read from unified accountService tasks
    const managedTasks = accountService.getTasks().map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      intern_name: t.intern_name,
      intern_id: t.intern_id,
      mentor_name: t.mentor_name ?? 'Assigned Mentor',
      batch: t.track,
      stage: t.stage_number,
      priority: 'high' as const,
      status: t.status as 'pending' | 'submitted' | 'reviewed' | 'overdue',
      due_date: t.due_date,
      submitted_at: t.submitted_at,
      reviewed_at: t.reviewed_at,
      created_at: t.created_at,
      submission_text: t.submission_text,
      file_links: t.submission_url ? [t.submission_url] : [],
      mentor_feedback: t.mentor_feedback,
      mentor_score: t.mentor_score,
    }))

    // Combine with base seed tasks (avoiding duplicates)
    const existingIds = new Set(managedTasks.map((m) => m.id))
    const extra = MOCK_TASKS.filter((m) => !existingIds.has(m.id))
    setTasks([...managedTasks, ...extra])
    setLoading(false)
  }, [])

  const batches = [
    'AI & Cloud',
    'Salesforce',
    'Software Engineering',
    'IoT & Robotics',
    'ServiceNow',
    'Business Intelligence',
  ]
  const mentors = [...new Set(tasks.map(t => t.mentor_name))]

  const filtered = tasks.filter(t => {
    if (filterBatch && t.batch !== filterBatch) return false
    if (filterMentor && t.mentor_name !== filterMentor) return false
    if (filterIntern && !t.intern_name.toLowerCase().includes(filterIntern.toLowerCase()) && !t.intern_id.toLowerCase().includes(filterIntern.toLowerCase())) return false
    if (filterStage && String(t.stage) !== filterStage) return false
    if (filterPriority && t.priority !== filterPriority) return false
    if (filterStatus && t.status !== filterStatus) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Summary
  const total = tasks.length
  const pending = tasks.filter(t => t.status === 'pending').length
  const submitted = tasks.filter(t => t.status === 'submitted').length
  const reviewed = tasks.filter(t => t.status === 'reviewed').length
  const overdue = tasks.filter(t => t.status === 'overdue').length

  const summaryCards = [
    { label: 'Total Tasks', value: total, icon: CheckSquare, color: 'text-navy' },
    { label: 'Pending', value: pending, icon: Clock, color: 'text-muted' },
    { label: 'Submitted', value: submitted, icon: Upload, color: 'text-primary' },
    { label: 'Reviewed', value: reviewed, icon: CheckCircle, color: 'text-success' },
    { label: 'Overdue', value: overdue, icon: AlertTriangle, color: 'text-danger', highlight: true },
  ]

  return (
    <AdminLayout title="Tasks" subtitle="Monitoring intern tasks across all tracks">
      {/* Info note */}
      <div className="mb-4 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
        <Info size={16} className="mt-0.5 shrink-0 text-blue-500" />
        <span>Task creation is managed by mentors through the Mentor Portal. Admin has monitoring and oversight access only.</span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {summaryCards.map(c => (
          <Card key={c.label} padding="md">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${c.highlight ? 'bg-red-50' : 'bg-gray-50'}`}>
                <c.icon size={20} className={c.color} />
              </div>
              <div>
                <p className="text-xs text-muted">{c.label}</p>
                <p className={`text-2xl font-bold ${c.highlight ? 'text-danger' : 'text-navy'}`}>{loading ? '—' : c.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card padding="md" className="mb-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <select value={filterBatch} onChange={e => { setFilterBatch(e.target.value); setPage(1) }}
            className="col-span-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">All Tracks</option>
            {batches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={filterMentor} onChange={e => { setFilterMentor(e.target.value); setPage(1) }}
            className="col-span-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">All Mentors</option>
            {mentors.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <input placeholder="Search intern…" value={filterIntern} onChange={e => { setFilterIntern(e.target.value); setPage(1) }}
            className="col-span-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <select value={filterStage} onChange={e => { setFilterStage(e.target.value); setPage(1) }}
            className="col-span-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">All Stages</option>
            {[1, 2, 3, 4].map(s => <option key={s} value={s}>Stage {s}</option>)}
          </select>
          <select value={filterPriority} onChange={e => { setFilterPriority(e.target.value); setPage(1) }}
            className="col-span-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
            className="col-span-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="reviewed">Reviewed</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Task Title', 'Intern', 'Mentor', 'Batch', 'Stage', 'Priority', 'Due Date', 'Status', 'Submitted At', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 10 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center text-muted">
                    <CheckSquare size={36} className="mx-auto mb-2 opacity-30" />
                    <p>No tasks found matching the current filters.</p>
                  </td>
                </tr>
              ) : paged.map(task => (
                <tr key={task.id} className="border-b border-gray-50 hover:bg-surface transition-colors">
                  <td className="px-4 py-3 font-medium text-navy max-w-[180px] truncate">{task.title}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-navy">{task.intern_name}</div>
                    <div className="text-xs text-muted">{task.intern_id}</div>
                  </td>
                  <td className="px-4 py-3 text-navy whitespace-nowrap">{task.mentor_name}</td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">{task.batch}</td>
                  <td className="px-4 py-3 text-center text-navy font-medium">{task.stage}</td>
                  <td className="px-4 py-3">
                    <Badge variant={priorityBadgeVariant(task.priority) as any}>{task.priority}</Badge>
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap font-medium ${isOverdue(task.due_date, task.status) ? 'text-danger' : 'text-navy'}`}>
                    {fmt(task.due_date)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusBadgeVariant(task.status) as any}>{task.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">{fmt(task.submitted_at)}</td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="ghost" icon={<Eye size={14} />} onClick={() => setSelectedTask(task)}>
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
      <Modal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} title={selectedTask?.title ?? ''} size="xl">
        {selectedTask && (
          <div className="space-y-5">
            {/* Meta */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted">Intern:</span> <span className="font-medium text-navy">{selectedTask.intern_name} ({selectedTask.intern_id})</span></div>
              <div><span className="text-muted">Mentor:</span> <span className="font-medium text-navy">{selectedTask.mentor_name}</span></div>
              <div><span className="text-muted">Batch:</span> <span className="font-medium text-navy">{selectedTask.batch}</span></div>
              <div><span className="text-muted">Stage:</span> <span className="font-medium text-navy">{selectedTask.stage}</span></div>
              <div><span className="text-muted">Priority:</span> <Badge variant={priorityBadgeVariant(selectedTask.priority) as any}>{selectedTask.priority}</Badge></div>
              <div><span className="text-muted">Status:</span> <Badge variant={statusBadgeVariant(selectedTask.status) as any}>{selectedTask.status}</Badge></div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Description</h4>
              <p className="text-sm text-navy">{selectedTask.description}</p>
            </div>

            {/* Submission */}
            {selectedTask.submission_text && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h4 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Intern Submission</h4>
                <p className="text-sm text-navy mb-2">{selectedTask.submission_text}</p>
                {selectedTask.file_links && selectedTask.file_links.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.file_links.map((link, i) => (
                      <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-primary underline truncate max-w-xs">
                        🔗 {link.replace('https://', '')}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Review */}
            {selectedTask.mentor_feedback && (
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <h4 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Mentor Review</h4>
                <p className="text-sm text-navy mb-1">{selectedTask.mentor_feedback}</p>
                {selectedTask.mentor_score !== undefined && (
                  <p className="text-sm font-semibold text-success">Score: {selectedTask.mentor_score}/100</p>
                )}
              </div>
            )}

            {/* Timeline */}
            <div>
              <h4 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Timeline</h4>
              <div className="relative pl-5 border-l-2 border-gray-200 space-y-3">
                {[
                  { label: 'Created', date: selectedTask.created_at, color: 'bg-gray-400' },
                  ...(selectedTask.submitted_at ? [{ label: 'Submitted', date: selectedTask.submitted_at, color: 'bg-primary' }] : []),
                  ...(selectedTask.reviewed_at ? [{ label: 'Reviewed', date: selectedTask.reviewed_at, color: 'bg-success' }] : []),
                ].map(ev => (
                  <div key={ev.label} className="relative">
                    <span className={`absolute -left-[21px] w-3 h-3 rounded-full ${ev.color} border-2 border-white`} />
                    <p className="text-xs text-muted">{ev.label}</p>
                    <p className="text-sm font-medium text-navy">{fmt(ev.date)}</p>
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

export default TasksPage
