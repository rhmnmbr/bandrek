import { useQuery } from '@tanstack/react-query';
import { repositories } from '../repositories';
import type { AuditFilterParams } from '../interfaces/IAuditRepository';
import { MOCK_AUDIT_LOGS } from '../mocks/auditLog';

export const auditKeys = {
  all: ['audit'] as const,
  list: (params?: AuditFilterParams) => ['audit', 'list', params] as const,
};

export function useAuditLogs(params?: AuditFilterParams) {
  return useQuery({
    queryKey: auditKeys.list(params),
    queryFn: async () => {
      try {
        const data = await repositories.audit.getAll(params);
        return data && data.length > 0 ? data : MOCK_AUDIT_LOGS;
      } catch (err) {
        console.warn('Failed to fetch audit logs, falling back to mock:', err);
        return MOCK_AUDIT_LOGS;
      }
    },
  });
}
