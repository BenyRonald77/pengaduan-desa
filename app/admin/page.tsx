"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [stat, setStat] = useState<any>(null);
  const [petugas, setPetugas] = useState<any[]>([]);
  const [baru, setBaru] = useState<any[]>([]);
  const [diproses, setDiproses] = useState<any[]>([]);
  const [pilihPetugas, setPilihPetugas] = useState<Record<number, string>>({});
  const [catatan, setCatatan] = useState<Record<number, string>>({});

  async function load() {
    const [s, p, b, dp] = await Promise.all([
      fetch("/api/publik/statistik").then((r) => r.json()),
      fetch("/api/petugas").then((r) => r.json()),
      fetch("/api/laporan?status=baru").then((r) => r.json()),
      fetch("/api/laporan?status=diproses").then((r) => r.json()),
    ]);
    setStat(s);
    setPetugas(p);
    setBaru(b);
    setDiproses(dp);
  }

  useEffect(() => {
    load();
  }, []);

  async function disposisi(id: number) {
    const petugas_id = Number(pilihPetugas[id]);
    const r = await fetch(`/api/laporan/${id}/disposisi`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ petugas_id }),
    });
    if (r.ok) load();
    else alert((await r.json()).error);
  }

  async function setStatus(id: number, status: string) {
    const r = await fetch(`/api/laporan/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, catatan: catatan[id] ?? "" }),
    });
    if (r.ok) load();
    else alert((await r.json()).error);
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Dashboard Admin</h2>
      {stat && (
        <div className="grid gap-3 md:grid-cols-4 mb-6">
          {stat.per_status.map((x: any) => (
            <div key={x.status} className="card">
              <h4 className="font-semibold">{x.status}</h4>
              <p>
                <b>{x.jumlah}</b> laporan
              </p>
            </div>
          ))}
          <div className="card">
            <h4 className="font-semibold">Tanggapan terlambat</h4>
            <p>
              <b className="text-red-600">{stat.tanggapan_terlambat}</b>
            </p>
          </div>
          <div className="card">
            <h4 className="font-semibold">Lewat deadline, belum ditanggapi</h4>
            <p>
              <b className="text-red-600">
                {stat.melewati_deadline_belum_ditanggapi}
              </b>
            </p>
          </div>
        </div>
      )}

      <h3 className="text-lg font-bold mb-2">Disposisi Laporan Baru</h3>
      <table className="data mb-6">
        <thead>
          <tr>
            <th>Kode</th>
            <th>Kategori</th>
            <th>Judul</th>
            <th>Dibuat</th>
            <th>Deadline</th>
            <th>Petugas</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {baru.map((l) => (
            <tr key={l.id}>
              <td>{l.kode_tiket}</td>
              <td>{l.kategori}</td>
              <td>{l.judul}</td>
              <td>{l.dibuat_pada}</td>
              <td>{l.deadline_respons}</td>
              <td>
                <select
                  value={pilihPetugas[l.id] ?? ""}
                  onChange={(e) =>
                    setPilihPetugas({ ...pilihPetugas, [l.id]: e.target.value })
                  }
                >
                  <option value="" disabled>
                    pilih
                  </option>
                  {petugas
                    .filter((p) => p.kategori === l.kategori)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nama}
                      </option>
                    ))}
                </select>
              </td>
              <td>
                <button onClick={() => disposisi(l.id)}>Disposisikan</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-lg font-bold mb-2">Diproses</h3>
      <table className="data">
        <thead>
          <tr>
            <th>Kode</th>
            <th>Judul</th>
            <th>Petugas</th>
            <th>Terlambat</th>
            <th>Catatan</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {diproses.map((l) => (
            <tr key={l.id}>
              <td>{l.kode_tiket}</td>
              <td>{l.judul}</td>
              <td>{l.nama_petugas}</td>
              <td>{l.terlambat ? <b className="text-red-600">YA</b> : "tidak"}</td>
              <td>
                <input
                  value={catatan[l.id] ?? ""}
                  onChange={(e) =>
                    setCatatan({ ...catatan, [l.id]: e.target.value })
                  }
                  placeholder="catatan penyelesaian/alasan"
                />
              </td>
              <td className="whitespace-nowrap">
                <button onClick={() => setStatus(l.id, "selesai")} className="mr-1">
                  Selesai
                </button>
                <button onClick={() => setStatus(l.id, "ditolak")} className="danger">
                  Tolak
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
