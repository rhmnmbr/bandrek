import type { AuditLogItem } from '../types/auditLog';

export interface AuditFilterParams {
  q?: string;
  category?: string;
  action?: string;
  userId?: string;
  from?: string;
  to?: string;
  limit?: number;
}

export interface IAuditRepository {
  getAll(filter?: AuditFilterParams): Promise<AuditLogItem[]>;
}
