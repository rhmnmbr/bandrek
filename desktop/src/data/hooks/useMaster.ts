import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { repositories } from '../repositories';
import type {
  SiswaFilterParams,
  CreateSiswaInput,
  UpdateSiswaInput,
  SubjekFilterParams,
  CreateSubjekInput,
  UpdateSubjekInput,
  KetersediaanRutinItem,
  KelasFilterParams,
  CreateKelasInput,
  UpdateKelasInput,
  MapelFilterParams,
  CreateMapelInput,
  UpdateMapelInput,
  CreateMateriInput,
  UpdateMateriInput,
  TempatFilterParams,
  CreateTempatInput,
  UpdateTempatInput,
  CreateRuanganInput,
  UpdateRuanganInput,
  CreateJenisKegiatanInput,
  UpdateJenisKegiatanInput,
  JenisKegiatanFilterParams,
} from '../types/master';

// ==========================================
// SISWA
// ==========================================
export const siswaKeys = {
  all: ['siswa'] as const,
  list: () => ['siswa', 'list'] as const,
  detail: (id: string) => ['siswa', 'detail', id] as const,
  profil: (id: string) => ['siswa', 'profil', id] as const,
};

export function useSiswaList(filter?: SiswaFilterParams) {
  const status = filter?.status ?? 'aktif';
  const jenjang = filter?.jenjang ?? 'semua';
  const kelasId = filter?.kelasId;
  const q = filter?.q;
  const desc = filter?.desc ?? false;

  return useQuery({
    queryKey: siswaKeys.list(),
    queryFn: () => repositories.siswa.getAll({ status: 'semua' }),
    select: (allSiswa) => {
      const qLower = q?.trim().toLowerCase() ?? '';
      return allSiswa
        .filter((s) => {
          if (status === 'aktif' && !s.aktif) return false;
          if (status === 'nonaktif' && s.aktif) return false;
          if (jenjang !== 'semua' && s.jenjang !== jenjang) return false;

          if (kelasId === '-') {
            if ((s.daftarKelas?.length ?? 0) > 0) return false;
          } else if (kelasId) {
            if (!s.daftarKelas?.includes(kelasId)) return false;
          }

          if (qLower.length > 0) {
            const matchNama = s.nama.toLowerCase().includes(qLower);
            const matchAsal = s.asal?.toLowerCase().includes(qLower);
            const matchWali = s.waliNama?.toLowerCase().includes(qLower);
            if (!matchNama && !matchAsal && !matchWali) return false;
          }

          return true;
        })
        .sort((a, b) => a.nama.localeCompare(b.nama, 'id') * (desc ? -1 : 1));
    },
  });
}

export function useSiswaDetail(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: siswaKeys.detail(id),
    queryFn: () => repositories.siswa.getById(id),
    enabled: enabled && Boolean(id),
  });
}

export function useSiswaProfil(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: siswaKeys.profil(id),
    queryFn: () => repositories.siswa.getProfil(id),
    enabled: enabled && Boolean(id),
  });
}

export function useCreateSiswa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSiswaInput) => repositories.siswa.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siswaKeys.all });
    },
  });
}

export function useUpdateSiswa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSiswaInput }) =>
      repositories.siswa.update(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: siswaKeys.all });
      queryClient.invalidateQueries({ queryKey: siswaKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: siswaKeys.profil(id) });
      queryClient.invalidateQueries({ queryKey: ['matriks'] });
    },
  });
}

export function useDeleteSiswa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => repositories.siswa.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siswaKeys.all });
      queryClient.invalidateQueries({ queryKey: ['matriks'] });
    },
  });
}

// ==========================================
// SUBJEK
// ==========================================
export const subjekKeys = {
  all: ['subjek'] as const,
  list: () => ['subjek', 'list'] as const,
  detail: (id: string) => ['subjek', 'detail', id] as const,
  profil: (id: string) => ['subjek', 'profil', id] as const,
};

