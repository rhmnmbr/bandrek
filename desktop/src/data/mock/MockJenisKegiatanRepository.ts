import type { IJenisKegiatanRepository } from '../interfaces/IJenisKegiatanRepository';
import type {
  JenisKegiatan,
  CreateJenisKegiatanInput,
  UpdateJenisKegiatanInput,
  DeleteMasterResult,
} from '../types/master';
import { BandrekApiError } from '../types/simulasi';
import { mockRunner } from './mockRunner';
import { mockStore } from './mockStore';
import { checkMasterUsage } from './businessRules';

export class MockJenisKegiatanRepository implements IJenisKegiatanRepository {
  public async getAll(): Promise<JenisKegiatan[]> {
    return mockRunner(() => [...mockStore.jenis]);
  }

  public async getById(id: string): Promise<JenisKegiatan> {
    return mockRunner(() => {
      const j = mockStore.jenis.find((item) => item.id === id);
      if (!j) {
        throw new BandrekApiError('unknown', `Jenis kegiatan dengan ID "${id}" tidak ditemukan.`, 404);
      }
      return j;
    });
  }

  public async create(input: CreateJenisKegiatanInput): Promise<JenisKegiatan> {
    return mockRunner(
      () => {
        const newId = `J${mockStore.jenis.length + 1}`;
        const newJenis: JenisKegiatan = {
          id: newId,
          nama: input.nama,
          warna: input.warna,
          materiWajib: input.materiWajib,
          siswaWajib: input.siswaWajib,
        };

        mockStore.jenis.push(newJenis);
        mockStore.persist();
        return newJenis;
      },
      { isMutation: true }
    );
  }

  public async update(id: string, input: UpdateJenisKegiatanInput): Promise<JenisKegiatan> {
    return mockRunner(
      () => {
        const idx = mockStore.jenis.findIndex((item) => item.id === id);
        if (idx === -1) {
          throw new BandrekApiError('unknown', `Jenis kegiatan dengan ID "${id}" tidak ditemukan.`, 404);
        }

        const existing = mockStore.jenis[idx];
        const updated: JenisKegiatan = {
          ...existing,
          nama: input.nama ?? existing.nama,
          warna: input.warna ?? existing.warna,
          materiWajib: input.materiWajib !== undefined ? input.materiWajib : existing.materiWajib,
          siswaWajib: input.siswaWajib !== undefined ? input.siswaWajib : existing.siswaWajib,
        };

        mockStore.jenis[idx] = updated;
        mockStore.persist();
        return updated;
      },
      { isMutation: true }
    );
  }

  public async delete(id: string): Promise<DeleteMasterResult> {
    return mockRunner(
      () => {
        const check = checkMasterUsage(
          'jenis',
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

        const idx = mockStore.jenis.findIndex((item) => item.id === id);
        if (idx >= 0) {
          mockStore.jenis.splice(idx, 1);
          mockStore.persist();
        }

        return check;
      },
      { isMutation: true }
    );
  }
}
