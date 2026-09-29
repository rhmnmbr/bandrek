import type { IMapelRepository } from '../interfaces/IMapelRepository';
import type {
  MataPelajaran,
  MapelFilterParams,
  CreateMapelInput,
  UpdateMapelInput,
  Materi,
  CreateMateriInput,
  UpdateMateriInput,
  DeleteMasterResult,
} from '../types/master';
import { BandrekApiError } from '../types/simulasi';
import { mockRunner } from './mockRunner';
import { mockStore } from './mockStore';
import { checkMasterUsage } from './businessRules';

function enrichMateri(t: Materi): Materi {
  const kegCount = mockStore.kegiatan.filter(
    (k) => k.materi === t.id || k.realisasi?.materi === t.id
  ).length;

  const dapatDihapus = kegCount === 0;
  const alasanTidakBisaHapus = dapatDihapus
    ? undefined
    : `Tidak bisa dihapus: ${kegCount} kegiatan menunjuk materi ini. Pakai Nonaktifkan.`;

  return {
    ...t,
    jumlahKegiatan: kegCount,
    dapatDihapus,
    alasanTidakBisaHapus,
    ringkasanPenggunaan:
      kegCount > 0
        ? `${kegCount} kegiatan tercatat memakai materi ini.`
        : 'Belum pernah dipakai di kegiatan mana pun.',
  };
}

function enrichMapel(m: MataPelajaran): MataPelajaran {
  const materiList = mockStore.materi
    .filter((t) => t.mapel === m.id)
    .sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0))
    .map(enrichMateri);
  const anakN = materiList.length;
  const kegCount = mockStore.kegiatan.filter((k) => k.mapel === m.id).length;

  const dapatDihapus = anakN === 0 && kegCount === 0;
  let alasanTidakBisaHapus: string | undefined;
  if (kegCount > 0) {
    alasanTidakBisaHapus = `Tidak bisa dihapus: ${kegCount} kegiatan menunjuk mata pelajaran ini. Pakai Nonaktifkan.`;
  } else if (anakN > 0) {
    alasanTidakBisaHapus = `Kosongkan dulu ${anakN} materi di dalamnya.`;
  }

  return {
    ...m,
    jumlahMateri: anakN,
    jumlahKegiatan: kegCount,
    dapatDihapus,
    alasanTidakBisaHapus,
    rincianPenggunaan: kegCount > 0 ? [`${kegCount} kegiatan`] : [],
    ringkasanPenggunaan:
      kegCount > 0
        ? `${kegCount} kegiatan tercatat memakai mata pelajaran ini.`
        : 'Belum pernah dipakai di kegiatan mana pun.',
    materi: materiList,
  };
}

export class MockMapelRepository implements IMapelRepository {
  public async getAll(filter: MapelFilterParams = {}): Promise<MataPelajaran[]> {
    return mockRunner(() => {
      const { status = 'semua', q } = filter;
      return mockStore.mapel
        .filter((m) => {
          if (status === 'aktif' && !m.aktif) return false;
          if (status === 'nonaktif' && m.aktif) return false;
          if (q && q.trim().length > 0) {
            const qLower = q.trim().toLowerCase();
            if (!m.nama.toLowerCase().includes(qLower)) return false;
          }
          return true;
        })
        .map(enrichMapel)
        .sort((a, b) => a.nama.localeCompare(b.nama, 'id'));
    });
  }

  public async getById(id: string): Promise<MataPelajaran> {
    return mockRunner(() => {
      const m = mockStore.mapel.find((item) => item.id === id);
      if (!m) {
        throw new BandrekApiError('unknown', `Mata Pelajaran dengan ID "${id}" tidak ditemukan.`, 404);
      }
      return enrichMapel(m);
    });
  }

  public async create(input: CreateMapelInput): Promise<MataPelajaran> {
    return mockRunner(
      () => {
        let n = mockStore.mapel.length + 1;
        while (mockStore.mapel.some((x) => x.id === `M${n}`)) {
          n++;
        }
        const newId = `M${n}`;
        const newMapel: MataPelajaran = {
          id: newId,
          nama: input.nama.trim(),
          aktif: input.aktif !== undefined ? input.aktif : true,
          jumlahMateri: 0,
        };

        mockStore.mapel.push(newMapel);
        mockStore.persist();
        return enrichMapel(newMapel);
      },
      { isMutation: true }
    );
  }

