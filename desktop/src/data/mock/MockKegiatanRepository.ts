import type { IKegiatanRepository } from '../interfaces/IKegiatanRepository';
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
import { BandrekApiError } from '../types/simulasi';
import { mockRunner } from './mockRunner';
import { mockStore } from './mockStore';
import { enrichKegiatan, detectScheduleConflicts } from './businessRules';
import type { RawKegiatanSeed } from './seedData';

export class MockKegiatanRepository implements IKegiatanRepository {
  private enrich(raw: RawKegiatanSeed): Kegiatan {
    return enrichKegiatan(
      raw,
      mockStore.tempat,
      mockStore.ruangan,
      mockStore.jenis,
      mockStore.subjek,
      mockStore.mapel,
      mockStore.materi,
      mockStore.today,
      mockStore.now
    );
  }

  public async getKalender(params: KalenderFilterParams): Promise<Kegiatan[]> {
    return mockRunner(() => {
      const {
        rentangMulai,
        rentangSelesai,
        jenisId,
        subjekId,
        kelasId,
        ruanganId,
        status,
        tampilkanDibatalkan = false,
      } = params;

      return mockStore.kegiatan
        .filter((k) => {
          // Filter rentang tanggal
          if (k.tanggal < rentangMulai || k.tanggal > rentangSelesai) {
            return false;
          }
          if (jenisId && jenisId !== 'semua' && k.jenis !== jenisId) {
            return false;
          }
          if (subjekId && subjekId !== 'semua' && !k.subjek.some((s) => s.id === subjekId)) {
            return false;
          }
          if (kelasId && kelasId !== 'semua' && k.kelas !== kelasId) {
            return false;
          }
          if (ruanganId && ruanganId !== 'semua' && k.ruangan !== ruanganId) {
            return false;
          }

          // Dibatalkan tersembunyi default di kalender
          if (!tampilkanDibatalkan && k.status === 'dibatalkan') {
            return false;
          }

          return true;
        })
        .map((k) => this.enrich(k))
        .filter((k) => {
          if (status && status !== 'semua' && k.status !== status) {
            return false;
          }
          return true;
        })
        .sort((a, b) => {
          if (a.tanggal !== b.tanggal) return a.tanggal.localeCompare(b.tanggal);
          return a.mulai.localeCompare(b.mulai);
        });
    });
  }

  public async getDaftar(params: DaftarKegiatanFilterParams = {}): Promise<Kegiatan[]> {
    return mockRunner(() => {
      const {
        tanggalMulai,
        tanggalSelesai,
        jenisId,
        subjekId,
        kelasId,
        status,
        hanyaPerluRealisasi,
        q,
      } = params;

      return mockStore.kegiatan
        .filter((k) => {
          if (tanggalMulai && k.tanggal < tanggalMulai) return false;
          if (tanggalSelesai && k.tanggal > tanggalSelesai) return false;
          if (jenisId && jenisId !== 'semua' && k.jenis !== jenisId) return false;
          if (subjekId && subjekId !== 'semua' && !k.subjek.some((s) => s.id === subjekId)) return false;
          if (kelasId && kelasId !== 'semua' && k.kelas !== kelasId) return false;
          if (q && q.trim().length > 0) {
            const qLower = q.trim().toLowerCase();
            if (!k.nama.toLowerCase().includes(qLower)) return false;
          }
          return true;
        })
        .map((k) => this.enrich(k))
        .filter((k) => {
          if (hanyaPerluRealisasi && k.status !== 'belum_direalisasi') {
            return false;
          }
          if (status && status !== 'semua' && k.status !== status) {
            return false;
          }
          return true;
        })
        .sort((a, b) => {
          // Default daftar kegiatan: tanggal terbaru di atas
          if (b.tanggal !== a.tanggal) return b.tanggal.localeCompare(a.tanggal);
          return b.mulai.localeCompare(a.mulai);
        });
    });
  }

  public async getById(id: string): Promise<Kegiatan> {
    return mockRunner(() => {
      const raw = mockStore.kegiatan.find((k) => k.id === id);
      if (!raw) {
        throw new BandrekApiError('unknown', `Kegiatan dengan ID "${id}" tidak ditemukan.`, 404);
      }
      return this.enrich(raw);
    });
  }

  public async cekBentrok(input: CekBentrokInput): Promise<HasilDeteksiBentrok> {
    return mockRunner(() => {
      return detectScheduleConflicts(
        input,
        mockStore.kegiatan,
        mockStore.ruangan,
        mockStore.subjek,
        mockStore.siswa
      );
    });
  }

  public async create(input: CreateKegiatanInput): Promise<Kegiatan> {
    return mockRunner(
      () => {
        const newId = `e_${Date.now().toString().slice(-6)}`;
        const raw: RawKegiatanSeed = {
          id: newId,
          nama: input.nama,
          jenis: input.jenis,
          mapel: input.mapel || null,
          materi: input.materi || null,
          kelas: input.kelas || null,
          tanggal: input.tanggal,
          mulai: input.mulai,
          selesai: input.selesai,
          ruangan: input.ruangan,
          subjek: input.subjek,
          siswa: input.siswa,
          catatan: input.catatan || '',
          status: 'terjadwal',
          realisasi: null,
        };

        mockStore.kegiatan.push(raw);
        mockStore.persist();
        return this.enrich(raw);
      },
      { isMutation: true }
    );
  }