export function useSubjekList(filter?: SubjekFilterParams) {
  const status = filter?.status ?? 'aktif';
  const aktifOnly = filter?.aktifOnly ?? false;
  const peran = filter?.peran ?? 'semua';
  const q = filter?.q;
  const effectiveStatus = aktifOnly ? 'aktif' : status;

  return useQuery({
    queryKey: subjekKeys.list(),
    queryFn: () => repositories.subjek.getAll({ status: 'semua' }),
    select: (allSubjek) => {
      const qLower = q?.trim().toLowerCase() ?? '';
      return allSubjek
        .filter((s) => {
          if (effectiveStatus === 'aktif' && !s.aktif) return false;
          if (effectiveStatus === 'nonaktif' && s.aktif) return false;
          if (peran !== 'semua' && s.peran !== peran) return false;
          if (qLower.length > 0) {
            const matchNama = s.nama.toLowerCase().includes(qLower);
            const matchKontak = s.kontak?.toLowerCase().includes(qLower);
            if (!matchNama && !matchKontak) return false;
          }
          return true;
        })
        .sort((a, b) => a.nama.localeCompare(b.nama, 'id'));
    },
  });
}

export function useSubjekDetail(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: subjekKeys.detail(id),
    queryFn: () => repositories.subjek.getById(id),
    enabled: enabled && Boolean(id),
  });
}

export function useSubjekProfil(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: subjekKeys.profil(id),
    queryFn: () => repositories.subjek.getProfil(id),
    enabled: enabled && Boolean(id),
  });
}

export function useCreateSubjek() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSubjekInput) => repositories.subjek.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subjekKeys.all });
    },
  });
}

export function useUpdateSubjek() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSubjekInput }) =>
      repositories.subjek.update(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: subjekKeys.all });
      queryClient.invalidateQueries({ queryKey: subjekKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: subjekKeys.profil(id) });
      queryClient.invalidateQueries({ queryKey: ['kegiatan'] });
    },
  });
}

export function useDeleteSubjek() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => repositories.subjek.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subjekKeys.all });
    },
  });
}

export function useTambahKetersediaanSubjek() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, item }: { id: string; item: KetersediaanRutinItem }) =>
      repositories.subjek.tambahKetersediaan(id, item),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: subjekKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: subjekKeys.profil(id) });
    },
  });
}

export function useUbahKetersediaanSubjek() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      index,
      patch,
    }: {
      id: string;
      index: number;
      patch: Partial<KetersediaanRutinItem>;
    }) => repositories.subjek.ubahKetersediaan(id, index, patch),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: subjekKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: subjekKeys.profil(id) });
    },
  });
}

export function useHapusKetersediaanSubjek() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, index }: { id: string; index: number }) =>
      repositories.subjek.hapusKetersediaan(id, index),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: subjekKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: subjekKeys.profil(id) });
    },
  });
}

// ==========================================
// KELAS
// ==========================================
export const kelasKeys = {
  all: ['kelas'] as const,
  list: () => ['kelas', 'list'] as const,
  detail: (id: string) => ['kelas', 'detail', id] as const,
};

export function useKelasList(filter?: KelasFilterParams) {
  const jenjang = filter?.jenjang ?? 'semua';
  const q = filter?.q;

  return useQuery({
    queryKey: kelasKeys.list(),
    queryFn: () => repositories.kelas.getAll(),
    select: (allKelas) => {
      const qLower = q?.trim().toLowerCase() ?? '';
      return allKelas
        .filter((k) => {
          if (jenjang !== 'semua' && k.jenjang !== jenjang) return false;
          if (qLower.length > 0) {
            const matchNama = k.nama.toLowerCase().includes(qLower);
            const matchKet = k.keterangan?.toLowerCase().includes(qLower);
            if (!matchNama && !matchKet) return false;
          }
          return true;
        })
        .sort((a, b) => a.nama.localeCompare(b.nama, 'id'));
    },
  });
}

export function useKelasDetail(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: kelasKeys.detail(id),
    queryFn: () => repositories.kelas.getById(id),
    enabled: enabled && Boolean(id),
  });
}

export function useCreateKelas() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateKelasInput) => repositories.kelas.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kelasKeys.all });
      queryClient.invalidateQueries({ queryKey: siswaKeys.all });
    },
  });
}

export function useUpdateKelas() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateKelasInput }) =>
      repositories.kelas.update(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: kelasKeys.all });
      queryClient.invalidateQueries({ queryKey: kelasKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: siswaKeys.all });
    },
  });
}

