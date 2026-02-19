import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { formatDate } from '../lib/constants'
import { WorkflowBadge, LoadingPage, ErrorBox, EmptyState } from './ui'

// ============================================================
// AUDIT TRAIL PAGE
// ============================================================
export function AuditPage() {
  const { profile } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const ppkId = profile?.role === 'PPK' ? profile.ppk_id : null
      const data = await api.getAllWorkflowHistory(ppkId)
      setHistory(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>Audit Trail</h1>
        <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
          Log seluruh perubahan workflow · {history.length} entri
        </p>
      </div>

      {loading ? <LoadingPage text="Memuat audit trail..." /> : error ? <ErrorBox message={error} onRetry={load} /> : (
        <div style={{ background: '#161b2e', border: '1px solid #1e2d44', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['#', 'Waktu', 'NUB', 'Proyek', 'Status Lama', 'Status Baru', 'Diubah Oleh', 'Catatan'].map(h => (
                    <th key={h} style={{ background: '#0f1421', color: '#64748b', fontWeight: 600, padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #1e2d44', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.length === 0
                  ? <tr><td colSpan={8}><EmptyState icon="clock" title="Belum ada audit log" /></td></tr>
                  : history.map(h => (
                    <tr key={h.id} style={{ borderBottom: '1px solid #1a2033' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#13192b'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '10px 14px', fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#334155' }}>#{h.id}</td>
                      <td style={{ padding: '10px 14px', fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#64748b', whiteSpace: 'nowrap' }}>{formatDate(h.changed_at)}</td>
                      <td style={{ padding: '10px 14px', fontFamily: "'DM Mono', monospace", color: '#93c5fd', fontWeight: 600 }}>{h.bidang?.nub || '—'}</td>
                      <td style={{ padding: '10px 14px', color: '#94a3b8', fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.bidang?.project?.nama_proyek}</td>
                      <td style={{ padding: '10px 14px' }}>{h.status_lama ? <WorkflowBadge status={h.status_lama} /> : <span style={{ color: '#334155', fontSize: 11 }}>—</span>}</td>
                      <td style={{ padding: '10px 14px' }}><WorkflowBadge status={h.status_baru} /></td>
                      <td style={{ padding: '10px 14px', color: '#e2e8f0', fontSize: 12 }}>{h.users?.nama || '—'}</td>
                      <td style={{ padding: '10px 14px', color: '#64748b', fontSize: 12 }}>{h.catatan || '—'}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// PPK PAGE (Ketua PPK only)
// ============================================================
export function PpkPage() {
  const [ppkList, setPpkList] = useState([])
  const [userList, setUserList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([api.getPpkList(), api.getUserList()])
      .then(([ppk, users]) => { setPpkList(ppk); setUserList(users) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingPage text="Memuat data PPK..." />
  if (error) return <ErrorBox message={error} />

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>Manajemen PPK</h1>
        <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>{ppkList.length} PPK terdaftar</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {ppkList.map(ppk => {
          const users = userList.filter(u => u.ppk_id === ppk.id)
          return (
            <div key={ppk.id} style={{ background: '#161b2e', border: '1px solid #1e2d44', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" fill="none" stroke="#60a5fa" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>{ppk.nama_ppk}</div>
                  <div style={{ fontSize: 12, color: '#475569' }}>{ppk.wilayah_kerja}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[['Pengguna', users.length]].map(([l, v]) => (
                  <div key={l} style={{ background: '#0f1421', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>{v}</div>
                    <div style={{ fontSize: 11, color: '#475569' }}>{l}</div>
                  </div>
                ))}
                <div style={{ background: '#0f1421', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>{ppk.created_at?.slice(0, 4)}</div>
                  <div style={{ fontSize: 11, color: '#475569' }}>Tahun Berdiri</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Pengguna PPK</div>
                {users.length === 0
                  ? <div style={{ fontSize: 12, color: '#334155', fontStyle: 'italic' }}>Belum ada pengguna terdaftar</div>
                  : users.map(u => (
                    <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1e2d44', fontSize: 12 }}>
                      <span style={{ color: '#e2e8f0' }}>{u.nama}</span>
                      <span style={{ color: '#64748b' }}>{u.email}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================
// MASTER DATA PAGE (Ketua PPK only)
// ============================================================
export function MasterPage() {
  const [tab, setTab] = useState('status')
  const [statusList, setStatusList] = useState([])
  const [provinsiList, setProvinsiList] = useState([])
  const [desaAktif, setDesaAktif] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getStatusTanah(), api.getProvinsi(), api.getAllDesaAktif()])
      .then(([st, prov, da]) => { setStatusList(st); setProvinsiList(prov); setDesaAktif(da) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingPage text="Memuat master data..." />

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>Master Data</h1>
        <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Data master nasional — read-only untuk PPK</p>
      </div>

      <div style={{ display: 'flex', gap: 2, marginBottom: 20, background: '#0f1421', border: '1px solid #1e2d44', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {[['status','Status Tanah'],['wilayah','Wilayah'],['desa_aktif','Desa Aktif PPK']].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: tab === t ? '#1e2d44' : 'transparent', color: tab === t ? '#e2e8f0' : '#64748b', border: 'none', cursor: 'pointer' }}>{l}</button>
        ))}
      </div>

      {tab === 'status' && (
        <div style={{ background: '#161b2e', border: '1px solid #1e2d44', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr>{['Kode','Nama Status','Keterangan'].map(h => <th key={h} style={{ background: '#0f1421', color: '#64748b', fontWeight: 600, padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #1e2d44' }}>{h}</th>)}</tr></thead>
            <tbody>
              {statusList.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #1a2033' }}>
                  <td style={{ padding: '10px 14px' }}><span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: '#f59e0b', background: '#451a0020', padding: '2px 10px', borderRadius: 6 }}>{s.kode}</span></td>
                  <td style={{ padding: '10px 14px', color: '#e2e8f0' }}>{s.nama_status}</td>
                  <td style={{ padding: '10px 14px', color: '#475569', fontSize: 12 }}>Master nasional — tidak dapat diubah PPK</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'wilayah' && (
        <div style={{ background: '#161b2e', border: '1px solid #1e2d44', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr><th style={{ background: '#0f1421', color: '#64748b', fontWeight: 600, padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #1e2d44' }}>Provinsi</th></tr></thead>
            <tbody>
              {provinsiList.map(p => <tr key={p.id} style={{ borderBottom: '1px solid #1a2033' }}><td style={{ padding: '10px 14px', color: '#e2e8f0' }}>{p.nama}</td></tr>)}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'desa_aktif' && (
        <div style={{ background: '#161b2e', border: '1px solid #1e2d44', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr>{['PPK','Desa','Kecamatan'].map(h => <th key={h} style={{ background: '#0f1421', color: '#64748b', fontWeight: 600, padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #1e2d44' }}>{h}</th>)}</tr></thead>
            <tbody>
              {desaAktif.map(da => (
                <tr key={da.id} style={{ borderBottom: '1px solid #1a2033' }}>
                  <td style={{ padding: '10px 14px', color: '#60a5fa' }}>{da.ppk?.nama_ppk}</td>
                  <td style={{ padding: '10px 14px', color: '#e2e8f0' }}>{da.master_desa?.nama}</td>
                  <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{da.master_desa?.master_kecamatan?.nama}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
