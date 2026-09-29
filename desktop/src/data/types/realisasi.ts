// ==========================================
// REALISASI & KEHADIRAN (DOMAIN.md §2, §9)
// ==========================================

export type StatusKehadiran = 'hadir' | 'sakit' | 'izin' | 'alpa';

export type KetuntasanMateri = 'tuntas' | 'sebagian' | 'tidak';

export interface KehadiranSiswaItem {
  siswaId: string;
  status: StatusKehadiran;
  catatan?: string;
}

export interface KehadiranSubjekItem {
  subjekId: string;
  status: StatusKehadiran;
  catatan?: string;
}

export interface Realisasi {
  mulai: string; // HH:mm (jam mulai riil)
  selesai: string; // HH:mm (jam selesai riil)
  materi?: string | null; // Materi ID yang benar-benar diajarkan; fallback ke rencana
  ketuntasan?: KetuntasanMateri | null; // satu nilai per kegiatan
  catatan: string;
  // Kehadiran disimpan terpisah per ID
  kehadiran: Record<string, StatusKehadiran>; // siswaId -> status
  catatanSiswa: Record<string, string>; // siswaId -> keterangan
  kehadiranSubjek: Record<string, StatusKehadiran>; // subjekId -> status
  catatanSubjek: Record<string, string>; // subjekId -> catatan
  diisiOleh: string;
  diisiPada: string; // YYYY-MM-DD HH:mm
}

export interface SimpanRealisasiInput {
  mulai: string;
  selesai: string;
  materi?: string | null;
  ketuntasan?: KetuntasanMateri | null;
  catatan?: string;
  kehadiranSiswa: Record<string, StatusKehadiran>;
  catatanSiswa?: Record<string, string>;
  kehadiranSubjek: Record<string, StatusKehadiran>;
  catatanSubjek?: Record<string, string>;
  diisiOleh: string;
}

export interface RingkasanKehadiran {
  totalSiswa: number;
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
  belumDiisi: number;
}
