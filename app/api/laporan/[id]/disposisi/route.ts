import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, apiError, laporanOut, nowIso } from "@/lib/aduan";

/** Disposisikan laporan baru ke petugas → status diproses. */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const data = await req.json().catch(() => null);
    if (!data?.petugas_id) throw new ApiError(400, "petugas_id wajib");
    const r = await prisma.laporan.findUnique({ where: { id } });
    if (!r) throw new ApiError(404, "laporan tidak ditemukan");
    if (r.status !== "baru") {
      throw new ApiError(409, `sudah berstatus ${r.status}`);
    }
    const p = await prisma.petugas.findUnique({ where: { id: Number(data.petugas_id) } });
    if (!p) throw new ApiError(404, "petugas tidak ditemukan");
    const waktu = nowIso();
    const updated = await prisma.laporan.update({
      where: { id },
      data: {
        status: "diproses",
        petugasId: p.id,
        ditanggapiPada: waktu,
        logs: {
          create: [{ status: "diproses", waktu, catatan: `Didisposisikan ke ${p.nama}` }],
        },
      },
      include: { petugas: true },
    });
    return NextResponse.json(laporanOut(updated));
  } catch (e) {
    return apiError(e);
  }
}
