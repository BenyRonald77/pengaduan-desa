"use client";

import { useState } from "react";

export default function LacakPage() {
  const [kode, setKode] = useState("");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  async function cari(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setData(null);
    const r = await fetch(
      "/api/publik/lacak/" + encodeURIComponent(kode.trim().toUpperCase())
    );
    const d = await r.json();
    if (!r.ok) {
      setError(d.error ?? "gagal");
      return;
    }
    setData(d);
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Lacak Laporan</h2>
      <form onSubmit={cari} className="card flex gap-2">
        <input
          value={kode}
          onChange={(e) => setKode(e.target.value)}
          placeholder="Kode tiket (contoh ADU-20260929-1234)"
          required
        />
        <button className="w-auto">Lacak</button>
      </form>
      {error && (
        <p className="mt-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {data && (
        <div className="card mt-4">
          <h3 className="text-lg font-bold">{data.judul}</h3>
          <p className="text-sm text-slate-600">
            <b>{data.kode_tiket}</b> · {data.kategori} ·{" "}
            <span className={`badge ${data.status}`}>{data.status}</span>{" "}
            {data.terlambat && <span className="badge telat">respons terlambat</span>}
          </p>
          <p className="mt-2 text-sm">{data.deskripsi}</p>
          {data.foto && (
            <img
              src={`/api/uploads/${data.foto}`}
              alt="foto laporan"
              className="mt-2 max-h-64 rounded"
            />
          )}
          {data.lat != null && (
            <p className="mt-2 text-sm">
              Lokasi: {data.lat}, {data.lng}
            </p>
          )}
          <p className="mt-2 text-sm">
            Pelapor: {data.pelapor} · Dilapor: {data.dibuat_pada}
          </p>
          {data.nama_petugas && <p className="text-sm">Ditangani: {data.nama_petugas}</p>}
          {data.catatan_penyelesaian && (
            <p className="text-sm">
              <b>Penyelesaian:</b> {data.catatan_penyelesaian}
            </p>
          )}
          <h4 className="mt-3 font-semibold">Riwayat</h4>
          <ul className="list-disc pl-5 text-sm">
            {data.riwayat.map((x: any, i: number) => (
              <li key={i}>
                {x.waktu} — {x.status}
                {x.catatan ? `: ${x.catatan}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
