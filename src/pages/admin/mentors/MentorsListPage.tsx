import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  Eye,
  Edit2,
  MoreVertical,
  Download,
  UserCheck,
  UserX,
  X,
  CheckCircle,
} from 'lucide-react'
import AdminLayout from '../../../components/layout/AdminLayout'
import Button from '../../../components/ui/Button'
import Badge, { statusToBadgeVariant } from '../../../components/ui/Badge'
import Card from '../../../components/ui/Card'
import Input from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import { accountService, type Mentor } from '../../../lib/accountService'

const STANDARD_DOMAINS = [
  'AI & Cloud',
  'Salesforce',
  'Software Engineering',
  'IoT & Robotics',
  'ServiceNow',
  'Business Intelligence',
]

const MentorsListPage: React.FC = () => {
  const navigate = useNavigate()
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [domainFilter, setDomainFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [editMentor, setEditMentor] = useState<Mentor | null>(null)
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    department: '',
    domain: '',
    designation: '',
    expertise: '',
    status: 'active',
  })
  const [editLoading, setEditLoading] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const loadMentors = useCallback(() => {
    setLoading(true)
    try {
      const data = accountService.getMentors()
      setMentors(data)
    } catch {
      // fallback
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMentors()
  }, [loadMentors])

  const handleToggleStatus = (e: React.MouseEvent, mentor: Mentor) => {
    e.stopPropagation()
    setOpenMenuId(null)
    try {
      const updated = accountService.toggleMentorStatus(mentor.id)
      setMentors(prev => prev.map(m => m.id === mentor.id ? updated : m))
      showToast(`Mentor status updated to "${updated.status}"`)
    } catch {
      showToast('Failed to update status.')
    }
  }

  const openEditModal = (e: React.MouseEvent, mentor: Mentor) => {
    e.stopPropagation()
    setOpenMenuId(null)
    setEditMentor(mentor)
    setEditForm({
      full_name: mentor.profile?.full_name ?? '',
      email: mentor.profile?.email ?? '',
      department: mentor.department ?? '',
      domain: mentor.domain ?? 'AI & Cloud',
      designation: mentor.designation ?? '',
      expertise: mentor.expertise?.join(', ') ?? '',
      status: mentor.status ?? 'active',
    })
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editMentor) return
    setEditLoading(true)
    try {
      const updated = accountService.updateMentor(editMentor.id, {
        full_name: editForm.full_name,
        email: editForm.email,
        department: editForm.department,
        domain: editForm.domain,
        designation: editForm.designation,
        expertise: editForm.expertise.split(',').map(s => s.trim()).filter(Boolean),
        status: editForm.status as 'active' | 'inactive',
      })
      setMentors(prev => prev.map(m => m.id === editMentor.id ? updated : m))
      setEditMentor(null)
      showToast('Mentor profile updated successfully!')
    } catch {
      showToast('Failed to save changes.')
    } finally {
      setEditLoading(false)
    }
  }

  const filtered = mentors.filter((m) => {
    const matchSearch =
      !search ||
      m.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.employee_id?.toLowerCase().includes(search.toLowerCase()) ||
      m.domain?.toLowerCase().includes(search.toLowerCase()) ||
      m.designation?.toLowerCase().includes(search.toLowerCase()) ||
      m.profile?.email?.toLowerCase().includes(search.toLowerCase())
    const matchDomain = !domainFilter || m.domain === domainFilter
    const matchStatus = !statusFilter || m.status === statusFilter
    return matchSearch && matchDomain && matchStatus
  })

  return (
    <AdminLayout title="Mentors" subtitle="Manage program mentors and assigned interns">
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-navy text-white px-4 py-2.5 rounded-lg shadow-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      <Card padding="none">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-gray-100">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search mentor by name, ID or domain..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 w-64"
              />
            </div>
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All Domains / Tracks</option>
              {STANDARD_DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Download size={14} />}
              onClick={() => {
                const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `mentors_export_${Date.now()}.json`
                a.click()
              }}
            >
              Export
            </Button>
            <Button size="sm" icon={<Plus size={14} />} onClick={() => navigate('/admin/mentors/add')}>
              Add Mentor
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Mentor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Employee ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Department</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Domain / Track</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Designation</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Assigned Interns</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted">
                    No mentors found matching the criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((mentor) => (
                  <tr
                    key={mentor.id}
                    className="bg-white hover:bg-surface transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/mentors/${mentor.id}`)}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-navy/10 rounded-full flex items-center justify-center text-navy text-sm font-semibold flex-shrink-0">
                          {mentor.profile?.full_name?.[0] ?? '?'}
                        </div>
                        <div>
                          <p className="font-medium text-navy">{mentor.profile?.full_name}</p>
                          <p className="text-xs text-muted">{mentor.profile?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-muted">{mentor.employee_id}</td>
                    <td className="px-4 py-4 text-sm">{mentor.department ?? '—'}</td>
                    <td className="px-4 py-4 font-medium text-navy">{mentor.domain ?? '—'}</td>
                    <td className="px-4 py-4 text-xs text-slate-700">{mentor.designation ?? '—'}</td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-navy">{mentor.intern_count ?? 0}</span>
                      <span className="text-xs text-muted"> intern{(mentor.intern_count ?? 0) === 1 ? '' : 's'}</span>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={statusToBadgeVariant(mentor.status)}>{mentor.status}</Badge>
                    </td>
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === mentor.id ? null : mentor.id)}
                          className="p-1.5 rounded hover:bg-gray-100 text-muted transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openMenuId === mentor.id && (
                          <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-100 z-20 py-1">
                            <button
                              onClick={() => {
                                setOpenMenuId(null)
                                navigate(`/admin/mentors/${mentor.id}`)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 text-left text-navy font-medium"
                            >
                              <Eye size={13} className="text-primary" /> View Profile
                            </button>
                            <button
                              onClick={(e) => openEditModal(e, mentor)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 text-left text-navy font-medium"
                            >
                              <Edit2 size={13} className="text-muted" /> Edit Details
                            </button>
                            <button
                              onClick={(e) => handleToggleStatus(e, mentor)}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 text-left font-medium ${
                                mentor.status === 'active' ? 'text-danger hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              {mentor.status === 'active' ? (
                                <>
                                  <UserX size={13} /> Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck size={13} /> Activate
                                </>
                              )}
                            </button>
                          </div>
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

      {/* Edit Mentor Modal */}
      {editMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-navy text-base">Edit Mentor Profile</h3>
                <p className="text-xs text-muted font-mono">{editMentor.employee_id}</p>
              </div>
              <button
                onClick={() => setEditMentor(null)}
                className="p-1 rounded-lg text-muted hover:text-navy hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Full Name"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
                <Input
                  label="Designation"
                  value={editForm.designation}
                  onChange={(e) => setEditForm((f) => ({ ...f, designation: e.target.value }))}
                  placeholder="e.g. Lead Architect"
                  required
                />
                <Input
                  label="Department"
                  value={editForm.department}
                  onChange={(e) => setEditForm((f) => ({ ...f, department: e.target.value }))}
                />
                <Select
                  label="Primary Domain / Track"
                  options={STANDARD_DOMAINS.map((d) => ({ value: d, label: d }))}
                  value={editForm.domain}
                  onChange={(e) => setEditForm((f) => ({ ...f, domain: e.target.value }))}
                />
                <Select
                  label="Status"
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                  ]}
                  value={editForm.status}
                  onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Expertise (comma-separated)"
                    value={editForm.expertise}
                    onChange={(e) => setEditForm((f) => ({ ...f, expertise: e.target.value }))}
                    placeholder="e.g. Python, Azure, CI/CD"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditMentor(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" loading={editLoading}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default MentorsListPage
