import { supabase } from './supabase'

// ============================================================
// AUTH
// ============================================================
export const api = {

  // ---- MASTER DATA (read-only for PPK) ----
  async getProvinsi() {
    const { data, error } = await supabase.from('master_provinsi').select('*').order('nama')
    if (error) throw error
    return data
  },

  async getKabupaten(provinsiId) {
    let q = supabase.from('master_kabupaten').select('*').order('nama')
    if (provinsiId) q = q.eq('provinsi_id', provinsiId)
    const { data, error } = await q
    if (error) throw error
    return data
  },

  async getKecamatan(kabupatenId) {
    let q = supabase.from('master_kecamatan').select('*').order('nama')
    if (kabupatenId) q = q.eq('kabupaten_id', kabupatenId)
    const { data, error } = await q
    if (error) throw error
    return data
  },

  async getDesa(kecamatanId) {
    let q = supabase.from('master_desa').select('*').order('nama')
    if (kecamatanId) q = q.eq('kecamatan_id', kecamatanId)
    const { data, error } = await q
    if (error) throw error
    return data
  },

  async getDesaAktifPpk(ppkId) {
    const { data, error } = await supabase
      .from('ppk_desa_aktif')
      .select('desa_id, master_desa(id, nama, kecamatan_id)')
      .eq('ppk_id', ppkId)
    if (error) throw error
    return data.map(d => d.master_desa)
  },

  async getStatusTanah() {
    const { data, error } = await supabase.from('master_status_tanah').select('*').order('kode')
    if (error) throw error
    return data
  },

  // ---- PPK ----
  async getPpkList() {
    const { data, error } = await supabase
      .from('ppk')
      .select('*, project(count), users(count)')
      .order('nama_ppk')
    if (error) throw error
    return data
  },

  async getPpkById(id) {
    const { data, error } = await supabase.from('ppk').select('*').eq('id', id).single()
    if (error) throw error
    return data
  },

  // ---- USERS ----
  async getUserList() {
    const { data, error } = await supabase
      .from('users')
      .select('*, ppk(nama_ppk)')
      .order('nama')
    if (error) throw error
    return data
  },

  // ---- PROJECT ----
  async getProjects(ppkId = null) {
    let q = supabase
      .from('project')
      .select(`
        *,
        ppk(id, nama_ppk),
        bidang(count)
      `)
      .order('created_at', { ascending: false })
    if (ppkId) q = q.eq('ppk_id', ppkId)
    const { data, error } = await q
    if (error) throw error
    return data
  },

  async createProject(payload) {
    const { data, error } = await supabase
      .from('project')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateProject(id, payload) {
    const { data, error } = await supabase
      .from('project')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // ---- BIDANG ----
  async getBidangList({ projectId = null, ppkId = null, workflowStatus = null, search = null } = {}) {
    let q = supabase
      .from('bidang')
      .select(`
        *,
        project(id, nama_proyek, ppk_id),
        master_status_tanah(id, kode, nama_status),
        master_provinsi(id, nama),
        master_kabupaten(id, nama),
        master_kecamatan(id, nama),
        master_desa(id, nama),
        bidang_luas(luas_asal, luas_terkena, luas_sisa, ruang_atas, ruang_bawah)
      `)
      .eq('aktif', true)
      .order('created_at', { ascending: false })

    if (projectId) q = q.eq('project_id', projectId)
    if (workflowStatus) q = q.eq('workflow_status', workflowStatus)
    if (search) q = q.or(`nub.ilike.%${search}%,nib.ilike.%${search}%`)

    const { data, error } = await q
    if (error) throw error
    return data
  },

  async getBidangById(id) {
    const { data, error } = await supabase
      .from('bidang')
      .select(`
        *,
        project(id, nama_proyek, ppk_id, ppk(nama_ppk)),
        master_status_tanah(id, kode, nama_status),
        master_provinsi(id, nama),
        master_kabupaten(id, nama),
        master_kecamatan(id, nama),
        master_desa(id, nama),
        bidang_luas(*),
        users!bidang_created_by_fkey(id, nama)
      `)
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async createBidang(payload, userId) {
    // Check NUB uniqueness
    const { data: exists } = await supabase
      .from('bidang')
      .select('id')
      .eq('project_id', payload.project_id)
      .eq('nub', payload.nub)
      .eq('aktif', true)
      .maybeSingle()
    if (exists) throw new Error('NUB sudah digunakan dalam proyek ini')

    const { data, error } = await supabase
      .from('bidang')
      .insert({ ...payload, created_by: userId, workflow_status: 'NOMINATIF' })
      .select()
      .single()
    if (error) throw error

    // Create empty luas record
    await supabase.from('bidang_luas').insert({
      bidang_id: data.id,
      luas_asal: 0, luas_terkena: 0, ruang_atas: 0, ruang_bawah: 0
    })

    // Log workflow history
    await supabase.from('bidang_workflow_history').insert({
      bidang_id: data.id,
      status_lama: null,
      status_baru: 'NOMINATIF',
      changed_by: userId,
      catatan: 'Bidang dibuat'
    })

    return data
  },

  async updateBidang(id, payload) {
    const { data, error } = await supabase
      .from('bidang')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async softDeleteBidang(id) {
    const { error } = await supabase
      .from('bidang')
      .update({ aktif: false })
      .eq('id', id)
    if (error) throw error
  },

  // ---- WORKFLOW ----
  async advanceWorkflow(bidangId, statusBaru, userId, catatan = '') {
    // Update bidang — trigger di DB akan validasi & auto-log
    const { data, error } = await supabase
      .from('bidang')
      .update({ workflow_status: statusBaru })
      .eq('id', bidangId)
      .select('workflow_status')
      .single()
    if (error) throw error

    // Manual insert history (lebih reliable daripada trigger saja)
    const { data: bidang } = await supabase
      .from('bidang')
      .select('workflow_status')
      .eq('id', bidangId)
      .single()

    await supabase.from('bidang_workflow_history').insert({
      bidang_id: bidangId,
      status_lama: bidang?.workflow_status === statusBaru
        ? null // fallback
        : bidang?.workflow_status,
      status_baru: statusBaru,
      changed_by: userId,
      catatan
    })

    return data
  },

  // ---- BIDANG LUAS ----
  async updateLuas(bidangId, payload) {
    const { data, error } = await supabase
      .from('bidang_luas')
      .update(payload)
      .eq('bidang_id', bidangId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // ---- PIHAK ----
  async getPihak(bidangId) {
    const { data, error } = await supabase
      .from('pihak')
      .select('*')
      .eq('bidang_id', bidangId)
      .eq('aktif', true)
      .order('created_at')
    if (error) throw error
    return data
  },

  async createPihak(payload) {
    const { data, error } = await supabase
      .from('pihak')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async softDeletePihak(id) {
    const { error } = await supabase.from('pihak').update({ aktif: false }).eq('id', id)
    if (error) throw error
  },

  // ---- BIDANG OBJEK ----
  async getObjek(bidangId) {
    const { data, error } = await supabase
      .from('bidang_objek')
      .select('*')
      .eq('bidang_id', bidangId)
      .order('created_at')
    if (error) throw error
    return data
  },

  async createObjek(payload) {
    const { data, error } = await supabase
      .from('bidang_objek')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteObjek(id) {
    const { error } = await supabase.from('bidang_objek').delete().eq('id', id)
    if (error) throw error
  },

  // ---- BIDANG DOKUMEN ----
  async getDokumen(bidangId) {
    const { data, error } = await supabase
      .from('bidang_dokumen')
      .select('*')
      .eq('bidang_id', bidangId)
      .order('created_at')
    if (error) throw error
    return data
  },

  async createDokumen(payload) {
    if (!payload.url?.startsWith('http')) throw new Error('URL tidak valid (harus dimulai http/https)')
    const { data, error } = await supabase
      .from('bidang_dokumen')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteDokumen(id) {
    const { error } = await supabase.from('bidang_dokumen').delete().eq('id', id)
    if (error) throw error
  },

  // ---- WORKFLOW HISTORY ----
  async getWorkflowHistory(bidangId) {
    const { data, error } = await supabase
      .from('bidang_workflow_history')
      .select('*, users(nama)')
      .eq('bidang_id', bidangId)
      .order('changed_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getAllWorkflowHistory(ppkId = null) {
    let q = supabase
      .from('bidang_workflow_history')
      .select(`
        *,
        users(nama),
        bidang(nub, project(nama_proyek, ppk_id))
      `)
      .order('changed_at', { ascending: false })
      .limit(200)

    const { data, error } = await q
    if (error) throw error

    // Filter by ppk if needed (RLS handles this but double-check)
    if (ppkId) {
      return data.filter(h => h.bidang?.project?.ppk_id === ppkId)
    }
    return data
  },

  // ---- DASHBOARD STATS ----
  async getDashboardStats(ppkId = null) {
    // Projects
    let projQ = supabase.from('project').select('id, ppk_id, status_proyek')
    if (ppkId) projQ = projQ.eq('ppk_id', ppkId)
    const { data: projects } = await projQ

    // Bidang with luas
    let bidangQ = supabase
      .from('bidang')
      .select('id, workflow_status, project_id, bidang_luas(luas_terkena)')
      .eq('aktif', true)
    if (ppkId) {
      const projectIds = projects?.map(p => p.id) || []
      if (projectIds.length > 0) bidangQ = bidangQ.in('project_id', projectIds)
    }
    const { data: bidang } = await bidangQ

    const statusCounts = {}
    let totalLuas = 0
    bidang?.forEach(b => {
      statusCounts[b.workflow_status] = (statusCounts[b.workflow_status] || 0) + 1
      totalLuas += b.bidang_luas?.[0]?.luas_terkena || 0
    })

    return {
      totalBidang: bidang?.length || 0,
      totalProjects: projects?.length || 0,
      totalLuas,
      statusCounts,
      projects,
      bidang,
    }
  },

  // ---- PPK_DESA_AKTIF ----
  async getAllDesaAktif() {
    const { data, error } = await supabase
      .from('ppk_desa_aktif')
      .select('*, ppk(nama_ppk), master_desa(nama, master_kecamatan(nama))')
      .order('ppk_id')
    if (error) throw error
    return data
  },

  async addDesaAktif(ppkId, desaId) {
    const { error } = await supabase.from('ppk_desa_aktif').insert({ ppk_id: ppkId, desa_id: desaId })
    if (error) throw error
  },

  async removeDesaAktif(id) {
    const { error } = await supabase.from('ppk_desa_aktif').delete().eq('id', id)
    if (error) throw error
  },
}
