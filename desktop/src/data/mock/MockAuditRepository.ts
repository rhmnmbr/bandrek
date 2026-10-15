import type { IAuditRepository, AuditFilterParams } from '../interfaces/IAuditRepository';
import type { AuditLogItem } from '../types/auditLog';
import { MOCK_AUDIT_LOGS } from '../mocks/auditLog';

export class MockAuditRepository implements IAuditRepository {
  public async getAll(filter?: AuditFilterParams): Promise<AuditLogItem[]> {
    let list = [...MOCK_AUDIT_LOGS];

    if (filter?.q) {
      const q = filter.q.toLowerCase();
      list = list.filter(
        (item) =>
          item.ringkasan.toLowerCase().includes(q) ||
          item.entitasNama.toLowerCase().includes(q) ||
          item.operator.nama.toLowerCase().includes(q) ||
          item.operator.username.toLowerCase().includes(q)
      );
    }

    if (filter?.category && filter.category !== 'semua') {
      list = list.filter((item) => item.kategori === filter.category);
    }

    if (filter?.action && filter.action !== 'semua') {
      list = list.filter((item) => item.aksi === filter.action);
    }

    if (filter?.userId) {
      list = list.filter((item) => item.operator.id === filter.userId);
    }

    if (filter?.from) {
      const fromTime = new Date(filter.from).getTime();
      list = list.filter((item) => new Date(item.waktu).getTime() >= fromTime);
    }

    if (filter?.to) {
      const toTime = new Date(filter.to).getTime();
      list = list.filter((item) => new Date(item.waktu).getTime() <= toTime);
    }

    if (filter?.limit) {
      list = list.slice(0, filter.limit);
    }

    return list;
  }
}
