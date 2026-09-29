import type { ISubjekRepository } from '../interfaces/ISubjekRepository';
import type {
  Subjek,
  SubjekFilterParams,
  CreateSubjekInput,
  UpdateSubjekInput,
  DeleteMasterResult,
} from '../types/master';
import { BandrekApiError } from '../types/simulasi';
import { mockRunner } from './mockRunner';
import { mockStore } from './mockStore';
import { checkMasterUsage } from './businessRules';

export class MockSubjekRepository implements ISubjekRepository {
  public async getAll(filter: SubjekFilterParams = {}): Promise<Subjek[]> {
    return mockRunner(() => {
      const { aktifOnly = false, peran = 'semua', q } = filter;

      return mockStore.subjek
        .filter((s) => {
          if (aktifOnly && !s.aktif) return false;
          if (peran !== 'semua' && s.peran !== peran) return false;
          if (q && q.trim().length > 0) {
            const qLower = q.trim().toLowerCase();
            const matchNama = s.nama.toLowerCase().includes(qLower);
            const matchKontak = s.kontak?.toLowerCase().includes(qLower);
            if (!matchNama && !matchKontak) return false;
          }
          return true;
        })
        .map((s) => ({
          ...s,
          jumlahKegiatan: mockStore.kegiatan.filter((k) => k.subjek.some((sub) => sub.id === s.id)).length,
        }))
        .sort((a, b) => a.nama.localeCompare(b.nama, 'id'));
    });
  }

  public async getById(id: string): Promise<Subjek> {
    return mockRunner(() => {
      const s = mockStore.subjek.find((item) => item.id === id);
      if (!s) {
        throw new BandrekApiError('unknown', `Subjek dengan ID "${id}" tidak ditemukan.`, 404);
      }
      return {
        ...s,
        jumlahKegiatan: mockStore.kegiatan.filter((k) => k.subjek.some((sub) => sub.id === s.id)).length,
      };
    });
  }

  public async create(input: CreateSubjekInput): Promise<Subjek> {
    return mockRunner(
      () => {
        const newId = `U${mockStore.subjek.length + 1}`;
        const newSubjek: Subjek = {
          id: newId,
          nama: input.nama,
          kelamin: input.kelamin,
          peran: input.peran,
          aktif: input.aktif !== undefined ? input.aktif : true,
          mapel: input.mapel || [],
          kontak: input.kontak || '',
          jumlahKegiatan: 0,
        };

        mockStore.subjek.push(newSubjek);
        mockStore.persist();
        return newSubjek;
      },
      { isMutation: true }
    );
  }

  public async update(id: string, input: UpdateSubjekInput): Promise<Subjek> {
    return mockRunner(
      () => {
        const idx = mockStore.subjek.findIndex((item) => item.id === id);
        if (idx === -1) {
          throw new BandrekApiError('unknown', `Subjek dengan ID "${id}" tidak ditemukan.`, 404);
        }

        const existing = mockStore.subjek[idx];
        const updated: Subjek = {
          ...existing,
          nama: input.nama ?? existing.nama,
          kelamin: input.kelamin ?? existing.kelamin,
          peran: input.peran ?? existing.peran,
          aktif: input.aktif !== undefined ? input.aktif : existing.aktif,
          mapel: input.mapel !== undefined ? input.mapel : existing.mapel,
          kontak: input.kontak !== undefined ? input.kontak : existing.kontak,
        };

        mockStore.subjek[idx] = updated;
        mockStore.persist();
        return {
          ...updated,
          jumlahKegiatan: mockStore.kegiatan.filter((k) => k.subjek.some((sub) => sub.id === updated.id)).length,
        };
      },
      { isMutation: true }
    );
  }

  public async delete(id: string): Promise<DeleteMasterResult> {
    return mockRunner(
      () => {
        const check = checkMasterUsage(
          'subjek',
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

        const idx = mockStore.subjek.findIndex((item) => item.id === id);
        if (idx >= 0) {
          mockStore.subjek.splice(idx, 1);
          mockStore.persist();
        }

        return check;
      },
      { isMutation: true }
    );
  }
}
