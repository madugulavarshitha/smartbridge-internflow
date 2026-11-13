import React, { useState, useMemo } from 'react'
import {
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { accountService, type CertificationRecord } from '../../lib/accountService'
import InternLayout from '../../components/layout/InternLayout'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'

const InternCertificationsPage: React.FC = () => {
  const { user, profile } = useAuth()
  const [certs, setCerts] = useState<CertificationRecord[]>(() => accountService.getCertifications())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [toast, setToast] = useState('')

  // Form
  const [milestone, setMilestone] = useState<'Week 12' | 'Week 24'>('Week 12')
  const [certName, setCertName] = useState('')
  const [certIssuer, setCertIssuer] = useState('')
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10))
  const [credentialUrl, setCredentialUrl] = useState('')
  const [formError, setFormError] = useState('')

  // Intern record
  const internRecord = useMemo(() => {
    if (!profile) return null
    return (
      accountService.getInterns().find(
        (i) =>
          i.profile_id === profile.id ||
          i.profile?.email.toLowerCase() === profile.email.toLowerCase() ||
          i.id === user?.id
      ) ?? null
    )
  }, [profile, user])

  // Get certifications for this intern
  const myCerts = useMemo(() => {
    if (!profile) return []
    const internId = internRecord?.id ?? ''
    const email = profile.email.toLowerCase()

    return certs.filter(
      (c) => c.intern_id === internId || c.intern_email.toLowerCase() === email
    )
  }, [certs, profile, internRecord])

  const handleSubmitCert = (e: React.FormEvent) => {
    e.preventDefault()
    if (!certName.trim() || !certIssuer.trim() || !credentialUrl.trim()) {
      setFormError('Please fill in all required fields.')
      return
    }

    try {
      accountService.submitCertification({
        intern_id: internRecord?.id ?? 'int-1',
        intern_name: profile?.full_name ?? 'Intern',
        intern_email: profile?.email ?? '',
        track: internRecord?.track ?? 'Technology Track',
        milestone,
        cert_name: certName.trim(),
        cert_issuer: certIssuer.trim(),
        issue_date: issueDate,
        credential_url: credentialUrl.trim(),
      })

      setCerts(accountService.getCertifications())
      setIsModalOpen(false)
      setToast('Certification submitted for mentor verification!')
      setTimeout(() => setToast(''), 4500)

      setCertName('')
      setCertIssuer('')
      setCredentialUrl('')
      setFormError('')
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Submission failed')
    }
  }

  return (
    <InternLayout
      title="Milestone Certifications"
      subtitle="Industry credentials required at Week 12 (Foundational) and Week 24 (Advanced Specialization)"
    >
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-navy text-white text-sm px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Banner with Add Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-navy">LaunchPad Exit-Gate Certifications</h2>
            <p className="text-xs text-muted">
              Official industry certifications from AWS, Microsoft, Salesforce, ServiceNow, or Google Cloud.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={15} />}
            onClick={() => setIsModalOpen(true)}
          >
            Submit Milestone Certificate
          </Button>
        </div>

        {/* Milestone Requirements Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Badge variant="primary" size="sm">Milestone 1</Badge>
                <span className="text-xs font-bold text-muted">Week 12 Gate</span>
              </div>
              <h3 className="font-bold text-navy text-sm">Foundational Industry Certification</h3>
              <p className="text-xs text-muted leading-relaxed">
                Required for completion of Stage 2 (Practitioner). Proves foundational cloud/platform knowledge.
              </p>
              <div className="p-2.5 bg-blue-50/60 border border-blue-100 rounded-lg text-xs text-navy font-semibold">
                Examples: AWS Certified Cloud Practitioner, Salesforce Certified Administrator, Azure Fundamentals (AZ-900).
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Badge variant="success" size="sm">Milestone 2</Badge>
                <span className="text-xs font-bold text-muted">Week 24 Gate</span>
              </div>
              <h3 className="font-bold text-navy text-sm">Advanced Role Specialization</h3>
              <p className="text-xs text-muted leading-relaxed">
                Required for graduation and Stage 4 exit gate. Demonstrates developer-level production capability.
              </p>
              <div className="p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-lg text-xs text-navy font-semibold">
                Examples: AWS Certified Solutions Architect Associate, Salesforce Platform Developer I, ServiceNow CAD.
              </div>
            </div>
          </Card>
        </div>

        {/* Submitted Certifications Table */}
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-bold text-muted uppercase tracking-wider">
                  <th className="px-5 py-3.5">Milestone</th>
                  <th className="px-4 py-3.5">Certification Name</th>
                  <th className="px-4 py-3.5">Issuer</th>
                  <th className="px-4 py-3.5">Issue Date</th>
                  <th className="px-4 py-3.5">Verification Status</th>
                  <th className="px-4 py-3.5">Verified By / Remarks</th>
                  <th className="px-5 py-3.5 text-right">Evidence Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {myCerts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-muted">
                      <div className="flex flex-col items-center justify-center">
                        <Award className="w-10 h-10 text-gray-300 mb-2" />
                        <p className="font-semibold text-navy">No certificates submitted yet</p>
                        <p className="text-xs text-muted mt-1">
                          Click &quot;Submit Milestone Certificate&quot; above to submit your credentials.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  myCerts.map((c) => (
                    <tr key={c.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-5 py-4">
                        <Badge variant="primary" size="sm">{c.milestone}</Badge>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-navy">{c.cert_name}</p>
                        <p className="text-[11px] text-muted">{c.track}</p>
                      </td>
                      <td className="px-4 py-4 text-xs text-navy font-medium">{c.cert_issuer}</td>
                      <td className="px-4 py-4 text-xs text-muted">{c.issue_date}</td>
                      <td className="px-4 py-4">
                        {c.status === 'verified' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={12} /> Verified
                          </span>
                        )}
                        {c.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock size={12} /> Pending Review
                          </span>
                        )}
                        {c.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertCircle size={12} /> Needs Re-submission
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-xs">
                        {c.verified_by ? (
                          <div>
                            <p className="text-navy font-medium">{c.verified_by}</p>
                            {c.remarks && <p className="text-[11px] text-muted">{c.remarks}</p>}
                          </div>
                        ) : (
                          <span className="text-muted text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <a
                          href={c.credential_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                        >
                          <ExternalLink size={12} />
                          View Certificate
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Submit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Submit Milestone Certification Proof"
          size="md"
        >
          <form onSubmit={handleSubmitCert} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Program Milestone *</label>
              <select
                value={milestone}
                onChange={(e) => setMilestone(e.target.value as 'Week 12' | 'Week 24')}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              >
                <option value="Week 12">Week 12 (Foundational Certification)</option>
                <option value="Week 24">Week 24 (Advanced Role Specialization)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy mb-1">Certification Title *</label>
              <input
                type="text"
                placeholder="e.g. AWS Certified Cloud Practitioner (CLF-C02)"
                value={certName}
                onChange={(e) => setCertName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-navy mb-1">Issuing Authority *</label>
                <input
                  type="text"
                  placeholder="e.g. Amazon Web Services, Salesforce"
                  value={certIssuer}
                  onChange={(e) => setCertIssuer(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">Issue Date *</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy mb-1">Credential Verification URL *</label>
              <input
                type="url"
                placeholder="https://www.credly.com/badges/... or official verification URL"
                value={credentialUrl}
                onChange={(e) => setCredentialUrl(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-navy focus:border-primary focus:outline-hidden"
              />
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" icon={<Award size={14} />}>
                Submit For Verification
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </InternLayout>
  )
}

export default InternCertificationsPage
