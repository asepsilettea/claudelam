export const WORKFLOW_STEPS = ['NOMINATIF', 'PENILAIAN', 'VALIDASI', 'SIAP_BAYAR', 'SUDAH_BAYAR', 'DIBATALKAN']

export const WORKFLOW_LABELS = {
  NOMINATIF:  'Nominatif',
  PENILAIAN:  'Penilaian',
  VALIDASI:   'Validasi',
  SIAP_BAYAR: 'Siap Bayar',
  SUDAH_BAYAR:'Sudah Bayar',
  DIBATALKAN: 'Dibatalkan',
}

export const WORKFLOW_COLORS = {
  NOMINATIF:  '#64748b',
  PENILAIAN:  '#f59e0b',
  VALIDASI:   '#3b82f6',
  SIAP_BAYAR: '#8b5cf6',
  SUDAH_BAYAR:'#10b981',
  DIBATALKAN: '#ef4444',
}

export function nextAllowedStatuses(current) {
  const ordered = ['NOMINATIF', 'PENILAIAN', 'VALIDASI', 'SIAP_BAYAR', 'SUDAH_BAYAR']
  if (current === 'SUDAH_BAYAR' || current === 'DIBATALKAN') return []
  const idx = ordered.indexOf(current)
  const next = ordered[idx + 1]
  return next ? [next, 'DIBATALKAN'] : ['DIBATALKAN']
}

export function formatLuas(val) {
  if (val === null || val === undefined) return '—'
  return Number(val).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' m²'
}

export function formatRupiah(val) {
  if (val === null || val === undefined) return '—'
  return 'Rp ' + Number(val).toLocaleString('id-ID')
}

export function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}
