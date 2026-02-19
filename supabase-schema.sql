-- ============================================================
-- LAMCS — Land Acquisition Monitoring & Control System
-- Supabase PostgreSQL Schema
-- Jalankan script ini di Supabase → SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- MASTER: PROVINSI
-- ============================================================
CREATE TABLE master_provinsi (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MASTER: KABUPATEN
-- ============================================================
CREATE TABLE master_kabupaten (
  id SERIAL PRIMARY KEY,
  provinsi_id INTEGER NOT NULL REFERENCES master_provinsi(id),
  nama VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MASTER: KECAMATAN
-- ============================================================
CREATE TABLE master_kecamatan (
  id SERIAL PRIMARY KEY,
  kabupaten_id INTEGER NOT NULL REFERENCES master_kabupaten(id),
  nama VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MASTER: DESA
-- ============================================================
CREATE TABLE master_desa (
  id SERIAL PRIMARY KEY,
  kecamatan_id INTEGER NOT NULL REFERENCES master_kecamatan(id),
  nama VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MASTER: STATUS TANAH
-- ============================================================
CREATE TABLE master_status_tanah (
  id SERIAL PRIMARY KEY,
  kode VARCHAR(10) NOT NULL UNIQUE,
  nama_status VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PPK
-- ============================================================
CREATE TABLE ppk (
  id SERIAL PRIMARY KEY,
  nama_ppk VARCHAR(200) NOT NULL,
  wilayah_kerja VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USERS
-- Role disimpan di sini; Supabase Auth mengelola login session.
-- auth_user_id merujuk ke auth.users.id milik Supabase Auth.
-- ============================================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nama VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('KETUA_PPK', 'PPK')),
  ppk_id INTEGER REFERENCES ppk(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT ppk_required_for_ppk_role CHECK (
    (role = 'PPK' AND ppk_id IS NOT NULL) OR
    (role = 'KETUA_PPK' AND ppk_id IS NULL)
  )
);

-- ============================================================
-- PPK DESA AKTIF
-- PPK hanya bisa input bidang pada desa yang diaktifkan
-- ============================================================
CREATE TABLE ppk_desa_aktif (
  id SERIAL PRIMARY KEY,
  ppk_id INTEGER NOT NULL REFERENCES ppk(id) ON DELETE CASCADE,
  desa_id INTEGER NOT NULL REFERENCES master_desa(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (ppk_id, desa_id)
);

-- ============================================================
-- PROJECT
-- ============================================================
CREATE TABLE project (
  id SERIAL PRIMARY KEY,
  nama_proyek VARCHAR(300) NOT NULL,
  tahun INTEGER NOT NULL,
  deskripsi TEXT,
  ppk_id INTEGER NOT NULL REFERENCES ppk(id) ON DELETE RESTRICT,
  status_proyek VARCHAR(20) NOT NULL DEFAULT 'AKTIF' CHECK (status_proyek IN ('AKTIF', 'SELESAI')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BIDANG (Entity Utama)
-- ============================================================
CREATE TYPE workflow_status_enum AS ENUM (
  'NOMINATIF',
  'PENILAIAN',
  'VALIDASI',
  'SIAP_BAYAR',
  'SUDAH_BAYAR',
  'DIBATALKAN'
);

CREATE TABLE bidang (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE RESTRICT,
  nub VARCHAR(50) NOT NULL,
  nib VARCHAR(100),
  status_tanah_id INTEGER REFERENCES master_status_tanah(id),
  pembebanan VARCHAR(200),
  rencana_pembangunan VARCHAR(200),
  keterangan TEXT,
  workflow_status workflow_status_enum NOT NULL DEFAULT 'NOMINATIF',
  provinsi_id INTEGER REFERENCES master_provinsi(id),
  kabupaten_id INTEGER REFERENCES master_kabupaten(id),
  kecamatan_id INTEGER REFERENCES master_kecamatan(id),
  desa_id INTEGER REFERENCES master_desa(id),
  aktif BOOLEAN NOT NULL DEFAULT TRUE,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- NUB unik dalam satu project (hanya untuk bidang aktif)
  CONSTRAINT uq_nub_per_project UNIQUE (project_id, nub)
);

-- ============================================================
-- BIDANG WORKFLOW HISTORY (Audit Trail)
-- ============================================================
CREATE TABLE bidang_workflow_history (
  id SERIAL PRIMARY KEY,
  bidang_id INTEGER NOT NULL REFERENCES bidang(id) ON DELETE RESTRICT,
  status_lama workflow_status_enum,
  status_baru workflow_status_enum NOT NULL,
  changed_by INTEGER REFERENCES users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  catatan TEXT
);

-- ============================================================
-- BIDANG LUAS
-- ============================================================
CREATE TABLE bidang_luas (
  id SERIAL PRIMARY KEY,
  bidang_id INTEGER NOT NULL UNIQUE REFERENCES bidang(id) ON DELETE CASCADE,
  luas_asal NUMERIC(12, 2) DEFAULT 0,
  luas_terkena NUMERIC(12, 2) DEFAULT 0,
  luas_sisa NUMERIC(12, 2) GENERATED ALWAYS AS (luas_asal - luas_terkena) STORED,
  ruang_atas NUMERIC(12, 2) DEFAULT 0,
  ruang_bawah NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PIHAK (Pemilik / Penggarap)
-- ============================================================
CREATE TABLE pihak (
  id SERIAL PRIMARY KEY,
  bidang_id INTEGER NOT NULL REFERENCES bidang(id) ON DELETE RESTRICT,
  jenis VARCHAR(20) NOT NULL CHECK (jenis IN ('PEMILIK', 'PENGGARAP')),
  nama VARCHAR(200) NOT NULL,
  nik VARCHAR(20),
  tempat_lahir VARCHAR(100),
  tanggal_lahir DATE,
  pekerjaan VARCHAR(100),
  alamat TEXT,
  aktif BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BIDANG OBJEK (Bangunan, Tanaman, Benda Lain)
-- ============================================================
CREATE TABLE bidang_objek (
  id SERIAL PRIMARY KEY,
  bidang_id INTEGER NOT NULL REFERENCES bidang(id) ON DELETE RESTRICT,
  jenis_objek VARCHAR(20) NOT NULL CHECK (jenis_objek IN ('BANGUNAN', 'TANAMAN', 'BENDA_LAIN')),
  deskripsi TEXT,
  nilai_estimasi NUMERIC(15, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BIDANG DOKUMEN (hanya simpan URL, tidak upload file)
-- ============================================================
CREATE TABLE bidang_dokumen (
  id SERIAL PRIMARY KEY,
  bidang_id INTEGER NOT NULL REFERENCES bidang(id) ON DELETE RESTRICT,
  kategori VARCHAR(20) NOT NULL CHECK (kategori IN ('KMZ', 'VALIDASI', 'PEMBAYARAN', 'LAINNYA')),
  url TEXT NOT NULL CHECK (url ~* '^https?://'),
  deskripsi TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- INDEXES (untuk performa query)
-- ============================================================
CREATE INDEX idx_bidang_project_id ON bidang(project_id);
CREATE INDEX idx_bidang_workflow_status ON bidang(workflow_status);
CREATE INDEX idx_bidang_desa_id ON bidang(desa_id);
CREATE INDEX idx_bidang_aktif ON bidang(aktif);
CREATE INDEX idx_project_ppk_id ON project(ppk_id);
CREATE INDEX idx_pihak_bidang_id ON pihak(bidang_id);
CREATE INDEX idx_pihak_aktif ON pihak(aktif);
CREATE INDEX idx_bidang_objek_bidang_id ON bidang_objek(bidang_id);
CREATE INDEX idx_bidang_dokumen_bidang_id ON bidang_dokumen(bidang_id);
CREATE INDEX idx_workflow_history_bidang_id ON bidang_workflow_history(bidang_id);
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_users_ppk_id ON users(ppk_id);
CREATE INDEX idx_ppk_desa_aktif_ppk_id ON ppk_desa_aktif(ppk_id);


-- ============================================================
-- TRIGGER: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_ppk BEFORE UPDATE ON ppk FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_users BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_project BEFORE UPDATE ON project FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_bidang BEFORE UPDATE ON bidang FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_bidang_luas BEFORE UPDATE ON bidang_luas FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_pihak BEFORE UPDATE ON pihak FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_bidang_objek BEFORE UPDATE ON bidang_objek FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- ============================================================
-- TRIGGER: validasi workflow — tidak boleh lompat tahap
-- ============================================================
CREATE OR REPLACE FUNCTION validate_workflow_transition()
RETURNS TRIGGER AS $$
DECLARE
  urutan TEXT[] := ARRAY['NOMINATIF','PENILAIAN','VALIDASI','SIAP_BAYAR','SUDAH_BAYAR'];
  idx_lama INTEGER;
  idx_baru INTEGER;
BEGIN
  -- DIBATALKAN boleh dari status mana pun (kecuali SUDAH_BAYAR)
  IF NEW.workflow_status = 'DIBATALKAN' THEN
    IF OLD.workflow_status = 'SUDAH_BAYAR' THEN
      RAISE EXCEPTION 'Status SUDAH_BAYAR tidak bisa dibatalkan.';
    END IF;
    RETURN NEW;
  END IF;

  -- Tidak bisa keluar dari SUDAH_BAYAR atau DIBATALKAN
  IF OLD.workflow_status = 'SUDAH_BAYAR' THEN
    RAISE EXCEPTION 'Bidang dengan status SUDAH_BAYAR tidak dapat diubah.';
  END IF;
  IF OLD.workflow_status = 'DIBATALKAN' THEN
    RAISE EXCEPTION 'Bidang dengan status DIBATALKAN tidak dapat diubah.';
  END IF;

  -- Harus maju satu langkah
  idx_lama := array_position(urutan, OLD.workflow_status::TEXT);
  idx_baru := array_position(urutan, NEW.workflow_status::TEXT);

  IF idx_baru != idx_lama + 1 THEN
    RAISE EXCEPTION 'Transisi workflow tidak valid: % → %. Hanya boleh maju satu tahap.',
      OLD.workflow_status, NEW.workflow_status;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_workflow_transition
  BEFORE UPDATE OF workflow_status ON bidang
  FOR EACH ROW
  WHEN (OLD.workflow_status IS DISTINCT FROM NEW.workflow_status)
  EXECUTE FUNCTION validate_workflow_transition();


-- ============================================================
-- TRIGGER: auto-insert ke bidang_workflow_history saat status berubah
-- ============================================================
CREATE OR REPLACE FUNCTION log_workflow_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO bidang_workflow_history (bidang_id, status_lama, status_baru, changed_by, changed_at, catatan)
  VALUES (NEW.id, OLD.workflow_status, NEW.workflow_status, NEW.created_by, NOW(), 'Auto-logged by system');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_log_workflow
  AFTER UPDATE OF workflow_status ON bidang
  FOR EACH ROW
  WHEN (OLD.workflow_status IS DISTINCT FROM NEW.workflow_status)
  EXECUTE FUNCTION log_workflow_change();


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Supabase menggunakan RLS untuk enforce role-based access
-- ============================================================
ALTER TABLE ppk ENABLE ROW LEVEL SECURITY;
ALTER TABLE project ENABLE ROW LEVEL SECURITY;
ALTER TABLE bidang ENABLE ROW LEVEL SECURITY;
ALTER TABLE bidang_luas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pihak ENABLE ROW LEVEL SECURITY;
ALTER TABLE bidang_objek ENABLE ROW LEVEL SECURITY;
ALTER TABLE bidang_dokumen ENABLE ROW LEVEL SECURITY;
ALTER TABLE bidang_workflow_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppk_desa_aktif ENABLE ROW LEVEL SECURITY;

-- Helper function: ambil role user yang sedang login
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM users WHERE auth_user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: ambil ppk_id user yang sedang login
CREATE OR REPLACE FUNCTION get_my_ppk_id()
RETURNS INTEGER AS $$
  SELECT ppk_id FROM users WHERE auth_user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---- PPK ----
CREATE POLICY "KETUA_PPK bisa lihat semua PPK"
  ON ppk FOR SELECT
  USING (get_my_role() = 'KETUA_PPK');

CREATE POLICY "PPK hanya bisa lihat PPK miliknya"
  ON ppk FOR SELECT
  USING (get_my_role() = 'PPK' AND id = get_my_ppk_id());

-- ---- PROJECT ----
CREATE POLICY "KETUA_PPK bisa lihat semua project"
  ON project FOR SELECT
  USING (get_my_role() = 'KETUA_PPK');

CREATE POLICY "PPK hanya bisa lihat project miliknya"
  ON project FOR SELECT
  USING (get_my_role() = 'PPK' AND ppk_id = get_my_ppk_id());

CREATE POLICY "PPK bisa buat project untuk PPK-nya"
  ON project FOR INSERT
  WITH CHECK (get_my_role() = 'PPK' AND ppk_id = get_my_ppk_id());

CREATE POLICY "PPK bisa update project miliknya"
  ON project FOR UPDATE
  USING (get_my_role() = 'PPK' AND ppk_id = get_my_ppk_id());

-- ---- BIDANG ----
CREATE POLICY "KETUA_PPK bisa lihat semua bidang"
  ON bidang FOR SELECT
  USING (get_my_role() = 'KETUA_PPK');

CREATE POLICY "PPK hanya bisa lihat bidang di proyeknya"
  ON bidang FOR SELECT
  USING (
    get_my_role() = 'PPK' AND
    project_id IN (SELECT id FROM project WHERE ppk_id = get_my_ppk_id())
  );

CREATE POLICY "PPK bisa tambah bidang di proyeknya"
  ON bidang FOR INSERT
  WITH CHECK (
    get_my_role() = 'PPK' AND
    project_id IN (SELECT id FROM project WHERE ppk_id = get_my_ppk_id())
  );

CREATE POLICY "PPK bisa update bidang di proyeknya"
  ON bidang FOR UPDATE
  USING (
    get_my_role() = 'PPK' AND
    project_id IN (SELECT id FROM project WHERE ppk_id = get_my_ppk_id())
  );

-- ---- BIDANG_LUAS ----
CREATE POLICY "KETUA_PPK bisa lihat semua luas"
  ON bidang_luas FOR SELECT
  USING (get_my_role() = 'KETUA_PPK');

CREATE POLICY "PPK hanya bisa lihat luas bidangnya"
  ON bidang_luas FOR SELECT
  USING (
    get_my_role() = 'PPK' AND
    bidang_id IN (
      SELECT b.id FROM bidang b
      JOIN project p ON b.project_id = p.id
      WHERE p.ppk_id = get_my_ppk_id()
    )
  );

CREATE POLICY "PPK bisa insert/update luas bidangnya"
  ON bidang_luas FOR ALL
  USING (
    get_my_role() = 'PPK' AND
    bidang_id IN (
      SELECT b.id FROM bidang b
      JOIN project p ON b.project_id = p.id
      WHERE p.ppk_id = get_my_ppk_id()
    )
  );

-- ---- PIHAK ----
CREATE POLICY "KETUA_PPK bisa lihat semua pihak"
  ON pihak FOR SELECT USING (get_my_role() = 'KETUA_PPK');

CREATE POLICY "PPK akses pihak bidangnya"
  ON pihak FOR ALL
  USING (
    bidang_id IN (
      SELECT b.id FROM bidang b
      JOIN project p ON b.project_id = p.id
      WHERE p.ppk_id = get_my_ppk_id()
    )
  );

-- ---- BIDANG_OBJEK ----
CREATE POLICY "KETUA_PPK bisa lihat semua objek"
  ON bidang_objek FOR SELECT USING (get_my_role() = 'KETUA_PPK');

CREATE POLICY "PPK akses objek bidangnya"
  ON bidang_objek FOR ALL
  USING (
    bidang_id IN (
      SELECT b.id FROM bidang b
      JOIN project p ON b.project_id = p.id
      WHERE p.ppk_id = get_my_ppk_id()
    )
  );

-- ---- BIDANG_DOKUMEN ----
CREATE POLICY "KETUA_PPK bisa lihat semua dokumen"
  ON bidang_dokumen FOR SELECT USING (get_my_role() = 'KETUA_PPK');

CREATE POLICY "PPK akses dokumen bidangnya"
  ON bidang_dokumen FOR ALL
  USING (
    bidang_id IN (
      SELECT b.id FROM bidang b
      JOIN project p ON b.project_id = p.id
      WHERE p.ppk_id = get_my_ppk_id()
    )
  );

-- ---- WORKFLOW HISTORY ----
CREATE POLICY "KETUA_PPK lihat semua history"
  ON bidang_workflow_history FOR SELECT USING (get_my_role() = 'KETUA_PPK');

CREATE POLICY "PPK lihat history bidangnya"
  ON bidang_workflow_history FOR SELECT
  USING (
    bidang_id IN (
      SELECT b.id FROM bidang b
      JOIN project p ON b.project_id = p.id
      WHERE p.ppk_id = get_my_ppk_id()
    )
  );

-- ---- USERS ----
CREATE POLICY "User bisa lihat profilnya sendiri"
  ON users FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "KETUA_PPK bisa lihat semua user"
  ON users FOR SELECT USING (get_my_role() = 'KETUA_PPK');

-- ---- PPK_DESA_AKTIF ----
CREATE POLICY "KETUA_PPK lihat semua desa aktif"
  ON ppk_desa_aktif FOR SELECT USING (get_my_role() = 'KETUA_PPK');

CREATE POLICY "PPK lihat desa aktif miliknya"
  ON ppk_desa_aktif FOR SELECT
  USING (ppk_id = get_my_ppk_id());

-- Master tables: semua user bisa baca (read-only untuk PPK)
CREATE POLICY "Semua user bisa baca master wilayah - provinsi"
  ON master_provinsi FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Semua user bisa baca master wilayah - kabupaten"
  ON master_kabupaten FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Semua user bisa baca master wilayah - kecamatan"
  ON master_kecamatan FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Semua user bisa baca master wilayah - desa"
  ON master_desa FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Semua user bisa baca master status tanah"
  ON master_status_tanah FOR SELECT USING (auth.role() = 'authenticated');

-- KETUA_PPK bisa insert/update master
CREATE POLICY "KETUA_PPK bisa kelola master status tanah"
  ON master_status_tanah FOR ALL USING (get_my_role() = 'KETUA_PPK');


-- ============================================================
-- SEED DATA: Master Status Tanah
-- ============================================================
INSERT INTO master_status_tanah (kode, nama_status) VALUES
  ('THL', 'Tanah Hak Lainnya'),
  ('HM',  'Hak Milik'),
  ('HGB', 'Hak Guna Bangunan'),
  ('HGU', 'Hak Guna Usaha');


-- ============================================================
-- SEED DATA: Wilayah (contoh, tambahkan sesuai kebutuhan)
-- ============================================================
INSERT INTO master_provinsi (nama) VALUES
  ('Jawa Tengah'),
  ('Jawa Barat'),
  ('DI Yogyakarta'),
  ('Jawa Timur'),
  ('DKI Jakarta');

INSERT INTO master_kabupaten (provinsi_id, nama) VALUES
  (1, 'Kab. Semarang'),
  (1, 'Kab. Boyolali'),
  (1, 'Kota Semarang'),
  (2, 'Kab. Bogor'),
  (2, 'Kota Bogor'),
  (3, 'Kab. Sleman'),
  (3, 'Kab. Bantul');

INSERT INTO master_kecamatan (kabupaten_id, nama) VALUES
  (1, 'Bergas'),
  (1, 'Pringapus'),
  (1, 'Ungaran Barat'),
  (2, 'Ampel'),
  (4, 'Caringin'),
  (6, 'Depok'),
  (6, 'Mlati');

INSERT INTO master_desa (kecamatan_id, nama) VALUES
  (1, 'Ds. Bergas Lor'),
  (1, 'Ds. Bergas Kidul'),
  (1, 'Ds. Wringinputih'),
  (2, 'Ds. Pringapus'),
  (3, 'Ds. Ungaran'),
  (5, 'Ds. Caringin'),
  (6, 'Ds. Maguwoharjo'),
  (6, 'Ds. Condongcatur'),
  (7, 'Ds. Sendangadi');


-- ============================================================
-- SEED DATA: PPK (sesuaikan dengan data nyata)
-- ============================================================
INSERT INTO ppk (nama_ppk, wilayah_kerja) VALUES
  ('PPK Jalan Tol Trans Jawa', 'Jawa Tengah & DIY'),
  ('PPK Bendungan Ciawi', 'Jawa Barat');

-- PPK 1 aktif di desa 1,2,3,4
INSERT INTO ppk_desa_aktif (ppk_id, desa_id) VALUES (1,1),(1,2),(1,3),(1,4);
-- PPK 2 aktif di desa 6
INSERT INTO ppk_desa_aktif (ppk_id, desa_id) VALUES (2,6);


-- ============================================================
-- CATATAN PENTING:
-- Setelah menjalankan SQL ini, lakukan langkah berikut:
--
-- 1. Di Supabase Dashboard → Authentication → Users:
--    Buat user baru (email + password) untuk setiap pengguna.
--
-- 2. Setelah user dibuat, insert ke tabel 'users' dengan
--    mengisi auth_user_id dari UUID yang diberikan Supabase Auth:
--
--    INSERT INTO users (auth_user_id, nama, email, role, ppk_id) VALUES
--      ('uuid-dari-supabase-auth', 'Ir. Budi Santoso', 'ketua@ppk.go.id', 'KETUA_PPK', NULL),
--      ('uuid-dari-supabase-auth', 'Drs. Ahmad Fauzi', 'ppk1@ppk.go.id', 'PPK', 1),
--      ('uuid-dari-supabase-auth', 'Sri Wahyuni', 'ppk2@ppk.go.id', 'PPK', 2);
--
-- 3. Lanjut ke tahap backend (Node.js/Express) atau langsung
--    gunakan Supabase JS client di frontend React.
-- ============================================================
