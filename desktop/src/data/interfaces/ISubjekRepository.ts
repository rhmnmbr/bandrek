import type {
  Subjek,
  SubjekFilterParams,
  CreateSubjekInput,
  UpdateSubjekInput,
  DeleteMasterResult,
  SubjekProfil,
  KetersediaanRutinItem,
} from '../types/master';

export interface ISubjekRepository {
  getAll(filter?: SubjekFilterParams): Promise<Subjek[]>;
  getById(id: string): Promise<Subjek>;
  getProfil(id: string): Promise<SubjekProfil>;
  create(input: CreateSubjekInput): Promise<Subjek>;
  update(id: string, input: UpdateSubjekInput): Promise<Subjek>;
  delete(id: string): Promise<DeleteMasterResult>;
  tambahKetersediaan(id: string, item: KetersediaanRutinItem): Promise<Subjek>;
  ubahKetersediaan(
    id: string,
    index: number,
    patch: Partial<KetersediaanRutinItem>
  ): Promise<Subjek>;
  hapusKetersediaan(id: string, index: number): Promise<Subjek>;
}

