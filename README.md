# LAMCS — Land Acquisition Monitoring & Control System

Aplikasi monitoring dan pengendalian proses pembebasan tanah berbasis proyek.

## Stack
- **Frontend**: React 18 + Vite
- **Backend/Database**: Supabase (PostgreSQL + Auth + RLS)
- **Deployment**: Vercel (frontend) + Supabase (backend)

---

## Cara Setup & Deploy

### 1. Persiapan Database Supabase

1. Buat akun di [supabase.com](https://supabase.com)
2. Klik **New Project**
3. Masuk ke **SQL Editor**
4. Paste isi file `supabase-schema.sql` → klik **Run**
5. Tunggu hingga selesai (semua tabel, trigger, RLS terbuat)

### 2. Buat User Login

Di Supabase Dashboard → **Authentication** → **Users** → **Invite User**:
- Buat user untuk setiap pengguna sistem (email + password)

Setelah dibuat, ambil **User UID** dari tabel users di Auth, lalu jalankan di SQL Editor:

```sql
INSERT INTO users (auth_user_id, nama, email, role, ppk_id) VALUES
  ('UUID-dari-supabase', 'Ir. Budi Santoso', 'ketua@ppk.go.id', 'KETUA_PPK', NULL),
  ('UUID-dari-supabase', 'Drs. Ahmad Fauzi', 'ppk1@ppk.go.id', 'PPK', 1),
  ('UUID-dari-supabase', 'Sri Wahyuni', 'ppk2@ppk.go.id', 'PPK', 2);
```

### 3. Setup Environment Variables

Ambil kredensial dari Supabase → **Settings** → **API**:

```bash
cp .env.example .env.local
# Edit .env.local dan isi:
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 4. Jalankan Lokal (Development)

```bash
npm install
npm run dev
# Buka http://localhost:5173
```

### 5. Deploy ke Vercel

#### Cara A: Via GitHub (Recommended)
1. Push project ini ke GitHub repository
2. Buka [vercel.com](https://vercel.com) → **New Project**
3. Import repository dari GitHub
4. Di **Environment Variables**, tambahkan:
   - `VITE_SUPABASE_URL` = URL Supabase kamu
   - `VITE_SUPABASE_ANON_KEY` = Anon key Supabase kamu
5. Klik **Deploy** → selesai!

#### Cara B: Via Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
# Ikuti wizard, masukkan env variables saat diminta
```

---

## Struktur Project

```
lamcs/
├── src/
│   ├── lib/
│   │   ├── supabase.js      # Supabase client
│   │   ├── api.js           # Semua fungsi API ke Supabase
│   │   └── constants.js     # Konstanta workflow, format utils
│   ├── context/
│   │   └── AuthContext.jsx  # Auth state management
│   ├── components/
│   │   ├── ui.jsx           # Shared UI components
│   │   ├── LoginPage.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Dashboard.jsx
│   │   ├── ProjectsPage.jsx
│   │   ├── BidangPage.jsx
│   │   ├── BidangDetail.jsx # Tabs: info, luas, pihak, objek, dokumen, audit
│   │   └── OtherPages.jsx   # Audit, PPK, Master pages
│   ├── App.jsx              # Router utama
│   └── main.jsx
├── index.html
├── vite.config.js
├── package.json
└── .env.example
```

---

## Fitur Utama

- **RBAC**: KETUA_PPK (akses penuh) vs PPK (hanya proyeknya)
- **Workflow terkunci**: Tidak bisa lompat tahap, enforced di DB level
- **Audit Trail**: Setiap perubahan workflow tercatat otomatis
- **Soft Delete**: Data tidak pernah dihapus permanen
- **RLS**: Row Level Security di PostgreSQL, bukan hanya frontend
- **Desa Aktif**: PPK hanya bisa input di desa yang diaktifkan
- **Luas Sisa**: Auto-calculated di database (GENERATED ALWAYS AS)

---

## Keamanan

- Auth menggunakan Supabase Auth (JWT)
- RLS policies memastikan PPK tidak bisa lihat data PPK lain
- Workflow validation di DB trigger (tidak bisa di-bypass dari frontend)
- Anon key aman diekspos di frontend (dikontrol oleh RLS)
