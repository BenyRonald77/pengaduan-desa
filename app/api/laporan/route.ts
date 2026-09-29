import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import {
  ALLOWED_EXT,
  ApiError,
  KATEGORI,
  apiError,
  deadlineIso,
  laporanOut,
  nowIso,
  ymd,
} from "@/lib/aduan";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const status = sp.get("status");
    const kategori = sp.get("kategori");
    const rows = await prisma.laporan.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(kategori ? { kategori } : {}),
      },
      include: { petugas: true },
      orderBy: { dibuatPada: "desc" },
    });
    return NextResponse.json(rows.map(laporanOut));
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const get = (k: string) => {
      const v = form.get(k);
      return typeof v === "string" ? v.trim() : "";
    };
    for (const f of ["nama_pelapor", "kategori", "judul", "deskripsi"]) {
      if (!get(f)) throw new ApiError(400, `field wajib: ${f}`);
    }
    const kategori = get("kategori");
    if (!KATEGORI.includes(kategori)) {
      throw new ApiError(400, `kategori harus salah satu: ${KATEGORI.join(", ")}`);
    }
    let lat: number | null = null;
    let lng: number | null = null;
    try {
      if (get("lat")) lat = parseFloat(get("lat"));
      if (get("lng")) lng = parseFloat(get("lng"));
    } catch {
      throw new ApiError(400, "lat/lng harus angka");
    }
    if ((get("lat") && Number.isNaN(lat)) || (get("lng") && Number.isNaN(lng))) {
      throw new ApiError(400, "lat/lng harus angka");
    }

    let namaFile: string | null = null;
    const file = form.get("foto");
    if (file instanceof File && file.size > 0) {
      const ext = path.extname(file.name).toLowerCase();
      if (!ALLOWED_EXT.includes(ext)) {
        throw new ApiError(400, "format foto harus jpg/png/webp");
      }
      namaFile = `${randomBytes(16).toString("hex")}${ext}`;
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      const buf = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(path.join(UPLOAD_DIR, namaFile), buf);
    }

    const dibuat = new Date();
    let kode = `ADU-${ymd(dibuat)}-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`;
    while (await prisma.laporan.findUnique({ where: { kodeTiket: kode } })) {
      kode = `ADU-${ymd(dibuat)}-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`;
    }

    const dibuatIso = nowIso(dibuat);
    const created = await prisma.laporan.create({
      data: {
        kodeTiket: kode,
        namaPelapor: get("nama_pelapor"),
        kategori,
        judul: get("judul"),
        deskripsi: get("deskripsi"),
        foto: namaFile,
        lat,
        lng,
        dibuatPada: dibuatIso,
        deadlineRespons: deadlineIso(dibuat),
        logs: { create: [{ status: "baru", waktu: dibuatIso, catatan: "Laporan diterima" }] },
      },
      include: { petugas: true },
    });
    return NextResponse.json(laporanOut(created), { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
