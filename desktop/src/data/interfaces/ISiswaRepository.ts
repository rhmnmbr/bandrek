import type {
  Siswa,
  SiswaFilterParams,
  CreateSiswaInput,
  UpdateSiswaInput,
  DeleteMasterResult,
} from '../types/master';

export interface ISiswaRepository {
  getAll(filter?: SiswaFilterParams): Promise<Siswa[]>;
  getById(id: string): Promise<Siswa>;
  create(input: CreateSiswaInput): Promise<Siswa>;
  update(id: string, input: UpdateSiswaInput): Promise<Siswa>;
  delete(id: string): Promise<DeleteMasterResult>;
}
