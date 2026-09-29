"use client";

import { useState } from "react";
import { KATEGORI } from "@/lib/kategori";

export default function LaporPage() {
  const [hasil, setHasil] = useState<any>(null);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setHasil(null);
    const r = await fetch("/api/laporan", {
      method: "POST",
      body: new FormData(e.currentTarget),
    });
    const d = await r.json();
    if (!r.ok) {
      setError(d.error ?? "gagal mengirim");
      return;
    }
    setHasil(d);
    (e.target as HTMLFormElement).reset();
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Formulir Pengaduan</h2>
      <form onSubmit={submit} className="card flex flex-col gap-3">
        <input name="nama_pelapor" placeholder="Nama lengkap" required />
        <select name="kategori" required defaultValue="">
          <option value="" disabled>
            Pilih kategori
          </option>
          {KATEGORI.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <input name="judul" placeholder="Judul laporan" required />
        <textarea
          name="deskripsi"
          placeholder="Deskripsi lengkap kejadian"
          required
          rows={4}
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            name="lat"
            type="number"
            step="any"
            placeholder="Latitude (contoh -7.7956)"
          />
          <input
            name="lng"
            type="number"
            step="any"
            placeholder="Longitude (contoh 110.3695)"
          />
        </div>
        <input name="foto" type="file" accept="image/*" />
        <button>Kirim Laporan</button>
      </form>
      {error && (
        <p className="mt-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {hasil && (
        <div className="alert-ok">
          Laporan diterima! Simpan kode tiket Anda: <b>{hasil.kode_tiket}</b>
          <br />
          Batas respons: {hasil.deadline_respons}
        </div>
      )}
    </div>
  );
}