export function useUbahAnggotaKelas() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      kelasId,
      siswaId,
      tambah,
    }: {
      kelasId: string;
      siswaId: string;
      tambah: boolean;
    }) => repositories.kelas.ubahAnggota(kelasId, siswaId, tambah),
    onSuccess: (_, { kelasId, siswaId }) => {
      queryClient.invalidateQueries({ queryKey: kelasKeys.all });
      queryClient.invalidateQueries({ queryKey: kelasKeys.detail(kelasId) });
      queryClient.invalidateQueries({ queryKey: siswaKeys.all });
      queryClient.invalidateQueries({ queryKey: siswaKeys.detail(siswaId) });
      queryClient.invalidateQueries({ queryKey: siswaKeys.profil(siswaId) });
    },
  });
}

export function useDeleteKelas() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => repositories.kelas.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kelasKeys.all });
      queryClient.invalidateQueries({ queryKey: siswaKeys.all });
    },
  });
}

// ==========================================
// MAPEL & MATERI
// ==========================================
export const mapelKeys = {
  all: ['mapel'] as const,
  list: () => ['mapel', 'list'] as const,
  detail: (id: string) => ['mapel', 'detail', id] as const,
  materiByMapel: (mapelId: string) => ['mapel', 'materi', mapelId] as const,
  allMateri: ['mapel', 'materi', 'all'] as const,
};

export function useMapelList(filter?: MapelFilterParams) {
  const status = filter?.status ?? 'semua';
  const q = filter?.q;

  return useQuery({
    queryKey: mapelKeys.list(),
    queryFn: () => repositories.mapel.getAll({ status: 'semua' }),
    select: (allMapel) => {
      const qLower = q?.trim().toLowerCase() ?? '';
      return allMapel
        .filter((m) => {
          if (status === 'aktif' && !m.aktif) return false;
          if (status === 'nonaktif' && m.aktif) return false;
          if (qLower.length > 0 && !m.nama.toLowerCase().includes(qLower)) return false;
          return true;
        })
        .sort((a, b) => a.nama.localeCompare(b.nama, 'id'));
    },
  });
}

export function useMapelDetail(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: mapelKeys.detail(id),
    queryFn: () => repositories.mapel.getById(id),
    enabled: enabled && Boolean(id),
  });
}

export function useCreateMapel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMapelInput) => repositories.mapel.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mapelKeys.all });
    },
  });
}

export function useUpdateMapel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMapelInput }) =>
      repositories.mapel.update(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: mapelKeys.all });
      queryClient.invalidateQueries({ queryKey: mapelKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['matriks'] });
    },
  });
}

export function useDeleteMapel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => repositories.mapel.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mapelKeys.all });
      queryClient.invalidateQueries({ queryKey: ['matriks'] });
    },
  });
}

export function useAllMateriList() {
  return useQuery({
    queryKey: mapelKeys.allMateri,
    queryFn: () => repositories.mapel.getAllMateri(),
  });
}

export function useMateriList(mapelId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: mapelKeys.materiByMapel(mapelId),
    queryFn: () => repositories.mapel.getMateriByMapel(mapelId),
    enabled: enabled && Boolean(mapelId),
  });
}

export function useCreateMateri() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMateriInput) => repositories.mapel.createMateri(input),
    onSuccess: (_, input) => {
      queryClient.invalidateQueries({ queryKey: mapelKeys.all });
      queryClient.invalidateQueries({ queryKey: mapelKeys.materiByMapel(input.mapel) });
      queryClient.invalidateQueries({ queryKey: ['matriks'] });
    },
  });
}

export function useUpdateMateri() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMateriInput }) =>
      repositories.mapel.updateMateri(id, input),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: mapelKeys.all });
      queryClient.invalidateQueries({ queryKey: mapelKeys.materiByMapel(updated.mapel) });
      queryClient.invalidateQueries({ queryKey: ['matriks'] });
    },
  });
}

export function useDeleteMateri() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => repositories.mapel.deleteMateri(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mapelKeys.all });
      queryClient.invalidateQueries({ queryKey: ['matriks'] });
    },
  });
}

export function useReorderMateri() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mapelId, orderedIds }: { mapelId: string; orderedIds: string[] }) =>
      repositories.mapel.reorderMateri(mapelId, orderedIds),
    onSuccess: (_, { mapelId }) => {
      queryClient.invalidateQueries({ queryKey: mapelKeys.materiByMapel(mapelId) });
      queryClient.invalidateQueries({ queryKey: ['matriks'] });
    },
  });
}

