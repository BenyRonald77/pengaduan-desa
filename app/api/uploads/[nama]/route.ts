import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { apiError, ApiError } from "@/lib/aduan";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { nama: string } }
) {
  try {
    const nama = path.basename(params.nama);
    const filePath = path.join(UPLOAD_DIR, nama);
    const ext = path.extname(nama).toLowerCase();
    let buf;
    try {
      buf = await fs.readFile(filePath);
    } catch {
      throw new ApiError(404, "file tidak ditemukan");
    }
    return new NextResponse(new Uint8Array(buf), {
      headers: { "Content-Type": MIME[ext] ?? "application/octet-stream" },
    });
  } catch (e) {
    return apiError(e);
  }
}
