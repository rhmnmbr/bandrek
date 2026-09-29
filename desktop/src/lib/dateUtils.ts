// ==========================================
// UTILITY TANGGAL DAN JAM BANDREK (ID)
// Minggu dimulai dari Senin per DOMAIN.md & ARCHITECTURE.md
// ==========================================

export const NAMA_BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const NAMA_BULAN_PENDEK = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

export const NAMA_HARI = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
  'Minggu',
];

export const NAMA_HARI_PENDEK = [
  'SEN',
  'SEL',
  'RAB',
  'KAM',
  'JUM',
  'SAB',
  'MIN',
];

export const JAM_AWAL = 7; // 07:00
export const JAM_AKHIR = 18; // 18:00
export const SLOT_PX = 36; // 36px per jam per DESIGN.md §3.4

/**
 * Konversi ISO YYYY-MM-DD ke Date object pada jam 00:00:00 lokal
 */
export function toDate(iso: string): Date {
  const parts = iso.split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

/**
 * Konversi Date object ke format ISO YYYY-MM-DD lokal
 */
export function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Tambah/kurang hari pada tanggal
 */
export function addDays(d: Date, n: number): Date {
  const res = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  res.setDate(res.getDate() + n);
  return res;
}

/**
 * Tambah/kurang bulan pada tanggal
 */
export function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

/**
 * Cari hari Senin pada minggu dari tanggal yang diberikan
 * (Minggu di Indonesia dan Bandrek dimulai hari Senin, indeks 0)
 */
export function getMonday(d: Date): Date {
  const dow = (d.getDay() + 6) % 7; // 0=Senin, ..., 6=Minggu
  return addDays(d, -dow);
}

/**
 * Konversi string waktu HH:mm ke total menit dari 00:00
 */
export function menit(hhmm: string): number {
  if (!hhmm) return 0;
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Format rentang minggu (misal: "14 – 20 Sep 2026" atau "28 Sep – 4 Okt 2026")
 */
export function formatRentangMinggu(mon: Date): string {
  const sun = addDays(mon, 6);
  if (mon.getMonth() === sun.getMonth()) {
    return `${mon.getDate()} – ${sun.getDate()} ${NAMA_BULAN_PENDEK[sun.getMonth()]} ${sun.getFullYear()}`;
  }
  return `${mon.getDate()} ${NAMA_BULAN_PENDEK[mon.getMonth()]} – ${sun.getDate()} ${NAMA_BULAN_PENDEK[sun.getMonth()]} ${sun.getFullYear()}`;
}

/**
 * Format tampilan tanggal harian (misal: "Rabu, 16 September 2026")
 */
export function formatTanggalHari(d: Date): string {
  const dow = (d.getDay() + 6) % 7;
  return `${NAMA_HARI[dow]}, ${d.getDate()} ${NAMA_BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Format tampilan bulan tahun (misal: "September 2026")
 */
export function formatBulanTahun(d: Date): string {
  return `${NAMA_BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Format tampilan tanggal ringkas (misal: "Rab, 16 Sep 2026")
 */
export function formatTanggalRingkas(iso: string): string {
  const d = toDate(iso);
  const dow = (d.getDay() + 6) % 7;
  const h = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'][dow];
  return `${h}, ${d.getDate()} ${NAMA_BULAN_PENDEK[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Format tampilan tanggal pendek tanpa tahun (misal: "Rab, 16 Sep")
 */
export function formatTanggalPendek(iso: string): string {
  if (!iso) return '';
  const d = toDate(iso);
  const dow = (d.getDay() + 6) % 7;
  const h = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'][dow];
  return `${h}, ${d.getDate()} ${NAMA_BULAN_PENDEK[d.getMonth()]}`;
}

/**
 * Format tanggal format slash DD/MM/YYYY
 */
export function formatTanggalSlash(iso: string): string {
  if (!iso) return '';
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/**
 * Format tanggal dengan bulan pendek dan tahun (misal: "12 Feb 2013")
 */
export function formatTanggalTahun(iso: string): string {
  if (!iso) return '—';
  const d = toDate(iso);
  return `${d.getDate()} ${NAMA_BULAN_PENDEK[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Hitung umur berdasarkan tanggal lahir dalam tahun
 */
export function hitungUmur(isoLahir: string, isoToday?: string): number | null {
  if (!isoLahir) return null;
  const dLahir = toDate(isoLahir);
  const dToday = isoToday ? toDate(isoToday) : new Date();
  let age = dToday.getFullYear() - dLahir.getFullYear();
  const mDiff = dToday.getMonth() - dLahir.getMonth();
  if (mDiff < 0 || (mDiff === 0 && dToday.getDate() < dLahir.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

