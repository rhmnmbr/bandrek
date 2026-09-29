import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { repositories } from '../repositories';
import type { JenjangPendidikan } from '../types/common';
import type { MatriksFilterParams, TandaiManualInput } from '../types/matriks';

export const matriksKeys = {
  all: ['matriks'] as const,
  detail: (mapelId: string, jenjang: JenjangPendidikan, filter?: MatriksFilterParams) =>
    ['matriks', 'detail', mapelId, jenjang, filter] as const,
};

export function useMatriks(
  mapelId: string,
  jenjang: JenjangPendidikan,
  filter?: MatriksFilterParams,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: matriksKeys.detail(mapelId, jenjang, filter),
    queryFn: () => repositories.matriks.getMatriks(mapelId, jenjang, filter),
    enabled: enabled && Boolean(mapelId) && Boolean(jenjang),
  });
}

export function useTandaiManual() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TandaiManualInput) => repositories.matriks.tandaiManual(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matriksKeys.all });
    },
  });
}

export function useHapusManual() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repositories.matriks.hapusManual(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matriksKeys.all });
    },
  });
}

export function useTandaiManualMassal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: TandaiManualInput[]) => repositories.matriks.tandaiManualMassal(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matriksKeys.all });
    },
  });
}
