import type { ITempatRepository } from '../interfaces/ITempatRepository';
import type {
  Tempat,
  TempatFilterParams,
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

function enrichRuangan(r: Ruangan): Ruangan {
  const kegCount = mockStore.kegiatan.filter((k) => k.ruangan === r.id).length;
  const tempatObj = mockStore.tempat.find((t) => t.id === r.tempat);

  const dapatDihapus = kegCount === 0;
  const alasanTidakBisaHapus = dapatDihapus
    ? undefined
    : `Tidak bisa dihapus: ${kegCount} kegiatan menunjuk ruangan ini. Ubah dulu kegiatan itu.`;

  return {
    ...r,
    kapasitas: r.kapasitas || 12,
    namaTempat: tempatObj?.nama,
    jumlahKegiatan: kegCount,
    dapatDihapus,
    alasanTidakBisaHapus,
    ringkasanPenggunaan:
      kegCount > 0
        ? `${kegCount} kegiatan tercatat memakai ruangan ini.`
        : 'Belum pernah dipakai di kegiatan mana pun.',
  };
}

function enrichTempat(t: Tempat): Tempat {
  const rooms = mockStore.ruangan.filter((r) => r.tempat === t.id).map(enrichRuangan);
  const roomIds = rooms.map((r) => r.id);
  const kegCount = mockStore.kegiatan.filter((k) => roomIds.includes(k.ruangan)).length;
  const anakN = rooms.length;

  const dapatDihapus = anakN === 0 && kegCount === 0;
  let alasanTidakBisaHapus: string | undefined;
  if (kegCount > 0) {
    alasanTidakBisaHapus = `Tidak bisa dihapus: ${kegCount} kegiatan menunjuk tempat ini. Ubah dulu kegiatan itu.`;
  } else if (anakN > 0) {
    alasanTidakBisaHapus = `Kosongkan dulu ${anakN} ruangan di dalamnya.`;
  }

  return {
    ...t,
    jumlahRuangan: anakN,
    jumlahKegiatan: kegCount,
    dapatDihapus,
    alasanTidakBisaHapus,
    rincianPenggunaan: kegCount > 0 ? [`${kegCount} kegiatan`] : [],
    ringkasanPenggunaan:
      kegCount > 0
        ? `${kegCount} kegiatan tercatat memakai tempat ini.`
        : 'Belum pernah dipakai di kegiatan mana pun.',
    ruangan: rooms,
  };
}

export class MockTempatRepository implements ITempatRepository {
  public async getAll(filter: TempatFilterParams = {}): Promise<Tempat[]> {
    return mockRunner(() => {
      const { q } = filter;
      return mockStore.tempat
        .filter((t) => {
          if (q && q.trim().length > 0) {
            const qLower = q.trim().toLowerCase();
            if (!t.nama.toLowerCase().includes(qLower)) return false;
          }
          return true;
        })
        .map(enrichTempat)
        .sort((a, b) => a.nama.localeCompare(b.nama, 'id'));
    });
  }

  public async getById(id: string): Promise<Tempat> {
    return mockRunner(() => {
      const t = mockStore.tempat.find((item) => item.id === id);
      if (!t) {
        throw new BandrekApiError('unknown', `Tempat dengan ID "${id}" tidak ditemukan.`, 404);
      }
      return enrichTempat(t);
    });
  }

  public async create(input: CreateTempatInput): Promise<Tempat> {
    return mockRunner(
      () => {
        let n = mockStore.tempat.length + 1;
        while (mockStore.tempat.some((x) => x.id === `P${n}`)) {
          n++;
        }
        const newId = `P${n}`;
        const newTempat: Tempat = {
          id: newId,
          nama: input.nama.trim(),
          jumlahRuangan: 0,
          ruangan: [],
        };

        mockStore.tempat.push(newTempat);
        mockStore.persist();
        return enrichTempat(newTempat);
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
          nama: input.nama !== undefined ? input.nama.trim() : existing.nama,
        };

        mockStore.tempat[idx] = updated;
        mockStore.persist();
        return enrichTempat(updated);
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
    return mockRunner(() => mockStore.ruangan.map(enrichRuangan));
  }

  public async getRuanganByTempat(tempatId: string): Promise<Ruangan[]> {
    return mockRunner(() => {
      return mockStore.ruangan
        .filter((r) => r.tempat === tempatId)
        .map(enrichRuangan)
        .sort((a, b) => a.nama.localeCompare(b.nama, 'id'));
    });
  }

  public async createRuangan(input: CreateRuanganInput): Promise<Ruangan> {
    return mockRunner(
      () => {
        let n = mockStore.ruangan.length + 1;
        while (mockStore.ruangan.some((x) => x.id === `R${n}`)) {
          n++;
        }
        const newId = `R${n}`;
        const newRuangan: Ruangan = {
          id: newId,
          tempat: input.tempat,
          nama: input.nama.trim(),
          kapasitas: input.kapasitas != null ? input.kapasitas : 12,
        };

        mockStore.ruangan.push(newRuangan);
        mockStore.persist();
        return enrichRuangan(newRuangan);
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
        const updated: Ruangan = {
          ...existing,
          tempat: input.tempat ?? existing.tempat,
          nama: input.nama !== undefined ? input.nama.trim() : existing.nama,
          kapasitas: input.kapasitas !== undefined ? input.kapasitas : existing.kapasitas,
        };

        mockStore.ruangan[idx] = updated;
        mockStore.persist();
        return enrichRuangan(updated);
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
