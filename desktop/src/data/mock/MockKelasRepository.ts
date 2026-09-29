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

function enrichKelas(k: Kelas): Kelas {
  const anggota = k.anggota || [];
  const kegDirect = mockStore.kegiatan.filter((e) => e.kelas === k.id).length;
  const kegAll = mockStore.kegiatan.filter(
    (e) => e.kelas === k.id || e.siswa.some((sid) => anggota.includes(sid))
  ).length;

  const dapatDihapus = kegDirect === 0;
  const alasanTidakBisaHapus = dapatDihapus
    ? undefined
    : `Tidak bisa dihapus: dipakai sebagai sumber impor di ${kegDirect} kegiatan.`;

  return {
    ...k,
    anggota,
    jumlahSiswa: anggota.length,
    jumlahKegiatan: kegAll,
    jumlahKegiatanLangsung: kegDirect,
    dapatDihapus,
    alasanTidakBisaHapus,
    rincianPenggunaan: kegDirect > 0 ? [`${kegDirect} kegiatan`] : [],
    ringkasanPenggunaan:
      kegAll > 0
        ? `${kegAll} kegiatan menyentuh kelas ini — ${
            kegDirect > 0
              ? `${kegDirect} di antaranya ditandai langsung dengan kelas ini, sisanya lewat anggotanya.`
              : 'semuanya lewat anggotanya, tidak ada yang ditandai kelas ini.'
          }`
        : 'Belum ada kegiatan yang dijadwalkan untuk kelas ini.',
  };
}

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
        .map(enrichKelas)
        .sort((a, b) => a.nama.localeCompare(b.nama, 'id'));
    });
  }

  public async getById(id: string): Promise<Kelas> {
    return mockRunner(() => {
      const k = mockStore.kelas.find((item) => item.id === id);
      if (!k) {
        throw new BandrekApiError('unknown', `Kelas dengan ID "${id}" tidak ditemukan.`, 404);
      }
      return enrichKelas(k);
    });
  }

  public async create(input: CreateKelasInput): Promise<Kelas> {
    return mockRunner(
      () => {
        let n = mockStore.kelas.length + 1;
        while (mockStore.kelas.some((x) => x.id === `K${n}`)) {
          n++;
        }
        const newId = `K${n}`;
        const newKelas: Kelas = {
          id: newId,
          nama: input.nama.trim(),
          jenjang: input.jenjang,
          keterangan: input.keterangan ? input.keterangan.trim() : '',
          anggota: input.anggota || [],
        };

        mockStore.kelas.push(newKelas);
        mockStore.persist();
        return enrichKelas(newKelas);
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
          nama: input.nama !== undefined ? input.nama.trim() : existing.nama,
          jenjang: input.jenjang !== undefined ? input.jenjang : existing.jenjang,
          keterangan: input.keterangan !== undefined ? input.keterangan.trim() : existing.keterangan,
          anggota: input.anggota !== undefined ? input.anggota : existing.anggota,
        };

        mockStore.kelas[idx] = updated;
        mockStore.persist();
        return enrichKelas(updated);
      },
      { isMutation: true }
    );
  }

  public async ubahAnggota(kelasId: string, siswaId: string, tambah: boolean): Promise<Kelas> {
    return mockRunner(
      () => {
        const idx = mockStore.kelas.findIndex((item) => item.id === idToClassId(kelasId));
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
        };

        mockStore.kelas[idx] = updated;
        mockStore.persist();
        return enrichKelas(updated);
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

function idToClassId(id: string): string {
  return id;
}
