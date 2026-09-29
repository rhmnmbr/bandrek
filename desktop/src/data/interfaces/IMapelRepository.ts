import type {
  MataPelajaran,
  CreateMapelInput,
  UpdateMapelInput,
  Materi,
  CreateMateriInput,
  UpdateMateriInput,
  DeleteMasterResult,
} from '../types/master';

export interface IMapelRepository {
  getAll(): Promise<MataPelajaran[]>;
  getById(id: string): Promise<MataPelajaran>;
  create(input: CreateMapelInput): Promise<MataPelajaran>;
  update(id: string, input: UpdateMapelInput): Promise<MataPelajaran>;
  delete(id: string): Promise<DeleteMasterResult>;

  // Materi child resources
  getAllMateri(): Promise<Materi[]>;
  getMateriByMapel(mapelId: string): Promise<Materi[]>;
  createMateri(input: CreateMateriInput): Promise<Materi>;
  updateMateri(id: string, input: UpdateMateriInput): Promise<Materi>;
  deleteMateri(id: string): Promise<DeleteMasterResult>;
  reorderMateri(mapelId: string, orderedMateriIds: string[]): Promise<Materi[]>;
}
