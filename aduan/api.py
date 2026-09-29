"""CRUD petugas + submit laporan + disposisi + update status."""
import random
import uuid
from datetime import datetime, timedelta
from pathlib import Path

from flask import Blueprint, jsonify, request, send_from_directory
from werkzeug.utils import secure_filename

from aduan.db import UPLOAD_DIR, get_conn

api_bp = Blueprint("api", __name__, url_prefix="/api")

ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".webp"}
KATEGORI = ["infrastruktur", "kesehatan", "pendidikan", "keamanan", "kebersihan"]
STATUS = ["baru", "diproses", "selesai", "ditolak"]
BATAS_HARI = 3

now_iso = lambda: datetime.now().isoformat(timespec="seconds")


def _dicts(cur):
    return [dict(r) for r in cur.fetchall()]


def _laporan_row(conn, lap_id: int):
    return conn.execute(
        """SELECT l.*, p.nama AS nama_petugas, p.kategori AS petugas_kategori
           FROM laporan l LEFT JOIN petugas p ON p.id = l.petugas_id
           WHERE l.id = ?""", (lap_id,)).fetchone()


def _terlambat(r: dict) -> dict:
    r = dict(r)
    r["terlambat"] = bool(
        r["ditanggapi_pada"] and r["ditanggapi_pada"] > r["deadline_respons"])
    return r


def _publik(r: dict) -> dict:
    """Versi publik: identitas pelapor disamarkan."""
    r = _terlambat(r)
    nama = r.pop("nama_pelapor", "")
    r["pelapor"] = (nama[:1] + "***") if nama else "***"
    return r


def _log(conn, lap_id: int, status: str, catatan: str = ""):
    conn.execute("INSERT INTO status_log (laporan_id, status, waktu, catatan)"
                 " VALUES (?, ?, ?, ?)", (lap_id, status, now_iso(), catatan))


# ---------- petugas ----------

@api_bp.get("/petugas")
def list_petugas():
    conn = get_conn()
    try:
        kat = request.args.get("kategori")
        q = "SELECT * FROM petugas"
        vals = []
        if kat:
            q += " WHERE kategori = ?"
            vals.append(kat)
        return jsonify(_dicts(conn.execute(q + " ORDER BY nama", vals)))
    finally:
        conn.close()


@api_bp.post("/petugas")
def create_petugas():
    data = request.get_json(force=True)
    if not data.get("nama") or not data.get("kategori"):
        return jsonify({"error": "nama dan kategori wajib"}), 400
    conn = get_conn()
    try:
        cur = conn.execute(
            "INSERT INTO petugas (nama, kategori, telepon) VALUES (?, ?, ?)",
            (data["nama"], data["kategori"], data.get("telepon")))
        conn.commit()
        return jsonify(dict(conn.execute(
            "SELECT * FROM petugas WHERE id = ?", (cur.lastrowid,)).fetchone())), 201
    finally:
        conn.close()


# ---------- laporan ----------

@api_bp.get("/laporan")
def list_laporan():
    """Versi admin: semua laporan dengan detail."""
    conn = get_conn()
    try:
        status = request.args.get("status")
        kat = request.args.get("kategori")
        q = ("SELECT l.*, p.nama AS nama_petugas FROM laporan l"
             " LEFT JOIN petugas p ON p.id = l.petugas_id WHERE 1=1")
        vals = []
        if status:
            q += " AND l.status = ?"
            vals.append(status)
        if kat:
            q += " AND l.kategori = ?"
            vals.append(kat)
        rows = _dicts(conn.execute(q + " ORDER BY l.dibuat_pada DESC", vals))
        return jsonify([_terlambat(r) for r in rows])
    finally:
        conn.close()


