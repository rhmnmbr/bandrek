import type { Kegiatan } from '../types/kegiatan';
import type { Realisasi, SimpanRealisasiInput } from '../types/realisasi';

export interface IRealisasiRepository {
  getByKegiatanId(kegiatanId: string): Promise<Realisasi | null>;
  simpan(
    kegiatanId: string,
    input: SimpanRealisasiInput
  ): Promise<{ kegiatan: Kegiatan; realisasi: Realisasi }>;
  getPerluRealisasiCount(): Promise<number>;
}
