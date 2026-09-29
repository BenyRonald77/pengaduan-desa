"""Endpoint publik: lacak tiket, daftar publik, statistik."""
from flask import Blueprint, jsonify, request

from aduan.api import _publik, _terlambat, _dicts
from aduan.db import get_conn

publik_bp = Blueprint("publik", __name__, url_prefix="/api/publik")


@publik_bp.get("/lacak/<kode>")
def lacak(kode: str):
    conn = get_conn()
    try:
        r = conn.execute(
            """SELECT l.*, p.nama AS nama_petugas FROM laporan l
               LEFT JOIN petugas p ON p.id = l.petugas_id
               WHERE l.kode_tiket = ?""", (kode,)).fetchone()
        if r is None:
            return jsonify({"error": "kode tiket tidak ditemukan"}), 404
        log = _dicts(conn.execute(
            "SELECT status, waktu, catatan FROM status_log"
            " WHERE laporan_id = ? ORDER BY waktu", (r["id"],)))
        out = _publik(dict(r))
        out["riwayat"] = log
        return jsonify(out)
    finally:
        conn.close()


@publik_bp.get("/laporan")
def daftar_publik():
    conn = get_conn()
    try:
        status = request.args.get("status")
        q = ("SELECT l.*, p.nama AS nama_petugas FROM laporan l"
             " LEFT JOIN petugas p ON p.id = l.petugas_id WHERE 1=1")
        vals = []
        if status:
            q += " AND l.status = ?"
            vals.append(status)
        rows = _dicts(conn.execute(q + " ORDER BY l.dibuat_pada DESC LIMIT 100", vals))
        return jsonify([_publik(r) for r in rows])
    finally:
        conn.close()


@publik_bp.get("/statistik")
def statistik():
    conn = get_conn()
    try:
        per_status = _dicts(conn.execute(
            "SELECT status, COUNT(*) AS jumlah FROM laporan GROUP BY status"))
        per_kat = _dicts(conn.execute(
            "SELECT kategori, COUNT(*) AS jumlah FROM laporan GROUP BY kategori"))
        telat = conn.execute(
            "SELECT COUNT(*) FROM laporan"
            " WHERE ditanggapi_pada IS NOT NULL"
            " AND ditanggapi_pada > deadline_respons").fetchone()[0]
        belum = conn.execute(
            "SELECT COUNT(*) FROM laporan"
            " WHERE ditanggapi_pada IS NULL"
            " AND deadline_respons < datetime('now','localtime')").fetchone()[0]
        return jsonify({"per_status": per_status, "per_kategori": per_kat,
                        "tanggapan_terlambat": telat,
                        "melewati_deadline_belum_ditanggapi": belum})
    finally:
        conn.close()
