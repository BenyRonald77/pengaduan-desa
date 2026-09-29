import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, apiError, publikOut } from "@/lib/aduan";

export async function GET(
  _req: NextRequest,
  { params }: { params: { kode: string } }
) {
  try {
    const kode = decodeURIComponent(params.kode).toUpperCase();
    const r = await prisma.laporan.findUnique({
      where: { kodeTiket: kode },
      include: { petugas: true, logs: { orderBy: { waktu: "asc" } } },
    });
    if (!r) throw new ApiError(404, "kode tiket tidak ditemukan");
    const out = publikOut(r);
    out.riwayat = r.logs.map((x) => ({
      status: x.status,
      waktu: x.waktu,
      catatan: x.catatan,
    }));
    return NextResponse.json(out);
  } catch (e) {
    return apiError(e);
  }
}