  public async update(id: string, input: UpdateKegiatanInput): Promise<Kegiatan> {
    return mockRunner(
      () => {
        const idx = mockStore.kegiatan.findIndex((k) => k.id === id);
        if (idx === -1) {
          throw new BandrekApiError('unknown', `Kegiatan dengan ID "${id}" tidak ditemukan.`, 404);
        }

        const existing = mockStore.kegiatan[idx];
        const updated: RawKegiatanSeed = {
          ...existing,
          nama: input.nama ?? existing.nama,
          jenis: input.jenis ?? existing.jenis,
          mapel: input.mapel !== undefined ? input.mapel : existing.mapel,
          materi: input.materi !== undefined ? input.materi : existing.materi,
          kelas: input.kelas !== undefined ? input.kelas : existing.kelas,
          tanggal: input.tanggal ?? existing.tanggal,
          mulai: input.mulai ?? existing.mulai,
          selesai: input.selesai ?? existing.selesai,
          ruangan: input.ruangan ?? existing.ruangan,
          subjek: input.subjek ?? existing.subjek,
          siswa: input.siswa ?? existing.siswa,
          catatan: input.catatan ?? existing.catatan,
        };

        mockStore.kegiatan[idx] = updated;
        mockStore.persist();
        return this.enrich(updated);
      },
      { isMutation: true }
    );
  }

  public async batalkan(id: string, input: BatalkanKegiatanInput): Promise<Kegiatan> {
    return mockRunner(
      () => {
        const idx = mockStore.kegiatan.findIndex((k) => k.id === id);
        if (idx === -1) {
          throw new BandrekApiError('unknown', `Kegiatan dengan ID "${id}" tidak ditemukan.`, 404);
        }

        const existing = mockStore.kegiatan[idx];
        const updated: RawKegiatanSeed = {
          ...existing,
          status: 'dibatalkan',
          pembatalan: {
            alasan: input.alasan,
            keterangan: input.keterangan || '',
            pada: `${mockStore.today} ${mockStore.now}`,
          },
        };

        mockStore.kegiatan[idx] = updated;
        mockStore.persist();
        return this.enrich(updated);
      },
      { isMutation: true }
    );
  }

  public async jadwalUlang(
    id: string,
    input: JadwalUlangKegiatanInput
  ): Promise<{ kegiatanAsal: Kegiatan; kegiatanBaru: Kegiatan }> {
    return mockRunner(
      () => {
        const idx = mockStore.kegiatan.findIndex((k) => k.id === id);
        if (idx === -1) {
          throw new BandrekApiError('unknown', `Kegiatan dengan ID "${id}" tidak ditemukan.`, 404);
        }

        const existing = mockStore.kegiatan[idx];
        const newId = `e_${Date.now().toString().slice(-6)}`;

        // Kegiatan Baru (berstatus Terjadwal)
        const rawBaru: RawKegiatanSeed = {
          id: newId,
          nama: input.namaBaru || existing.nama,
          jenis: existing.jenis,
          mapel: existing.mapel,
          materi: existing.materi,
          kelas: existing.kelas,
          tanggal: input.tanggalBaru,
          mulai: input.mulaiBaru,
          selesai: input.selesaiBaru,
          ruangan: input.ruanganBaru || existing.ruangan,
          subjek: input.subjekBaru || existing.subjek,
          siswa: input.siswaBaru || existing.siswa,
          catatan: input.catatanBaru !== undefined ? input.catatanBaru : existing.catatan,
          status: 'terjadwal',
          realisasi: null,
          jadwalUlangDari: existing.id,
        };

        // Kegiatan Asal (berstatus Dijadwal Ulang)
        const updatedAsal: RawKegiatanSeed = {
          ...existing,
          status: 'dijadwal-ulang',
          jadwalUlangKe: newId,
          penjadwalanUlang: {
            alasan: input.alasan,
            keterangan: input.keterangan || '',
            pada: `${mockStore.today} ${mockStore.now}`,
          },
        };

        mockStore.kegiatan[idx] = updatedAsal;
        mockStore.kegiatan.push(rawBaru);
        mockStore.persist();

        return {
          kegiatanAsal: this.enrich(updatedAsal),
          kegiatanBaru: this.enrich(rawBaru),
        };
      },
      { isMutation: true }
    );
  }

  public async getAlasanBatal(): Promise<string[]> {
    return mockRunner(() => [...mockStore.alasanBatal]);
  }

  public async getAlasanJadwalUlang(): Promise<string[]> {
    return mockRunner(() => [...mockStore.alasanJadwalUlang]);
  }
}
