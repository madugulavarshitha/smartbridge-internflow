import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  Eye,
  Edit2,
  UserCheck,
  UserX,
  Download,
  MoreVertical,
  X,
  CheckCircle,
} from 'lucide-react'
import AdminLayout from '../../../components/layout/AdminLayout'
import Button from '../../../components/ui/Button'
import Badge, { statusToBadgeVariant } from '../../../components/ui/Badge'
import Card from '../../../components/ui/Card'
import Input from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import { accountService, type Intern } from '../../../lib/accountService'
import { LAUNCHPAD_STAGES } from '../../../lib/constants'

const STANDARD_TRACKS = [
  'AI & Cloud',
  'Salesforce',
  'Software Engineering',
  'IoT & Robotics',
  'ServiceNow',
  'Business Intelligence',
]

const InternsListPage: React.FC = () => {
  const navigate = useNavigate()
  const [interns, setInterns] = useState<Intern[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [trackFilter, setTrackFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [page, setPage] = useState(1)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [editIntern, setEditIntern] = useState<Intern | null>(null)
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    track: '',
    status: 'active',
    college: '',
    degree: '',
    branch: '',
    grad_year: 2026,
  })
  const [editLoading, setEditLoading] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const pageSize = 10

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const loadInterns = useCallback(() => {
    setLoading(true)
    try {
      const data = accountService.getInterns()
      setInterns(data)
    } catch {
      // fallback
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInterns()
  }, [loadInterns])

  const handleToggleStatus = (e: React.MouseEvent, intern: Intern) => {
    e.stopPropagation()
    setOpenMenuId(null)
    try {
      const updated = accountService.toggleInternStatus(intern.id)
      setInterns(prev => prev.map(i => i.id === intern.id ? updated : i))
      showToast(`Intern status updated to "${updated.status}"`)
    } catch (err) {
      showToast('Failed to update status.')
    }
  }

  const openEditModal = (e: React.MouseEvent, intern: Intern) => {
    e.stopPropagation()
    setOpenMenuId(null)
    setEditIntern(intern)
    setEditForm({
      full_name: intern.profile?.full_name ?? '',
      email: intern.profile?.email ?? '',
      phone: intern.phone ?? '',
      track: intern.track ?? 'AI & Cloud',
      status: intern.status ?? 'active',
      college: intern.college ?? '',
      degree: intern.degree ?? 'B.Tech',
      branch: intern.branch ?? '',
      grad_year: intern.grad_year ?? 2026,
    })
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editIntern) return
    setEditLoading(true)
    try {
      const updated = accountService.updateIntern(editIntern.id, {
        full_name: editForm.full_name,
        email: editForm.email,
        phone: editForm.phone,
        track: editForm.track,
        status: editForm.status as any,
        college: editForm.college,
        degree: editForm.degree,
        branch: editForm.branch,
        grad_year: Number(editForm.grad_year),
      })
      setInterns(prev => prev.map(i => i.id === editIntern.id ? updated : i))
      setEditIntern(null)
      showToast('Intern profile updated successfully!')
    } catch (err) {
      showToast('Failed to save changes.')
    } finally {
      setEditLoading(false)
    }
  }

  const filtered = interns.filter((i) => {
    const matchSearch =
      !search ||
      i.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      i.intern_id?.toLowerCase().includes(search.toLowerCase()) ||
      i.profile?.email?.toLowerCase().includes(search.toLowerCase())
    const matchTrack = !trackFilter || i.track === trackFilter
    const matchStatus = !statusFilter || i.status === statusFilter
    const matchStage = !stageFilter || String(i.current_stage) === stageFilter
    return matchSearch && matchTrack && matchStatus && matchStage
  })

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <AdminLayout title="Interns" subtitle="Manage all program interns and provisioned accounts">
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-navy text-white px-4 py-2.5 rounded-lg shadow-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      <Card padding="none">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-gray-100">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search by name, ID or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 w-64"
              />
            </div>
            <select
              value={trackFilter}
              onChange={(e) => {
                setTrackFilter(e.target.value)
                setPage(1)
              }}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All Tracks</option>
              {STANDARD_TRACKS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All Status</option>
              {['active', 'invited', 'inactive', 'on_hold', 'completed', 'withdrawn'].map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
            <select
              value={stageFilter}
              onChange={(e) => {
                setStageFilter(e.target.value)
                setPage(1)
              }}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All Stages</option>
              {LAUNCHPAD_STAGES.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  Stage {s.id}
                </option>
              ))}
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
                a.download = `interns_export_${Date.now()}.json`
                a.click()
              }}
            >
              Export
            </Button>
            <Button size="sm" icon={<Plus size={14} />} onClick={() => navigate('/admin/interns/add')}>
              Add Intern
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Intern</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Track</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Stage</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Mentor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">College</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-muted">
                    No interns found matching the criteria.
                  </td>
                </tr>
              ) : (
                paged.map((intern) => (
                  <tr
                    key={intern.id}
                    className="bg-white hover:bg-surface transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/interns/${intern.id}`)}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm font-semibold flex-shrink-0">
                          {intern.profile?.full_name?.[0] ?? '?'}
                        </div>
                        <div>
                          <p className="font-medium text-navy">{intern.profile?.full_name ?? '—'}</p>
                          <p className="text-xs text-muted">{intern.profile?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted font-mono text-xs">{intern.intern_id}</td>
                    <td className="px-4 py-4 font-medium text-navy">{intern.track ?? '—'}</td>
                    <td className="px-4 py-4">
                      <Badge variant="primary" size="sm">
                        Stage {intern.current_stage}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={statusToBadgeVariant(intern.status)}>
                        {intern.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-xs font-medium text-slate-700">
                      {intern.mentor?.profile?.full_name ?? 'Unassigned'}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted">{intern.college ?? '—'}</td>
                    <td className="px-4 py-4 text-sm text-muted">
                      {intern.joining_date ? new Date(intern.joining_date).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === intern.id ? null : intern.id)}
                          className="p-1.5 rounded hover:bg-gray-100 text-muted transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openMenuId === intern.id && (
                          <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-100 z-20 py-1">
                            <button
                              onClick={() => {
                                setOpenMenuId(null)
                                navigate(`/admin/interns/${intern.id}`)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 text-left text-navy font-medium"
                            >
                              <Eye size={13} className="text-primary" /> View Details
                            </button>
                            <button
                              onClick={(e) => openEditModal(e, intern)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 text-left text-navy font-medium"
                            >
                              <Edit2 size={13} className="text-muted" /> Edit Details
                            </button>
                            <button
                              onClick={(e) => handleToggleStatus(e, intern)}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 text-left font-medium ${
                                intern.status === 'active' ? 'text-danger hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              {intern.status === 'active' ? (
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

        {/* Pagination */}
        {filtered.length > pageSize && (
          <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between">
            <span className="text-xs text-muted">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
                Prev
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page * pageSize >= filtered.length}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Edit Intern Modal */}
      {editIntern && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-navy text-base">Edit Intern Profile</h3>
                <p className="text-xs text-muted font-mono">{editIntern.intern_id}</p>
              </div>
              <button
                onClick={() => setEditIntern(null)}
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
                  label="Phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                />
                <Select
                  label="Program Track"
                  options={STANDARD_TRACKS.map((t) => ({ value: t, label: t }))}
                  value={editForm.track}
                  onChange={(e) => setEditForm((f) => ({ ...f, track: e.target.value }))}
                />
                <Select
                  label="Status"
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'invited', label: 'Invited' },
                    { value: 'inactive', label: 'Inactive' },
                    { value: 'on_hold', label: 'On Hold' },
                    { value: 'completed', label: 'Completed' },
                  ]}
                  value={editForm.status}
                  onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                />
                <Input
                  label="College / University"
                  value={editForm.college}
                  onChange={(e) => setEditForm((f) => ({ ...f, college: e.target.value }))}
                />
                <Input
                  label="Degree & Branch"
                  value={editForm.degree}
                  onChange={(e) => setEditForm((f) => ({ ...f, degree: e.target.value }))}
                  placeholder="e.g. B.Tech CSE"
                />
                <Input
                  label="Graduation Year"
                  type="number"
                  value={String(editForm.grad_year)}
                  onChange={(e) => setEditForm((f) => ({ ...f, grad_year: Number(e.target.value) }))}
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditIntern(null)}>
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

export default InternsListPage
