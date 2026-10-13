export type AuditAksi = 'buat' | 'ubah' | 'hapus' | 'realisasi' | 'login';

export type AuditKategori =
  | 'semua'
  | 'kegiatan'
  | 'realisasi'
  | 'siswa'
  | 'subjek'
  | 'master'
  | 'pengguna'
  | 'sistem';

export interface AuditFieldDiff {
  field: string;
  label: string;
  sebelum?: string;
  sesudah?: string;
}

export interface AuditLogItem {
  id: string;
  waktu: string; // ISO string format
  operator: {
    id: string;
    nama: string;
    username: string;
    peran: 'admin' | 'operator';
  };
  aksi: AuditAksi;
  kategori: Exclude<AuditKategori, 'semua'>;
  entitasTipe: string;
  entitasNama: string;
  ringkasan: string;
  diff?: AuditFieldDiff[];
  ipAddress?: string;
}
