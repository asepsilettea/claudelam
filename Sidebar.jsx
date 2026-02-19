import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Icon } from './ui'

export default function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) return setError('Email dan password wajib diisi.')
    setLoading(true)
    setError('')
    const err = await signIn(email, password)
    if (err) setError(err.message || 'Login gagal. Periksa email dan password.')
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", padding: 20 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(29,78,216,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(16,185,129,0.08) 0%, transparent 50%)' }} />

      <div style={{ background: '#161b2e', border: '1px solid #1e2d44', borderRadius: 20, padding: 48, width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #1d4ed8, #10b981)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="map" size={22} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', letterSpacing: 0.5 }}>LAMCS</div>
            <div style={{ fontSize: 11, color: '#475569', letterSpacing: 0.5 }}>Land Acquisition Monitoring</div>
          </div>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>Masuk ke Sistem</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 28 }}>Sistem Monitoring & Pengendalian Pembebasan Tanah</p>

        {error && (
          <div style={{ background: '#7f1d1d', border: '1px solid #991b1b', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#fca5a5', marginBottom: 18 }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Email</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="email@instansi.go.id"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ background: '#0f1421', border: '1px solid #2d3748', color: '#e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 14, width: '100%', fontFamily: 'inherit' }}
          />
        </div>
        <div style={{ marginBottom: 28 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Password</label>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ background: '#0f1421', border: '1px solid #2d3748', color: '#e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 14, width: '100%', fontFamily: 'inherit' }}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width: '100%', padding: 12, background: loading ? '#1e2535' : 'linear-gradient(135deg, #1d4ed8, #1e40af)', color: loading ? '#64748b' : '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit', transition: 'background 0.2s' }}
        >
          {loading
            ? <><span style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }}>⟳</span> Memverifikasi...</>
            : <><Icon name="arrow" size={16} color="#fff" /> Masuk</>
          }
        </button>

        <p style={{ marginTop: 24, fontSize: 12, color: '#334155', textAlign: 'center' }}>
          Belum punya akun? Hubungi administrator sistem.
        </p>
      </div>
    </div>
  )
}
