import type { JenjangPendidikan } from './common';
import type { StatusKehadiran, KetuntasanMateri } from './realisasi';

// ==========================================
// KEADAAN SEL MATRIKS (DOMAIN.md §10)
// ==========================================
export type KeadaanSelMatriks =
  | 'kosong'
  | 'terjadwal'
  | 'tersampaikan'
  | 'selesai_manual'
  | 'sakit'
  | 'izin'
  | 'alpa';

// Urutan prioritas jika bertumpuk (DOMAIN.md §10)
// tersampaikan / selesai_manual > terjadwal > alpa > izin > sakit > kosong
export const PRIORITAS_SEL_MATRIKS: Record<KeadaanSelMatriks, number> = {
  tersampaikan: 6,
  selesai_manual: 6,
  terjadwal: 5,
  alpa: 4,
  izin: 3,
  sakit: 2,
  kosong: 1,
};

// ==========================================
// CEKLIS MANUAL MATRIKS (DOMAIN.md §2, §10)
// ==========================================
export interface CeklisManual {
  id: string;
  siswa: string; // Siswa ID
  materi: string; // Materi ID
  tanggal: string | null; // Tanggal materi dipelajari (opsional)
  catatan: string;
  oleh: string; // Pencatat
  dicatat: string; // Jejak audit YYYY-MM-DD HH:mm
  sumber: 'manual';
}

export interface TandaiManualInput {
  siswaId: string;
  materiId: string;
  tanggal?: string | null;
  catatan?: string;
  oleh: string;
}

// ==========================================
// DATA STRUKTUR SEL & TABEL MATRIKS
// ==========================================
export interface RiwayatKegiatanMateri {
  kegiatanId: string;
  namaKegiatan: string;
  tanggal: string;
  kehadiran?: StatusKehadiran | null;
  ketuntasan?: KetuntasanMateri | null;
  realisasiAda?: boolean;
}

export interface SelMatriks {
  siswaId: string;
  materiId: string;
  keadaan: KeadaanSelMatriks;
  kegiatanId?: string;
  tanggal?: string | null;
  ketuntasan?: KetuntasanMateri | null;
  ceklisManualId?: string;
  catatanManual?: string;
  olehManual?: string;
  dicatatManual?: string;
  riwayat: RiwayatKegiatanMateri[];
}

export interface KolomMateri {
  id: string;
  mapelId: string;
  nama: string;
  jenjang?: JenjangPendidikan[];
  urutan: number;
  terakhirDijadwalkan?: string | null;
}

export interface BarisSiswa {
  id: string;
  nama: string;
  jenjang?: JenjangPendidikan;
  aktif: boolean;
  daftarKelasIds?: string[];
  daftarKelasNama?: string[];
}

export interface RingkasanKolomMateri {
  materiId: string;
  menerimaCount: number; // Siswa dengan keadaan tersampaikan atau selesai_manual
  totalSiswa: number;
  persentase: number;
}

export interface SiswaTertinggal {
  siswaId: string;
  nama: string;
  materiBelumDiterima: number;
  totalMateri: number;
  persentaseBelumDiterima: number;
}

export interface MateriPalingTertinggal {
  materiId: string;
  nama: string;
  belumMenerimaCount: number;
  terakhirDijadwalkan?: string | null;
  alasan: string; // e.g. "Paling banyak belum menerima (18 siswa)"
}

export interface CatatanDiLuarJenjang {
  siswaId: string;
  siswaNama: string;
  siswaJenjang?: JenjangPendidikan;
  materiId: string;
  materiNama: string;
  materiJenjang?: JenjangPendidikan[];
  tipe: 'realisasi' | 'ceklis_manual';
  sumber?: string;
  kegiatanId?: string | null;
  tanggal?: string | null;
}

export interface MatriksFilterParams {
  kelasId?: string;
  kelasIds?: string[];
  q?: string; // cari nama siswa
  tampilkanNonaktif?: boolean; // default false
}

export interface MatriksBelajarResult {
  mapelId: string;
  namaMapel: string;
  jenjang?: JenjangPendidikan;
  kolom: KolomMateri[];
  baris: BarisSiswa[];
  sel: Record<string, Record<string, SelMatriks>>; // [siswaId][materiId]
  ringkasanKolom: Record<string, RingkasanKolomMateri>;
  siswaTertinggal: SiswaTertinggal[];
  ambangTertinggal: {
    minBelum: number; // >= 40% dibulatkan ke atas, minimal 2
    totalMateri: number;
    persen: number;
  };
  materiPalingTertinggal: MateriPalingTertinggal | null;
  catatanDiLuarJenjang: CatatanDiLuarJenjang[];
  menungguRealisasiCount?: number;
}
