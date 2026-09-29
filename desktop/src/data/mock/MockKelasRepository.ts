import type { IKelasRepository } from '../interfaces/IKelasRepository';
import type {
  Kelas,
  KelasFilterParams,
  CreateKelasInput,
  UpdateKelasInput,
  DeleteMasterResult,
} from '../types/master';
import { BandrekApiError } from '../types/simulasi';
import { mockRunner } from './mockRunner';
import { mockStore } from './mockStore';
import { checkMasterUsage } from './businessRules';

export class MockKelasRepository implements IKelasRepository {
  public async getAll(filter: KelasFilterParams = {}): Promise<Kelas[]> {
    return mockRunner(() => {
      const { jenjang = 'semua', q } = filter;

      return mockStore.kelas
        .filter((k) => {
          if (jenjang !== 'semua' && k.jenjang !== jenjang) return false;
          if (q && q.trim().length > 0) {
            const qLower = q.trim().toLowerCase();
            const matchNama = k.nama.toLowerCase().includes(qLower);
            const matchKet = k.keterangan?.toLowerCase().includes(qLower);
            if (!matchNama && !matchKet) return false;
          }
          return true;
        })
        .map((k) => ({
          ...k,
          jumlahSiswa: k.anggota.length,
        }))
        .sort((a, b) => a.nama.localeCompare(b.nama, 'id'));
    });
  }

  public async getById(id: string): Promise<Kelas> {
    return mockRunner(() => {
      const k = mockStore.kelas.find((item) => item.id === id);
      if (!k) {
        throw new BandrekApiError('unknown', `Kelas dengan ID "${id}" tidak ditemukan.`, 404);
      }
      return {
        ...k,
        jumlahSiswa: k.anggota.length,
      };
    });
  }

  public async create(input: CreateKelasInput): Promise<Kelas> {
    return mockRunner(
      () => {
        const newId = `K${mockStore.kelas.length + 1}`;
        const newKelas: Kelas = {
          id: newId,
          nama: input.nama,
          jenjang: input.jenjang,
          keterangan: input.keterangan || '',
          anggota: input.anggota || [],
          jumlahSiswa: (input.anggota || []).length,
        };

        mockStore.kelas.push(newKelas);
        mockStore.persist();
        return newKelas;
      },
      { isMutation: true }
    );
  }

  public async update(id: string, input: UpdateKelasInput): Promise<Kelas> {
    return mockRunner(
      () => {
        const idx = mockStore.kelas.findIndex((item) => item.id === id);
        if (idx === -1) {
          throw new BandrekApiError('unknown', `Kelas dengan ID "${id}" tidak ditemukan.`, 404);
        }

        const existing = mockStore.kelas[idx];
        const updated: Kelas = {
          ...existing,
          nama: input.nama ?? existing.nama,
          jenjang: input.jenjang !== undefined ? input.jenjang : existing.jenjang,
          keterangan: input.keterangan !== undefined ? input.keterangan : existing.keterangan,
          anggota: input.anggota !== undefined ? input.anggota : existing.anggota,
        };

        mockStore.kelas[idx] = updated;
        mockStore.persist();
        return {
          ...updated,
          jumlahSiswa: updated.anggota.length,
        };
      },
      { isMutation: true }
    );
  }

  public async ubahAnggota(kelasId: string, siswaId: string, tambah: boolean): Promise<Kelas> {
    return mockRunner(
      () => {
        const idx = mockStore.kelas.findIndex((item) => item.id === kelasId);
        if (idx === -1) {
          throw new BandrekApiError('unknown', `Kelas dengan ID "${kelasId}" tidak ditemukan.`, 404);
        }

        const existing = mockStore.kelas[idx];
        let newAnggota = [...existing.anggota];
        if (tambah) {
          if (!newAnggota.includes(siswaId)) {
            newAnggota.push(siswaId);
          }
        } else {
          newAnggota = newAnggota.filter((id) => id !== siswaId);
        }

        const updated: Kelas = {
          ...existing,
          anggota: newAnggota,
          jumlahSiswa: newAnggota.length,
        };

        mockStore.kelas[idx] = updated;
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
          'kelas',
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

        const idx = mockStore.kelas.findIndex((item) => item.id === id);
        if (idx >= 0) {
          mockStore.kelas.splice(idx, 1);
          mockStore.persist();
        }

        return check;
      },
      { isMutation: true }
    );
  }
}
