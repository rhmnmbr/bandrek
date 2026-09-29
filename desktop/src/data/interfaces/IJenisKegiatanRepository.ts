import type {
  JenisKegiatan,
  CreateJenisKegiatanInput,
  UpdateJenisKegiatanInput,
  DeleteMasterResult,
} from '../types/master';

export interface IJenisKegiatanRepository {
  getAll(): Promise<JenisKegiatan[]>;
  getById(id: string): Promise<JenisKegiatan>;
  create(input: CreateJenisKegiatanInput): Promise<JenisKegiatan>;
  update(id: string, input: UpdateJenisKegiatanInput): Promise<JenisKegiatan>;
  delete(id: string): Promise<DeleteMasterResult>;
}
