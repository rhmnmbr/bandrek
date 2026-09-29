import type { ISiswaRepository } from '../interfaces/ISiswaRepository';
import type {
  Siswa,
  SiswaFilterParams,
  CreateSiswaInput,
  UpdateSiswaInput,
  DeleteMasterResult,
} from '../types/master';
import { BandrekApiError } from '../types/simulasi';
import { mockRunner } from './mockRunner';
import { mockStore } from './mockStore';
import { checkMasterUsage } from './businessRules';

export class MockSiswaRepository implements ISiswaRepository {
  public async getAll(filter: SiswaFilterParams = {}): Promise<Siswa[]> {
    return mockRunner(() => {
      const { status = 'aktif', jenjang = 'semua', kelasId, q } = filter;

      return mockStore.siswa
        .filter((s) => {
          if (status === 'aktif' && !s.aktif) return false;
          if (status === 'nonaktif' && s.aktif) return false;
          if (jenjang !== 'semua' && s.jenjang !== jenjang) return false;

          if (kelasId) {
            const k = mockStore.kelas.find((item) => item.id === kelasId);
            if (k && !k.anggota.includes(s.id)) return false;
          }

          if (q && q.trim().length > 0) {
            const qLower = q.trim().toLowerCase();
            const matchNama = s.nama.toLowerCase().includes(qLower);
            const matchAsal = s.asal?.toLowerCase().includes(qLower);
            const matchWali = s.waliNama?.toLowerCase().includes(qLower);
            if (!matchNama && !matchAsal && !matchWali) return false;
          }

          return true;
        })
        .map((s) => ({
          ...s,
          daftarKelas: mockStore.kelas.filter((k) => k.anggota.includes(s.id)).map((k) => k.id),
        }))
        .sort((a, b) => a.nama.localeCompare(b.nama, 'id'));
    });
  }

  public async getById(id: string): Promise<Siswa> {
    return mockRunner(() => {
      const s = mockStore.siswa.find((item) => item.id === id);
      if (!s) {
        throw new BandrekApiError('unknown', `Siswa dengan ID "${id}" tidak ditemukan.`, 404);
      }
      return {
        ...s,
        daftarKelas: mockStore.kelas.filter((k) => k.anggota.includes(s.id)).map((k) => k.id),
      };
    });
  }

  public async create(input: CreateSiswaInput): Promise<Siswa> {
    return mockRunner(
      () => {
        const newId = `S${mockStore.siswa.length + 1}`;
        const newSiswa: Siswa = {
          id: newId,
          nama: input.nama,
          jenjang: input.jenjang,
          aktif: input.aktif !== undefined ? input.aktif : true,
          lahir: input.lahir,
          kelamin: input.kelamin,
          asal: input.asal || '',
          waliNama: input.waliNama || '',
          waliWa: input.waliWa || '',
          bergabung: mockStore.today,
          catatan: input.catatan || '',
          daftarKelas: [],
        };

        mockStore.siswa.push(newSiswa);
        mockStore.persist();
        return newSiswa;
      },
      { isMutation: true }
    );
  }

  public async update(id: string, input: UpdateSiswaInput): Promise<Siswa> {
    return mockRunner(
      () => {
        const idx = mockStore.siswa.findIndex((item) => item.id === id);
        if (idx === -1) {
          throw new BandrekApiError('unknown', `Siswa dengan ID "${id}" tidak ditemukan.`, 404);
        }

        const existing = mockStore.siswa[idx];
        const updated: Siswa = {
          ...existing,
          nama: input.nama ?? existing.nama,
          jenjang: input.jenjang ?? existing.jenjang,
          aktif: input.aktif !== undefined ? input.aktif : existing.aktif,
          lahir: input.lahir ?? existing.lahir,
          kelamin: input.kelamin ?? existing.kelamin,
          asal: input.asal !== undefined ? input.asal : existing.asal,
          waliNama: input.waliNama !== undefined ? input.waliNama : existing.waliNama,
          waliWa: input.waliWa !== undefined ? input.waliWa : existing.waliWa,
          catatan: input.catatan !== undefined ? input.catatan : existing.catatan,
        };

        mockStore.siswa[idx] = updated;
        mockStore.persist();
        return {
          ...updated,
          daftarKelas: mockStore.kelas.filter((k) => k.anggota.includes(updated.id)).map((k) => k.id),
        };
      },
      { isMutation: true }
    );
  }

  public async delete(id: string): Promise<DeleteMasterResult> {
    return mockRunner(
      () => {
        const check = checkMasterUsage(
          'siswa',
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

        const idx = mockStore.siswa.findIndex((item) => item.id === id);
        if (idx >= 0) {
          mockStore.siswa.splice(idx, 1);
          mockStore.persist();
        }

        return check;
      },
      { isMutation: true }
    );
  }
}
