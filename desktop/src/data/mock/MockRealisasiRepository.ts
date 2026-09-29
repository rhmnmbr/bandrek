import type { IRealisasiRepository } from '../interfaces/IRealisasiRepository';
import type { Kegiatan } from '../types/kegiatan';
import type { Realisasi, SimpanRealisasiInput } from '../types/realisasi';
import { BandrekApiError } from '../types/simulasi';
import { mockRunner } from './mockRunner';
import { mockStore } from './mockStore';
import { enrichKegiatan, computeStatusKegiatan } from './businessRules';

export class MockRealisasiRepository implements IRealisasiRepository {
  public async getByKegiatanId(kegiatanId: string): Promise<Realisasi | null> {
    return mockRunner(() => {
      const k = mockStore.kegiatan.find((item) => item.id === kegiatanId);
      if (!k) {
        throw new BandrekApiError('unknown', `Kegiatan dengan ID "${kegiatanId}" tidak ditemukan.`, 404);
      }
      return k.realisasi || null;
    });
  }

  public async simpan(
    kegiatanId: string,
    input: SimpanRealisasiInput
  ): Promise<{ kegiatan: Kegiatan; realisasi: Realisasi }> {
    return mockRunner(
      () => {
        const idx = mockStore.kegiatan.findIndex((item) => item.id === kegiatanId);
        if (idx === -1) {
          throw new BandrekApiError('unknown', `Kegiatan dengan ID "${kegiatanId}" tidak ditemukan.`, 404);
        }

        const existing = mockStore.kegiatan[idx];

        const realisasiData: Realisasi = {
          mulai: input.mulai,
          selesai: input.selesai,
          materi: input.materi || existing.materi,
          ketuntasan: input.ketuntasan,
          catatan: input.catatan || '',
          kehadiran: input.kehadiranSiswa,
          catatanSiswa: input.catatanSiswa || {},
          kehadiranSubjek: input.kehadiranSubjek,
          catatanSubjek: input.catatanSubjek || {},
          diisiOleh: input.diisiOleh,
          diisiPada: `${mockStore.today} ${mockStore.now}`,
        };

        const updated = {
          ...existing,
          status: 'terealisasi' as const,
          realisasi: realisasiData,
        };

        mockStore.kegiatan[idx] = updated;
        mockStore.persist();

        const enriched = enrichKegiatan(
          updated,
          mockStore.tempat,
          mockStore.ruangan,
          mockStore.jenis,
          mockStore.subjek,
          mockStore.mapel,
          mockStore.materi,
          mockStore.today,
          mockStore.now
        );

        return {
          kegiatan: enriched,
          realisasi: realisasiData,
        };
      },
      { isMutation: true }
    );
  }

  public async getPerluRealisasiCount(): Promise<number> {
    return mockRunner(() => {
      let count = 0;
      for (const k of mockStore.kegiatan) {
        const status = computeStatusKegiatan(
          k.status,
          k.realisasi,
          k.tanggal,
          k.selesai,
          mockStore.today,
          mockStore.now
        );
        if (status === 'belum_direalisasi') {
          count += 1;
        }
      }
      return count;
    });
  }
}
