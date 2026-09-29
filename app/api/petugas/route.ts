import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, apiError } from "@/lib/aduan";

export async function GET(req: NextRequest) {
  try {
    const kategori = req.nextUrl.searchParams.get("kategori");
    const rows = await prisma.petugas.findMany({
      where: kategori ? { kategori } : undefined,
      orderBy: { nama: "asc" },
    });
    return NextResponse.json(rows);
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json().catch(() => null);
    if (!data?.nama || !data?.kategori) {
      throw new ApiError(400, "nama dan kategori wajib");
    }
    const created = await prisma.petugas.create({
      data: { nama: data.nama, kategori: data.kategori, telepon: data.telepon ?? null },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
