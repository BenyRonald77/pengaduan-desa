import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PETUGAS = [
  { nama: "Sdr. Joko Susilo", kategori: "infrastruktur", telepon: "081234567890" },
  { nama: "Sdri. Dewi Lestari", kategori: "kesehatan", telepon: "081234567891" },
  { nama: "Sdr. Ahmad Hidayat", kategori: "pendidikan", telepon: "081234567892" },
  { nama: "Sdr. Budi Santoso", kategori: "keamanan", telepon: "081234567893" },
  { nama: "Sdri. Siti Rahma", kategori: "kebersihan", telepon: "081234567894" },
];

async function main() {
  const n = await prisma.petugas.count();
  if (n > 0) {
    console.log("seed dilewati (sudah ada data)");
    return;
  }
  await prisma.petugas.createMany({ data: PETUGAS });
  console.log(`seed selesai: ${PETUGAS.length} petugas`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
