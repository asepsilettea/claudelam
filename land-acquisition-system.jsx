import { useState, useEffect, useCallback } from "react";

// ============================================================
// MOCK DATABASE (in-memory, simulating full relational schema)
// ============================================================
const DB = {
  users: [
    { id: 1, nama: "Ir. Budi Santoso", email: "ketua@ppk.go.id", password: "ketua123", role: "KETUA_PPK", ppk_id: null },
    { id: 2, nama: "Drs. Ahmad Fauzi", email: "ppk1@ppk.go.id", password: "ppk123", role: "PPK", ppk_id: 1 },
    { id: 3, nama: "Sri Wahyuni, S.T.", email: "ppk2@ppk.go.id", password: "ppk456", role: "PPK", ppk_id: 2 },
  ],
  ppk: [
    { id: 1, nama_ppk: "PPK Jalan Tol Trans Jawa", wilayah_kerja: "Jawa Tengah & DIY", created_at: "2024-01-15" },
    { id: 2, nama_ppk: "PPK Bendungan Ciawi", wilayah_kerja: "Jawa Barat", created_at: "2024-02-10" },
  ],
  projects: [
    { id: 1, nama_proyek: "Pembebasan Tanah Ruas Semarang-Solo", tahun: 2024, deskripsi: "Pembebasan lahan untuk jalan tol segmen utara", ppk_id: 1, status_proyek: "AKTIF", created_at: "2024-02-01" },
    { id: 2, nama_proyek: "Pembebasan Tanah Jalan Tol Yogya-Bawen", tahun: 2024, deskripsi: "Pembebasan lahan segmen selatan", ppk_id: 1, status_proyek: "AKTIF", created_at: "2024-03-05" },
    { id: 3, nama_proyek: "Pembebasan Lahan Bendungan Ciawi Paket 1", tahun: 2024, deskripsi: "Area genangan waduk", ppk_id: 2, status_proyek: "AKTIF", created_at: "2024-01-20" },
  ],
  master_status_tanah: [
    { id: 1, kode: "THL", nama_status: "Tanah Hak Lainnya" },
    { id: 2, kode: "HM", nama_status: "Hak Milik" },
    { id: 3, kode: "HGB", nama_status: "Hak Guna Bangunan" },
    { id: 4, kode: "HGU", nama_status: "Hak Guna Usaha" },
  ],
  provinsi: [
    { id: 1, nama: "Jawa Tengah" },
    { id: 2, nama: "Jawa Barat" },
    { id: 3, nama: "DI Yogyakarta" },
  ],
  kabupaten: [
    { id: 1, provinsi_id: 1, nama: "Kab. Semarang" },
    { id: 2, provinsi_id: 1, nama: "Kab. Boyolali" },
    { id: 3, provinsi_id: 2, nama: "Kab. Bogor" },
    { id: 4, provinsi_id: 3, nama: "Kab. Sleman" },
  ],
  kecamatan: [
    { id: 1, kabupaten_id: 1, nama: "Bergas" },
    { id: 2, kabupaten_id: 1, nama: "Pringapus" },
    { id: 3, kabupaten_id: 2, nama: "Ampel" },
    { id: 4, kabupaten_id: 3, nama: "Caringin" },
    { id: 5, kabupaten_id: 4, nama: "Depok" },
  ],
  desa: [
    { id: 1, kecamatan_id: 1, nama: "Ds. Bergas Lor" },
    { id: 2, kecamatan_id: 1, nama: "Ds. Bergas Kidul" },
    { id: 3, kecamatan_id: 2, nama: "Ds. Pringapus" },
    { id: 4, kecamatan_id: 3, nama: "Ds. Ngadirojo" },
    { id: 5, kecamatan_id: 4, nama: "Ds. Caringin" },
    { id: 6, kecamatan_id: 5, nama: "Ds. Maguwoharjo" },
  ],
  ppk_desa_aktif: [
    { id: 1, ppk_id: 1, desa_id: 1 },
    { id: 2, ppk_id: 1, desa_id: 2 },
    { id: 3, ppk_id: 1, desa_id: 3 },
    { id: 4, ppk_id: 1, desa_id: 4 },
    { id: 5, ppk_id: 2, desa_id: 5 },
  ],
  bidang: [
    { id: 1, project_id: 1, nub: "BDG-001", nib: "33.22.010.001", status_tanah_id: 2, pembebanan: "Jalan Tol", rencana_pembangunan: "Jalur Utama", keterangan: "Tanah produktif", workflow_status: "SUDAH_BAYAR", provinsi_id: 1, kabupaten_id: 1, kecamatan_id: 1, desa_id: 1, aktif: true, created_by: 2, created_at: "2024-03-01" },
    { id: 2, project_id: 1, nub: "BDG-002", nib: "33.22.010.002", status_tanah_id: 2, pembebanan: "Jalan Tol", rencana_pembangunan: "Jalur Utama", keterangan: "", workflow_status: "SIAP_BAYAR", provinsi_id: 1, kabupaten_id: 1, kecamatan_id: 1, desa_id: 1, aktif: true, created_by: 2, created_at: "2024-03-05" },
    { id: 3, project_id: 1, nub: "BDG-003", nib: "33.22.010.003", status_tanah_id: 1, pembebanan: "Jalan Tol", rencana_pembangunan: "Jalur Pendukung", keterangan: "Lahan kosong", workflow_status: "VALIDASI", provinsi_id: 1, kabupaten_id: 1, kecamatan_id: 2, desa_id: 2, aktif: true, created_by: 2, created_at: "2024-03-10" },
    { id: 4, project_id: 1, nub: "BDG-004", nib: "33.22.010.004", status_tanah_id: 3, pembebanan: "Jalan Tol", rencana_pembangunan: "Jalur Utama", keterangan: "Bangunan komersial", workflow_status: "PENILAIAN", provinsi_id: 1, kabupaten_id: 1, kecamatan_id: 1, desa_id: 2, aktif: true, created_by: 2, created_at: "2024-03-15" },
    { id: 5, project_id: 1, nub: "BDG-005", nib: "33.22.010.005", status_tanah_id: 2, pembebanan: "Jalan Tol", rencana_pembangunan: "Rest Area", keterangan: "", workflow_status: "NOMINATIF", provinsi_id: 1, kabupaten_id: 1, kecamatan_id: 1, desa_id: 1, aktif: true, created_by: 2, created_at: "2024-04-01" },
    { id: 6, project_id: 2, nub: "BDG-001", nib: "34.04.010.001", status_tanah_id: 2, pembebanan: "Jalan Tol", rencana_pembangunan: "Jalur Utama", keterangan: "", workflow_status: "NOMINATIF", provinsi_id: 1, kabupaten_id: 2, kecamatan_id: 3, desa_id: 3, aktif: true, created_by: 2, created_at: "2024-04-10" },
    { id: 7, project_id: 3, nub: "BDG-001", nib: "32.01.010.001", status_tanah_id: 2, pembebanan: "Bendungan", rencana_pembangunan: "Area Genangan", keterangan: "Sawah irigasi", workflow_status: "PENILAIAN", provinsi_id: 2, kabupaten_id: 3, kecamatan_id: 4, desa_id: 5, aktif: true, created_by: 3, created_at: "2024-03-20" },
    { id: 8, project_id: 3, nub: "BDG-002", nib: "32.01.010.002", status_tanah_id: 1, pembebanan: "Bendungan", rencana_pembangunan: "Area Genangan", keterangan: "", workflow_status: "DIBATALKAN", provinsi_id: 2, kabupaten_id: 3, kecamatan_id: 4, desa_id: 5, aktif: true, created_by: 3, created_at: "2024-03-22" },
  ],
  bidang_luas: [
    { id: 1, bidang_id: 1, luas_asal: 1250.5, luas_terkena: 980.0, ruang_atas: 0, ruang_bawah: 0 },
    { id: 2, bidang_id: 2, luas_asal: 850.0, luas_terkena: 850.0, ruang_atas: 0, ruang_bawah: 0 },
    { id: 3, bidang_id: 3, luas_asal: 2100.0, luas_terkena: 1500.0, ruang_atas: 0, ruang_bawah: 0 },
    { id: 4, bidang_id: 4, luas_asal: 500.0, luas_terkena: 500.0, ruang_atas: 150.0, ruang_bawah: 0 },
    { id: 5, bidang_id: 5, luas_asal: 3200.0, luas_terkena: 2000.0, ruang_atas: 0, ruang_bawah: 0 },
    { id: 6, bidang_id: 6, luas_asal: 1800.0, luas_terkena: 1200.0, ruang_atas: 0, ruang_bawah: 0 },
    { id: 7, bidang_id: 7, luas_asal: 4500.0, luas_terkena: 4500.0, ruang_atas: 0, ruang_bawah: 0 },
    { id: 8, bidang_id: 8, luas_asal: 800.0, luas_terkena: 0, ruang_atas: 0, ruang_bawah: 0 },
  ],
  pihak: [
    { id: 1, bidang_id: 1, jenis: "PEMILIK", nama: "Sutrisno", nik: "3322010101800001", tempat_lahir: "Semarang", tanggal_lahir: "1980-01-01", pekerjaan: "Petani", alamat: "Ds. Bergas Lor RT 01/01", aktif: true },
    { id: 2, bidang_id: 2, jenis: "PEMILIK", nama: "Hj. Siti Aminah", nik: "3322010201750002", tempat_lahir: "Semarang", tanggal_lahir: "1975-02-15", pekerjaan: "Ibu Rumah Tangga", alamat: "Ds. Bergas Lor RT 02/01", aktif: true },
    { id: 3, bidang_id: 3, jenis: "PEMILIK", nama: "Bambang Kusumo", nik: "3322010301700003", tempat_lahir: "Solo", tanggal_lahir: "1970-05-20", pekerjaan: "PNS", alamat: "Ds. Bergas Kidul RT 01/02", aktif: true },
    { id: 4, bidang_id: 3, jenis: "PENGGARAP", nama: "Karno", nik: "3322010401850003", tempat_lahir: "Semarang", tanggal_lahir: "1985-11-30", pekerjaan: "Petani", alamat: "Ds. Bergas Kidul RT 02/02", aktif: true },
    { id: 5, bidang_id: 4, jenis: "PEMILIK", nama: "PT. Maju Bersama", nik: "-", tempat_lahir: "-", tanggal_lahir: "2000-01-01", pekerjaan: "Badan Hukum", alamat: "Jl. Industri No. 5 Semarang", aktif: true },
  ],
  bidang_objek: [
    { id: 1, bidang_id: 1, jenis_objek: "BANGUNAN", deskripsi: "Rumah tinggal 1 lantai", nilai_estimasi: 150000000 },
    { id: 2, bidang_id: 1, jenis_objek: "TANAMAN", deskripsi: "Pohon jati 25 batang", nilai_estimasi: 25000000 },
    { id: 3, bidang_id: 4, jenis_objek: "BANGUNAN", deskripsi: "Ruko 2 lantai", nilai_estimasi: 750000000 },
    { id: 4, bidang_id: 7, jenis_objek: "TANAMAN", deskripsi: "Padi, jagung (musim tanam)", nilai_estimasi: 45000000 },
  ],
  bidang_dokumen: [
    { id: 1, bidang_id: 1, kategori: "KMZ", url: "https://drive.google.com/file/bdg001-kmz", deskripsi: "File KMZ bidang 001", created_at: "2024-03-02" },
    { id: 2, bidang_id: 1, kategori: "PEMBAYARAN", url: "https://drive.google.com/file/bdg001-bayar", deskripsi: "Bukti pembayaran ganti rugi", created_at: "2024-05-10" },
    { id: 3, bidang_id: 2, kategori: "VALIDASI", url: "https://drive.google.com/file/bdg002-validasi", deskripsi: "Dokumen validasi APD", created_at: "2024-04-20" },
  ],
  workflow_history: [
    { id: 1, bidang_id: 1, status_lama: "NOMINATIF", status_baru: "PENILAIAN", changed_by: 2, changed_at: "2024-03-05 09:00", catatan: "Dokumen lengkap" },
    { id: 2, bidang_id: 1, status_lama: "PENILAIAN", status_baru: "VALIDASI", changed_by: 2, changed_at: "2024-03-15 10:30", catatan: "Nilai sudah disetujui" },
    { id: 3, bidang_id: 1, status_lama: "VALIDASI", status_baru: "SIAP_BAYAR", changed_by: 2, changed_at: "2024-04-01 08:00", catatan: "" },
    { id: 4, bidang_id: 1, status_lama: "SIAP_BAYAR", status_baru: "SUDAH_BAYAR", changed_by: 2, changed_at: "2024-05-10 14:00", catatan: "Transfer sukses" },
    { id: 5, bidang_id: 8, status_lama: "NOMINATIF", status_baru: "DIBATALKAN", changed_by: 3, changed_at: "2024-04-15 11:00", catatan: "Data kepemilikan sengketa" },
  ],
  nextId: { bidang: 9, pihak: 6, objek: 5, dokumen: 4, history: 6, project: 4, luas: 9 },
};

