import type { IKegiatanRepository } from '../../interfaces/IKegiatanRepository';
import type {
  Kegiatan,
  KalenderFilterParams,
  DaftarKegiatanFilterParams,
  CekBentrokInput,
  HasilDeteksiBentrok,
  CreateKegiatanInput,
  UpdateKegiatanInput,
  BatalkanKegiatanInput,
  JadwalUlangKegiatanInput,
} from '../../types/kegiatan';
import {
  getCalendarActivities,
  getActivityList,
  getActivityById,
  checkActivityConflicts,
  createActivity,
  updateActivity,
  cancelActivity,
  rescheduleActivity,
  getCancellationReasons,
  getRescheduleReasons,
} from '../../api/generated/endpoints';
import type {
  ActivityDto,
  ConflictCheckResponse,
  RescheduleResultDto,
} from '../../api/generated/models';
import {
  mapActivityDtoToKegiatan,
  mapCreateKegiatanInputToRequest,
  mapUpdateKegiatanInputToRequest,
  mapBatalkanKegiatanInputToRequest,
  mapJadwalUlangKegiatanInputToRequest,
  mapCekBentrokInputToRequest,
  mapConflictCheckResponseToHasilDeteksiBentrok,
  mapKalenderFilterParamsToGetCalendarActivitiesParams,
  mapDaftarKegiatanFilterParamsToGetActivityListParams,
} from '../mappers/kegiatanMapper';

export class HttpKegiatanRepository implements IKegiatanRepository {
  public async getKalender(params: KalenderFilterParams): Promise<Kegiatan[]> {
    const apiParams = mapKalenderFilterParamsToGetCalendarActivitiesParams(params);
    const res = await getCalendarActivities(apiParams);
    return ((res.data as ActivityDto[]) || []).map(mapActivityDtoToKegiatan);
  }

  public async getDaftar(params: DaftarKegiatanFilterParams): Promise<Kegiatan[]> {
    const apiParams = mapDaftarKegiatanFilterParamsToGetActivityListParams(params);
    const res = await getActivityList(apiParams);
    return ((res.data as ActivityDto[]) || []).map(mapActivityDtoToKegiatan);
  }

  public async getById(id: string): Promise<Kegiatan> {
    const res = await getActivityById(id);
    return mapActivityDtoToKegiatan(res.data as ActivityDto);
  }

  public async cekBentrok(input: CekBentrokInput): Promise<HasilDeteksiBentrok> {
    const request = mapCekBentrokInputToRequest(input);
    const res = await checkActivityConflicts(request);
    return mapConflictCheckResponseToHasilDeteksiBentrok(
      res.data as ConflictCheckResponse
    );
  }

  public async create(input: CreateKegiatanInput): Promise<Kegiatan> {
    const request = mapCreateKegiatanInputToRequest(input);
    const res = await createActivity(request);
    return mapActivityDtoToKegiatan(res.data as ActivityDto);
  }

  public async update(id: string, input: UpdateKegiatanInput): Promise<Kegiatan> {
    const request = mapUpdateKegiatanInputToRequest(input);
    const res = await updateActivity(id, request);
    return mapActivityDtoToKegiatan(res.data as ActivityDto);
  }

  public async batalkan(id: string, input: BatalkanKegiatanInput): Promise<Kegiatan> {
    const request = mapBatalkanKegiatanInputToRequest(input);
    const res = await cancelActivity(id, request);
    return mapActivityDtoToKegiatan(res.data as ActivityDto);
  }

  public async jadwalUlang(
    id: string,
    input: JadwalUlangKegiatanInput
  ): Promise<{ kegiatanAsal: Kegiatan; kegiatanBaru: Kegiatan }> {
    const request = mapJadwalUlangKegiatanInputToRequest(input);
    const res = await rescheduleActivity(id, request);
    const result = res.data as RescheduleResultDto;
    return {
      kegiatanAsal: mapActivityDtoToKegiatan(result.originalActivity),
      kegiatanBaru: mapActivityDtoToKegiatan(result.newActivity),
    };
  }

  public async getAlasanBatal(): Promise<string[]> {
    const res = await getCancellationReasons();
    return res.data as string[];
  }

  public async getAlasanJadwalUlang(): Promise<string[]> {
    const res = await getRescheduleReasons();
    return res.data as string[];
  }
}
