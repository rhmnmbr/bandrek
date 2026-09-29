import type { ITempatRepository } from '../interfaces/ITempatRepository';
import type {
  Tempat,
  CreateTempatInput,
  UpdateTempatInput,
  Ruangan,
  CreateRuanganInput,
  UpdateRuanganInput,
  DeleteMasterResult,
} from '../types/master';
import { BandrekApiError } from '../types/simulasi';
import { mockRunner } from './mockRunner';
import { mockStore } from './mockStore';
import { checkMasterUsage } from './businessRules';

export class MockTempatRepository implements ITempatRepository {
  public async getAll(): Promise<Tempat[]> {
    return mockRunner(() => {
      return mockStore.tempat.map((t) => {
        const rooms = mockStore.ruangan.filter((r) => r.tempat === t.id);
        return {
          ...t,
          jumlahRuangan: rooms.length,
          ruangan: rooms.map((r) => ({ ...r, namaTempat: t.nama })),
        };
      });
    });
  }

  public async getById(id: string): Promise<Tempat> {
    return mockRunner(() => {
      const t = mockStore.tempat.find((item) => item.id === id);
      if (!t) {
        throw new BandrekApiError('unknown', `Tempat dengan ID "${id}" tidak ditemukan.`, 404);
      }
      const rooms = mockStore.ruangan.filter((r) => r.tempat === t.id);
      return {
        ...t,
        jumlahRuangan: rooms.length,
        ruangan: rooms.map((r) => ({ ...r, namaTempat: t.nama })),
      };
    });
  }

  public async create(input: CreateTempatInput): Promise<Tempat> {
    return mockRunner(
      () => {
        const newId = `P${mockStore.tempat.length + 1}`;
        const newTempat: Tempat = {
          id: newId,
          nama: input.nama,
          jumlahRuangan: 0,
          ruangan: [],
        };

        mockStore.tempat.push(newTempat);
        mockStore.persist();
        return newTempat;
      },
      { isMutation: true }
    );
  }

  public async update(id: string, input: UpdateTempatInput): Promise<Tempat> {
    return mockRunner(
      () => {
        const idx = mockStore.tempat.findIndex((item) => item.id === id);
        if (idx === -1) {
          throw new BandrekApiError('unknown', `Tempat dengan ID "${id}" tidak ditemukan.`, 404);
        }

        const existing = mockStore.tempat[idx];
        const updated: Tempat = {
          ...existing,
          nama: input.nama,
        };

        mockStore.tempat[idx] = updated;
        mockStore.persist();

        const rooms = mockStore.ruangan.filter((r) => r.tempat === updated.id);
        return {
          ...updated,
          jumlahRuangan: rooms.length,
          ruangan: rooms.map((r) => ({ ...r, namaTempat: updated.nama })),
        };
      },
      { isMutation: true }
    );
  }

  public async delete(id: string): Promise<DeleteMasterResult> {
    return mockRunner(
      () => {
        const check = checkMasterUsage(
          'tempat',
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

        const idx = mockStore.tempat.findIndex((item) => item.id === id);
        if (idx >= 0) {
          mockStore.tempat.splice(idx, 1);
          mockStore.persist();
        }

        return check;
      },
      { isMutation: true }
    );
  }

  // --------------------------------------------------------------------------
  // RUANGAN
  // --------------------------------------------------------------------------
  public async getAllRuangan(): Promise<Ruangan[]> {
    return mockRunner(() => {
      return mockStore.ruangan.map((r) => {
        const place = mockStore.tempat.find((p) => p.id === r.tempat);
        return {
          ...r,
          namaTempat: place ? place.nama : 'Tempat',
        };
      });
    });
  }

  public async getRuanganByTempat(tempatId: string): Promise<Ruangan[]> {
    return mockRunner(() => {
      const place = mockStore.tempat.find((p) => p.id === tempatId);
      return mockStore.ruangan
        .filter((r) => r.tempat === tempatId)
        .map((r) => ({
          ...r,
          namaTempat: place ? place.nama : 'Tempat',
        }));
    });
  }

  public async createRuangan(input: CreateRuanganInput): Promise<Ruangan> {
    return mockRunner(
      () => {
        const newId = `R${mockStore.ruangan.length + 1}`;
        const place = mockStore.tempat.find((p) => p.id === input.tempat);
        const newRuangan: Ruangan = {
          id: newId,
          tempat: input.tempat,
          nama: input.nama,
          kapasitas: input.kapasitas,
          namaTempat: place ? place.nama : 'Tempat',
        };

        mockStore.ruangan.push(newRuangan);
        mockStore.persist();
        return newRuangan;
      },
      { isMutation: true }
    );
  }

  public async updateRuangan(id: string, input: UpdateRuanganInput): Promise<Ruangan> {
    return mockRunner(
      () => {
        const idx = mockStore.ruangan.findIndex((item) => item.id === id);
        if (idx === -1) {
          throw new BandrekApiError('unknown', `Ruangan dengan ID "${id}" tidak ditemukan.`, 404);
        }

        const existing = mockStore.ruangan[idx];
        const targetTempatId = input.tempat ?? existing.tempat;
        const place = mockStore.tempat.find((p) => p.id === targetTempatId);

        const updated: Ruangan = {
          ...existing,
          tempat: targetTempatId,
          nama: input.nama ?? existing.nama,
          kapasitas: input.kapasitas !== undefined ? input.kapasitas : existing.kapasitas,
          namaTempat: place ? place.nama : 'Tempat',
        };

        mockStore.ruangan[idx] = updated;
        mockStore.persist();
        return updated;
      },
      { isMutation: true }
    );
  }

  public async deleteRuangan(id: string): Promise<DeleteMasterResult> {
    return mockRunner(
      () => {
        const check = checkMasterUsage(
          'ruangan',
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

        const idx = mockStore.ruangan.findIndex((item) => item.id === id);
        if (idx >= 0) {
          mockStore.ruangan.splice(idx, 1);
          mockStore.persist();
        }

        return check;
      },
      { isMutation: true }
    );
  }
}
