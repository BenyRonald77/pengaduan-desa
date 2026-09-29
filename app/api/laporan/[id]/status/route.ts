import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, apiError, laporanOut, nowIso } from "@/lib/aduan";

/** Selesaikan atau tolak laporan yang sedang diproses. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const data = await req.json().catch(() => null);
    const status = data?.status;
    if (status !== "selesai" && status !== "ditolak") {
      throw new ApiError(400, "status harus selesai atau ditolak");
    }
    const catatan: string = data?.catatan ?? "";
    if (status === "ditolak" && !catatan) {
      throw new ApiError(400, "alasan penolakan wajib diisi");
    }
    const r = await prisma.laporan.findUnique({ where: { id } });
    if (!r) throw new ApiError(404, "laporan tidak ditemukan");
    if (r.status !== "diproses") {
      throw new ApiError(409, `sudah berstatus ${r.status}`);
    }
    const waktu = nowIso();
    const updated = await prisma.laporan.update({
      where: { id },
      data: {
        status,
        catatanPenyelesaian: catatan,
        logs: { create: [{ status, waktu, catatan }] },
      },
      include: { petugas: true },
    });
    return NextResponse.json(laporanOut(updated));
  } catch (e) {
    return apiError(e);
  }
}
