import type { IMapelRepository } from '../interfaces/IMapelRepository';
import type {
  MataPelajaran,
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

export class MockMapelRepository implements IMapelRepository {
  public async getAll(): Promise<MataPelajaran[]> {
    return mockRunner(() => {
      return mockStore.mapel.map((m) => ({
        ...m,
        jumlahMateri: mockStore.materi.filter((t) => t.mapel === m.id).length,
      }));
    });
  }

  public async getById(id: string): Promise<MataPelajaran> {
    return mockRunner(() => {
      const m = mockStore.mapel.find((item) => item.id === id);
      if (!m) {
        throw new BandrekApiError('unknown', `Mata Pelajaran dengan ID "${id}" tidak ditemukan.`, 404);
      }
      return {
        ...m,
        jumlahMateri: mockStore.materi.filter((t) => t.mapel === m.id).length,
      };
    });
  }

  public async create(input: CreateMapelInput): Promise<MataPelajaran> {
    return mockRunner(
      () => {
        const newId = `M${mockStore.mapel.length + 1}`;
        const newMapel: MataPelajaran = {
          id: newId,
          nama: input.nama,
          aktif: input.aktif !== undefined ? input.aktif : true,
          jumlahMateri: 0,
        };

        mockStore.mapel.push(newMapel);
        mockStore.persist();
        return newMapel;
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
          nama: input.nama ?? existing.nama,
          aktif: input.aktif !== undefined ? input.aktif : existing.aktif,
        };

        mockStore.mapel[idx] = updated;
        mockStore.persist();
        return {
          ...updated,
          jumlahMateri: mockStore.materi.filter((t) => t.mapel === updated.id).length,
        };
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
    return mockRunner(() => [...mockStore.materi]);
  }

  public async getMateriByMapel(mapelId: string): Promise<Materi[]> {
    return mockRunner(() => {
      return mockStore.materi
        .filter((t) => t.mapel === mapelId)
        .sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0));
    });
  }

  public async createMateri(input: CreateMateriInput): Promise<Materi> {
    return mockRunner(
      () => {
        const newId = `T${mockStore.materi.length + 1}`;
        const mapelMateri = mockStore.materi.filter((t) => t.mapel === input.mapel);
        const nextUrutan = input.urutan ?? mapelMateri.length + 1;

        const newMateri: Materi = {
          id: newId,
          mapel: input.mapel,
          nama: input.nama,
          jenjang: input.jenjang,
          aktif: input.aktif !== undefined ? input.aktif : true,
          urutan: nextUrutan,
        };

        mockStore.materi.push(newMateri);
        mockStore.persist();
        return newMateri;
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
          nama: input.nama ?? existing.nama,
          jenjang: input.jenjang ?? existing.jenjang,
          aktif: input.aktif !== undefined ? input.aktif : existing.aktif,
          urutan: input.urutan ?? existing.urutan,
        };

        mockStore.materi[idx] = updated;
        mockStore.persist();
        return updated;
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
          .sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0));
      },
      { isMutation: true }
    );
  }
}
