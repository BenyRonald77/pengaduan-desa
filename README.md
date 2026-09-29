# Pengaduan Masyarakat Desa

Kanal pengaduan warga desa yang transparan: warga melapor dengan foto dan
titik lokasi, mendapat kode tiket untuk memantau status, aparat
mendisposisikan ke petugas bidang, dan batas waktu respons tercatat dengan
deteksi keterlambatan otomatis.

## Cara Menjalankan

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

## Halaman

- `/` — Formulir pengaduan (nama, kategori, judul, deskripsi, lat/lng, foto)
- `/lacak` — Lacak laporan via kode tiket, lengkap dengan riwayat status
- `/publik` — Daftar laporan publik (identitas pelapor disamarkan)
- `/admin` — Dashboard: statistik, disposisi laporan baru, update status
- `/petugas` — Data petugas (tambah + daftar)

## API

- `GET/POST /api/petugas` — daftar (+filter `?kategori`) / tambah petugas
- `GET /api/laporan` — daftar admin (+filter `?status`, `?kategori`)
- `POST /api/laporan` — kirim laporan (multipart: foto + lat/lng)
- `POST /api/laporan/[id]/disposisi` — disposisikan ke petugas
- `PATCH /api/laporan/[id]/status` — selesai / ditolak
- `GET /api/uploads/[nama]` — berkas foto
- `GET /api/publik/lacak/[kode]` — lacak tiket (publik)
- `GET /api/publik/laporan` — daftar publik (publik)
- `GET /api/publik/statistik` — statistik + keterlambatan

## Aturan Bisnis

- Kode tiket unik format `ADU-YYYYMMDD-XXXX`.
- Deadline respons = dibuat + 3 hari.
- Disposisi: status `baru` → `diproses`, mencatat waktu tanggapan; jika
  melewati deadline ditandai `terlambat`.
- Penyelesaian membutuhkan catatan; penolakan wajib alasan.
- Identitas pelapor disamarkan di endpoint publik (`A***`).
