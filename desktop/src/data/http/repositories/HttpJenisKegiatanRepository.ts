import type { IJenisKegiatanRepository } from '../../interfaces/IJenisKegiatanRepository';
import type {
  JenisKegiatan,
  JenisKegiatanFilterParams,
  CreateJenisKegiatanInput,
  UpdateJenisKegiatanInput,
  DeleteMasterResult,
} from '../../types/master';
import {
  getActivityTypes,
  getActivityTypeById,
  createActivityType,
  updateActivityType,
  deleteActivityType,
} from '../../api/generated/endpoints';
import type {
  ActivityTypeDto,
  DeleteResultDto,
} from '../../api/generated/models';
import {
  mapActivityTypeDtoToJenisKegiatan,
  mapDeleteResultDto,
} from '../mappers/masterMapper';

export class HttpJenisKegiatanRepository implements IJenisKegiatanRepository {
  async getAll(filter: JenisKegiatanFilterParams = {}): Promise<JenisKegiatan[]> {
    const { q } = filter;
    const params = q?.trim() ? { q: q.trim() } : undefined;

    const res = await getActivityTypes(params);
    return ((res.data as ActivityTypeDto[]) || []).map(mapActivityTypeDtoToJenisKegiatan);
  }

  async getById(id: string): Promise<JenisKegiatan> {
    const res = await getActivityTypeById(id);
    return mapActivityTypeDtoToJenisKegiatan(res.data as ActivityTypeDto);
  }

  async create(input: CreateJenisKegiatanInput): Promise<JenisKegiatan> {
    const res = await createActivityType({
      id: null,
      name: input.nama,
      color: input.warna,
      requiresTopic: input.materiWajib,
      requiresStudents: input.siswaWajib,
    });
    return mapActivityTypeDtoToJenisKegiatan(res.data as ActivityTypeDto);
  }

  async update(id: string, input: UpdateJenisKegiatanInput): Promise<JenisKegiatan> {
    const res = await updateActivityType(id, {
      name: input.nama ?? null,
      color: input.warna ?? null,
      requiresTopic: input.materiWajib ?? null,
      requiresStudents: input.siswaWajib ?? null,
    });
    return mapActivityTypeDtoToJenisKegiatan(res.data as ActivityTypeDto);
  }

  async delete(id: string): Promise<DeleteMasterResult> {
    const res = await deleteActivityType(id);
    return mapDeleteResultDto(res.data as DeleteResultDto);
  }
}