// ============================================================
// CONSTANTS
// ============================================================
const WORKFLOW_STEPS = ["NOMINATIF", "PENILAIAN", "VALIDASI", "SIAP_BAYAR", "SUDAH_BAYAR", "DIBATALKAN"];
const WORKFLOW_LABELS = {
  NOMINATIF: "Nominatif",
  PENILAIAN: "Penilaian",
  VALIDASI: "Validasi",
  SIAP_BAYAR: "Siap Bayar",
  SUDAH_BAYAR: "Sudah Bayar",
  DIBATALKAN: "Dibatalkan",
};
const WORKFLOW_COLORS = {
  NOMINATIF: "#64748b",
  PENILAIAN: "#f59e0b",
  VALIDASI: "#3b82f6",
  SIAP_BAYAR: "#8b5cf6",
  SUDAH_BAYAR: "#10b981",
  DIBATALKAN: "#ef4444",
};

const nextAllowedStatuses = (current) => {
  const idx = WORKFLOW_STEPS.indexOf(current);
  if (current === "SUDAH_BAYAR" || current === "DIBATALKAN") return [];
  return [WORKFLOW_STEPS[idx + 1], "DIBATALKAN"].filter(Boolean);
};

// ============================================================
// ICONS (SVG inline)
// ============================================================
const Icon = ({ name, size = 16, color = "currentColor" }) => {
  const icons = {
    home: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    grid: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    folder: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>,
    map: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
    users: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    file: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    logout: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    plus: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    edit: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    eye: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    arrow: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    check: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
    x: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    clock: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    trending: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    alert: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    database: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
    trash: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
    link: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
  };
  return icons[name] || null;
};

// ============================================================
// AUTH CONTEXT SIMULATION
// ============================================================
let currentUser = null;

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function getLuas(bidang_id) {
  return DB.bidang_luas.find(l => l.bidang_id === bidang_id) || null;
}
function getStatusTanah(id) {
  return DB.master_status_tanah.find(s => s.id === id);
}
function getProvinsi(id) { return DB.provinsi.find(p => p.id === id); }
function getKabupaten(id) { return DB.kabupaten.find(k => k.id === id); }
function getKecamatan(id) { return DB.kecamatan.find(k => k.id === id); }
function getDesa(id) { return DB.desa.find(d => d.id === id); }
function getPpk(id) { return DB.ppk.find(p => p.id === id); }
function getProject(id) { return DB.projects.find(p => p.id === id); }
function getUser(id) { return DB.users.find(u => u.id === id); }

function getAccessibleProjects(user) {
  if (user.role === "KETUA_PPK") return DB.projects;
  return DB.projects.filter(p => p.ppk_id === user.ppk_id);
}
function getAccessibleBidang(user) {
  const projects = getAccessibleProjects(user).map(p => p.id);
  return DB.bidang.filter(b => projects.includes(b.project_id) && b.aktif);
}

