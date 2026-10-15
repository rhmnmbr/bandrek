import { useQuery } from '@tanstack/react-query';
import { repositories } from '../repositories';
import type { AuditFilterParams } from '../interfaces/IAuditRepository';

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
        return data || [];
      } catch (err) {
        console.warn('Failed to fetch audit logs:', err);
        return [];
      }
    },
  });
}
