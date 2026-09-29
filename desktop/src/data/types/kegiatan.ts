import type { PeranSubjek, JenisKegiatanWarna } from './master';
import type { Realisasi } from './realisasi';

// ==========================================
// STATUS & AKSI KEGIATAN (DOMAIN.md §3)
// ==========================================

export type StatusKegiatan =
  | 'terjadwal'
  | 'belum_direalisasi'
  | 'terealisasi'
  | 'dibatalkan'
  | 'dijadwal_ulang';

export type RawStatusKegiatan =
  | 'terjadwal'
  | 'belum'
  | 'terealisasi'
  | 'dibatalkan'
  | 'dijadwal-ulang';

export type AksiKegiatan =
  | 'lihat_detail'
  | 'edit'
  | 'isi_realisasi'
  | 'ubah_realisasi'
  | 'jadwal_ulang'
  | 'batalkan';

export interface KegiatanSubjekItem {
  id: string; // Subjek ID
  peran: PeranSubjek;
}

export interface PembatalanKegiatan {
  alasan: string;
  keterangan: string;
  pada: string; // YYYY-MM-DD HH:mm
  oleh?: string;
}

export interface PenjadwalanUlangKegiatan {
  alasan: string;
  keterangan: string;
  pada: string; // YYYY-MM-DD HH:mm
  oleh?: string;
}

// ==========================================
// ENTITAS KEGIATAN LENGKAP
// ==========================================
export interface Kegiatan {
  id: string;
  nama: string;
  jenis: string; // JenisKegiatan ID
  mapel?: string | null; // MataPelajaran ID
  materi?: string | null; // Materi ID
  kelas?: string | null; // Kelas ID (opsional penanda asal)
  tanggal: string; // YYYY-MM-DD
  mulai: string; // HH:mm
  selesai: string; // HH:mm
  ruangan: string; // Ruangan ID
  subjek: KegiatanSubjekItem[];
  siswa: string[]; // List of Siswa IDs
  catatan: string;

  // Lifecycle & Status
  status: StatusKegiatan; // Server-computed derived status
  statusRaw: RawStatusKegiatan; // Raw stored status
  realisasi?: Realisasi | null;
  pembatalan?: PembatalanKegiatan | null;
  penjadwalanUlang?: PenjadwalanUlangKegiatan | null;
  jadwalUlangDari?: string | null; // ID kegiatan sebelumnya
  jadwalUlangKe?: string | null; // ID kegiatan hasil jadwal ulang

  // Server-computed fields (UI dilarang menghitung)
  aksiDiizinkan: AksiKegiatan[];
  tempat: string; // Tempat ID (diturunkan dari ruangan)
  namaTempat: string;
  namaRuangan: string;
  namaJenis: string;
  warnaJenis: JenisKegiatanWarna;
  namaMapel?: string;
  namaMateri?: string;
  jumlahSiswa: number;
  pengisiUtama?: {
    id: string;
    nama: string;
  };
}

// ==========================================
// DETEKSI BENTROK JADWAL (DOMAIN.md §5)
// ==========================================
export type TipeBentrok = 'ruangan' | 'subjek' | 'siswa';

export interface ItemBentrok {
  tipe: TipeBentrok;
  entitasId: string;
  entitasNama: string;
  kegiatanBentrokId: string;
  kegiatanBentrokNama: string;
  mulai: string;
  selesai: string;
  keterangan: string;
}

export interface HasilDeteksiBentrok {
  adaBentrok: boolean;
  daftarBentrok: ItemBentrok[];
  ringkasan: string;
}

export interface CekBentrokInput {
  tanggal: string;
  mulai: string;
  selesai: string;
  ruangan: string;
  subjek: string[]; // List of Subjek IDs
  siswa: string[]; // List of Siswa IDs
  excludeKegiatanId?: string; // Untuk mode Edit, jangan bentrok dengan diri sendiri
}

// ==========================================
// FILTER PARAMS
// ==========================================
export interface KalenderFilterParams {
  rentangMulai: string; // YYYY-MM-DD
  rentangSelesai: string; // YYYY-MM-DD
  jenisId?: string;
  subjekId?: string;
  kelasId?: string;
  ruanganId?: string;
  status?: StatusKegiatan | 'semua';
  tampilkanDibatalkan?: boolean; // Default false
}

export interface DaftarKegiatanFilterParams {
  tanggalMulai?: string; // YYYY-MM-DD
  tanggalSelesai?: string; // YYYY-MM-DD
  jenisId?: string;
  subjekId?: string;
  kelasId?: string;
  status?: StatusKegiatan | 'semua';
  hanyaPerluRealisasi?: boolean; // Shortcut filter
  q?: string;
}

// ==========================================
// INPUTS UNTUK MUTASI
// ==========================================
export interface CreateKegiatanInput {
  nama: string;
  jenis: string;
  mapel?: string | null;
  materi?: string | null;
  kelas?: string | null;
  tanggal: string;
  mulai: string;
  selesai: string;
  ruangan: string;
  subjek: KegiatanSubjekItem[];
  siswa: string[];
  catatan?: string;
}

export interface UpdateKegiatanInput extends Partial<CreateKegiatanInput> {}

export interface BatalkanKegiatanInput {
  alasan: string; // Wajib
  keterangan?: string;
  sekalianJadwalUlang?: boolean;
}

export interface JadwalUlangKegiatanInput {
  alasan: string; // Wajib
  keterangan?: string;
  tanggalBaru: string;
  mulaiBaru: string;
  selesaiBaru: string;
  ruanganBaru?: string;
  namaBaru?: string;
  subjekBaru?: KegiatanSubjekItem[];
  siswaBaru?: string[];
  catatanBaru?: string;
}