function formatLuas(val) {
  if (!val && val !== 0) return "-";
  return val.toLocaleString("id-ID", { maximumFractionDigits: 2 }) + " m²";
}
function formatRupiah(val) {
  return "Rp " + val.toLocaleString("id-ID");
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedBidang, setSelectedBidang] = useState(null);
  const [modal, setModal] = useState(null); // { type, data }
  const [toast, setToast] = useState(null);
  const [, forceUpdate] = useState(0);

  const refresh = useCallback(() => forceUpdate(n => n + 1), []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (!user) {
    return <LoginPage onLogin={(u) => { currentUser = u; setUser(u); }} />;
  }

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#0f1117", color: "#e2e8f0", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #1a1f2e; }
        ::-webkit-scrollbar-thumb { background: #2d3748; border-radius: 3px; }
        button { cursor: pointer; border: none; font-family: inherit; }
        input, select, textarea { font-family: inherit; }
        .nav-item { display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:8px;cursor:pointer;transition:all 0.15s;color:#94a3b8;font-size:14px;font-weight:500;text-decoration:none; }
        .nav-item:hover { background:#1e2535;color:#e2e8f0; }
        .nav-item.active { background:#1e3a5f;color:#60a5fa; }
        .card { background:#161b2e;border:1px solid #1e2d44;border-radius:12px;padding:20px; }
        .stat-card { background:#161b2e;border:1px solid #1e2d44;border-radius:12px;padding:20px;transition:border-color 0.2s; }
        .stat-card:hover { border-color:#2d4a6d; }
        .btn { padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;display:inline-flex;align-items:center;gap:6px;transition:all 0.15s; }
        .btn-primary { background:#1d4ed8;color:#fff; }
        .btn-primary:hover { background:#2563eb; }
        .btn-secondary { background:#1e2535;color:#94a3b8;border:1px solid #2d3748; }
        .btn-secondary:hover { background:#252e42;color:#e2e8f0; }
        .btn-danger { background:#7f1d1d;color:#fca5a5; }
        .btn-danger:hover { background:#991b1b; }
        .btn-success { background:#064e3b;color:#6ee7b7; }
        .btn-success:hover { background:#065f46; }
        .badge { padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase; }
        .table-wrap { overflow-x:auto; }
        table { width:100%;border-collapse:collapse;font-size:13px; }
        th { background:#0f1421;color:#64748b;font-weight:600;padding:10px 14px;text-align:left;border-bottom:1px solid #1e2d44;white-space:nowrap; }
        td { padding:10px 14px;border-bottom:1px solid #1a2033;color:#94a3b8; }
        tr:hover td { background:#13192b; }
        input, select, textarea { background:#0f1421;border:1px solid #2d3748;color:#e2e8f0;border-radius:8px;padding:8px 12px;font-size:13px;width:100%; }
        input:focus, select:focus, textarea:focus { outline:none;border-color:#3b82f6; }
        label { font-size:12px;font-weight:600;color:#64748b;margin-bottom:4px;display:block;text-transform:uppercase;letter-spacing:0.5px; }
        .form-group { margin-bottom:14px; }
        .modal-overlay { position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px; }
        .modal { background:#161b2e;border:1px solid #1e2d44;border-radius:16px;width:100%;max-width:700px;max-height:90vh;overflow-y:auto; }
        .progress-bar { height:6px;background:#1e2d44;border-radius:3px;overflow:hidden; }
        .progress-fill { height:100%;border-radius:3px;transition:width 0.5s; }
        .toast { position:fixed;bottom:24px;right:24px;z-index:2000;padding:12px 20px;border-radius:10px;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px;animation:slideIn 0.3s ease; }
        @keyframes slideIn { from{transform:translateX(100px);opacity:0} to{transform:translateX(0);opacity:1} }
        .workflow-chip { display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.5px; }
        .section-title { font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#475569;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #1e2d44; }
      `}</style>

      {/* SIDEBAR */}
      <Sidebar user={user} page={page} setPage={(p) => { setPage(p); setSelectedBidang(null); }} onLogout={() => { setUser(null); currentUser = null; setPage("dashboard"); }} />

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* TOPBAR */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e2d44", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0f1117", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: "#475569" }}>
              {user.role === "KETUA_PPK" ? "Ketua PPK — Akses Penuh" : `PPK — ${getPpk(user.ppk_id)?.nama_ppk}`}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }}></div>
            <span style={{ fontSize: 13, color: "#94a3b8" }}>{user.nama}</span>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
          {page === "dashboard" && <Dashboard user={user} setPage={setPage} setSelectedProject={setSelectedProject} />}
          {page === "projects" && <ProjectsPage user={user} setPage={setPage} setSelectedProject={setSelectedProject} showToast={showToast} refresh={refresh} />}
          {page === "bidang" && <BidangPage user={user} selectedProject={selectedProject} setSelectedBidang={setSelectedBidang} setPage={setPage} showToast={showToast} refresh={refresh} />}
          {page === "bidang-detail" && selectedBidang && <BidangDetail user={user} bidang={selectedBidang} setPage={setPage} showToast={showToast} refresh={refresh} />}
          {page === "ppk" && user.role === "KETUA_PPK" && <PpkPage />}
          {page === "master" && user.role === "KETUA_PPK" && <MasterPage />}
          {page === "audit" && <AuditPage user={user} />}
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div className="toast" style={{ background: toast.type === "success" ? "#064e3b" : toast.type === "error" ? "#7f1d1d" : "#1e3a5f", color: toast.type === "success" ? "#6ee7b7" : toast.type === "error" ? "#fca5a5" : "#93c5fd", border: `1px solid ${toast.type === "success" ? "#065f46" : toast.type === "error" ? "#991b1b" : "#1d4ed8"}` }}>
          <Icon name={toast.type === "success" ? "check" : toast.type === "error" ? "x" : "alert"} size={14} />
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ============================================================
// LOGIN PAGE
// ============================================================
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const user = DB.users.find(u => u.email === email && u.password === password);
    if (user) {
      onLogin(user);
    } else {
      setError("Email atau password salah.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap'); *{box-sizing:border-box;margin:0;padding:0} input{font-family:inherit}`}</style>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 20% 50%, rgba(29,78,216,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(16,185,129,0.08) 0%, transparent 50%)" }}></div>
      <div style={{ background: "#161b2e", border: "1px solid #1e2d44", borderRadius: 20, padding: 48, width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, background: "linear-gradient(135deg, #1d4ed8, #10b981)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="map" size={22} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", letterSpacing: 0.5 }}>LAMCS</div>
            <div style={{ fontSize: 11, color: "#475569", letterSpacing: 0.5 }}>Land Acquisition Monitoring</div>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>Masuk ke Sistem</h1>
          <p style={{ fontSize: 13, color: "#64748b" }}>Sistem Monitoring & Pengendalian Pembebasan Tanah</p>
        </div>

        {error && <div style={{ background: "#7f1d1d", border: "1px solid #991b1b", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#fca5a5", marginBottom: 16 }}>{error}</div>}

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: 0.5, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@ppk.go.id" style={{ background: "#0f1421", border: "1px solid #2d3748", color: "#e2e8f0", borderRadius: 8, padding: "10px 14px", fontSize: 14, width: "100%" }} onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: 0.5, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ background: "#0f1421", border: "1px solid #2d3748", color: "#e2e8f0", borderRadius: 8, padding: "10px 14px", fontSize: 14, width: "100%" }} onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>

        <button onClick={handleLogin} style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg, #1d4ed8, #1e40af)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Icon name="arrow" size={16} color="#fff" />
          Masuk
        </button>

        <div style={{ marginTop: 24, background: "#0f1421", border: "1px solid #1e2d44", borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 10 }}>Demo Akun</div>
          {[
            { email: "ketua@ppk.go.id", password: "ketua123", role: "KETUA_PPK" },
            { email: "ppk1@ppk.go.id", password: "ppk123", role: "PPK Jalan Tol" },
            { email: "ppk2@ppk.go.id", password: "ppk456", role: "PPK Bendungan" },
          ].map((a, i) => (
            <div key={i} onClick={() => { setEmail(a.email); setPassword(a.password); }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", borderRadius: 6, cursor: "pointer", marginBottom: 4, transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#161b2e"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <span style={{ fontSize: 12, color: "#60a5fa", fontFamily: "'DM Mono', monospace" }}>{a.email}</span>
              <span style={{ fontSize: 11, color: "#475569" }}>{a.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SIDEBAR
// ============================================================
function Sidebar({ user, page, setPage, onLogout }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "home" },
    { id: "projects", label: "Proyek", icon: "folder" },
    { id: "bidang", label: "Data Bidang", icon: "map" },
    { id: "audit", label: "Audit Trail", icon: "clock" },
    ...(user.role === "KETUA_PPK" ? [
      { id: "ppk", label: "Manajemen PPK", icon: "users" },
      { id: "master", label: "Master Data", icon: "database" },
    ] : []),
  ];

  return (
    <div style={{ width: 220, background: "#0d1220", borderRight: "1px solid #1e2d44", display: "flex", flexDirection: "column", padding: "20px 12px", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 10px", marginBottom: 32 }}>
        <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #1d4ed8, #10b981)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="map" size={18} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>LAMCS</div>
          <div style={{ fontSize: 10, color: "#475569" }}>v1.0.0</div>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#334155", letterSpacing: 1, textTransform: "uppercase", padding: "0 10px", marginBottom: 8 }}>Navigasi</div>
        {navItems.map(item => (
          <div key={item.id} className={`nav-item ${page === item.id || (page === "bidang-detail" && item.id === "bidang") ? "active" : ""}`} onClick={() => setPage(item.id)}>
            <Icon name={item.icon} size={16} />
            {item.label}
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px solid #1e2d44", paddingTop: 12 }}>
        <div style={{ padding: "8px 10px", marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8" }}>{user.nama}</div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>
            <span style={{ background: user.role === "KETUA_PPK" ? "#1e3a5f" : "#1a2e1a", color: user.role === "KETUA_PPK" ? "#60a5fa" : "#6ee7b7", padding: "1px 8px", borderRadius: 10, fontSize: 10, fontWeight: 700 }}>
              {user.role === "KETUA_PPK" ? "Ketua PPK" : "PPK"}
            </span>
          </div>
        </div>
        <div className="nav-item" onClick={onLogout}>
          <Icon name="logout" size={16} />
          Keluar
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DASHBOARD PAGE
// ============================================================
function Dashboard({ user, setPage, setSelectedProject }) {
  const allBidang = getAccessibleBidang(user);
  const allProjects = getAccessibleProjects(user);

  const statusCounts = WORKFLOW_STEPS.reduce((acc, s) => {
    acc[s] = allBidang.filter(b => b.workflow_status === s).length;
    return acc;
  }, {});

  const totalLuas = allBidang.reduce((sum, b) => {
    const luas = getLuas(b.id);
    return sum + (luas ? luas.luas_terkena : 0);
  }, 0);

  const stats = [
    { label: "Total Bidang", value: allBidang.length, icon: "map", color: "#3b82f6" },
    { label: "Total Proyek", value: allProjects.length, icon: "folder", color: "#8b5cf6" },
    { label: "Total Luas Terkena", value: formatLuas(totalLuas), icon: "trending", color: "#10b981" },
    ...(user.role === "KETUA_PPK" ? [{ label: "Total PPK", value: DB.ppk.length, icon: "users", color: "#f59e0b" }] : []),
    { label: "Sudah Bayar", value: statusCounts["SUDAH_BAYAR"] || 0, icon: "check", color: "#10b981" },
    { label: "Perlu Perhatian", value: (statusCounts["DIBATALKAN"] || 0), icon: "alert", color: "#ef4444" },
  ];

  const maxCount = Math.max(...Object.values(statusCounts), 1);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9" }}>Dashboard</h1>
        <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
          {user.role === "KETUA_PPK" ? "Ringkasan seluruh sistem pembebasan tanah" : `Ringkasan proyek PPK: ${getPpk(user.ppk_id)?.nama_ppk}`}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: s.color + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name={s.icon} size={18} color={s.color} />
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Workflow Distribution */}
        <div className="card">
          <div className="section-title">Distribusi Status Workflow</div>
          {WORKFLOW_STEPS.map(s => (
            <div key={s} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: WORKFLOW_COLORS[s] }}></div>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>{WORKFLOW_LABELS[s]}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: WORKFLOW_COLORS[s] }}>{statusCounts[s] || 0}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${((statusCounts[s] || 0) / maxCount) * 100}%`, background: WORKFLOW_COLORS[s] + "90" }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Projects */}
        <div className="card">
          <div className="section-title">Proyek Aktif</div>
          {allProjects.filter(p => p.status_proyek === "AKTIF").slice(0, 5).map(p => {
            const bidangProyek = allBidang.filter(b => b.project_id === p.id);
            const done = bidangProyek.filter(b => b.workflow_status === "SUDAH_BAYAR").length;
            const pct = bidangProyek.length > 0 ? Math.round((done / bidangProyek.length) * 100) : 0;
            return (
              <div key={p.id} style={{ marginBottom: 16, cursor: "pointer" }} onClick={() => { setSelectedProject(p); setPage("bidang"); }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{p.nama_proyek}</div>
                    <div style={{ fontSize: 11, color: "#475569" }}>{bidangProyek.length} bidang · {getPpk(p.ppk_id)?.nama_ppk}</div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#10b981" }}>{pct}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #10b981, #34d399)" }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bidang macet */}
      <div className="card">
        <div className="section-title">Bidang yang Perlu Perhatian (Macet / Dibatalkan)</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>NUB</th>
                <th>Proyek</th>
                <th>Status</th>
                <th>Desa</th>
                <th>Terakhir Diperbarui</th>
              </tr>
            </thead>
            <tbody>
              {allBidang.filter(b => b.workflow_status === "DIBATALKAN" || b.workflow_status === "NOMINATIF").slice(0, 6).map(b => (
                <tr key={b.id}>
                  <td style={{ fontFamily: "'DM Mono', monospace", color: "#93c5fd" }}>{b.nub}</td>
                  <td style={{ color: "#e2e8f0" }}>{getProject(b.project_id)?.nama_proyek}</td>
                  <td><WorkflowBadge status={b.workflow_status} /></td>
                  <td>{getDesa(b.desa_id)?.nama}</td>
                  <td style={{ color: "#475569" }}>{b.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PROJECTS PAGE
// ============================================================
function ProjectsPage({ user, setPage, setSelectedProject, showToast, refresh }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nama_proyek: "", tahun: new Date().getFullYear(), deskripsi: "", ppk_id: user.ppk_id || "" });

  const projects = getAccessibleProjects(user);
  const allBidang = getAccessibleBidang(user);

  const handleCreate = () => {
    if (!form.nama_proyek.trim()) return showToast("Nama proyek wajib diisi", "error");
    const newId = DB.nextId.project++;
    DB.projects.push({
      id: newId, nama_proyek: form.nama_proyek, tahun: parseInt(form.tahun), deskripsi: form.deskripsi,
      ppk_id: parseInt(form.ppk_id) || user.ppk_id, status_proyek: "AKTIF", created_at: new Date().toISOString().slice(0, 10),
    });
    setShowForm(false);
    setForm({ nama_proyek: "", tahun: new Date().getFullYear(), deskripsi: "", ppk_id: user.ppk_id || "" });
    showToast("Proyek berhasil dibuat");
    refresh();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9" }}>Manajemen Proyek</h1>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>{projects.length} proyek</p>
        </div>
        {(user.role === "PPK") && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <Icon name="plus" size={14} color="#fff" /> Proyek Baru
          </button>
        )}
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20, borderColor: "#1d4ed8" }}>
          <div className="section-title">Buat Proyek Baru</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="form-group" style={{ gridColumn: "1/-1" }}>
              <label>Nama Proyek</label>
              <input value={form.nama_proyek} onChange={e => setForm({ ...form, nama_proyek: e.target.value })} placeholder="Pembebasan Tanah..." />
            </div>
            <div className="form-group">
              <label>Tahun</label>
              <input type="number" value={form.tahun} onChange={e => setForm({ ...form, tahun: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Deskripsi</label>
              <input value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} placeholder="Opsional..." />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" onClick={handleCreate}><Icon name="check" size={14} color="#fff" /> Simpan</button>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}><Icon name="x" size={14} /> Batal</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {projects.map(p => {
          const bidangList = allBidang.filter(b => b.project_id === p.id);
          const done = bidangList.filter(b => b.workflow_status === "SUDAH_BAYAR").length;
          const pct = bidangList.length > 0 ? Math.round((done / bidangList.length) * 100) : 0;
          const ppk = getPpk(p.ppk_id);
          return (
            <div key={p.id} className="card" style={{ cursor: "pointer", transition: "border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#3b82f6"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#1e2d44"}
              onClick={() => { setSelectedProject(p); setPage("bidang"); }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>{p.nama_proyek}</div>
                  <div style={{ fontSize: 11, color: "#475569" }}>{ppk?.nama_ppk} · {p.tahun}</div>
                </div>
                <span style={{ background: p.status_proyek === "AKTIF" ? "#064e3b" : "#1e2d44", color: p.status_proyek === "AKTIF" ? "#6ee7b7" : "#64748b", padding: "2px 10px", borderRadius: 10, fontSize: 10, fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>{p.status_proyek}</span>
              </div>

              <div style={{ display: "flex", gap: 20, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>{bidangList.length}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>Total Bidang</div>
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#10b981" }}>{done}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>Sudah Bayar</div>
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#f59e0b" }}>{pct}%</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>Progress</div>
                </div>
              </div>

              <div className="progress-bar" style={{ marginBottom: 8 }}>
                <div className="progress-fill" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #1d4ed8, #10b981)" }}></div>
              </div>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {WORKFLOW_STEPS.slice(0, 5).map(s => {
                  const cnt = bidangList.filter(b => b.workflow_status === s).length;
                  if (!cnt) return null;
                  return <span key={s} style={{ background: WORKFLOW_COLORS[s] + "20", color: WORKFLOW_COLORS[s], padding: "2px 8px", borderRadius: 8, fontSize: 10, fontWeight: 700 }}>{WORKFLOW_LABELS[s]}: {cnt}</span>;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// BIDANG PAGE
// ============================================================
function BidangPage({ user, selectedProject, setSelectedBidang, setPage, showToast, refresh }) {
  const [filter, setFilter] = useState({ status: "", search: "" });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ project_id: selectedProject?.id || "", nub: "", nib: "", status_tanah_id: "", pembebanan: "", rencana_pembangunan: "", keterangan: "", provinsi_id: "", kabupaten_id: "", kecamatan_id: "", desa_id: "" });

  const projects = getAccessibleProjects(user);
  const allBidang = getAccessibleBidang(user);

  let displayBidang = selectedProject ? allBidang.filter(b => b.project_id === selectedProject.id) : allBidang;
  if (filter.status) displayBidang = displayBidang.filter(b => b.workflow_status === filter.status);
  if (filter.search) displayBidang = displayBidang.filter(b => b.nub.toLowerCase().includes(filter.search.toLowerCase()) || b.nib?.includes(filter.search));

  const activeDesaIds = DB.ppk_desa_aktif.filter(pd => pd.ppk_id === user.ppk_id).map(pd => pd.desa_id);

  const filteredKabupaten = DB.kabupaten.filter(k => !form.provinsi_id || k.provinsi_id === parseInt(form.provinsi_id));
  const filteredKecamatan = DB.kecamatan.filter(k => !form.kabupaten_id || k.kabupaten_id === parseInt(form.kabupaten_id));
  const filteredDesa = DB.desa.filter(d => {
    if (!form.kecamatan_id || d.kecamatan_id !== parseInt(form.kecamatan_id)) return false;
    if (user.role === "PPK") return activeDesaIds.includes(d.id);
    return true;
  });

  const handleCreate = () => {
    if (!form.nub.trim() || !form.project_id) return showToast("NUB dan Proyek wajib diisi", "error");
    const proj = parseInt(form.project_id);
    const exists = DB.bidang.some(b => b.project_id === proj && b.nub === form.nub && b.aktif);
    if (exists) return showToast("NUB sudah digunakan dalam proyek ini", "error");

    const newId = DB.nextId.bidang++;
    DB.bidang.push({
      id: newId, project_id: proj, nub: form.nub, nib: form.nib,
      status_tanah_id: parseInt(form.status_tanah_id) || 1,
      pembebanan: form.pembebanan, rencana_pembangunan: form.rencana_pembangunan,
      keterangan: form.keterangan, workflow_status: "NOMINATIF",
      provinsi_id: parseInt(form.provinsi_id), kabupaten_id: parseInt(form.kabupaten_id),
      kecamatan_id: parseInt(form.kecamatan_id), desa_id: parseInt(form.desa_id),
      aktif: true, created_by: user.id, created_at: new Date().toISOString().slice(0, 10),
    });
    DB.bidang_luas.push({ id: DB.nextId.luas++, bidang_id: newId, luas_asal: 0, luas_terkena: 0, ruang_atas: 0, ruang_bawah: 0 });
    DB.workflow_history.push({ id: DB.nextId.history++, bidang_id: newId, status_lama: null, status_baru: "NOMINATIF", changed_by: user.id, changed_at: new Date().toISOString().slice(0, 16).replace("T", " "), catatan: "Bidang dibuat" });
    setShowForm(false);
    showToast("Bidang berhasil ditambahkan");
    refresh();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <button onClick={() => setPage("projects")} style={{ background: "none", color: "#64748b", fontSize: 12 }}>← Proyek</button>
            {selectedProject && <span style={{ color: "#475569" }}>/</span>}
            {selectedProject && <span style={{ color: "#93c5fd", fontSize: 13 }}>{selectedProject.nama_proyek}</span>}
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9" }}>Data Bidang</h1>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>{displayBidang.length} bidang ditampilkan</p>
        </div>
        {user.role === "PPK" && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <Icon name="plus" size={14} color="#fff" /> Tambah Bidang
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input placeholder="Cari NUB / NIB..." value={filter.search} onChange={e => setFilter({ ...filter, search: e.target.value })} style={{ width: 220 }} />
        <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })} style={{ width: 180 }}>
          <option value="">Semua Status</option>
          {WORKFLOW_STEPS.map(s => <option key={s} value={s}>{WORKFLOW_LABELS[s]}</option>)}
        </select>
        {!selectedProject && (
          <select style={{ width: 200 }}>
            <option>Semua Proyek</option>
            {projects.map(p => <option key={p.id}>{p.nama_proyek}</option>)}
          </select>
        )}
      </div>

      {/* Inline Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 20, borderColor: "#1d4ed8" }}>
          <div className="section-title">Tambah Bidang Baru</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <div className="form-group">
              <label>Proyek *</label>
              <select value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })}>
                <option value="">Pilih Proyek</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.nama_proyek}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>NUB * (unik dalam proyek)</label>
              <input value={form.nub} onChange={e => setForm({ ...form, nub: e.target.value })} placeholder="BDG-001" />
            </div>
            <div className="form-group">
              <label>NIB</label>
              <input value={form.nib} onChange={e => setForm({ ...form, nib: e.target.value })} placeholder="33.22.010.001" />
            </div>
            <div className="form-group">
              <label>Status Tanah</label>
              <select value={form.status_tanah_id} onChange={e => setForm({ ...form, status_tanah_id: e.target.value })}>
                <option value="">Pilih...</option>
                {DB.master_status_tanah.map(s => <option key={s.id} value={s.id}>{s.kode} - {s.nama_status}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Pembebanan</label>
              <input value={form.pembebanan} onChange={e => setForm({ ...form, pembebanan: e.target.value })} placeholder="Jalan Tol..." />
            </div>
            <div className="form-group">
              <label>Rencana Pembangunan</label>
              <input value={form.rencana_pembangunan} onChange={e => setForm({ ...form, rencana_pembangunan: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Provinsi</label>
              <select value={form.provinsi_id} onChange={e => setForm({ ...form, provinsi_id: e.target.value, kabupaten_id: "", kecamatan_id: "", desa_id: "" })}>
                <option value="">Pilih...</option>
                {DB.provinsi.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Kabupaten</label>
              <select value={form.kabupaten_id} onChange={e => setForm({ ...form, kabupaten_id: e.target.value, kecamatan_id: "", desa_id: "" })}>
                <option value="">Pilih...</option>
                {filteredKabupaten.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Kecamatan</label>
              <select value={form.kecamatan_id} onChange={e => setForm({ ...form, kecamatan_id: e.target.value, desa_id: "" })}>
                <option value="">Pilih...</option>
                {filteredKecamatan.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Desa {user.role === "PPK" ? "(hanya desa aktif)" : ""}</label>
              <select value={form.desa_id} onChange={e => setForm({ ...form, desa_id: e.target.value })}>
                <option value="">Pilih...</option>
                {filteredDesa.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Keterangan</label>
              <input value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" onClick={handleCreate}><Icon name="check" size={14} color="#fff" /> Simpan</button>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}><Icon name="x" size={14} /> Batal</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>NUB</th>
                <th>NIB</th>
                <th>Proyek</th>
                <th>Status Tanah</th>
                <th>Desa</th>
                <th>Luas Terkena</th>
                <th>Workflow</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayBidang.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "#475569" }}>Tidak ada data bidang</td></tr>
              )}
              {displayBidang.map(b => {
                const luas = getLuas(b.id);
                const st = getStatusTanah(b.status_tanah_id);
                return (
                  <tr key={b.id}>
                    <td style={{ fontFamily: "'DM Mono', monospace", color: "#93c5fd", fontWeight: 600 }}>{b.nub}</td>
                    <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#64748b" }}>{b.nib || "-"}</td>
                    <td style={{ color: "#e2e8f0", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{getProject(b.project_id)?.nama_proyek}</td>
                    <td><span style={{ background: "#1e2d44", color: "#94a3b8", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{st?.kode || "-"}</span></td>
                    <td style={{ color: "#94a3b8", fontSize: 12 }}>{getDesa(b.desa_id)?.nama}</td>
                    <td style={{ fontFamily: "'DM Mono', monospace", color: "#f1f5f9", fontSize: 12 }}>{luas ? formatLuas(luas.luas_terkena) : "-"}</td>
                    <td><WorkflowBadge status={b.workflow_status} /></td>
                    <td>
                      <button className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => { setSelectedBidang(b); setPage("bidang-detail"); }}>
                        <Icon name="eye" size={12} /> Detail
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// BIDANG DETAIL PAGE
// ============================================================
function BidangDetail({ user, bidang: initialBidang, setPage, showToast, refresh }) {
  const [tab, setTab] = useState("info");
  const [bidang, setBidang] = useState(initialBidang);
  const [editLuas, setEditLuas] = useState(false);
  const [luasForm, setLuasForm] = useState({});
  const [workflowNote, setWorkflowNote] = useState("");
  const [showAddPihak, setShowAddPihak] = useState(false);
  const [showAddObjek, setShowAddObjek] = useState(false);
  const [showAddDokumen, setShowAddDokumen] = useState(false);
  const [pihakForm, setPihakForm] = useState({ jenis: "PEMILIK", nama: "", nik: "", tempat_lahir: "", tanggal_lahir: "", pekerjaan: "", alamat: "" });
  const [objekForm, setObjekForm] = useState({ jenis_objek: "BANGUNAN", deskripsi: "", nilai_estimasi: "" });
  const [dokForm, setDokForm] = useState({ kategori: "KMZ", url: "", deskripsi: "" });

  const luas = getLuas(bidang.id);
  const pihakList = DB.pihak.filter(p => p.bidang_id === bidang.id && p.aktif);
  const objekList = DB.bidang_objek.filter(o => o.bidang_id === bidang.id);
  const dokList = DB.bidang_dokumen.filter(d => d.bidang_id === bidang.id);
  const history = DB.workflow_history.filter(h => h.bidang_id === bidang.id).sort((a, b) => b.id - a.id);

  const canEdit = user.role === "PPK";
  const allowed = nextAllowedStatuses(bidang.workflow_status);

  const handleWorkflowChange = (newStatus) => {
    if (!allowed.includes(newStatus)) return showToast("Transisi status tidak diizinkan", "error");
    const hist = { id: DB.nextId.history++, bidang_id: bidang.id, status_lama: bidang.workflow_status, status_baru: newStatus, changed_by: user.id, changed_at: new Date().toISOString().slice(0, 16).replace("T", " "), catatan: workflowNote };
    DB.workflow_history.push(hist);
    const idx = DB.bidang.findIndex(b => b.id === bidang.id);
    DB.bidang[idx].workflow_status = newStatus;
    const updated = { ...bidang, workflow_status: newStatus };
    setBidang(updated);
    setWorkflowNote("");
    showToast(`Status diubah ke ${WORKFLOW_LABELS[newStatus]}`);
    refresh();
  };

  const handleLuasSave = () => {
    const idx = DB.bidang_luas.findIndex(l => l.bidang_id === bidang.id);
    if (idx >= 0) {
      DB.bidang_luas[idx] = { ...DB.bidang_luas[idx], luas_asal: parseFloat(luasForm.luas_asal) || 0, luas_terkena: parseFloat(luasForm.luas_terkena) || 0, ruang_atas: parseFloat(luasForm.ruang_atas) || 0, ruang_bawah: parseFloat(luasForm.ruang_bawah) || 0 };
    }
    setEditLuas(false);
    showToast("Data luas disimpan");
    refresh();
  };

  const handleAddPihak = () => {
    if (!pihakForm.nama) return showToast("Nama pihak wajib diisi", "error");
    DB.pihak.push({ id: DB.nextId.pihak++, bidang_id: bidang.id, ...pihakForm, aktif: true, created_at: new Date().toISOString().slice(0, 10) });
    setShowAddPihak(false);
    setPihakForm({ jenis: "PEMILIK", nama: "", nik: "", tempat_lahir: "", tanggal_lahir: "", pekerjaan: "", alamat: "" });
    showToast("Pihak ditambahkan");
    refresh();
  };

  const handleDeletePihak = (id) => {
    const idx = DB.pihak.findIndex(p => p.id === id);
    if (idx >= 0) DB.pihak[idx].aktif = false;
    showToast("Pihak dinonaktifkan");
    refresh();
  };

  const handleAddObjek = () => {
    if (!objekForm.deskripsi) return showToast("Deskripsi objek wajib diisi", "error");
    DB.bidang_objek.push({ id: DB.nextId.objek++, bidang_id: bidang.id, ...objekForm, nilai_estimasi: parseFloat(objekForm.nilai_estimasi) || 0, created_at: new Date().toISOString().slice(0, 10) });
    setShowAddObjek(false);
    setObjekForm({ jenis_objek: "BANGUNAN", deskripsi: "", nilai_estimasi: "" });
    showToast("Objek ditambahkan");
    refresh();
  };

  const handleAddDokumen = () => {
    if (!dokForm.url || !dokForm.url.startsWith("http")) return showToast("URL tidak valid (harus http/https)", "error");
    DB.bidang_dokumen.push({ id: DB.nextId.dokumen++, bidang_id: bidang.id, ...dokForm, created_at: new Date().toISOString().slice(0, 10) });
    setShowAddDokumen(false);
    setDokForm({ kategori: "KMZ", url: "", deskripsi: "" });
    showToast("Dokumen ditambahkan");
    refresh();
  };

  const workflowStepIdx = WORKFLOW_STEPS.indexOf(bidang.workflow_status);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <button onClick={() => setPage("bidang")} style={{ background: "none", color: "#64748b", fontSize: 12, marginBottom: 12 }}>← Kembali ke Daftar Bidang</button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: "#f1f5f9", fontFamily: "'DM Mono', monospace" }}>{bidang.nub}</h1>
              <WorkflowBadge status={bidang.workflow_status} large />
            </div>
            <p style={{ color: "#64748b", fontSize: 13 }}>NIB: {bidang.nib || "-"} · {getProject(bidang.project_id)?.nama_proyek}</p>
          </div>
        </div>
      </div>

      {/* Workflow Stepper */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title">Alur Workflow</div>
        <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", paddingBottom: 4 }}>
          {WORKFLOW_STEPS.slice(0, 5).map((s, i) => {
            const isDone = i < workflowStepIdx && bidang.workflow_status !== "DIBATALKAN";
            const isCurrent = s === bidang.workflow_status;
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", border: `2px solid ${isCurrent ? WORKFLOW_COLORS[s] : isDone ? "#10b981" : "#1e2d44"}`, background: isCurrent ? WORKFLOW_COLORS[s] + "30" : isDone ? "#064e3b" : "#0f1421", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {isDone ? <Icon name="check" size={14} color="#10b981" /> : <span style={{ fontSize: 11, fontWeight: 700, color: isCurrent ? WORKFLOW_COLORS[s] : "#475569" }}>{i + 1}</span>}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: isCurrent ? WORKFLOW_COLORS[s] : isDone ? "#10b981" : "#475569", letterSpacing: 0.3, whiteSpace: "nowrap" }}>{WORKFLOW_LABELS[s]}</span>
                </div>
                {i < 4 && <div style={{ width: 40, height: 2, background: isDone && workflowStepIdx > i + 1 ? "#10b981" : "#1e2d44", margin: "0 4px", marginBottom: 20, flexShrink: 0 }}></div>}
              </div>
            );
          })}
          {bidang.workflow_status === "DIBATALKAN" && (
            <div style={{ marginLeft: 16, display: "flex", alignItems: "center", gap: 8, background: "#7f1d1d30", border: "1px solid #7f1d1d", borderRadius: 8, padding: "6px 14px" }}>
              <Icon name="x" size={14} color="#ef4444" />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#ef4444" }}>DIBATALKAN</span>
            </div>
          )}
        </div>

        {/* Workflow Actions */}
        {canEdit && allowed.length > 0 && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #1e2d44" }}>
            <div style={{ marginBottom: 10 }}>
              <label>Catatan Perubahan (opsional)</label>
              <input value={workflowNote} onChange={e => setWorkflowNote(e.target.value)} placeholder="Catatan untuk audit trail..." style={{ marginTop: 4 }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {allowed.map(s => (
                <button key={s} className="btn" onClick={() => handleWorkflowChange(s)} style={{ background: WORKFLOW_COLORS[s] + "20", color: WORKFLOW_COLORS[s], border: `1px solid ${WORKFLOW_COLORS[s]}40` }}>
                  <Icon name={s === "DIBATALKAN" ? "x" : "arrow"} size={13} color={WORKFLOW_COLORS[s]} />
                  Lanjut ke {WORKFLOW_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        )}
        {(!canEdit) && <p style={{ fontSize: 12, color: "#475569", marginTop: 12 }}>* Anda hanya memiliki akses lihat.</p>}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, marginBottom: 20, background: "#0f1421", border: "1px solid #1e2d44", borderRadius: 10, padding: 4, width: "fit-content" }}>
        {[["info", "Info Bidang"], ["luas", "Data Luas"], ["pihak", "Pihak"], ["objek", "Objek/Bangunan"], ["dokumen", "Dokumen"], ["history", "Audit Trail"]].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "7px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: tab === t ? "#1e2d44" : "transparent", color: tab === t ? "#e2e8f0" : "#64748b", border: "none", cursor: "pointer", transition: "all 0.15s" }}>{l}</button>
        ))}
      </div>

      {/* TAB: Info */}
      {tab === "info" && (
        <div className="card">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
            {[
              ["NUB", bidang.nub, "mono"],
              ["NIB", bidang.nib || "-", "mono"],
              ["Status Tanah", getStatusTanah(bidang.status_tanah_id)?.kode + " - " + getStatusTanah(bidang.status_tanah_id)?.nama_status],
              ["Pembebanan", bidang.pembebanan || "-"],
              ["Rencana Pembangunan", bidang.rencana_pembangunan || "-"],
              ["Keterangan", bidang.keterangan || "-"],
              ["Provinsi", getProvinsi(bidang.provinsi_id)?.nama || "-"],
              ["Kabupaten", getKabupaten(bidang.kabupaten_id)?.nama || "-"],
              ["Kecamatan", getKecamatan(bidang.kecamatan_id)?.nama || "-"],
              ["Desa", getDesa(bidang.desa_id)?.nama || "-"],
              ["Proyek", getProject(bidang.project_id)?.nama_proyek || "-"],
              ["Dibuat oleh", getUser(bidang.created_by)?.nama || "-"],
              ["Tanggal Dibuat", bidang.created_at],
            ].map(([label, val, type]) => (
              <div key={label}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
                <div style={{ fontSize: 13, color: "#e2e8f0", fontFamily: type === "mono" ? "'DM Mono', monospace" : "inherit" }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Luas */}
      {tab === "luas" && (
        <div className="card">
          {editLuas ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                {[["luas_asal", "Luas Asal (m²)"], ["luas_terkena", "Luas Terkena (m²)"], ["ruang_atas", "Ruang Atas (m²)"], ["ruang_bawah", "Ruang Bawah (m²)"]].map(([k, l]) => (
                  <div className="form-group" key={k}>
                    <label>{l}</label>
                    <input type="number" value={luasForm[k] ?? ""} onChange={e => setLuasForm({ ...luasForm, [k]: e.target.value })} />
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>
                Luas Sisa (auto): {formatLuas((parseFloat(luasForm.luas_asal) || 0) - (parseFloat(luasForm.luas_terkena) || 0))}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-success" onClick={handleLuasSave}><Icon name="check" size={14} color="#6ee7b7" /> Simpan</button>
                <button className="btn btn-secondary" onClick={() => setEditLuas(false)}>Batal</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 20, marginBottom: 20 }}>
                {[
                  ["Luas Asal", formatLuas(luas?.luas_asal)],
                  ["Luas Terkena", formatLuas(luas?.luas_terkena)],
                  ["Luas Sisa", formatLuas((luas?.luas_asal || 0) - (luas?.luas_terkena || 0))],
                  ["Ruang Atas", formatLuas(luas?.ruang_atas)],
                ].map(([l, v]) => (
                  <div key={l} style={{ background: "#0f1421", borderRadius: 10, padding: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{l}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", fontFamily: "'DM Mono', monospace" }}>{v}</div>
                  </div>
                ))}
              </div>
              {canEdit && <button className="btn btn-secondary" onClick={() => { setLuasForm({ luas_asal: luas?.luas_asal || 0, luas_terkena: luas?.luas_terkena || 0, ruang_atas: luas?.ruang_atas || 0, ruang_bawah: luas?.ruang_bawah || 0 }); setEditLuas(true); }}><Icon name="edit" size={13} /> Edit Data Luas</button>}
            </>
          )}
        </div>
      )}

      {/* TAB: Pihak */}
      {tab === "pihak" && (
        <div>
          {canEdit && (
            <div style={{ marginBottom: 16 }}>
              <button className="btn btn-primary" onClick={() => setShowAddPihak(!showAddPihak)}>
                <Icon name="plus" size={14} color="#fff" /> Tambah Pihak
              </button>
            </div>
          )}
          {showAddPihak && (
            <div className="card" style={{ marginBottom: 16, borderColor: "#1d4ed8" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                <div className="form-group">
                  <label>Jenis</label>
                  <select value={pihakForm.jenis} onChange={e => setPihakForm({ ...pihakForm, jenis: e.target.value })}>
                    <option value="PEMILIK">Pemilik</option>
                    <option value="PENGGARAP">Penggarap</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Nama *</label>
                  <input value={pihakForm.nama} onChange={e => setPihakForm({ ...pihakForm, nama: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>NIK</label>
                  <input value={pihakForm.nik} onChange={e => setPihakForm({ ...pihakForm, nik: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Tempat Lahir</label>
                  <input value={pihakForm.tempat_lahir} onChange={e => setPihakForm({ ...pihakForm, tempat_lahir: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Tanggal Lahir</label>
                  <input type="date" value={pihakForm.tanggal_lahir} onChange={e => setPihakForm({ ...pihakForm, tanggal_lahir: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Pekerjaan</label>
                  <input value={pihakForm.pekerjaan} onChange={e => setPihakForm({ ...pihakForm, pekerjaan: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: "1/-1" }}>
                  <label>Alamat</label>
                  <input value={pihakForm.alamat} onChange={e => setPihakForm({ ...pihakForm, alamat: e.target.value })} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-primary" onClick={handleAddPihak}><Icon name="check" size={14} color="#fff" /> Simpan</button>
                <button className="btn btn-secondary" onClick={() => setShowAddPihak(false)}>Batal</button>
              </div>
            </div>
          )}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <table>
              <thead><tr><th>Jenis</th><th>Nama</th><th>NIK</th><th>Tempat/Tgl Lahir</th><th>Pekerjaan</th><th>Alamat</th>{canEdit && <th>Aksi</th>}</tr></thead>
              <tbody>
                {pihakList.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 30, color: "#475569" }}>Belum ada data pihak</td></tr>}
                {pihakList.map(p => (
                  <tr key={p.id}>
                    <td><span style={{ background: p.jenis === "PEMILIK" ? "#1e3a5f" : "#1a2e1a", color: p.jenis === "PEMILIK" ? "#60a5fa" : "#6ee7b7", padding: "2px 10px", borderRadius: 10, fontSize: 10, fontWeight: 700 }}>{p.jenis}</span></td>
                    <td style={{ color: "#e2e8f0", fontWeight: 600 }}>{p.nama}</td>
                    <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{p.nik || "-"}</td>
                    <td style={{ fontSize: 12 }}>{p.tempat_lahir}, {p.tanggal_lahir}</td>
                    <td>{p.pekerjaan}</td>
                    <td style={{ fontSize: 12, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.alamat}</td>
                    {canEdit && <td><button className="btn btn-danger" style={{ padding: "3px 8px", fontSize: 11 }} onClick={() => handleDeletePihak(p.id)}><Icon name="trash" size={11} color="#fca5a5" /></button></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Objek */}
      {tab === "objek" && (
        <div>
          {canEdit && <div style={{ marginBottom: 16 }}><button className="btn btn-primary" onClick={() => setShowAddObjek(!showAddObjek)}><Icon name="plus" size={14} color="#fff" /> Tambah Objek</button></div>}
          {showAddObjek && (
            <div className="card" style={{ marginBottom: 16, borderColor: "#1d4ed8" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                <div className="form-group">
                  <label>Jenis Objek</label>
                  <select value={objekForm.jenis_objek} onChange={e => setObjekForm({ ...objekForm, jenis_objek: e.target.value })}>
                    <option value="BANGUNAN">Bangunan</option>
                    <option value="TANAMAN">Tanaman</option>
                    <option value="BENDA_LAIN">Benda Lain</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Deskripsi *</label>
                  <input value={objekForm.deskripsi} onChange={e => setObjekForm({ ...objekForm, deskripsi: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Nilai Estimasi (Rp)</label>
                  <input type="number" value={objekForm.nilai_estimasi} onChange={e => setObjekForm({ ...objekForm, nilai_estimasi: e.target.value })} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-primary" onClick={handleAddObjek}><Icon name="check" size={14} color="#fff" /> Simpan</button>
                <button className="btn btn-secondary" onClick={() => setShowAddObjek(false)}>Batal</button>
              </div>
            </div>
          )}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <table>
              <thead><tr><th>Jenis</th><th>Deskripsi</th><th>Nilai Estimasi</th></tr></thead>
              <tbody>
                {objekList.length === 0 && <tr><td colSpan={3} style={{ textAlign: "center", padding: 30, color: "#475569" }}>Belum ada objek/bangunan</td></tr>}
                {objekList.map(o => (
                  <tr key={o.id}>
                    <td><span style={{ background: "#1e2d44", color: "#94a3b8", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{o.jenis_objek}</span></td>
                    <td style={{ color: "#e2e8f0" }}>{o.deskripsi}</td>
                    <td style={{ fontFamily: "'DM Mono', monospace", color: "#f59e0b" }}>{formatRupiah(o.nilai_estimasi)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Dokumen */}
      {tab === "dokumen" && (
        <div>
          {canEdit && <div style={{ marginBottom: 16 }}><button className="btn btn-primary" onClick={() => setShowAddDokumen(!showAddDokumen)}><Icon name="plus" size={14} color="#fff" /> Tambah Dokumen</button></div>}
          {showAddDokumen && (
            <div className="card" style={{ marginBottom: 16, borderColor: "#1d4ed8" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 14 }}>
                <div className="form-group">
                  <label>Kategori</label>
                  <select value={dokForm.kategori} onChange={e => setDokForm({ ...dokForm, kategori: e.target.value })}>
                    {["KMZ", "VALIDASI", "PEMBAYARAN", "LAINNYA"].map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Deskripsi</label>
                  <input value={dokForm.deskripsi} onChange={e => setDokForm({ ...dokForm, deskripsi: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>URL * (http/https)</label>
                  <input value={dokForm.url} onChange={e => setDokForm({ ...dokForm, url: e.target.value })} placeholder="https://..." />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-primary" onClick={handleAddDokumen}><Icon name="check" size={14} color="#fff" /> Simpan</button>
                <button className="btn btn-secondary" onClick={() => setShowAddDokumen(false)}>Batal</button>
              </div>
            </div>
          )}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <table>
              <thead><tr><th>Kategori</th><th>Deskripsi</th><th>URL</th><th>Tanggal</th></tr></thead>
              <tbody>
                {dokList.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", padding: 30, color: "#475569" }}>Belum ada dokumen</td></tr>}
                {dokList.map(d => (
                  <tr key={d.id}>
                    <td><span style={{ background: "#1e2d44", color: "#94a3b8", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{d.kategori}</span></td>
                    <td style={{ color: "#e2e8f0" }}>{d.deskripsi}</td>
                    <td><a href={d.url} target="_blank" rel="noreferrer" style={{ color: "#60a5fa", fontSize: 12, display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}><Icon name="link" size={12} color="#60a5fa" />{d.url.length > 50 ? d.url.slice(0, 50) + "..." : d.url}</a></td>
                    <td style={{ fontSize: 12, color: "#475569" }}>{d.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: History/Audit */}
      {tab === "history" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table>
            <thead><tr><th>Waktu</th><th>Status Lama</th><th>Status Baru</th><th>Diubah Oleh</th><th>Catatan</th></tr></thead>
            <tbody>
              {history.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: 30, color: "#475569" }}>Belum ada riwayat</td></tr>}
              {history.map(h => (
                <tr key={h.id}>
                  <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#64748b" }}>{h.changed_at}</td>
                  <td>{h.status_lama ? <WorkflowBadge status={h.status_lama} /> : <span style={{ color: "#475569", fontSize: 11 }}>-</span>}</td>
                  <td><WorkflowBadge status={h.status_baru} /></td>
                  <td style={{ color: "#e2e8f0" }}>{getUser(h.changed_by)?.nama}</td>
                  <td style={{ color: "#94a3b8", fontSize: 12 }}>{h.catatan || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PPK PAGE (Ketua only)
// ============================================================
function PpkPage() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9" }}>Manajemen PPK</h1>
        <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>Daftar PPK yang terdaftar dalam sistem</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {DB.ppk.map(ppk => {
          const projects = DB.projects.filter(p => p.ppk_id === ppk.id);
          const users = DB.users.filter(u => u.ppk_id === ppk.id);
          const bidang = DB.bidang.filter(b => projects.some(p => p.id === b.project_id) && b.aktif);
          return (
            <div key={ppk.id} className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="users" size={18} color="#60a5fa" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{ppk.nama_ppk}</div>
                  <div style={{ fontSize: 12, color: "#475569" }}>{ppk.wilayah_kerja}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[["Proyek", projects.length], ["Bidang", bidang.length], ["User", users.length]].map(([l, v]) => (
                  <div key={l} style={{ background: "#0f1421", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>{v}</div>
                    <div style={{ fontSize: 11, color: "#475569" }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Pengguna</div>
                {users.map(u => (
                  <div key={u.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #1e2d44", fontSize: 12 }}>
                    <span style={{ color: "#e2e8f0" }}>{u.nama}</span>
                    <span style={{ color: "#64748b" }}>{u.email}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// MASTER PAGE (Ketua only)
// ============================================================
function MasterPage() {
  const [tab, setTab] = useState("status");
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9" }}>Master Data</h1>
        <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>Data master nasional (hanya dapat dilihat oleh Ketua PPK)</p>
      </div>
      <div style={{ display: "flex", gap: 2, marginBottom: 20, background: "#0f1421", border: "1px solid #1e2d44", borderRadius: 10, padding: 4, width: "fit-content" }}>
        {[["status", "Status Tanah"], ["wilayah", "Wilayah"], ["desa_aktif", "Desa Aktif PPK"]].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "7px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: tab === t ? "#1e2d44" : "transparent", color: tab === t ? "#e2e8f0" : "#64748b", border: "none", cursor: "pointer" }}>{l}</button>
        ))}
      </div>

      {tab === "status" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table>
            <thead><tr><th>Kode</th><th>Nama Status</th><th>Keterangan</th></tr></thead>
            <tbody>
              {DB.master_status_tanah.map(s => (
                <tr key={s.id}>
                  <td><span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: "#f59e0b", background: "#451a0020", padding: "2px 8px", borderRadius: 6 }}>{s.kode}</span></td>
                  <td style={{ color: "#e2e8f0" }}>{s.nama_status}</td>
                  <td style={{ color: "#475569", fontSize: 12 }}>Master nasional — tidak dapat diubah oleh PPK</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "wilayah" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #1e2d44", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>Provinsi ({DB.provinsi.length})</div>
            <table><tbody>{DB.provinsi.map(p => <tr key={p.id}><td style={{ color: "#e2e8f0" }}>{p.nama}</td></tr>)}</tbody></table>
          </div>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #1e2d44", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>Kabupaten ({DB.kabupaten.length})</div>
            <table><tbody>{DB.kabupaten.map(k => <tr key={k.id}><td style={{ color: "#e2e8f0" }}>{k.nama}</td><td style={{ color: "#475569", fontSize: 12 }}>{DB.provinsi.find(p => p.id === k.provinsi_id)?.nama}</td></tr>)}</tbody></table>
          </div>
        </div>
      )}

      {tab === "desa_aktif" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table>
            <thead><tr><th>PPK</th><th>Desa</th><th>Kecamatan</th></tr></thead>
            <tbody>
              {DB.ppk_desa_aktif.map(pd => {
                const desa = getDesa(pd.desa_id);
                const kec = desa ? getKecamatan(desa.kecamatan_id) : null;
                const ppk = getPpk(pd.ppk_id);
                return (
                  <tr key={pd.id}>
                    <td style={{ color: "#60a5fa" }}>{ppk?.nama_ppk}</td>
                    <td style={{ color: "#e2e8f0" }}>{desa?.nama}</td>
                    <td style={{ color: "#94a3b8" }}>{kec?.nama}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================
// AUDIT PAGE
// ============================================================
function AuditPage({ user }) {
  const allBidang = getAccessibleBidang(user);
  const allBidangIds = allBidang.map(b => b.id);
  const history = DB.workflow_history.filter(h => allBidangIds.includes(h.bidang_id)).sort((a, b) => b.id - a.id);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9" }}>Audit Trail</h1>
        <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>Log seluruh perubahan workflow bidang · {history.length} entri</p>
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Waktu</th>
              <th>Bidang (NUB)</th>
              <th>Proyek</th>
              <th>Status Lama</th>
              <th>Status Baru</th>
              <th>Diubah Oleh</th>
              <th>Catatan</th>
            </tr>
          </thead>
          <tbody>
            {history.map(h => {
              const bidang = DB.bidang.find(b => b.id === h.bidang_id);
              const proj = bidang ? getProject(bidang.project_id) : null;
              return (
                <tr key={h.id}>
                  <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#334155" }}>#{h.id}</td>
                  <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#64748b" }}>{h.changed_at}</td>
                  <td style={{ fontFamily: "'DM Mono', monospace", color: "#93c5fd", fontWeight: 600 }}>{bidang?.nub || "-"}</td>
                  <td style={{ color: "#94a3b8", fontSize: 12, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{proj?.nama_proyek}</td>
                  <td>{h.status_lama ? <WorkflowBadge status={h.status_lama} /> : <span style={{ color: "#334155", fontSize: 11 }}>—</span>}</td>
                  <td><WorkflowBadge status={h.status_baru} /></td>
                  <td style={{ color: "#e2e8f0", fontSize: 12 }}>{getUser(h.changed_by)?.nama}</td>
                  <td style={{ color: "#64748b", fontSize: 12 }}>{h.catatan || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// WORKFLOW BADGE COMPONENT
// ============================================================
function WorkflowBadge({ status, large }) {
  const color = WORKFLOW_COLORS[status] || "#64748b";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: color + "20", color,
      border: `1px solid ${color}40`,
      padding: large ? "4px 14px" : "2px 10px",
      borderRadius: 20,
      fontSize: large ? 12 : 10,
      fontWeight: 700,
      letterSpacing: 0.5,
      textTransform: "uppercase",
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }}></span>
      {WORKFLOW_LABELS[status]}
    </span>
  );
}
