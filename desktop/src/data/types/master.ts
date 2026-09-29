import type { JenjangPendidikan, JenisKelamin } from './common';
import type { StatusKehadiran } from './realisasi';

// ==========================================
// SISWA
// ==========================================
export interface SiswaKelasDetail {
  id: string;
  nama: string;
  jenjang?: JenjangPendidikan;
}

export interface Siswa {
  id: string;
  nama: string;
  jenjang: JenjangPendidikan;
  aktif: boolean;
  lahir: string; // ISO date YYYY-MM-DD
  kelamin: JenisKelamin;
  asal?: string;
  waliNama?: string;
  waliWa?: string;
  bergabung?: string; // ISO date YYYY-MM-DD
  catatan?: string;
  // Computed / joins
  daftarKelas?: string[]; // IDs of classes this student belongs to
  daftarKelasDetail?: SiswaKelasDetail[];
  jumlahKegiatan?: number;
  jumlahKelas?: number;
  jumlahCeklis?: number;
  kegiatanMendatangCount?: number;
  dapatDihapus?: boolean;
  alasanTidakBisaHapus?: string;
  rincianPenggunaan?: string[];
  ringkasanPenggunaan?: string;
}

export interface SiswaFilterParams {
  status?: 'aktif' | 'nonaktif' | 'semua';
  jenjang?: JenjangPendidikan | 'semua';
  kelasId?: string;
  q?: string;
  desc?: boolean;
}

export interface CreateSiswaInput {
  nama: string;
  jenjang: JenjangPendidikan;
  aktif?: boolean;
  lahir: string;
  kelamin: JenisKelamin;
  asal?: string;
  waliNama?: string;
  waliWa?: string;
  catatan?: string;
  bergabung?: string;
}

export interface UpdateSiswaInput extends Partial<CreateSiswaInput> {
  aktif?: boolean;
}

export interface SiswaKPI {
  label: string;
  val: string;
  valFg: string;
  brd: string;
  bg: string;
  lblFg: string;
  sub: string;
  subFg: string;
}

export interface SiswaRiwayatItem {
  id: string;
  tanggal: string; // ISO
  tanggalFormatted: string; // e.g. "16 Sep"
  nama: string;
  materi: string;
  statusKegiatan: string;
  kehadiran: {
    status: StatusKehadiran | 'batal' | 'belum';
    label: string;
    glyph: string;
    brd: string;
    bg: string;
    ink: string;
  };
  catatan: string;
}

export interface SiswaCakupanItem {
  mapelId: string;
  nama: string;
  tersampaikan: number;
  total: number;
  frac: string;
  pct: number;
  fracFg: string;
  barW: string;
  barBg: string;
}

export interface SiswaTerlewatItem {
  mapelId: string;
  materiId: string;
  judul: string;
  alasan: string;
}

export interface SiswaProfil {
  siswa: Siswa;
  inisial: string;
  kelasTeks: string;
  kpi: SiswaKPI[];
  riwayat: SiswaRiwayatItem[];
  opsiMapel: { id: string; nama: string }[];
  cakupan: SiswaCakupanItem[];
  terlewat: SiswaTerlewatItem[];
}

// ==========================================
// SUBJEK
// ==========================================
export type PeranSubjek = 'Pengisi' | 'Wali' | 'Support' | 'Pendamping';

export interface Subjek {
  id: string;
  nama: string;
  kelamin: JenisKelamin;
  peran: PeranSubjek;
  aktif: boolean;
  mapel?: string[]; // IDs of MataPelajaran
  kontak?: string;
  // Server-computed
  jumlahKegiatan?: number;
}

export interface SubjekFilterParams {
  aktifOnly?: boolean;
  peran?: PeranSubjek | 'semua';
  q?: string;
}

export interface CreateSubjekInput {
  nama: string;
  kelamin: JenisKelamin;
  peran: PeranSubjek;
  aktif?: boolean;
  mapel?: string[];
  kontak?: string;
}

export interface UpdateSubjekInput extends Partial<CreateSubjekInput> {
  aktif?: boolean;
}

// ==========================================
// KELAS
// ==========================================
export interface Kelas {
  id: string;
  nama: string;
  jenjang?: JenjangPendidikan;
  keterangan?: string;
  anggota: string[]; // List of Siswa IDs
  // Server-computed
  jumlahSiswa?: number;
}

export interface KelasFilterParams {
  jenjang?: JenjangPendidikan | 'semua';
  q?: string;
}

export interface CreateKelasInput {
  nama: string;
  jenjang?: JenjangPendidikan;
  keterangan?: string;
  anggota: string[];
}

export interface UpdateKelasInput extends Partial<CreateKelasInput> {}

// ==========================================
// MATA PELAJARAN & MATERI
// ==========================================
export interface MataPelajaran {
  id: string;
  nama: string;
  aktif: boolean;
  // Server-computed
  jumlahMateri?: number;
}

export interface CreateMapelInput {
  nama: string;
  aktif?: boolean;
}

export interface UpdateMapelInput extends Partial<CreateMapelInput> {}

export interface Materi {
  id: string;
  mapel: string; // MataPelajaran ID
  nama: string;
  jenjang: JenjangPendidikan[]; // Wajib minimal 1
  aktif: boolean;
  urutan?: number;
}

export interface CreateMateriInput {
  mapel: string;
  nama: string;
  jenjang: JenjangPendidikan[];
  aktif?: boolean;
  urutan?: number;
}

export interface UpdateMateriInput extends Partial<CreateMateriInput> {}

// ==========================================
// TEMPAT & RUANGAN
// ==========================================
export interface Tempat {
  id: string;
  nama: string;
  // Server-computed
  jumlahRuangan?: number;
  ruangan?: Ruangan[];
}

export interface CreateTempatInput {
  nama: string;
}

export interface UpdateTempatInput {
  nama: string;
}

export interface Ruangan {
  id: string;
  tempat: string; // Tempat ID
  nama: string;
  kapasitas?: number;
  // Server-computed
  namaTempat?: string;
}

export interface CreateRuanganInput {
  tempat: string;
  nama: string;
  kapasitas?: number;
}

export interface UpdateRuanganInput extends Partial<CreateRuanganInput> {}

// ==========================================
// JENIS KEGIATAN
// ==========================================
export type JenisKegiatanWarna = 'pembelajaran' | 'rapat' | 'olahraga' | 'ujian' | 'lainnya';

export interface JenisKegiatan {
  id: string;
  nama: string;
  warna: JenisKegiatanWarna;
  materiWajib: boolean;
  siswaWajib: boolean;
}

export interface CreateJenisKegiatanInput {
  nama: string;
  warna: JenisKegiatanWarna;
  materiWajib: boolean;
  siswaWajib: boolean;
}

export interface UpdateJenisKegiatanInput extends Partial<CreateJenisKegiatanInput> {}

// ==========================================
// MASTER DATA DELETE STATUS (DOMAIN.md §12)
// ==========================================
export interface DeleteMasterResult {
  bisaDihapus: boolean;
  alasanTidakBisa?: string;
  jumlahPenggunaan: number;
  rincianPenggunaan: string[];
}
