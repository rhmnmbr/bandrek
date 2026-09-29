import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { repositories } from '../repositories';
import type { SimpanRealisasiInput } from '../types/realisasi';
import { kegiatanKeys } from './useKegiatan';

export const realisasiKeys = {
  all: ['realisasi'] as const,
  detail: (kegiatanId: string) => ['realisasi', 'detail', kegiatanId] as const,
  perluCount: ['realisasi', 'perlu-count'] as const,
};

export function useRealisasi(kegiatanId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: realisasiKeys.detail(kegiatanId),
    queryFn: () => repositories.realisasi.getByKegiatanId(kegiatanId),
    enabled: enabled && Boolean(kegiatanId),
  });
}

export function usePerluRealisasiCount() {
  return useQuery({
    queryKey: realisasiKeys.perluCount,
    queryFn: () => repositories.realisasi.getPerluRealisasiCount(),
  });
}

export function useSimpanRealisasi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      kegiatanId,
      input,
    }: {
      kegiatanId: string;
      input: SimpanRealisasiInput;
    }) => repositories.realisasi.simpan(kegiatanId, input),
    onSuccess: (_, { kegiatanId }) => {
      queryClient.invalidateQueries({ queryKey: realisasiKeys.all });
      queryClient.invalidateQueries({ queryKey: realisasiKeys.detail(kegiatanId) });
      queryClient.invalidateQueries({ queryKey: realisasiKeys.perluCount });
      queryClient.invalidateQueries({ queryKey: kegiatanKeys.all });
      queryClient.invalidateQueries({ queryKey: kegiatanKeys.detail(kegiatanId) });
      queryClient.invalidateQueries({ queryKey: ['matriks'] });
    },
  });
}
