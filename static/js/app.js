function el(id) { return document.getElementById(id); }
async function api(path, opts) {
  const r = await fetch(path, opts);
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || r.statusText);
  return r.json();
}
const KATEGORI = ["infrastruktur", "kesehatan", "pendidikan", "keamanan", "kebersihan"];
const STATUS = ["baru", "diproses", "selesai", "ditolak"];
