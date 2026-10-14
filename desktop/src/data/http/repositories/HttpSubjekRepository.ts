import type { ISubjekRepository } from '../../interfaces/ISubjekRepository';
import type {
  Subjek,
  SubjekFilterParams,
  CreateSubjekInput,
  UpdateSubjekInput,
  DeleteMasterResult,
  SubjekProfil,
  KetersediaanRutinItem,
} from '../../types/master';
import {
  getSubjects,
  getSubjectById,
  getSubjectProfile,
  createSubject,
  updateSubject,
  deleteSubject,
  addSubjectAvailability,
  updateSubjectAvailability,
  deleteSubjectAvailability,
} from '../../api/generated/endpoints';
import type {
  SubjectDto,
  SubjectProfileData,
  DeleteResultDto,
} from '../../api/generated/models';
import {
  mapSubjectDtoToSubjek,
  mapSubjectProfileDataToSubjekProfil,
  mapDeleteResultDto,
} from '../mappers/masterMapper';

export class HttpSubjekRepository implements ISubjekRepository {
  async getAll(filter: SubjekFilterParams = {}): Promise<Subjek[]> {
    const { status = 'aktif', peran = 'semua', q } = filter;

    const params: {
      q?: string;
      role?: string;
      isActive?: string;
    } = {};

    if (status === 'aktif') params.isActive = 'true';
    else if (status === 'nonaktif') params.isActive = 'false';

    if (peran && peran !== 'semua') params.role = peran;
    if (q?.trim()) params.q = q.trim();

    const res = await getSubjects(params);
    return ((res.data as SubjectDto[]) || []).map(mapSubjectDtoToSubjek);
  }

  async getById(id: string): Promise<Subjek> {
    const res = await getSubjectById(id);
    return mapSubjectDtoToSubjek(res.data as SubjectDto);
  }

  async getProfil(id: string): Promise<SubjekProfil> {
    const res = await getSubjectProfile(id);
    return mapSubjectProfileDataToSubjekProfil(res.data as SubjectProfileData);
  }

  async create(input: CreateSubjekInput): Promise<Subjek> {
    const availabilities = (input.ketersediaan || []).map((k) => ({
      day: k.hari,
      from: k.dari,
      to: k.sampai,
    }));

    const res = await createSubject({
      id: null,
      fullName: input.nama,
      gender: input.kelamin,
      role: input.peran ?? null,
      isActive: input.aktif ?? true,
      contact: input.kontak ?? null,
      courseIds: input.mapel ?? null,
      weeklyAvailabilities: availabilities,
    });
    return mapSubjectDtoToSubjek(res.data as SubjectDto);
  }

  async update(id: string, input: UpdateSubjekInput): Promise<Subjek> {
    const res = await updateSubject(id, {
      fullName: input.nama ?? null,
      gender: input.kelamin ?? null,
      role: input.peran ?? null,
      isActive: input.aktif ?? null,
      contact: input.kontak ?? null,
      courseIds: input.mapel ?? null,
    });
    return mapSubjectDtoToSubjek(res.data as SubjectDto);
  }

  async delete(id: string): Promise<DeleteMasterResult> {
    const res = await deleteSubject(id);
    return mapDeleteResultDto(res.data as DeleteResultDto);
  }

  async tambahKetersediaan(id: string, item: KetersediaanRutinItem): Promise<Subjek> {
    await addSubjectAvailability(id, {
      day: item.hari,
      from: item.dari,
      to: item.sampai,
    });
    return this.getById(id);
  }

  async ubahKetersediaan(
    id: string,
    index: number,
    patch: Partial<KetersediaanRutinItem>
  ): Promise<Subjek> {
    const current = await this.getById(id);
    const existingItem = current.ketersediaan?.[index];
    const updated = {
      day: patch.hari ?? existingItem?.hari ?? 'Senin',
      from: patch.dari ?? existingItem?.dari ?? '08:00',
      to: patch.sampai ?? existingItem?.sampai ?? '17:00',
    };

    await updateSubjectAvailability(id, index, updated);
    return this.getById(id);
  }

  async hapusKetersediaan(id: string, index: number): Promise<Subjek> {
    await deleteSubjectAvailability(id, index);
    return this.getById(id);
  }
}