@api_bp.post("/laporan")
def create_laporan():
    form = request.form
    for f in ("nama_pelapor", "kategori", "judul", "deskripsi"):
        if not form.get(f):
            return jsonify({"error": f"field wajib: {f}"}), 400
    if form["kategori"] not in KATEGORI:
        return jsonify({"error": f"kategori harus salah satu: {', '.join(KATEGORI)}"}), 400
    lat = lng = None
    try:
        if form.get("lat"):
            lat = float(form["lat"])
        if form.get("lng"):
            lng = float(form["lng"])
    except ValueError:
        return jsonify({"error": "lat/lng harus angka"}), 400
    nama_file = None
    f = request.files.get("foto")
    if f and f.filename:
        ext = Path(f.filename).suffix.lower()
        if ext not in ALLOWED_EXT:
            return jsonify({"error": "format foto harus jpg/png/webp"}), 400
        nama_file = f"{uuid.uuid4().hex}{ext}"
        f.save(UPLOAD_DIR / secure_filename(nama_file))
    dibuat = datetime.now()
    kode = f"ADU-{dibuat:%Y%m%d}-{random.randint(0, 9999):04d}"
    deadline = (dibuat + timedelta(days=BATAS_HARI)).isoformat(timespec="seconds")
    conn = get_conn()
    try:
        while conn.execute("SELECT id FROM laporan WHERE kode_tiket = ?",
                           (kode,)).fetchone():
            kode = f"ADU-{dibuat:%Y%m%d}-{random.randint(0, 9999):04d}"
        cur = conn.execute(
            """INSERT INTO laporan (kode_tiket, nama_pelapor, kategori, judul,
                                    deskripsi, foto, lat, lng, dibuat_pada,
                                    deadline_respons)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (kode, form["nama_pelapor"], form["kategori"], form["judul"],
             form["deskripsi"], nama_file, lat, lng,
             dibuat.isoformat(timespec="seconds"), deadline))
        _log(conn, cur.lastrowid, "baru", "Laporan diterima")
        conn.commit()
        return jsonify(_terlambat(dict(_laporan_row(conn, cur.lastrowid)))), 201
    finally:
        conn.close()


@api_bp.post("/laporan/<int:lap_id>/disposisi")
def disposisi(lap_id: int):
    """Disposisikan laporan baru ke petugas → status diproses."""
    data = request.get_json(force=True)
    if not data.get("petugas_id"):
        return jsonify({"error": "petugas_id wajib"}), 400
    conn = get_conn()
    try:
        r = conn.execute("SELECT * FROM laporan WHERE id = ?",
                         (lap_id,)).fetchone()
        if r is None:
            return jsonify({"error": "laporan tidak ditemukan"}), 404
        if r["status"] != "baru":
            return jsonify({"error": f"sudah berstatus {r['status']}"}), 409
        p = conn.execute("SELECT * FROM petugas WHERE id = ?",
                         (data["petugas_id"],)).fetchone()
        if p is None:
            return jsonify({"error": "petugas tidak ditemukan"}), 404
        waktu = now_iso()
        conn.execute(
            "UPDATE laporan SET status = 'diproses', petugas_id = ?,"
            " ditanggapi_pada = ? WHERE id = ?",
            (p["id"], waktu, lap_id))
        _log(conn, lap_id, "diproses", f"Didisposisikan ke {p['nama']}")
        conn.commit()
        return jsonify(_terlambat(dict(_laporan_row(conn, lap_id))))
    finally:
        conn.close()


@api_bp.patch("/laporan/<int:lap_id>/status")
def update_status(lap_id: int):
    """Selesaikan atau tolak laporan yang sedang diproses."""
    data = request.get_json(force=True)
    status = data.get("status")
    if status not in ("selesai", "ditolak"):
        return jsonify({"error": "status harus selesai atau ditolak"}), 400
    catatan = data.get("catatan", "")
    if status == "ditolak" and not catatan:
        return jsonify({"error": "alasan penolakan wajib diisi"}), 400
    conn = get_conn()
    try:
        r = conn.execute("SELECT * FROM laporan WHERE id = ?",
                         (lap_id,)).fetchone()
        if r is None:
            return jsonify({"error": "laporan tidak ditemukan"}), 404
        if r["status"] != "diproses":
            return jsonify({"error": f"sudah berstatus {r['status']}"}), 409
        conn.execute("UPDATE laporan SET status = ?, catatan_penyelesaian = ?"
                     " WHERE id = ?", (status, catatan, lap_id))
        _log(conn, lap_id, status, catatan)
        conn.commit()
        return jsonify(_terlambat(dict(_laporan_row(conn, lap_id))))
    finally:
        conn.close()


@api_bp.get("/uploads/<path:nama>")
def serve_upload(nama: str):
    return send_from_directory(UPLOAD_DIR, nama)
