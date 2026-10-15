import type { JenjangOption } from '../types/master';

export interface IJenjangRepository {
  getJenjangList(): Promise<JenjangOption[]>;
  createJenjang(nama: string, urutan?: number): Promise<JenjangOption>;
  updateJenjang(id: string, nama: string, urutan?: number): Promise<JenjangOption>;
  deleteJenjang(id: string): Promise<void>;
}
