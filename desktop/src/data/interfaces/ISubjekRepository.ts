import type {
  Subjek,
  SubjekFilterParams,
  CreateSubjekInput,
  UpdateSubjekInput,
  DeleteMasterResult,
} from '../types/master';

export interface ISubjekRepository {
  getAll(filter?: SubjekFilterParams): Promise<Subjek[]>;
  getById(id: string): Promise<Subjek>;
  create(input: CreateSubjekInput): Promise<Subjek>;
  update(id: string, input: UpdateSubjekInput): Promise<Subjek>;
  delete(id: string): Promise<DeleteMasterResult>;
}