// ==========================================
// TEMPAT & RUANGAN
// ==========================================
export const tempatKeys = {
  all: ['tempat'] as const,
  list: () => ['tempat', 'list'] as const,
  detail: (id: string) => ['tempat', 'detail', id] as const,
  ruanganAll: ['tempat', 'ruangan', 'all'] as const,
  ruanganByTempat: (tempatId: string) => ['tempat', 'ruangan', tempatId] as const,
};

export function useTempatList(filter?: TempatFilterParams) {
  const q = filter?.q;

  return useQuery({
    queryKey: tempatKeys.list(),
    queryFn: () => repositories.tempat.getAll(),
    select: (allTempat) => {
      const qLower = q?.trim().toLowerCase() ?? '';
      return allTempat
        .filter((t) => {
          if (qLower.length > 0 && !t.nama.toLowerCase().includes(qLower)) return false;
          return true;
        })
        .sort((a, b) => a.nama.localeCompare(b.nama, 'id'));
    },
  });
}

export function useTempatDetail(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: tempatKeys.detail(id),
    queryFn: () => repositories.tempat.getById(id),
    enabled: enabled && Boolean(id),
  });
}

export function useCreateTempat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTempatInput) => repositories.tempat.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tempatKeys.all });
    },
  });
}

export function useUpdateTempat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTempatInput }) =>
      repositories.tempat.update(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: tempatKeys.all });
      queryClient.invalidateQueries({ queryKey: tempatKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['kegiatan'] });
    },
  });
}

export function useDeleteTempat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => repositories.tempat.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tempatKeys.all });
    },
  });
}

export function useRuanganList() {
  return useQuery({
    queryKey: tempatKeys.ruanganAll,
    queryFn: () => repositories.tempat.getAllRuangan(),
  });
}

export function useRuanganByTempat(tempatId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: tempatKeys.ruanganByTempat(tempatId),
    queryFn: () => repositories.tempat.getRuanganByTempat(tempatId),
    enabled: enabled && Boolean(tempatId),
  });
}

export function useCreateRuangan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRuanganInput) => repositories.tempat.createRuangan(input),
    onSuccess: (_, input) => {
      queryClient.invalidateQueries({ queryKey: tempatKeys.all });
      queryClient.invalidateQueries({ queryKey: tempatKeys.ruanganByTempat(input.tempat) });
    },
  });
}

export function useUpdateRuangan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRuanganInput }) =>
      repositories.tempat.updateRuangan(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tempatKeys.all });
      queryClient.invalidateQueries({ queryKey: ['kegiatan'] });
    },
  });
}

export function useDeleteRuangan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => repositories.tempat.deleteRuangan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tempatKeys.all });
    },
  });
}

// ==========================================
// JENIS KEGIATAN
// ==========================================
export const jenisKegiatanKeys = {
  all: ['jenis-kegiatan'] as const,
  list: () => ['jenis-kegiatan', 'list'] as const,
  detail: (id: string) => ['jenis-kegiatan', 'detail', id] as const,
};

export function useJenisKegiatanList(filter?: JenisKegiatanFilterParams) {
  const q = filter?.q;

  return useQuery({
    queryKey: jenisKegiatanKeys.list(),
    queryFn: () => repositories.jenisKegiatan.getAll(),
    select: (allJenis) => {
      const qLower = q?.trim().toLowerCase() ?? '';
      return allJenis
        .filter((j) => {
          if (qLower.length > 0 && !j.nama.toLowerCase().includes(qLower)) return false;
          return true;
        })
        .sort((a, b) => a.nama.localeCompare(b.nama, 'id'));
    },
  });
}

export function useJenisKegiatanDetail(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: jenisKegiatanKeys.detail(id),
    queryFn: () => repositories.jenisKegiatan.getById(id),
    enabled: enabled && Boolean(id),
  });
}

export function useCreateJenisKegiatan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateJenisKegiatanInput) => repositories.jenisKegiatan.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jenisKegiatanKeys.all });
    },
  });
}

export function useUpdateJenisKegiatan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateJenisKegiatanInput }) =>
      repositories.jenisKegiatan.update(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: jenisKegiatanKeys.all });
      queryClient.invalidateQueries({ queryKey: jenisKegiatanKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['kegiatan'] });
    },
  });
}

export function useDeleteJenisKegiatan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => repositories.jenisKegiatan.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jenisKegiatanKeys.all });
    },
  });
}
