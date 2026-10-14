import type {
  IAuditRepository,
  AuditFilterParams,
} from '../../interfaces/IAuditRepository';
import type { AuditLogItem } from '../../types/auditLog';
import { getAuditLogs } from '../../api/generated/endpoints';
import type { AuditLogDto, GetAuditLogsParams } from '../../api/generated/models';
import { mapAuditLogDtoToAuditLogItem } from '../mappers/auditMapper';

export class HttpAuditRepository implements IAuditRepository {
  public async getAll(filter?: AuditFilterParams): Promise<AuditLogItem[]> {
    const params: GetAuditLogsParams = {
      q: filter?.q?.trim() || undefined,
      category:
        filter?.category && filter.category !== 'semua'
          ? filter.category
          : undefined,
      action:
        filter?.action && filter.action !== 'semua' ? filter.action : undefined,
      userId: filter?.userId || undefined,
      from: filter?.from || undefined,
      to: filter?.to || undefined,
      limit: filter?.limit || 100,
    };

    const res = await getAuditLogs(params);
    return ((res.data as AuditLogDto[]) || []).map(mapAuditLogDtoToAuditLogItem);
  }
}
