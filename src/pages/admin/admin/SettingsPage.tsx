import React, { useState, useEffect } from 'react'
import { Building2, Rocket, BarChart3, Bell, Plug, CheckCircle2, AlertTriangle } from 'lucide-react'
import AdminLayout from '../../../components/layout/AdminLayout'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { LAUNCHPAD_STAGES, L1_L2_L3_BANDS_PROPOSED, KPI_WEIGHTS } from '../../../lib/constants'

type SettingsTab = 'organization' | 'program' | 'score_bands' | 'notifications' | 'integrations'

const TABS: { key: SettingsTab; label: string; icon: React.ElementType }[] = [
  { key: 'organization', label: 'Organization', icon: Building2 },
  { key: 'program', label: 'Program', icon: Rocket },
  { key: 'score_bands', label: 'Score Bands', icon: BarChart3 },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'integrations', label: 'Integrations', icon: Plug },
]

const SettingsPage: React.FC = () => {
  const [tab, setTab] = useState<SettingsTab>('organization')
  const [orgName, setOrgName] = useState('SmartBridge Educational Services')
  const [contactEmail, setContactEmail] = useState('launchpad@smartbridge.in')
  const [toast, setToast] = useState<string | null>(null)
  const [notifPrefs, setNotifPrefs] = useState({
    newIntern: true,
    evalComplete: true,
    certUploaded: true,
    monthlyReportDue: true,
    stageProgression: true,
  })

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  return (
    <AdminLayout title="System Settings" subtitle="Configure InternFlow & LaunchPad preferences">
      {toast && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white bg-green-600">
          {toast}
        </div>
      )}

      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-navy'
              }`}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'organization' && (
        <Card className="max-w-2xl">
          <h3 className="font-semibold text-navy mb-4">Organization Profile</h3>
          <div className="space-y-4">
            <Input label="Organization Name" value={orgName} onChange={e => setOrgName(e.target.value)} />
            <Input label="Program Contact Email" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
            <div className="pt-2">
              <Button onClick={() => setToast('Organization settings saved!')}>Save Changes</Button>
            </div>
          </div>
        </Card>
      )}

      {tab === 'program' && (
        <Card className="max-w-3xl">
          <h3 className="font-semibold text-navy mb-2">LaunchPad 24-Week Program Structure</h3>
          <p className="text-xs text-muted mb-4">
            Official KPI Weights: Learn ({KPI_WEIGHTS.LEARN * 100}%), Build ({KPI_WEIGHTS.BUILD * 100}%), Share ({KPI_WEIGHTS.SHARE * 100}%), Showcase ({KPI_WEIGHTS.SHOWCASE * 100}%).
          </p>
          <div className="space-y-2.5">
            {LAUNCHPAD_STAGES.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-surface rounded-lg border border-gray-100">
                <div>
                  <p className="text-sm font-medium text-navy">{s.name}</p>
                  <p className="text-xs text-muted">Weeks {s.weeks}</p>
                </div>
                <Badge variant="primary">Stage {s.id}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'score_bands' && (
        <Card className="max-w-3xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-navy">KPI Score Bands</h3>
            <Badge variant="warning">Proposed – Not Officially Approved</Badge>
          </div>
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
            <AlertTriangle size={14} />
            <span>These score bands are proposed defaults for monitoring and are configurable pending official approval.</span>
          </div>
          <div className="space-y-2.5">
            {Object.entries(L1_L2_L3_BANDS_PROPOSED).map(([key, band]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-surface rounded-lg border border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-navy">{band.label}</p>
                  <p className="text-xs text-muted">Score range: {band.min}% – {band.max}%</p>
                </div>
                <Badge variant={band.approved ? 'success' : 'warning'}>{band.approved ? 'Approved' : 'Proposed'}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'notifications' && (
        <Card className="max-w-2xl">
          <h3 className="font-semibold text-navy mb-4">Email & System Notification Preferences</h3>
          <div className="space-y-3">
            {[
              { key: 'newIntern', label: 'New Intern Registration & Activation' },
              { key: 'evalComplete', label: 'Stage Evaluation Submitted by Mentor' },
              { key: 'certUploaded', label: 'Certification Uploaded for Verification' },
              { key: 'monthlyReportDue', label: 'Monthly KPI Report Reminders' },
              { key: 'stageProgression', label: 'Stage Progression Decisions' },
            ].map(item => (
              <label key={item.key} className="flex items-center justify-between p-3 bg-surface rounded-lg cursor-pointer">
                <span className="text-sm text-navy">{item.label}</span>
                <input
                  type="checkbox"
                  checked={notifPrefs[item.key as keyof typeof notifPrefs]}
                  onChange={e => setNotifPrefs(p => ({ ...p, [item.key]: e.target.checked }))}
                  className="h-4 w-4 text-primary rounded"
                />
              </label>
            ))}
            <div className="pt-2">
              <Button onClick={() => setToast('Notification preferences updated!')}>Save Preferences</Button>
            </div>
          </div>
        </Card>
      )}

      {tab === 'integrations' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
          {[
            { name: 'Supabase (Auth, DB & Storage)', status: 'Connected', ok: true, desc: 'Shared PostgreSQL database with Row Level Security.' },
            { name: 'EmailJS', status: 'Configurable', ok: false, desc: 'Configured via environment variables for invitation emails.' },
            { name: 'Gemini AI', status: 'Configurable', ok: false, desc: 'AI-assisted insights and report summaries where enabled.' },
          ].map(intg => (
            <Card key={intg.name}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-navy text-sm">{intg.name}</h4>
                <Badge variant={intg.ok ? 'success' : 'muted'}>
                  {intg.ok && <CheckCircle2 size={11} className="mr-1" />}
                  {intg.status}
                </Badge>
              </div>
              <p className="text-xs text-muted">{intg.desc}</p>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}

export default SettingsPage
