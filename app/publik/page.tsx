"use client";

import { useEffect, useState } from "react";
import { STATUS_LIST } from "@/lib/kategori";

export default function PublikPage() {
  const [filter, setFilter] = useState("");
  const [list, setList] = useState<any[]>([]);

  async function load() {
    const r = await fetch(
      "/api/publik/laporan" + (filter ? "?status=" + filter : "")
    );
    setList(await r.json());
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Daftar Laporan Publik</h2>
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-4 max-w-xs"
      >
        <option value="">Semua status</option>
        {STATUS_LIST.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((d) => (
          <div key={d.kode_tiket} className="card">
            <h4 className="font-bold">{d.judul}</h4>
            <p className="text-sm text-slate-600">
              <b>{d.kode_tiket}</b> · {d.kategori} ·{" "}
              <span className={`badge ${d.status}`}>{d.status}</span>{" "}
              {d.terlambat && <span className="badge telat">terlambat</span>}
            </p>
            {d.foto && (
              <img
                src={`/api/uploads/${d.foto}`}
                alt="foto laporan"
                className="mt-2 max-h-48 rounded"
              />
            )}
            <p className="mt-2 text-sm">{String(d.deskripsi).slice(0, 120)}…</p>
            <p className="mt-1 text-sm text-slate-500">
              Pelapor: {d.pelapor} · {d.dibuat_pada}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
