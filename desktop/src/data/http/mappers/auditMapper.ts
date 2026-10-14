import type {
  AuditLogItem,
  AuditAksi,
  AuditKategori,
  AuditFieldDiff,
} from '../../types/auditLog';
import type { AuditLogDto } from '../../api/generated/models';

function normalizeAuditAksi(action: string): AuditAksi {
  const lower = (action || '').toLowerCase();
  if (lower.includes('buat') || lower.includes('create') || lower.includes('add')) return 'buat';
  if (lower.includes('hapus') || lower.includes('delete') || lower.includes('remove')) return 'hapus';
  if (lower.includes('realisasi')) return 'realisasi';
  if (lower.includes('login') || lower.includes('auth')) return 'login';
  return 'ubah';
}

function normalizeAuditKategori(cat: string): Exclude<AuditKategori, 'semua'> {
  const lower = (cat || '').toLowerCase();
  if (lower === 'kegiatan') return 'kegiatan';
  if (lower === 'realisasi') return 'realisasi';
  if (lower === 'siswa') return 'siswa';
  if (lower === 'subjek') return 'subjek';
  if (lower === 'master') return 'master';
  if (lower === 'pengguna' || lower === 'user') return 'pengguna';
  return 'sistem';
}

export function mapAuditLogDtoToAuditLogItem(dto: AuditLogDto): AuditLogItem {
  let diff: AuditFieldDiff[] | undefined = undefined;
  if (dto.diffsJson) {
    try {
      diff = JSON.parse(dto.diffsJson);
    } catch {
      diff = undefined;
    }
  }

  return {
    id: dto.id,
    waktu:
      typeof dto.timestamp === 'string'
        ? dto.timestamp
        : new Date(dto.timestamp).toISOString(),
    operator: {
      id: dto.userId || '',
      nama: dto.operatorName || 'Administrator',
      username: dto.operatorUsername || 'admin',
      peran: (dto.operatorRole as 'admin' | 'operator') || 'operator',
    },
    aksi: normalizeAuditAksi(dto.action),
    kategori: normalizeAuditKategori(dto.category),
    entitasTipe: dto.entityType || 'sistem',
    entitasNama: dto.entityName || '',
    ringkasan: dto.summary || '',
    diff,
    ipAddress: dto.ipAddress ?? undefined,
  };
}
