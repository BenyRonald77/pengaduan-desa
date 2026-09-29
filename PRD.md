# PRD — Pengaduan Masyarakat Desa

Warga melapor dengan foto dan titik lokasi di peta, laporan didisposisikan
ke petugas yang tepat, status bisa dipantau publik, dan batas waktu respons
tercatat (keterlambatan terdeteksi otomatis).

## Tujuan

Kantor desa punya kanal pengaduan yang transparan: warga cukup isi form
(+foto + titik peta), dapat kode tiket untuk memantau, aparat disposisikan
ke petugas bidang, dan setiap laporan punya deadline respons.

## Stack

- Backend: Next.js 14 + TypeScript, Prisma 5 + SQLite
- Upload foto: multipart, disimpan di `public/uploads/`
- Frontend: Next.js App Router + React + Tailwind CSS. Titik lokasi dimasukkan
  sebagai koordinat lat/lng (input teks, tanpa dependency peta eksternal).

## Model Data

- `petugas`: id, nama, kategori (bidang), telepon
- `laporan`: id, kode_tiket (unik, format `ADU-YYYYMMDD-XXXX`), nama_pelapor,
  kategori, judul, deskripsi, foto, lat, lng, status
  (`baru`/`diproses`/`selesai`/`ditolak`), petugas_id, dibuat_pada,
  deadline_respons, ditanggapi_pada, catatan_penyelesaian
- `status_log`: id, laporan_id, status, waktu, catatan

## Aturan Bisnis

1. Setiap laporan mendapat kode tiket unik saat dibuat.
2. Deadline respons = dibuat_pada + 3 hari (bisa diubah admin).
3. Disposisi = laporan `baru` diberi petugas → status `diproses`,
   `ditanggapi_pada` dicatat. Kalau ditanggapi melewati deadline,
   ditandai `terlambat: true`.
4. Penyelesaian: petugas memberi catatan penyelesaian → status `selesai`;
   bisa juga `ditolak` dengan alasan.
5. Status publik hanya menampilkan: kode, kategori, judul, status, waktu,
   nama petugas, dan keterlambatan — identitas pelapor disamarkan.
6. Setiap perubahan status tercatat di `status_log`.

## Tahap Pengerjaan

- **F0 — Fondasi**: PRD, README, struktur, requirements, .gitignore.
- **F1 — Database + API inti**: schema, seed, CRUD petugas, submit laporan
  dengan foto + lat/lng, kode tiket otomatis, deadline otomatis.
- **F2 — Alur kerja**: disposisi ke petugas (deteksi terlambat), update
  status + log, lacak publik per kode tiket, statistik keterlambatan.
- **F3 — UI**: halaman lapor publik, lacak tiket, dashboard admin
  (disposisi, update status).

## Kriteria Selesai

- [ ] Laporan bisa dibuat dengan foto dan koordinat
- [ ] Disposisi mengubah status dan mencatat waktu tanggapan
- [ ] Keterlambatan respons terdeteksi
- [ ] Status bisa dipantau publik via kode tiket
- [ ] `pip install -r requirements.txt && python app.py` langsung jalan

## Non-tujuan

- Login warga/SSO, notifikasi WhatsApp, integrasi GIS lanjutan.
