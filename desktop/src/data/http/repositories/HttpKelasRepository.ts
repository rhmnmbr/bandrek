import type { IKelasRepository } from '../../interfaces/IKelasRepository';
import type {
  Kelas,
  KelasFilterParams,
  CreateKelasInput,
  UpdateKelasInput,
  DeleteMasterResult,
} from '../../types/master';
import {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  updateClassMember,
  deleteClass,
} from '../../api/generated/endpoints';
import type {
  ClassGroupDto,
  DeleteResultDto,
} from '../../api/generated/models';
import {
  mapClassGroupDtoToKelas,
  mapDeleteResultDto,
} from '../mappers/masterMapper';

export class HttpKelasRepository implements IKelasRepository {
  async getAll(filter: KelasFilterParams = {}): Promise<Kelas[]> {
    const { jenjang = 'semua', q } = filter;

    const params: {
      q?: string;
      educationalLevel?: string;
    } = {};

    if (jenjang && jenjang !== 'semua') params.educationalLevel = jenjang;
    if (q?.trim()) params.q = q.trim();

    const res = await getClasses(params);
    return ((res.data as ClassGroupDto[]) || []).map(mapClassGroupDtoToKelas);
  }

  async getById(id: string): Promise<Kelas> {
    const res = await getClassById(id);
    return mapClassGroupDtoToKelas(res.data as ClassGroupDto);
  }

  async create(input: CreateKelasInput): Promise<Kelas> {
    const res = await createClass({
      id: null,
      name: input.nama,
      educationalLevel: input.jenjang ?? null,
      description: input.keterangan ?? null,
      studentIds: input.anggota ?? null,
    });
    return mapClassGroupDtoToKelas(res.data as ClassGroupDto);
  }

  async update(id: string, input: UpdateKelasInput): Promise<Kelas> {
    const res = await updateClass(id, {
      name: input.nama ?? null,
      educationalLevel: input.jenjang ?? null,
      description: input.keterangan ?? null,
    });
    return mapClassGroupDtoToKelas(res.data as ClassGroupDto);
  }

  async ubahAnggota(kelasId: string, siswaId: string, tambah: boolean): Promise<Kelas> {
    const res = await updateClassMember(kelasId, {
      studentId: siswaId,
      add: tambah,
    });
    return mapClassGroupDtoToKelas(res.data as ClassGroupDto);
  }

  async delete(id: string): Promise<DeleteMasterResult> {
    const res = await deleteClass(id);
    return mapDeleteResultDto(res.data as DeleteResultDto);
  }
}
