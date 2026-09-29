import type { IMatriksRepository } from '../interfaces/IMatriksRepository';
import type { JenjangPendidikan } from '../types/common';
import type {
  MatriksBelajarResult,
  MatriksFilterParams,
  CeklisManual,
  TandaiManualInput,
} from '../types/matriks';
import { BandrekApiError } from '../types/simulasi';
import { mockRunner } from './mockRunner';
import { mockStore } from './mockStore';
import { computeMatriksBelajar } from './businessRules';

export class MockMatriksRepository implements IMatriksRepository {
  public async getMatriks(
    mapelId: string,
    jenjang: JenjangPendidikan,
    filter: MatriksFilterParams = {}
  ): Promise<MatriksBelajarResult> {
    return mockRunner(() => {
      return computeMatriksBelajar(
        mapelId,
        jenjang,
        filter,
        mockStore.materi,
        mockStore.siswa,
        mockStore.kelas,
        mockStore.mapel,
        mockStore.kegiatan,
        mockStore.ceklisManual,
        mockStore.today,
        mockStore.now
      );
    });
  }

  public async tandaiManual(input: TandaiManualInput): Promise<CeklisManual> {
    return mockRunner(
      () => {
        // Cari jika sudah ada entri manual sebelumnya untuk pasangan siswa + materi
        const existingIdx = mockStore.ceklisManual.findIndex(
          (cm) => cm.siswa === input.siswaId && cm.materi === input.materiId
        );

        const newId = existingIdx >= 0 ? mockStore.ceklisManual[existingIdx].id : `cm_${Date.now()}`;
        const item: CeklisManual = {
          id: newId,
          siswa: input.siswaId,
          materi: input.materiId,
          tanggal: input.tanggal ?? null,
          catatan: input.catatan || '',
          oleh: input.oleh || 'Operator',
          dicatat: `${mockStore.today} ${mockStore.now}`,
          sumber: 'manual',
        };

        if (existingIdx >= 0) {
          mockStore.ceklisManual[existingIdx] = item;
        } else {
          mockStore.ceklisManual.push(item);
        }

        mockStore.persist();
        return item;
      },
      { isMutation: true }
    );
  }

  public async hapusManual(id: string): Promise<void> {
    return mockRunner(
      () => {
        const idx = mockStore.ceklisManual.findIndex((cm) => cm.id === id);
        if (idx === -1) {
          throw new BandrekApiError('unknown', `Ceklis manual dengan ID "${id}" tidak ditemukan.`, 404);
        }
        mockStore.ceklisManual.splice(idx, 1);
        mockStore.persist();
      },
      { isMutation: true }
    );
  }

  public async tandaiManualMassal(items: TandaiManualInput[]): Promise<CeklisManual[]> {
    return mockRunner(
      () => {
        const results: CeklisManual[] = [];
        for (const input of items) {
          const existingIdx = mockStore.ceklisManual.findIndex(
            (cm) => cm.siswa === input.siswaId && cm.materi === input.materiId
          );

          const newId = existingIdx >= 0 ? mockStore.ceklisManual[existingIdx].id : `cm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          const item: CeklisManual = {
            id: newId,
            siswa: input.siswaId,
            materi: input.materiId,
            tanggal: input.tanggal ?? null,
            catatan: input.catatan || '',
            oleh: input.oleh || 'Operator',
            dicatat: `${mockStore.today} ${mockStore.now}`,
            sumber: 'manual',
          };

          if (existingIdx >= 0) {
            mockStore.ceklisManual[existingIdx] = item;
          } else {
            mockStore.ceklisManual.push(item);
          }
          results.push(item);
        }

        mockStore.persist();
        return results;
      },
      { isMutation: true }
    );
  }
}
