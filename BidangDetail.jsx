import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { WORKFLOW_STEPS, WORKFLOW_LABELS, formatLuas } from '../lib/constants'
import { Icon, WorkflowBadge, LoadingPage, ErrorBox, EmptyState } from './ui'

export default function BidangPage({ selectedProject, setSelectedBidang, setPage, showToast }) {
  const { profile } = useAuth()
  const [bidangList, setBidangList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState({ status: '', search: '' })
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  // Master data for form
  const [projects, setProjects] = useState([])
  const [provinsiList, setProvinsiList] = useState([])
  const [kabupatenList, setKabupatenList] = useState([])
  const [kecamatanList, setKecamatanList] = useState([])
  const [desaList, setDesaList] = useState([])
  const [statusTanahList, setStatusTanahList] = useState([])

  const [form, setForm] = useState({
    project_id: selectedProject?.id || '',
    nub: '', nib: '', status_tanah_id: '',
    pembebanan: '', rencana_pembangunan: '', keterangan: '',
    provinsi_id: '', kabupaten_id: '', kecamatan_id: '', desa_id: '',
  })

  const ppkId = profile?.role === 'PPK' ? profile.ppk_id : null

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getBidangList({
        projectId: selectedProject?.id || null,
        workflowStatus: filter.status || null,
        search: filter.search || null,
      })
      setBidangList(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Load master data for form
  useEffect(() => {
    api.getProjects(ppkId).then(setProjects)
    api.getStatusTanah().then(setStatusTanahList)
    api.getProvinsi().then(setProvinsiList)
  }, [])

  useEffect(() => { load() }, [selectedProject, filter.status])

  // Cascade selects
  useEffect(() => {
    if (form.provinsi_id) api.getKabupaten(form.provinsi_id).then(setKabupatenList)
    else setKabupatenList([])
  }, [form.provinsi_id])

  useEffect(() => {
    if (form.kabupaten_id) api.getKecamatan(form.kabupaten_id).then(setKecamatanList)
    else setKecamatanList([])
  }, [form.kabupaten_id])

  useEffect(() => {
    if (form.kecamatan_id) {
      if (profile?.role === 'PPK') {
        api.getDesaAktifPpk(ppkId).then(desas => {
          setDesaList(desas.filter(d => d.kecamatan_id === parseInt(form.kecamatan_id)))
        })
      } else {
        api.getDesa(form.kecamatan_id).then(setDesaList)
      }
    } else setDesaList([])
  }, [form.kecamatan_id])

  const handleSearch = (e) => {
    if (e.key === 'Enter') load()
  }

  const handleCreate = async () => {
    if (!form.nub.trim() || !form.project_id) return showToast('NUB dan Proyek wajib diisi', 'error')
    try {
      setSaving(true)
      await api.createBidang(
        {
          ...form,
          project_id: parseInt(form.project_id),
          status_tanah_id: parseInt(form.status_tanah_id) || null,
          provinsi_id: parseInt(form.provinsi_id) || null,
          kabupaten_id: parseInt(form.kabupaten_id) || null,
          kecamatan_id: parseInt(form.kecamatan_id) || null,
          desa_id: parseInt(form.desa_id) || null,
        },
        profile.id
      )
      showToast('Bidang berhasil ditambahkan')
      setShowForm(false)
      setForm({ project_id: selectedProject?.id || '', nub: '', nib: '', status_tanah_id: '', pembebanan: '', rencana_pembangunan: '', keterangan: '', provinsi_id: '', kabupaten_id: '', kecamatan_id: '', desa_id: '' })
      load()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = { background: '#0f1421', border: '1px solid #2d3748', color: '#e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 13, width: '100%', fontFamily: 'inherit' }
  const labelStyle = { fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span onClick={() => setPage('projects')} style={{ fontSize: 12, color: '#64748b', cursor: 'pointer' }}>← Proyek</span>
            {selectedProject && <><span style={{ color: '#475569' }}>/</span><span style={{ fontSize: 13, color: '#93c5fd' }}>{selectedProject.nama_proyek}</span></>}
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>Data Bidang</h1>
        </div>
        {profile?.role === 'PPK' && (
          <button onClick={() => setShowForm(!showForm)} style={{ padding: '8px 16px', borderRadius: 8, background: '#1d4ed8', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="plus" size={14} color="#fff" /> Tambah Bidang
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          placeholder="Cari NUB / NIB... (tekan Enter)" value={filter.search}
          onChange={e => setFilter({ ...filter, search: e.target.value })}
          onKeyDown={handleSearch}
          style={{ ...inputStyle, width: 260 }}
        />
        <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })} style={{ ...inputStyle, width: 180 }}>
          <option value="">Semua Status</option>
          {WORKFLOW_STEPS.map(s => <option key={s} value={s}>{WORKFLOW_LABELS[s]}</option>)}
        </select>
        <button onClick={load} style={{ padding: '8px 14px', borderRadius: 8, background: '#1e2535', color: '#94a3b8', border: '1px solid #2d3748', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="refresh" size={13} /> Refresh
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div style={{ background: '#161b2e', border: '1px solid #1d4ed8', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#475569', marginBottom: 16 }}>Tambah Bidang Baru</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Proyek *</label>
              <select value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })} style={inputStyle}>
                <option value="">Pilih Proyek</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.nama_proyek}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>NUB * (unik per proyek)</label>
              <input value={form.nub} onChange={e => setForm({ ...form, nub: e.target.value })} placeholder="BDG-001" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>NIB</label>
              <input value={form.nib} onChange={e => setForm({ ...form, nib: e.target.value })} placeholder="33.22.010.001" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Status Tanah</label>
              <select value={form.status_tanah_id} onChange={e => setForm({ ...form, status_tanah_id: e.target.value })} style={inputStyle}>
                <option value="">Pilih...</option>
                {statusTanahList.map(s => <option key={s.id} value={s.id}>{s.kode} — {s.nama_status}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Pembebanan</label>
              <input value={form.pembebanan} onChange={e => setForm({ ...form, pembebanan: e.target.value })} placeholder="Jalan Tol..." style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Rencana Pembangunan</label>
              <input value={form.rencana_pembangunan} onChange={e => setForm({ ...form, rencana_pembangunan: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Provinsi</label>
              <select value={form.provinsi_id} onChange={e => setForm({ ...form, provinsi_id: e.target.value, kabupaten_id: '', kecamatan_id: '', desa_id: '' })} style={inputStyle}>
                <option value="">Pilih...</option>
                {provinsiList.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Kabupaten</label>
              <select value={form.kabupaten_id} onChange={e => setForm({ ...form, kabupaten_id: e.target.value, kecamatan_id: '', desa_id: '' })} style={inputStyle} disabled={!form.provinsi_id}>
                <option value="">Pilih...</option>
                {kabupatenList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Kecamatan</label>
              <select value={form.kecamatan_id} onChange={e => setForm({ ...form, kecamatan_id: e.target.value, desa_id: '' })} style={inputStyle} disabled={!form.kabupaten_id}>
                <option value="">Pilih...</option>
                {kecamatanList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Desa {profile?.role === 'PPK' ? '(hanya desa aktif)' : ''}</label>
              <select value={form.desa_id} onChange={e => setForm({ ...form, desa_id: e.target.value })} style={inputStyle} disabled={!form.kecamatan_id}>
                <option value="">Pilih...</option>
                {desaList.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '2/-1' }}>
              <label style={labelStyle}>Keterangan</label>
              <input value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleCreate} disabled={saving} style={{ padding: '8px 18px', borderRadius: 8, background: '#1d4ed8', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="check" size={13} color="#fff" /> {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ padding: '8px 18px', borderRadius: 8, background: '#1e2535', color: '#94a3b8', border: '1px solid #2d3748', fontSize: 13, cursor: 'pointer' }}>Batal</button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? <LoadingPage text="Memuat bidang..." /> : error ? <ErrorBox message={error} onRetry={load} /> : (
        <div style={{ background: '#161b2e', border: '1px solid #1e2d44', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['NUB', 'NIB', 'Proyek', 'Status Tanah', 'Desa', 'Luas Terkena', 'Workflow', 'Aksi'].map(h => (
                    <th key={h} style={{ background: '#0f1421', color: '#64748b', fontWeight: 600, padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #1e2d44', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bidangList.length === 0
                  ? <tr><td colSpan={8}><EmptyState icon="map" title="Tidak ada bidang" subtitle="Tambah bidang baru atau ubah filter" /></td></tr>
                  : bidangList.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #1a2033' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#13192b'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '10px 14px', fontFamily: "'DM Mono', monospace", color: '#93c5fd', fontWeight: 600 }}>{b.nub}</td>
                      <td style={{ padding: '10px 14px', fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#64748b' }}>{b.nib || '—'}</td>
                      <td style={{ padding: '10px 14px', color: '#e2e8f0', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.project?.nama_proyek}</td>
                      <td style={{ padding: '10px 14px' }}>
                        {b.master_status_tanah && <span style={{ background: '#1e2d44', color: '#94a3b8', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{b.master_status_tanah.kode}</span>}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#94a3b8', fontSize: 12 }}>{b.master_desa?.nama || '—'}</td>
                      <td style={{ padding: '10px 14px', fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#f1f5f9' }}>{formatLuas(b.bidang_luas?.[0]?.luas_terkena)}</td>
                      <td style={{ padding: '10px 14px' }}><WorkflowBadge status={b.workflow_status} /></td>
                      <td style={{ padding: '10px 14px' }}>
                        <button onClick={() => { setSelectedBidang(b); setPage('bidang-detail') }}
                          style={{ padding: '4px 10px', borderRadius: 8, background: '#1e2535', color: '#94a3b8', border: '1px solid #2d3748', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Icon name="eye" size={12} /> Detail
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
