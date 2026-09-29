import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, publikOut } from "@/lib/aduan";

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status");
    const rows = await prisma.laporan.findMany({
      where: status ? { status } : undefined,
      include: { petugas: true },
      orderBy: { dibuatPada: "desc" },
      take: 100,
    });
    return NextResponse.json(rows.map(publikOut));
  } catch (e) {
    return apiError(e);
  }
}
