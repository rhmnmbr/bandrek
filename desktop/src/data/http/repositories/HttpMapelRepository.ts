import type { IMapelRepository } from '../../interfaces/IMapelRepository';
import type {
  MataPelajaran,
  MapelFilterParams,
  CreateMapelInput,
  UpdateMapelInput,
  Materi,
  CreateMateriInput,
  UpdateMateriInput,
  DeleteMasterResult,
} from '../../types/master';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getAllTopics,
  getTopicsByCourse,
  createTopic,
  updateTopic,
  deleteTopic,
  reorderCourseTopics,
} from '../../api/generated/endpoints';
import type {
  CourseDto,
  TopicDto,
  DeleteResultDto,
} from '../../api/generated/models';
import {
  mapCourseDtoToMataPelajaran,
  mapTopicDtoToMateri,
  mapDeleteResultDto,
} from '../mappers/masterMapper';

export class HttpMapelRepository implements IMapelRepository {
  async getAll(filter: MapelFilterParams = {}): Promise<MataPelajaran[]> {
    const { status = 'aktif', q } = filter;

    const params: {
      q?: string;
      isActive?: string;
    } = {};

    if (status === 'aktif') params.isActive = 'true';
    else if (status === 'nonaktif') params.isActive = 'false';
    if (q?.trim()) params.q = q.trim();

    const res = await getCourses(params);
    return ((res.data as CourseDto[]) || []).map(mapCourseDtoToMataPelajaran);
  }

  async getById(id: string): Promise<MataPelajaran> {
    const res = await getCourseById(id);
    return mapCourseDtoToMataPelajaran(res.data as CourseDto);
  }

  async create(input: CreateMapelInput): Promise<MataPelajaran> {
    const res = await createCourse({
      id: null,
      name: input.nama,
      isActive: input.aktif ?? true,
    });
    return mapCourseDtoToMataPelajaran(res.data as CourseDto);
  }

  async update(id: string, input: UpdateMapelInput): Promise<MataPelajaran> {
    const res = await updateCourse(id, {
      name: input.nama ?? null,
      isActive: input.aktif ?? null,
    });
    return mapCourseDtoToMataPelajaran(res.data as CourseDto);
  }

  async delete(id: string): Promise<DeleteMasterResult> {
    const res = await deleteCourse(id);
    return mapDeleteResultDto(res.data as DeleteResultDto);
  }

  // Materi child resources
  async getAllMateri(): Promise<Materi[]> {
    const res = await getAllTopics();
    return ((res.data as TopicDto[]) || []).map(mapTopicDtoToMateri);
  }

  async getMateriByMapel(mapelId: string): Promise<Materi[]> {
    const res = await getTopicsByCourse(mapelId);
    return ((res.data as TopicDto[]) || []).map(mapTopicDtoToMateri);
  }

  async createMateri(input: CreateMateriInput): Promise<Materi> {
    const res = await createTopic({
      id: null,
      courseId: input.mapel,
      name: input.nama,
      educationalLevels: input.jenjang ?? null,
      isActive: input.aktif ?? true,
      orderIndex: input.urutan ?? null,
    });
    return mapTopicDtoToMateri(res.data as TopicDto);
  }

  async updateMateri(id: string, input: UpdateMateriInput): Promise<Materi> {
    const res = await updateTopic(id, {
      name: input.nama ?? null,
      educationalLevels: input.jenjang ?? null,
      isActive: input.aktif ?? null,
      orderIndex: input.urutan ?? null,
    });
    return mapTopicDtoToMateri(res.data as TopicDto);
  }

  async deleteMateri(id: string): Promise<DeleteMasterResult> {
    const res = await deleteTopic(id);
    return mapDeleteResultDto(res.data as DeleteResultDto);
  }

  async reorderMateri(mapelId: string, orderedMateriIds: string[]): Promise<Materi[]> {
    const res = await reorderCourseTopics(mapelId, {
      orderedTopicIds: orderedMateriIds,
    });
    return ((res.data as TopicDto[]) || []).map(mapTopicDtoToMateri);
  }
}
