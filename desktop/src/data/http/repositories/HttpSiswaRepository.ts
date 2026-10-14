import type { ISiswaRepository } from '../../interfaces/ISiswaRepository';
import type {
  Siswa,
  SiswaFilterParams,
  CreateSiswaInput,
  UpdateSiswaInput,
  DeleteMasterResult,
  SiswaProfil,
} from '../../types/master';
import {
  getStudents,
  getStudentById,
  getStudentProfile,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../../api/generated/endpoints';
import type {
  StudentDto,
  StudentProfileData,
  DeleteResultDto,
} from '../../api/generated/models';
import {
  mapStudentDtoToSiswa,
  mapStudentProfileDataToSiswaProfil,
  mapDeleteResultDto,
} from '../mappers/masterMapper';

export class HttpSiswaRepository implements ISiswaRepository {
  async getAll(filter: SiswaFilterParams = {}): Promise<Siswa[]> {
    const { status = 'aktif', jenjang = 'semua', kelasId, q, desc = false } = filter;

    const params: {
      q?: string;
      educationalLevel?: string;
      isActive?: boolean;
      classGroupId?: string;
    } = {};

    if (status === 'aktif') params.isActive = true;
    else if (status === 'nonaktif') params.isActive = false;

    if (jenjang && jenjang !== 'semua') params.educationalLevel = jenjang;
    if (kelasId && kelasId !== '-') params.classGroupId = kelasId;
    if (q?.trim()) params.q = q.trim();

    const res = await getStudents(params);
    let items = ((res.data as StudentDto[]) || []).map(mapStudentDtoToSiswa);

    if (desc) {
      items = items.sort((a, b) => b.nama.localeCompare(a.nama, 'id'));
    }

    return items;
  }

  async getById(id: string): Promise<Siswa> {
    const res = await getStudentById(id);
    return mapStudentDtoToSiswa(res.data as StudentDto);
  }

  async getProfil(id: string): Promise<SiswaProfil> {
    const res = await getStudentProfile(id);
    return mapStudentProfileDataToSiswaProfil(res.data as StudentProfileData);
  }

  async create(input: CreateSiswaInput): Promise<Siswa> {
    const res = await createStudent({
      id: null,
      fullName: input.nama,
      educationalLevel: input.jenjang,
      birthDate: input.lahir,
      gender: input.kelamin,
      isActive: input.aktif ?? true,
      schoolOrigin: input.asal ?? null,
      guardianName: input.waliNama ?? null,
      guardianPhone: input.waliWa ?? null,
      joinedDate: input.bergabung ?? null,
      notes: input.catatan ?? null,
    });
    return mapStudentDtoToSiswa(res.data as StudentDto);
  }

  async update(id: string, input: UpdateSiswaInput): Promise<Siswa> {
    const res = await updateStudent(id, {
      fullName: input.nama ?? null,
      educationalLevel: input.jenjang ?? null,
      birthDate: input.lahir ?? null,
      gender: input.kelamin ?? null,
      isActive: input.aktif ?? null,
      schoolOrigin: input.asal ?? null,
      guardianName: input.waliNama ?? null,
      guardianPhone: input.waliWa ?? null,
      joinedDate: input.bergabung ?? null,
      notes: input.catatan ?? null,
    });
    return mapStudentDtoToSiswa(res.data as StudentDto);
  }

  async delete(id: string): Promise<DeleteMasterResult> {
    const res = await deleteStudent(id);
    return mapDeleteResultDto(res.data as DeleteResultDto);
  }
}
