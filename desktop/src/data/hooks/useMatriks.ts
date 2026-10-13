import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { repositories } from '../repositories';
import { filterMatriksBelajarResult } from '../mock/businessRules';
import type { MatriksFilterParams, TandaiManualInput } from '../types/matriks';

export const matriksKeys = {
  all: ['matriks'] as const,
  detail: (mapelId: string) => ['matriks', 'detail', mapelId] as const,
};

export function useMatriks(
  mapelId: string,
  filter?: MatriksFilterParams,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: matriksKeys.detail(mapelId),
    queryFn: () => repositories.matriks.getMatriks(mapelId, { tampilkanNonaktif: true }),
    select: (data) => filterMatriksBelajarResult(data, filter),
    enabled: enabled && Boolean(mapelId),
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

export function useHapusManualMassal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keys: Array<{ siswaId: string; materiId: string }>) =>
      repositories.matriks.hapusManualMassal(keys),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matriksKeys.all });
    },
  });
}
