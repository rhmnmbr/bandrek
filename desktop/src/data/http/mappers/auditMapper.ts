import type {
  AuditLogItem,
  AuditAksi,
  AuditKategori,
  AuditFieldDiff,
} from '../../types/auditLog';
import type { AuditLogDto } from '../../api/generated/models';

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
      nama: dto.operatorName || '',
      username: dto.operatorUsername || '',
      peran: (dto.operatorRole as 'admin' | 'operator') || 'operator',
    },
    aksi: (dto.action as AuditAksi) || 'ubah',
    kategori: (dto.category as Exclude<AuditKategori, 'semua'>) || 'sistem',
    entitasTipe: dto.entityType || '',
    entitasNama: dto.entityName || '',
    ringkasan: dto.summary || '',
    diff,
    ipAddress: dto.ipAddress ?? undefined,
  };
}
