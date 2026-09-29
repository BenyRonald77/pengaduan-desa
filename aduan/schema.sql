CREATE TABLE IF NOT EXISTS petugas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  kategori TEXT NOT NULL,
  telepon TEXT
);

CREATE TABLE IF NOT EXISTS laporan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kode_tiket TEXT NOT NULL UNIQUE,
  nama_pelapor TEXT NOT NULL,
  kategori TEXT NOT NULL,
  judul TEXT NOT NULL,
  deskripsi TEXT NOT NULL,
  foto TEXT,
  lat REAL,
  lng REAL,
  status TEXT NOT NULL DEFAULT 'baru'
    CHECK (status IN ('baru','diproses','selesai','ditolak')),
  petugas_id INTEGER REFERENCES petugas(id),
  dibuat_pada TEXT NOT NULL,
  deadline_respons TEXT NOT NULL,
  ditanggapi_pada TEXT,
  catatan_penyelesaian TEXT
);

CREATE TABLE IF NOT EXISTS status_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  laporan_id INTEGER NOT NULL REFERENCES laporan(id),
  status TEXT NOT NULL,
  waktu TEXT NOT NULL,
  catatan TEXT
);

CREATE INDEX IF NOT EXISTS idx_laporan_status ON laporan(status);
CREATE INDEX IF NOT EXISTS idx_laporan_kode ON laporan(kode_tiket);
CREATE INDEX IF NOT EXISTS idx_log_laporan ON status_log(laporan_id);
