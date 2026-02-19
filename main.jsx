import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './components/LoginPage'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import ProjectsPage from './components/ProjectsPage'
import BidangPage from './components/BidangPage'
import BidangDetail from './components/BidangDetail'
import { AuditPage, PpkPage, MasterPage } from './components/OtherPages'
import { LoadingPage } from './components/ui'

function AppInner() {
  const { session, profile, loading } = useAuth()
  const [page, setPage] = useState('dashboard')
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedBidang, setSelectedBidang] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const navigate = (p) => {
    setPage(p)
    if (p !== 'bidang-detail') setSelectedBidang(null)
    if (p !== 'bidang' && p !== 'bidang-detail') setSelectedProject(null)
  }

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1117', fontFamily: 'DM Sans, sans-serif' }}>
      <LoadingPage text="Menghubungkan ke sistem..." />
    </div>
  )

  if (!session || !profile) return <LoginPage />

  const toastColors = {
    success: { bg: '#064e3b', border: '#065f46', text: '#6ee7b7' },
    error:   { bg: '#7f1d1d', border: '#991b1b', text: '#fca5a5' },
    info:    { bg: '#1e3a5f', border: '#1d4ed8', text: '#93c5fd' },
  }
  const tc = toastColors[toast?.type] || toastColors.info

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: '#0f1117', color: '#e2e8f0', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #1a1f2e; }
        ::-webkit-scrollbar-thumb { background: #2d3748; border-radius: 3px; }
        button { cursor: pointer; border: none; font-family: inherit; }
        input, select, textarea { font-family: inherit; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from{transform:translateX(100px);opacity:0} to{transform:translateX(0);opacity:1} }
      `}</style>

      {/* SIDEBAR */}
      <Sidebar page={page} setPage={navigate} />

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* TOPBAR */}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid #1e2d44', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f1117', flexShrink: 0 }}>
          <div style={{ fontSize: 13, color: '#475569' }}>
            {profile?.role === 'KETUA_PPK' ? 'Ketua PPK — Akses Penuh' : `PPK — ${profile?.ppk?.nama_ppk}`}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
            <span style={{ fontSize: 13, color: '#94a3b8' }}>{profile?.nama}</span>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {page === 'dashboard' && (
            <Dashboard
              setPage={navigate}
              setSelectedProject={(p) => { setSelectedProject(p) }}
            />
          )}
          {page === 'projects' && (
            <ProjectsPage
              setPage={navigate}
              setSelectedProject={setSelectedProject}
              showToast={showToast}
            />
          )}
          {page === 'bidang' && (
            <BidangPage
              selectedProject={selectedProject}
              setSelectedBidang={setSelectedBidang}
              setPage={navigate}
              showToast={showToast}
            />
          )}
          {page === 'bidang-detail' && selectedBidang && (
            <BidangDetail
              bidangInit={selectedBidang}
              setPage={navigate}
              showToast={showToast}
            />
          )}
          {page === 'audit' && <AuditPage />}
          {page === 'ppk' && profile?.role === 'KETUA_PPK' && <PpkPage />}
          {page === 'master' && profile?.role === 'KETUA_PPK' && <MasterPage />}
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 2000,
          padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'slideIn 0.3s ease',
          background: tc.bg, border: `1px solid ${tc.border}`, color: tc.text,
        }}>
          {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'} {toast.msg}
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
