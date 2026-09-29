import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { KATEGORI, STATUS_LIST } from "./kategori";

export { KATEGORI, STATUS_LIST };
export const BATAS_HARI = 3;
export const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp"];

const pad = (n: number) => String(n).padStart(2, "0");

/** Waktu lokal ISO dengan detik, sama seperti Python isoformat(timespec="seconds"). */
export function nowIso(d = new Date()): string {
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}

/** YYYYMMDD untuk kode tiket. */
export function ymd(d = new Date()): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

/** Deadline respons = dibuat + 3 hari. */
export function deadlineIso(dibuat: Date): string {
  return nowIso(new Date(dibuat.getTime() + BATAS_HARI * 86400_000));
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function apiError(e: unknown) {
  if (e instanceof ApiError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2025") {
      return NextResponse.json({ error: "data tidak ditemukan" }, { status: 404 });
    }
    if (e.code === "P2002") {
      return NextResponse.json({ error: "data duplikat" }, { status: 400 });
    }
    if (e.code === "P2003") {
      return NextResponse.json({ error: "referensi tidak valid" }, { status: 400 });
    }
  }
  console.error(e);
  return NextResponse.json({ error: "kesalahan server" }, { status: 500 });
}

/** Konversi row Prisma ke kunci snake_case seperti versi Python. */
export function laporanOut(l: any) {
  const r: Record<string, any> = {
    id: l.id,
    kode_tiket: l.kodeTiket,
    nama_pelapor: l.namaPelapor,
    kategori: l.kategori,
    judul: l.judul,
    deskripsi: l.deskripsi,
    foto: l.foto,
    lat: l.lat,
    lng: l.lng,
    status: l.status,
    petugas_id: l.petugasId,
    dibuat_pada: l.dibuatPada,
    deadline_respons: l.deadlineRespons,
    ditanggapi_pada: l.ditanggapiPada,
    catatan_penyelesaian: l.catatanPenyelesaian,
    nama_petugas: l.petugas?.nama ?? null,
    petugas_kategori: l.petugas?.kategori ?? null,
  };
  r.terlambat = Boolean(
    r.ditanggapi_pada && r.ditanggapi_pada > r.deadline_respons
  );
  return r;
}

/** Versi publik: identitas pelapor disamarkan. */
export function publikOut(l: any) {
  const r = laporanOut(l);
  const nama = (r.nama_pelapor ?? "") as string;
  delete r.nama_pelapor;
  r.pelapor = nama ? nama[0] + "***" : "***";
  return r;
}
