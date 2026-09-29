import type {
  Tempat,
  CreateTempatInput,
  UpdateTempatInput,
  Ruangan,
  CreateRuanganInput,
  UpdateRuanganInput,
  DeleteMasterResult,
} from '../types/master';

export interface ITempatRepository {
  getAll(): Promise<Tempat[]>;
  getById(id: string): Promise<Tempat>;
  create(input: CreateTempatInput): Promise<Tempat>;
  update(id: string, input: UpdateTempatInput): Promise<Tempat>;
  delete(id: string): Promise<DeleteMasterResult>;

  // Ruangan child resources
  getAllRuangan(): Promise<Ruangan[]>;
  getRuanganByTempat(tempatId: string): Promise<Ruangan[]>;
  createRuangan(input: CreateRuanganInput): Promise<Ruangan>;
  updateRuangan(id: string, input: UpdateRuanganInput): Promise<Ruangan>;
  deleteRuangan(id: string): Promise<DeleteMasterResult>;
}
