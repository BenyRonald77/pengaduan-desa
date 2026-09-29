# Pengaduan Masyarakat Desa

Warga melapor dengan foto dan titik lokasi, disposisi ke petugas, status
terpantau publik, dan batas waktu respons tercatat.

## Cara Menjalankan

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Buka http://localhost:5003. Database dan folder upload dibuat otomatis
dan di-seed saat pertama dijalankan.

## Struktur

```
├── PRD.md
├── requirements.txt
├── app.py
├── aduan/
│   ├── __init__.py
│   ├── db.py
│   ├── schema.sql
│   ├── seed.sql
│   ├── api.py      # petugas + laporan + disposisi + status
│   └── publik.py   # endpoint lacak & statistik publik
├── static/
└── templates/
```
