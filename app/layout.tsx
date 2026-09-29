import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pengaduan Masyarakat Desa",
  description: "Kanal pengaduan warga desa yang transparan",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <header className="bg-emerald-700 text-white">
          <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
            <h1 className="text-lg font-bold">Pengaduan Masyarakat Desa</h1>
            <nav className="flex gap-4 text-sm">
              <a href="/" className="hover:underline">Lapor</a>
              <a href="/lacak" className="hover:underline">Lacak</a>
              <a href="/publik" className="hover:underline">Publik</a>
              <a href="/admin" className="hover:underline">Admin</a>
              <a href="/petugas" className="hover:underline">Petugas</a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
