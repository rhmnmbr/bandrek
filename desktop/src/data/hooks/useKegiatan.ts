import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { repositories } from '../repositories';
import type {
  KalenderFilterParams,
  DaftarKegiatanFilterParams,
  CekBentrokInput,
  CreateKegiatanInput,
  UpdateKegiatanInput,
  BatalkanKegiatanInput,
  JadwalUlangKegiatanInput,
} from '../types/kegiatan';

export const kegiatanKeys = {
  all: ['kegiatan'] as const,
  kalender: (params: KalenderFilterParams) => ['kegiatan', 'kalender', params] as const,
  daftar: (params: DaftarKegiatanFilterParams) => ['kegiatan', 'daftar', params] as const,
  detail: (id: string) => ['kegiatan', 'detail', id] as const,
  alasanBatal: ['kegiatan', 'alasan-batal'] as const,
  alasanJadwalUlang: ['kegiatan', 'alasan-jadwal-ulang'] as const,
};

export function useKegiatanKalender(params: KalenderFilterParams) {
  return useQuery({
    queryKey: kegiatanKeys.kalender(params),
    queryFn: () => repositories.kegiatan.getKalender(params),
    placeholderData: keepPreviousData,
  });
}

export function useKegiatanDaftar(params: DaftarKegiatanFilterParams = {}) {
  return useQuery({
    queryKey: kegiatanKeys.daftar(params),
    queryFn: () => repositories.kegiatan.getDaftar(params),
  });
}

export function useKegiatanDetail(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: kegiatanKeys.detail(id),
    queryFn: () => repositories.kegiatan.getById(id),
    enabled: enabled && Boolean(id),
  });
}

export function useAlasanBatal() {
  return useQuery({
    queryKey: kegiatanKeys.alasanBatal,
    queryFn: () => repositories.kegiatan.getAlasanBatal(),
  });
}

export function useAlasanJadwalUlang() {
  return useQuery({
    queryKey: kegiatanKeys.alasanJadwalUlang,
    queryFn: () => repositories.kegiatan.getAlasanJadwalUlang(),
  });
}

export function useCekBentrok() {
  return useMutation({
    mutationFn: (input: CekBentrokInput) => repositories.kegiatan.cekBentrok(input),
  });
}

export function useCreateKegiatan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateKegiatanInput) => repositories.kegiatan.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kegiatanKeys.all });
      queryClient.invalidateQueries({ queryKey: ['realisasi'] });
      queryClient.invalidateQueries({ queryKey: ['matriks'] });
    },
  });
}

export function useUpdateKegiatan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateKegiatanInput }) =>
      repositories.kegiatan.update(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: kegiatanKeys.all });
      queryClient.invalidateQueries({ queryKey: kegiatanKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['realisasi'] });
      queryClient.invalidateQueries({ queryKey: ['matriks'] });
    },
  });
}

export function useBatalkanKegiatan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: BatalkanKegiatanInput }) =>
      repositories.kegiatan.batalkan(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: kegiatanKeys.all });
      queryClient.invalidateQueries({ queryKey: kegiatanKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['realisasi'] });
      queryClient.invalidateQueries({ queryKey: ['matriks'] });
    },
  });
}

export function useJadwalUlangKegiatan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: JadwalUlangKegiatanInput }) =>
      repositories.kegiatan.jadwalUlang(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kegiatanKeys.all });
      queryClient.invalidateQueries({ queryKey: ['realisasi'] });
      queryClient.invalidateQueries({ queryKey: ['matriks'] });
    },
  });
}
