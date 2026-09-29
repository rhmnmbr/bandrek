import type {
  Kelas,
  KelasFilterParams,
  CreateKelasInput,
  UpdateKelasInput,
  DeleteMasterResult,
} from '../types/master';

export interface IKelasRepository {
  getAll(filter?: KelasFilterParams): Promise<Kelas[]>;
  getById(id: string): Promise<Kelas>;
  create(input: CreateKelasInput): Promise<Kelas>;
  update(id: string, input: UpdateKelasInput): Promise<Kelas>;
  delete(id: string): Promise<DeleteMasterResult>;
}
