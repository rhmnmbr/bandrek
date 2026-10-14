import type { IRealisasiRepository } from '../../interfaces/IRealisasiRepository';
import type { Kegiatan } from '../../types/kegiatan';
import type { Realisasi, SimpanRealisasiInput } from '../../types/realisasi';
import {
  getActivityRealization,
  saveActivityRealization,
  getPendingRealizationCount,
  getActivityById,
} from '../../api/generated/endpoints';
import type {
  ActivityDto,
  RealizationDto,
  PendingCountDto,
} from '../../api/generated/models';
import { ApiError } from '../../api/client';
import {
  mapRealizationDtoToRealisasi,
  mapSimpanRealisasiInputToRequest,
} from '../mappers/realisasiMapper';
import { mapActivityDtoToKegiatan } from '../mappers/kegiatanMapper';

export class HttpRealisasiRepository implements IRealisasiRepository {
  public async getByKegiatanId(kegiatanId: string): Promise<Realisasi | null> {
    try {
      const res = await getActivityRealization(kegiatanId);
      return mapRealizationDtoToRealisasi(res.data as RealizationDto);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        return null;
      }
      throw err;
    }
  }

  public async simpan(
    kegiatanId: string,
    input: SimpanRealisasiInput
  ): Promise<{ kegiatan: Kegiatan; realisasi: Realisasi }> {
    const request = mapSimpanRealisasiInputToRequest(input);
    const saveRes = await saveActivityRealization(kegiatanId, request);
    const activityRes = await getActivityById(kegiatanId);
    return {
      kegiatan: mapActivityDtoToKegiatan(activityRes.data as ActivityDto),
      realisasi: mapRealizationDtoToRealisasi(saveRes.data as RealizationDto),
    };
  }

  public async getPerluRealisasiCount(): Promise<number> {
    const res = await getPendingRealizationCount();
    return Number((res.data as PendingCountDto).count) || 0;
  }
}
