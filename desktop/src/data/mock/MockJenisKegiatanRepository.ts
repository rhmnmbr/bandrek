import type { IJenisKegiatanRepository } from '../interfaces/IJenisKegiatanRepository';
import type {
  JenisKegiatan,
  JenisKegiatanFilterParams,
  CreateJenisKegiatanInput,
  UpdateJenisKegiatanInput,
  DeleteMasterResult,
} from '../types/master';
import { BandrekApiError } from '../types/simulasi';
import { mockRunner } from './mockRunner';
import { mockStore } from './mockStore';
import { checkMasterUsage } from './businessRules';

export class MockJenisKegiatanRepository implements IJenisKegiatanRepository {
  private enrichJenisKegiatan(j: JenisKegiatan): JenisKegiatan {
    const matchingKegiatan = mockStore.kegiatan.filter((k) => k.jenis === j.id);
    const nKegiatan = matchingKegiatan.length;
    const dapatDihapus = nKegiatan === 0;
    const alasanTidakBisaHapus = dapatDihapus
      ? undefined
      : `Tidak bisa dihapus: ${nKegiatan} kegiatan menunjuk jenis kegiatan ini. Ubah dulu kegiatan itu.`;

    const rincianPenggunaan = matchingKegiatan.slice(0, 10).map((k) => k.nama);
    const ringkasanPenggunaan =
      nKegiatan > 0
        ? `${nKegiatan} kegiatan tercatat memakai jenis kegiatan ini.`
        : 'Belum pernah dipakai di kegiatan mana pun.';

    return {
      ...j,
      jumlahKegiatan: nKegiatan,
      dapatDihapus,
      alasanTidakBisaHapus,
      rincianPenggunaan,
      ringkasanPenggunaan,
    };
  }

  public async getAll(filter?: JenisKegiatanFilterParams): Promise<JenisKegiatan[]> {
    return mockRunner(() => {
      let list = mockStore.jenis.map((j) => this.enrichJenisKegiatan(j));

      if (filter?.q && filter.q.trim().length > 0) {
        const qLower = filter.q.trim().toLowerCase();
        list = list.filter((j) => j.nama.toLowerCase().includes(qLower));
      }

      return list.sort((a, b) => a.nama.localeCompare(b.nama, 'id'));
    });
  }

  public async getById(id: string): Promise<JenisKegiatan> {
    return mockRunner(() => {
      const j = mockStore.jenis.find((item) => item.id === id);
      if (!j) {
        throw new BandrekApiError(
          'unknown',
          `Jenis kegiatan dengan ID "${id}" tidak ditemukan.`,
          404
        );
      }
      return this.enrichJenisKegiatan(j);
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
        return this.enrichJenisKegiatan(newJenis);
      },
      { isMutation: true }
    );
  }

  public async update(id: string, input: UpdateJenisKegiatanInput): Promise<JenisKegiatan> {
    return mockRunner(
      () => {
        const idx = mockStore.jenis.findIndex((item) => item.id === id);
        if (idx === -1) {
          throw new BandrekApiError(
            'unknown',
            `Jenis kegiatan dengan ID "${id}" tidak ditemukan.`,
            404
          );
        }

        const existing = mockStore.jenis[idx];
        const updated: JenisKegiatan = {
          ...existing,
          nama: input.nama ?? existing.nama,
          warna: input.warna ?? existing.warna,
          materiWajib:
            input.materiWajib !== undefined ? input.materiWajib : existing.materiWajib,
          siswaWajib:
            input.siswaWajib !== undefined ? input.siswaWajib : existing.siswaWajib,
        };

        mockStore.jenis[idx] = updated;
        mockStore.persist();
        return this.enrichJenisKegiatan(updated);
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
