import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, nowIso } from "@/lib/aduan";

export async function GET() {
  try {
    const [perStatus, perKategori] = await Promise.all([
      prisma.laporan.groupBy({ by: ["status"], _count: true }),
      prisma.laporan.groupBy({ by: ["kategori"], _count: true }),
    ]);
    const tanggapanRows = await prisma.laporan.findMany({
      where: { ditanggapiPada: { not: null } },
      select: { ditanggapiPada: true, deadlineRespons: true },
    });
    const tanggapanTerlambat = tanggapanRows.filter(
      (r) => r.ditanggapiPada! > r.deadlineRespons
    ).length;
    const belumDitanggapi = await prisma.laporan.count({
      where: { ditanggapiPada: null, deadlineRespons: { lt: nowIso() } },
    });
    return NextResponse.json({
      per_status: perStatus.map((x) => ({ status: x.status, jumlah: x._count })),
      per_kategori: perKategori.map((x) => ({
        kategori: x.kategori,
        jumlah: x._count,
      })),
      tanggapan_terlambat: tanggapanTerlambat,
      melewati_deadline_belum_ditanggapi: belumDitanggapi,
    });
  } catch (e) {
    return apiError(e);
  }
}
