import React, { useState, useEffect, useCallback } from 'react'
import { BarChart3, Search, Award, TrendingUp, BookOpen, Hammer, Share2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import AdminLayout from '../../../components/layout/AdminLayout'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import StatCard from '../../../components/ui/StatCard'
import EmptyState from '../../../components/ui/EmptyState'
import { supabase } from '../../../lib/supabase'
import { KPI_WEIGHTS, LAUNCHPAD_STAGES, getScoreBand, calculateKPIScore } from '../../../lib/constants'

interface InternKPIRow {
  id: string
  intern_id: string
  intern_name: string
  batch_name: string
  stage: number
  report_month: string
  learn_score: number
  build_score: number
  share_score: number
  showcase_score: number
  overall_kpi: number
}

const STANDARD_TRACKS = [
  'AI & Cloud',
  'Salesforce',
  'Software Engineering',
  'IoT & Robotics',
  'ServiceNow',
  'Business Intelligence',
]

const MOCK_KPI_ROWS: InternKPIRow[] = [
  { id: '1', intern_id: 'INT-001', intern_name: 'Rahul Sharma', batch_name: 'AI & Cloud', stage: 2, report_month: '2026-05', learn_score: 88, build_score: 90, share_score: 82, showcase_score: 86, overall_kpi: calculateKPIScore(88, 90, 82, 86) },
  { id: '2', intern_id: 'INT-002', intern_name: 'Priya Patel', batch_name: 'Salesforce', stage: 2, report_month: '2026-05', learn_score: 82, build_score: 84, share_score: 76, showcase_score: 80, overall_kpi: calculateKPIScore(82, 84, 76, 80) },
  { id: '3', intern_id: 'INT-003', intern_name: 'Amit Kumar', batch_name: 'Software Engineering', stage: 3, report_month: '2026-05', learn_score: 91, build_score: 93, share_score: 85, showcase_score: 89, overall_kpi: calculateKPIScore(91, 93, 85, 89) },
  { id: '4', intern_id: 'INT-004', intern_name: 'Sneha Reddy', batch_name: 'IoT & Robotics', stage: 1, report_month: '2026-05', learn_score: 74, build_score: 76, share_score: 70, showcase_score: 72, overall_kpi: calculateKPIScore(74, 76, 70, 72) },
  { id: '5', intern_id: 'INT-005', intern_name: 'Vikram Singh', batch_name: 'ServiceNow', stage: 3, report_month: '2026-05', learn_score: 68, build_score: 65, share_score: 62, showcase_score: 64, overall_kpi: calculateKPIScore(68, 65, 62, 64) },
  { id: '6', intern_id: 'INT-006', intern_name: 'Neha Gupta', batch_name: 'Business Intelligence', stage: 1, report_month: '2026-05', learn_score: 79, build_score: 81, share_score: 74, showcase_score: 77, overall_kpi: calculateKPIScore(79, 81, 74, 77) },
  { id: '7', intern_id: 'INT-007', intern_name: 'Ravi Shankar', batch_name: 'AI & Cloud', stage: 2, report_month: '2026-05', learn_score: 55, build_score: 52, share_score: 58, showcase_score: 54, overall_kpi: calculateKPIScore(55, 52, 58, 54) },
  { id: '8', intern_id: 'INT-008', intern_name: 'Kavya Menon', batch_name: 'Salesforce', stage: 1, report_month: '2026-05', learn_score: 64, build_score: 62, share_score: 60, showcase_score: 63, overall_kpi: calculateKPIScore(64, 62, 60, 63) },
]

const bandVariant = (band: string) => {
  if (band === 'L3') return 'success'
  if (band === 'L2') return 'primary'
  if (band === 'L1') return 'warning'
  return 'danger'
}

const KPIMonitoringPage: React.FC = () => {
  const [rows, setRows] = useState<InternKPIRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [batchFilter, setBatchFilter] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [bandFilter, setBandFilter] = useState('')

  const fetchKPIs = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('monthly_reports')
        .select('*, intern:interns(intern_id, current_stage, batch:batches(name), profile:profiles(full_name))')
        .not('overall_kpi', 'is', null)
        .order('report_month', { ascending: false })

      if (error || !data || data.length === 0) {
        setRows(MOCK_KPI_ROWS)
      } else {
        const mapped: InternKPIRow[] = data.map((r: Record<string, unknown>) => {
          const intern = r.intern as { intern_id?: string; current_stage?: number; batch?: { name?: string }; profile?: { full_name?: string } } | null
          return {
            id: String(r.id),
            intern_id: intern?.intern_id ?? '—',
            intern_name: intern?.profile?.full_name ?? 'Unknown',
            batch_name: intern?.batch?.name ?? 'Unassigned',
            stage: intern?.current_stage ?? 0,
            report_month: String(r.report_month ?? ''),
            learn_score: Number(r.learn_score ?? 0),
            build_score: Number(r.build_score ?? 0),
            share_score: Number(r.share_score ?? 0),
            showcase_score: Number(r.showcase_score ?? 0),
            overall_kpi: Number(r.overall_kpi ?? 0),
          }
        })
        setRows(mapped)
      }
    } catch {
      setRows(MOCK_KPI_ROWS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchKPIs() }, [fetchKPIs])

  const batches = STANDARD_TRACKS

  const filtered = rows.filter(r => {
    const matchSearch = !search ||
      r.intern_name.toLowerCase().includes(search.toLowerCase()) ||
      r.intern_id.toLowerCase().includes(search.toLowerCase())
    const matchBatch = !batchFilter || r.batch_name === batchFilter
    const matchStage = !stageFilter || String(r.stage) === stageFilter
    const matchBand = !bandFilter || getScoreBand(r.overall_kpi) === bandFilter
    return matchSearch && matchBatch && matchStage && matchBand
  })

  const avg = (key: keyof InternKPIRow) =>
    filtered.length ? Math.round(filtered.reduce((acc, r) => acc + Number(r[key]), 0) / filtered.length) : 0

  const bandCounts = [
    { name: 'L3 (85+)', count: filtered.filter(r => getScoreBand(r.overall_kpi) === 'L3').length, color: '#16A34A' },
    { name: 'L2 (70–84)', count: filtered.filter(r => getScoreBand(r.overall_kpi) === 'L2').length, color: '#2563EB' },
    { name: 'L1 (60–69)', count: filtered.filter(r => getScoreBand(r.overall_kpi) === 'L1').length, color: '#F59E0B' },
    { name: 'Dev Required', count: filtered.filter(r => getScoreBand(r.overall_kpi) === 'Development Required').length, color: '#DC2626' },
  ]

  return (
    <AdminLayout title="KPI Monitoring" subtitle="Learn · Build · Share · Showcase performance tracking">
      <div className="mb-4 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center justify-between flex-wrap gap-2">
        <span>
          <strong>Official KPI Weights:</strong> Learn {KPI_WEIGHTS.LEARN * 100}% · Build {KPI_WEIGHTS.BUILD * 100}% · Share {KPI_WEIGHTS.SHARE * 100}% · Showcase {KPI_WEIGHTS.SHOWCASE * 100}%
        </span>
        <span className="font-medium">Note: L1 / L2 / L3 score bands are proposed and configurable, not yet officially approved.</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard title="Avg Learn (25%)" value={`${avg('learn_score')}%`} icon={BookOpen} iconColor="text-primary" iconBg="bg-blue-50" loading={loading} />
        <StatCard title="Avg Build (45%)" value={`${avg('build_score')}%`} icon={Hammer} iconColor="text-success" iconBg="bg-green-50" loading={loading} />
        <StatCard title="Avg Share (15%)" value={`${avg('share_score')}%`} icon={Share2} iconColor="text-warning" iconBg="bg-amber-50" loading={loading} />
        <StatCard title="Avg Showcase (15%)" value={`${avg('showcase_score')}%`} icon={Award} iconColor="text-navy" iconBg="bg-indigo-50" loading={loading} />
        <StatCard title="Overall KPI Avg" value={`${avg('overall_kpi')}%`} icon={TrendingUp} iconColor="text-primary" iconBg="bg-blue-50" loading={loading} />
      </div>

      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-navy">KPI Band Distribution (Proposed)</h3>
          <Badge variant="warning">Proposed Bands</Badge>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={bandCounts} margin={{ left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748B' }} />
            <Tooltip formatter={(val) => [val, 'Interns']} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {bandCounts.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card padding="none">
        <div className="flex flex-wrap items-center gap-3 p-5 border-b border-gray-100">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search intern name or ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 w-60"
            />
          </div>
          <select value={batchFilter} onChange={e => setBatchFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Tracks</option>
            {batches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Stages</option>
            {LAUNCHPAD_STAGES.map(s => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
          </select>
          <select value={bandFilter} onChange={e => setBandFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Bands (Proposed)</option>
            <option value="L3">L3 (85+)</option>
            <option value="L2">L2 (70–84)</option>
            <option value="L1">L1 (60–69)</option>
            <option value="Development Required">Development Required</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Intern', 'Batch', 'Stage', 'Learn', 'Build', 'Share', 'Showcase', 'Overall KPI', 'Band (Proposed)'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <EmptyState icon={BarChart3} title="No KPI records found" description="Adjust your filters to see intern KPI scores." />
                  </td>
                </tr>
              ) : (
                filtered.map(r => {
                  const band = getScoreBand(r.overall_kpi)
                  return (
                    <tr key={r.id} className="bg-white hover:bg-surface transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-medium text-navy">{r.intern_name}</p>
                        <p className="text-xs text-muted font-mono">{r.intern_id}</p>
                      </td>
                      <td className="px-5 py-4 text-muted">{r.batch_name}</td>
                      <td className="px-5 py-4"><Badge variant="muted">Stage {r.stage}</Badge></td>
                      <td className="px-5 py-4">{r.learn_score}%</td>
                      <td className="px-5 py-4">{r.build_score}%</td>
                      <td className="px-5 py-4">{r.share_score}%</td>
                      <td className="px-5 py-4">{r.showcase_score}%</td>
                      <td className="px-5 py-4 font-bold text-navy">{r.overall_kpi}%</td>
                      <td className="px-5 py-4"><Badge variant={bandVariant(band)}>{band}</Badge></td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminLayout>
  )
}

export default KPIMonitoringPage
