import type {
  Kegiatan,
  KalenderFilterParams,
  DaftarKegiatanFilterParams,
  CekBentrokInput,
  HasilDeteksiBentrok,
  CreateKegiatanInput,
  UpdateKegiatanInput,
  BatalkanKegiatanInput,
  JadwalUlangKegiatanInput,
} from '../types/kegiatan';

export interface IKegiatanRepository {
  getKalender(params: KalenderFilterParams): Promise<Kegiatan[]>;
  getDaftar(params: DaftarKegiatanFilterParams): Promise<Kegiatan[]>;
  getById(id: string): Promise<Kegiatan>;
  cekBentrok(input: CekBentrokInput): Promise<HasilDeteksiBentrok>;
  create(input: CreateKegiatanInput): Promise<Kegiatan>;
  update(id: string, input: UpdateKegiatanInput): Promise<Kegiatan>;
  batalkan(id: string, input: BatalkanKegiatanInput): Promise<Kegiatan>;
  jadwalUlang(
    id: string,
    input: JadwalUlangKegiatanInput
  ): Promise<{ kegiatanAsal: Kegiatan; kegiatanBaru: Kegiatan }>;
  getAlasanBatal(): Promise<string[]>;
  getAlasanJadwalUlang(): Promise<string[]>;
}
