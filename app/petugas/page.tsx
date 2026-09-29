"use client";

import { useEffect, useState } from "react";
import { KATEGORI } from "@/lib/kategori";

export default function PetugasPage() {
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ nama: "", kategori: "", telepon: "" });
  const [error, setError] = useState("");

  async function load() {
    const r = await fetch("/api/petugas");
    setList(await r.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function tambah(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const r = await fetch("/api/petugas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!r.ok) {
      setError((await r.json()).error);
      return;
    }
    setForm({ nama: "", kategori: "", telepon: "" });
    load();
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Data Petugas</h2>
      <form onSubmit={tambah} className="card mb-6 flex flex-col gap-3 max-w-xl">
        <input
          value={form.nama}
          onChange={(e) => setForm({ ...form, nama: e.target.value })}
          placeholder="Nama petugas"
          required
        />
        <select
          value={form.kategori}
          onChange={(e) => setForm({ ...form, kategori: e.target.value })}
          required
        >
          <option value="" disabled>
            Pilih kategori
          </option>
          {KATEGORI.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <input
          value={form.telepon}
          onChange={(e) => setForm({ ...form, telepon: e.target.value })}
          placeholder="Telepon"
        />
        <button className="w-fit">Tambah Petugas</button>
      </form>
      {error && (
        <p className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <table className="data">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama</th>
            <th>Kategori</th>
            <th>Telepon</th>
          </tr>
        </thead>
        <tbody>
          {list.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nama}</td>
              <td>{p.kategori}</td>
              <td>{p.telepon ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
