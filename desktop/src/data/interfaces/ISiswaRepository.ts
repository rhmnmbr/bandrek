import type {
  Siswa,
  SiswaFilterParams,
  CreateSiswaInput,
  UpdateSiswaInput,
  DeleteMasterResult,
  SiswaProfil,
} from '../types/master';

export interface ISiswaRepository {
  getAll(filter?: SiswaFilterParams): Promise<Siswa[]>;
  getById(id: string): Promise<Siswa>;
  getProfil(id: string): Promise<SiswaProfil>;
  create(input: CreateSiswaInput): Promise<Siswa>;
  update(id: string, input: UpdateSiswaInput): Promise<Siswa>;
  delete(id: string): Promise<DeleteMasterResult>;
}
