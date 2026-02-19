import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { WORKFLOW_STEPS, WORKFLOW_LABELS, WORKFLOW_COLORS, formatLuas } from '../lib/constants'
import { Icon, WorkflowBadge, LoadingPage, ErrorBox, ProgressBar } from './ui'

export default function Dashboard({ setPage, setSelectedProject }) {
  const { profile } = useAuth()
  const [stats, setStats] = useState(null)
  const [projects, setProjects] = useState([])
  const [recentBidang, setRecentBidang] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const ppkId = profile?.role === 'PPK' ? profile.ppk_id : null

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const [s, p, b] = await Promise.all([
        api.getDashboardStats(ppkId),
        api.getProjects(ppkId),
        api.getBidangList({ workflowStatus: null }),
      ])
      setStats(s)
      setProjects(p)
      // Bidang macet = DIBATALKAN atau NOMINATIF
      setRecentBidang(b.filter(bd => ['DIBATALKAN', 'NOMINATIF'].includes(bd.workflow_status)).slice(0, 8))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return <LoadingPage text="Memuat dashboard..." />
  if (error) return <ErrorBox message={error} onRetry={load} />

  const maxCount = Math.max(...WORKFLOW_STEPS.map(s => stats?.statusCounts?.[s] || 0), 1)

  const topStats = [
    { label: 'Total Bidang', value: stats?.totalBidang || 0, icon: 'map', color: '#3b82f6' },
    { label: 'Total Proyek', value: stats?.totalProjects || 0, icon: 'folder', color: '#8b5cf6' },
    { label: 'Total Luas Terkena', value: formatLuas(stats?.totalLuas), icon: 'trending', color: '#10b981', small: true },
    ...(profile?.role === 'KETUA_PPK' ? [{ label: 'Total PPK', value: 'Live', icon: 'users', color: '#f59e0b' }] : []),
    { label: 'Sudah Bayar', value: stats?.statusCounts?.SUDAH_BAYAR || 0, icon: 'check', color: '#10b981' },
    { label: 'Dibatalkan', value: stats?.statusCounts?.DIBATALKAN || 0, icon: 'alert', color: '#ef4444' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>Dashboard</h1>
        <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
          {profile?.role === 'KETUA_PPK'
            ? 'Ringkasan seluruh sistem pembebasan tanah'
            : `Ringkasan proyek — ${profile?.ppk?.nama_ppk}`}
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
        {topStats.map((s, i) => (
          <div key={i} style={{ background: '#161b2e', border: '1px solid #1e2d44', borderRadius: 12, padding: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: s.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Icon name={s.icon} size={18} color={s.color} />
            </div>
            <div style={{ fontSize: s.small ? 16 : 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Workflow Distribution */}
        <div style={{ background: '#161b2e', border: '1px solid #1e2d44', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#475569', marginBottom: 16 }}>Distribusi Status Workflow</div>
          {WORKFLOW_STEPS.map(s => (
            <div key={s} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: WORKFLOW_COLORS[s] }} />
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{WORKFLOW_LABELS[s]}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: WORKFLOW_COLORS[s] }}>{stats?.statusCounts?.[s] || 0}</span>
              </div>
              <ProgressBar pct={((stats?.statusCounts?.[s] || 0) / maxCount) * 100} color={WORKFLOW_COLORS[s] + '90'} />
            </div>
          ))}
        </div>

        {/* Active Projects */}
        <div style={{ background: '#161b2e', border: '1px solid #1e2d44', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#475569', marginBottom: 16 }}>Proyek Aktif</div>
          {projects.filter(p => p.status_proyek === 'AKTIF').slice(0, 5).map(p => {
            const total = p.bidang?.[0]?.count || 0
            const done = stats?.bidang?.filter(b => b.project_id === p.id && b.workflow_status === 'SUDAH_BAYAR').length || 0
            const pct = total > 0 ? Math.round((done / total) * 100) : 0
            return (
              <div key={p.id} style={{ marginBottom: 18, cursor: 'pointer' }} onClick={() => { setSelectedProject(p); setPage('bidang') }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{p.nama_proyek}</div>
                    <div style={{ fontSize: 11, color: '#475569' }}>{total} bidang · {p.ppk?.nama_ppk}</div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>{pct}%</span>
                </div>
                <ProgressBar pct={pct} />
              </div>
            )
          })}
          {projects.filter(p => p.status_proyek === 'AKTIF').length === 0 && (
            <p style={{ fontSize: 13, color: '#475569', textAlign: 'center', paddingTop: 20 }}>Belum ada proyek aktif</p>
          )}
        </div>
      </div>

      {/* Bidang perlu perhatian */}
      <div style={{ background: '#161b2e', border: '1px solid #1e2d44', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e2d44', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#475569' }}>
          Bidang Perlu Perhatian (Macet / Dibatalkan)
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['NUB', 'Proyek', 'Status', 'Desa', 'Dibuat'].map(h => (
                  <th key={h} style={{ background: '#0f1421', color: '#64748b', fontWeight: 600, padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid #1e2d44', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentBidang.length === 0
                ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#475569' }}>Semua bidang berjalan normal</td></tr>
                : recentBidang.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #1a2033' }}>
                    <td style={{ padding: '10px 16px', fontFamily: "'DM Mono', monospace", color: '#93c5fd', fontWeight: 600 }}>{b.nub}</td>
                    <td style={{ padding: '10px 16px', color: '#e2e8f0' }}>{b.project?.nama_proyek}</td>
                    <td style={{ padding: '10px 16px' }}><WorkflowBadge status={b.workflow_status} /></td>
                    <td style={{ padding: '10px 16px', color: '#94a3b8', fontSize: 12 }}>{b.master_desa?.nama}</td>
                    <td style={{ padding: '10px 16px', color: '#475569', fontSize: 12 }}>{b.created_at?.slice(0, 10)}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