  public async update(id: string, input: UpdateMapelInput): Promise<MataPelajaran> {
    return mockRunner(
      () => {
        const idx = mockStore.mapel.findIndex((item) => item.id === id);
        if (idx === -1) {
          throw new BandrekApiError('unknown', `Mata Pelajaran dengan ID "${id}" tidak ditemukan.`, 404);
        }

        const existing = mockStore.mapel[idx];
        const updated: MataPelajaran = {
          ...existing,
          nama: input.nama !== undefined ? input.nama.trim() : existing.nama,
          aktif: input.aktif !== undefined ? input.aktif : existing.aktif,
        };

        mockStore.mapel[idx] = updated;
        mockStore.persist();
        return enrichMapel(updated);
      },
      { isMutation: true }
    );
  }

  public async delete(id: string): Promise<DeleteMasterResult> {
    return mockRunner(
      () => {
        const check = checkMasterUsage(
          'mapel',
          id,
          mockStore.kegiatan,
          mockStore.kelas,
          mockStore.ceklisManual,
          mockStore.ruangan,
          mockStore.materi
        );

        if (!check.bisaDihapus) {
          return check;
        }

        const idx = mockStore.mapel.findIndex((item) => item.id === id);
        if (idx >= 0) {
          mockStore.mapel.splice(idx, 1);
          mockStore.persist();
        }

        return check;
      },
      { isMutation: true }
    );
  }

  // --------------------------------------------------------------------------
  // MATERI
  // --------------------------------------------------------------------------
  public async getAllMateri(): Promise<Materi[]> {
    return mockRunner(() => mockStore.materi.map(enrichMateri));
  }

  public async getMateriByMapel(mapelId: string): Promise<Materi[]> {
    return mockRunner(() => {
      return mockStore.materi
        .filter((t) => t.mapel === mapelId)
        .sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0))
        .map(enrichMateri);
    });
  }

  public async createMateri(input: CreateMateriInput): Promise<Materi> {
    return mockRunner(
      () => {
        let n = mockStore.materi.length + 1;
        while (mockStore.materi.some((x) => x.id === `T${n}`)) {
          n++;
        }
        const newId = `T${n}`;
        const mapelMateri = mockStore.materi.filter((t) => t.mapel === input.mapel);
        const nextUrutan = input.urutan ?? mapelMateri.length + 1;

        const newMateri: Materi = {
          id: newId,
          mapel: input.mapel,
          nama: input.nama.trim(),
          jenjang: input.jenjang,
          aktif: input.aktif !== undefined ? input.aktif : true,
          urutan: nextUrutan,
        };

        mockStore.materi.push(newMateri);
        mockStore.persist();
        return enrichMateri(newMateri);
      },
      { isMutation: true }
    );
  }

  public async updateMateri(id: string, input: UpdateMateriInput): Promise<Materi> {
    return mockRunner(
      () => {
        const idx = mockStore.materi.findIndex((item) => item.id === id);
        if (idx === -1) {
          throw new BandrekApiError('unknown', `Materi dengan ID "${id}" tidak ditemukan.`, 404);
        }

        const existing = mockStore.materi[idx];
        const updated: Materi = {
          ...existing,
          mapel: input.mapel ?? existing.mapel,
          nama: input.nama !== undefined ? input.nama.trim() : existing.nama,
          jenjang: input.jenjang ?? existing.jenjang,
          aktif: input.aktif !== undefined ? input.aktif : existing.aktif,
          urutan: input.urutan ?? existing.urutan,
        };

        mockStore.materi[idx] = updated;
        mockStore.persist();
        return enrichMateri(updated);
      },
      { isMutation: true }
    );
  }

  public async deleteMateri(id: string): Promise<DeleteMasterResult> {
    return mockRunner(
      () => {
        const check = checkMasterUsage(
          'materi',
          id,
          mockStore.kegiatan,
          mockStore.kelas,
          mockStore.ceklisManual,
          mockStore.ruangan,
          mockStore.materi
        );

        if (!check.bisaDihapus) {
          return check;
        }

        const idx = mockStore.materi.findIndex((item) => item.id === id);
        if (idx >= 0) {
          mockStore.materi.splice(idx, 1);
          mockStore.persist();
        }

        return check;
      },
      { isMutation: true }
    );
  }

  public async reorderMateri(mapelId: string, orderedMateriIds: string[]): Promise<Materi[]> {
    return mockRunner(
      () => {
        orderedMateriIds.forEach((mId, index) => {
          const m = mockStore.materi.find((item) => item.id === mId && item.mapel === mapelId);
          if (m) {
            m.urutan = index + 1;
          }
        });

        mockStore.persist();
        return mockStore.materi
          .filter((t) => t.mapel === mapelId)
          .sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0))
          .map(enrichMateri);
      },
      { isMutation: true }
    );
  }
}
