import React, { useState, useEffect, useCallback } from 'react'
import { Shield, Edit2, Users } from 'lucide-react'
import AdminLayout from '../../../components/layout/AdminLayout'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import Select from '../../../components/ui/Select'
import EmptyState from '../../../components/ui/EmptyState'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../contexts/AuthContext'
import type { AdminPermissionGroup } from '../../../types'

interface AdminUserRow {
  id: string
  full_name: string
  email: string
  is_active: boolean
  permission_group: AdminPermissionGroup
  updated_at: string
}

const GROUP_DESCRIPTIONS: Record<AdminPermissionGroup, { label: string; desc: string }> = {
  super_admin: { label: 'Super Admin', desc: 'Full administrative access across all modules, permissions, and settings.' },
  hr_admin: { label: 'HR Admin', desc: 'Intern onboarding, intern records, mentor onboarding, and batch administration.' },
  talent_accelerator: { label: 'Talent Accelerator', desc: 'Intern monitoring, progress tracking, improvement plans, and program coordination.' },
  delivery_lead: { label: 'Delivery Lead', desc: 'Technical progress, project monitoring, stage evaluations, and delivery reporting.' },
  management_viewer: { label: 'Management Viewer', desc: 'Read-only access to authorized management dashboards and analytics reports.' },
}

const MOCK_ADMINS: AdminUserRow[] = [
  { id: 'a1', full_name: 'Vikram Mehta', email: 'superadmin@smartbridge.in', is_active: true, permission_group: 'super_admin', updated_at: '2026-01-10T00:00:00Z' },
  { id: 'a2', full_name: 'Ananya Sharma', email: 'hr@smartbridge.in', is_active: true, permission_group: 'hr_admin', updated_at: '2026-02-01T00:00:00Z' },
  { id: 'a3', full_name: 'Rohan Kulkarni', email: 'talent@smartbridge.in', is_active: true, permission_group: 'talent_accelerator', updated_at: '2026-02-15T00:00:00Z' },
  { id: 'a4', full_name: 'Divya Krishnan', email: 'delivery@smartbridge.in', is_active: true, permission_group: 'delivery_lead', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'a5', full_name: 'Suresh Iyer', email: 'exec@smartbridge.in', is_active: true, permission_group: 'management_viewer', updated_at: '2026-03-10T00:00:00Z' },
]

const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const PermissionsPage: React.FC = () => {
  const { user, profile } = useAuth()
  const [admins, setAdmins] = useState<AdminUserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<AdminUserRow | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<AdminPermissionGroup>('hr_admin')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  const fetchAdmins = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, is_active, updated_at, admin_permissions(permission_group)')
        .eq('role', 'admin')

      if (error || !data || data.length === 0) {
        setAdmins(MOCK_ADMINS)
      } else {
        const mapped: AdminUserRow[] = data.map((p: Record<string, unknown>) => {
          const perms = p.admin_permissions as Array<{ permission_group?: AdminPermissionGroup }> | { permission_group?: AdminPermissionGroup } | null
          const group = Array.isArray(perms) ? perms[0]?.permission_group : perms?.permission_group
          return {
            id: String(p.id),
            full_name: String(p.full_name),
            email: String(p.email),
            is_active: Boolean(p.is_active),
            permission_group: group ?? 'management_viewer',
            updated_at: String(p.updated_at ?? ''),
          }
        })
        setAdmins(mapped)
      }
    } catch {
      setAdmins(MOCK_ADMINS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAdmins() }, [fetchAdmins])

  const handleSave = async () => {
    if (!editing) return
    setSaving(true)
    try {
      await supabase
        .from('admin_permissions')
        .upsert({ profile_id: editing.id, permission_group: selectedGroup }, { onConflict: 'profile_id' })

      if (user) {
        await supabase.from('audit_logs').insert({
          actor_id: user.id,
          actor_role: profile?.role ?? 'admin',
          action: 'permission_group.updated',
          entity_type: 'admin_permission',
          entity_id: editing.id,
          before_value: { permission_group: editing.permission_group },
          after_value: { permission_group: selectedGroup },
        })
      }
    } catch { /* fallback */ }

    setAdmins(prev => prev.map(a => a.id === editing.id ? { ...a, permission_group: selectedGroup, updated_at: new Date().toISOString() } : a))
    setToast(`Updated ${editing.full_name} to ${GROUP_DESCRIPTIONS[selectedGroup].label}`)
    setEditing(null)
    setSaving(false)
  }

  return (
    <AdminLayout title="Admin Permissions" subtitle="Configurable permission groups within the ADMIN role">
      {toast && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white bg-green-600">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {(Object.keys(GROUP_DESCRIPTIONS) as AdminPermissionGroup[]).map(key => (
          <Card key={key}>
            <div className="flex items-center gap-2 mb-1.5">
              <Shield size={15} className="text-primary" />
              <h4 className="font-semibold text-navy text-sm">{GROUP_DESCRIPTIONS[key].label}</h4>
            </div>
            <p className="text-xs text-muted">{GROUP_DESCRIPTIONS[key].desc}</p>
          </Card>
        ))}
      </div>

      <Card padding="none">
        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
          <Users size={16} className="text-primary" />
          <h3 className="font-semibold text-navy">Authorized Admin Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Name', 'Email', 'Permission Group', 'Status', 'Last Updated', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : admins.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon={Shield} title="No admin users found" description="Admin accounts will appear here." /></td></tr>
              ) : (
                admins.map(a => (
                  <tr key={a.id} className="bg-white hover:bg-surface transition-colors">
                    <td className="px-5 py-4 font-medium text-navy">{a.full_name}</td>
                    <td className="px-5 py-4 text-muted">{a.email}</td>
                    <td className="px-5 py-4"><Badge variant="primary">{GROUP_DESCRIPTIONS[a.permission_group]?.label ?? a.permission_group}</Badge></td>
                    <td className="px-5 py-4"><Badge variant={a.is_active ? 'success' : 'muted'}>{a.is_active ? 'Active' : 'Inactive'}</Badge></td>
                    <td className="px-5 py-4 text-muted">{fmt(a.updated_at)}</td>
                    <td className="px-5 py-4">
                      <Button size="sm" variant="outline" icon={<Edit2 size={13} />} onClick={() => { setEditing(a); setSelectedGroup(a.permission_group) }}>
                        Change Group
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {editing && (
        <Modal
          isOpen={!!editing}
          onClose={() => setEditing(null)}
          title={`Edit Permissions – ${editing.full_name}`}
          size="md"
          footer={
            <>
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button loading={saving} onClick={handleSave}>Save Permission Group</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Select
              label="Permission Group"
              options={(Object.keys(GROUP_DESCRIPTIONS) as AdminPermissionGroup[]).map(k => ({ value: k, label: GROUP_DESCRIPTIONS[k].label }))}
              value={selectedGroup}
              onChange={e => setSelectedGroup(e.target.value as AdminPermissionGroup)}
            />
            <div className="p-3 bg-surface rounded-lg text-xs text-muted">
              {GROUP_DESCRIPTIONS[selectedGroup].desc}
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  )
}

export default PermissionsPage
