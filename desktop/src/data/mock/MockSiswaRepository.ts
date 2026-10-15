import type { ISiswaRepository } from '../interfaces/ISiswaRepository';
import type {
  Siswa,
  SiswaFilterParams,
  CreateSiswaInput,
  UpdateSiswaInput,
  DeleteMasterResult,
  SiswaProfil,
  SiswaKPI,
  SiswaRiwayatItem,
  SiswaCakupanItem,
  SiswaTerlewatItem,
} from '../types/master';
import { BandrekApiError } from '../types/simulasi';
import { mockRunner } from './mockRunner';
import { mockStore } from './mockStore';
import { checkMasterUsage } from './businessRules';
import { formatTanggalRingkas } from '../../lib/dateUtils';

function enrichSiswa(s: Siswa): Siswa {
  const classes = mockStore.kelas.filter((k) => k.anggota.includes(s.id));
  const classIds = classes.map((k) => k.id);
  const classDetails = classes.map((k) => ({ id: k.id, nama: k.nama, jenjang: k.jenjang }));

  const kegs = mockStore.kegiatan.filter((e) => e.siswa.includes(s.id));
  const ceklis = mockStore.ceklisManual.filter((c) => c.siswa === s.id);
  const mendatang = kegs.filter(
    (e) => e.tanggal >= mockStore.today && (e.status === 'terjadwal' || e.status === 'belum')
  );

  const totalPakai = kegs.length + classes.length + ceklis.length;
  const dapatDihapus = totalPakai === 0;

  const usageParts: string[] = [];
  if (kegs.length > 0) usageParts.push(`${kegs.length} kegiatan`);
  if (classes.length > 0) usageParts.push(`${classes.length} kelas`);
  if (ceklis.length > 0) usageParts.push(`${ceklis.length} ceklis manual`);

  const alasanTidakBisaHapus = dapatDihapus
    ? undefined
    : `Tidak bisa dihapus: dipakai di ${usageParts.join(', ')}. Pakai Nonaktifkan.`;

  let ringkasanPenggunaan = 'Belum pernah ikut kegiatan apa pun.';
  if (kegs.length > 0) {
    ringkasanPenggunaan = `${kegs.length} kegiatan diikuti · ${ceklis.length} ceklis manual di matriks`;
    if (mendatang.length > 0) {
      ringkasanPenggunaan += ` · ${mendatang.length} kegiatan mendatang`;
    }
  }

  return {
    ...s,
    daftarKelas: classIds,
    daftarKelasDetail: classDetails,
    jumlahKegiatan: kegs.length,
    jumlahKelas: classes.length,
    jumlahCeklis: ceklis.length,
    kegiatanMendatangCount: mendatang.length,
    dapatDihapus,
    alasanTidakBisaHapus,
    rincianPenggunaan: usageParts,
    ringkasanPenggunaan,
  };
}

export class MockSiswaRepository implements ISiswaRepository {
  public async getAll(filter: SiswaFilterParams = {}): Promise<Siswa[]> {
    return mockRunner(() => {
      const { status = 'aktif', jenjang = 'semua', kelasId, q, desc = false } = filter;

      return mockStore.siswa
        .filter((s) => {
          if (status === 'aktif' && !s.aktif) return false;
          if (status === 'nonaktif' && s.aktif) return false;
          if (jenjang !== 'semua' && s.jenjang !== jenjang) return false;

          if (kelasId === '-') {
            const hasClass = mockStore.kelas.some((item) => item.anggota.includes(s.id));
            if (hasClass) return false;
          } else if (kelasId) {
            const k = mockStore.kelas.find((item) => item.id === kelasId);
            if (k && !k.anggota.includes(s.id)) return false;
          }

          if (q && q.trim().length > 0) {
            const qLower = q.trim().toLowerCase();
            const matchNama = s.nama.toLowerCase().includes(qLower);
            const matchAsal = s.asal?.toLowerCase().includes(qLower);
            const matchWali = s.waliNama?.toLowerCase().includes(qLower);
            if (!matchNama && !matchAsal && !matchWali) return false;
          }

          return true;
        })
        .map((s) => enrichSiswa(s))
        .sort((a, b) => a.nama.localeCompare(b.nama, 'id') * (desc ? -1 : 1));
    });
  }

  public async getById(id: string): Promise<Siswa> {
    return mockRunner(() => {
      const s = mockStore.siswa.find((item) => item.id === id);
      if (!s) {
        throw new BandrekApiError('unknown', `Siswa dengan ID "${id}" tidak ditemukan.`, 404);
      }
      return enrichSiswa(s);
    });
  }

  public async getProfil(id: string): Promise<SiswaProfil> {
    return mockRunner(() => {
      const s = mockStore.siswa.find((item) => item.id === id);
      if (!s) {
        throw new BandrekApiError('unknown', `Siswa dengan ID "${id}" tidak ditemukan.`, 404);
      }
      const enriched = enrichSiswa(s);
      const inisial =
        enriched.nama
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((w) => w[0])
          .join('')
          .toUpperCase() || '?';
      const kelasTeks =
        (enriched.daftarKelasDetail || []).length > 0
          ? (enriched.daftarKelasDetail || []).map((k) => k.nama).join(', ')
          : 'belum masuk kelas mana pun';

      const semuaKeg = mockStore.kegiatan.filter((ev) => ev.siswa.includes(s.id));
      const dihitungKeg = semuaKeg.filter(
        (ev) => ev.status !== 'dibatalkan' && ev.status !== 'dijadwal-ulang'
      );
      const byWaktuDesc = (a: any, b: any) =>
        a.tanggal + a.mulai < b.tanggal + b.mulai ? 1 : -1;
      const riwayatSemua = [...semuaKeg].sort(byWaktuDesc);

      const hit = { hadir: 0, izin: 0, sakit: 0, alpa: 0 };
      let realTotal = 0;
      for (const ev of dihitungKeg) {
        const kh =
          ev.status === 'terealisasi' && ev.realisasi?.kehadiran
            ? ev.realisasi.kehadiran[s.id]
            : null;
        if (kh && kh in hit) {
          hit[kh as keyof typeof hit]++;
          realTotal++;
        }
      }
      const kehadiranPct = realTotal ? Math.round((hit.hadir / realTotal) * 100) : 0;

      const cakupan: SiswaCakupanItem[] = [];
      const terlewat: SiswaTerlewatItem[] = [];
      const activeMapel = mockStore.mapel.filter((m) => m.aktif);

      for (const mp of activeMapel) {
        const materiList = mockStore.materi.filter(
          (mt) => mt.mapel === mp.id && mt.aktif && Boolean(s.jenjang && (mt.jenjang || []).includes(s.jenjang))
        );
        if (!materiList.length) continue;
        let ok = 0;
        for (const mt of materiList) {
          const tersampaikan =
            dihitungKeg.some(
              (ev) =>
                ev.status === 'terealisasi' &&
                ev.realisasi &&
                (ev.realisasi.materi || ev.materi) === mt.id &&
                ev.realisasi.kehadiran &&
                ev.realisasi.kehadiran[s.id] === 'hadir'
            ) || mockStore.ceklisManual.some((cm) => cm.siswa === s.id && cm.materi === mt.id);

          if (tersampaikan) {
            ok++;
            continue;
          }

          const terkait = semuaKeg
            .filter((ev) => (ev.realisasi?.materi || ev.materi) === mt.id)
            .sort(byWaktuDesc)[0];

          if (!terkait) continue;
          let alasan: string | null = null;
          if (terkait.status === 'dibatalkan') {
            alasan = `kegiatan dibatalkan ${formatTanggalRingkas(terkait.tanggal)}`;
          } else {
            const kh2 = terkait.realisasi?.kehadiran ? terkait.realisasi.kehadiran[s.id] : null;
            if (kh2 && kh2 !== 'hadir') {
              const labelKh = kh2 === 'izin' ? 'izin' : kh2 === 'sakit' ? 'sakit' : 'alpa';
              alasan = `${labelKh} pada ${formatTanggalRingkas(terkait.tanggal)}`;
            }
          }
          if (alasan) {
            terlewat.push({
              mapelId: mp.id,
              materiId: mt.id,
              judul: `${mp.nama} › ${mt.nama}`,
              alasan,
            });
          }
        }
        const pct = ok / materiList.length;
        cakupan.push({
          mapelId: mp.id,
          nama: mp.nama,
          tersampaikan: ok,
          total: materiList.length,
          frac: `${ok}/${materiList.length}`,
          pct,
          fracFg: pct < 0.6 ? '#8A5200' : '#424242',
          barW: `${Math.round(pct * 100)}%`,
          barBg: pct < 0.6 ? '#F0A82E' : '#4CAF50',
        });
      }

      const cakupanAvgPct = cakupan.length
        ? Math.round(cakupan.reduce((a, c) => a + c.pct * 100, 0) / cakupan.length)
        : 0;

      const mapelDisentuh: { id: string; nama: string }[] = [];
      const mapelSeen: Record<string, boolean> = {};
      for (const ev of semuaKeg) {
        if (ev.mapel && !mapelSeen[ev.mapel]) {
          mapelSeen[ev.mapel] = true;
          const mpObj = mockStore.mapel.find((m) => m.id === ev.mapel);
          if (mpObj) {
            mapelDisentuh.push({ id: mpObj.id, nama: mpObj.nama });
          }
        }
      }

      const rows: SiswaRiwayatItem[] = riwayatSemua.slice(0, 60).map((ev) => {
        const batal = ev.status === 'dibatalkan';
        const kh = ev.realisasi?.kehadiran ? ev.realisasi.kehadiran[s.id] : null;
        let khT: {
          status: any;
          label: string;
          glyph: string;
          brd: string;
          bg: string;
          ink: string;
        };

        if (batal) {
          khT = {
            status: 'batal',
            label: 'Batal',
            glyph: '✕',
            brd: '#C8C6C4',
            bg: '#F5F5F5',
            ink: '#5C5A58',
          };
        } else if (kh === 'hadir') {
          khT = {
            status: 'hadir',
            label: 'Hadir',
            glyph: '✓',
            brd: '#4CAF50',
            bg: '#E8F5E9',
            ink: '#2E7D32',
          };
        } else if (kh === 'izin') {
          khT = {
            status: 'izin',
            label: 'Izin',
            glyph: '·',
            brd: '#0F6CBD',
            bg: '#EBF3FC',
            ink: '#0C548F',
          };
        } else if (kh === 'sakit') {
          khT = {
            status: 'sakit',
            label: 'Sakit',
            glyph: '·',
            brd: '#F0A82E',
            bg: '#FFF3E0',
            ink: '#8A5200',
          };
        } else if (kh === 'alpa') {
          khT = {
            status: 'alpa',
            label: 'Alpa',
            glyph: '✕',
            brd: '#C50F1F',
            bg: '#FDE7E9',
            ink: '#9B0C18',
          };
        } else {
          khT = {
            status: 'belum',
            label: 'Belum diisi',
            glyph: '·',
            brd: '#E1DFDD',
            bg: '#FAFAFA',
            ink: '#8A8886',
          };
        }

        const mid = ev.realisasi?.materi || ev.materi;
        const mpObj = mockStore.mapel.find((m) => m.id === ev.mapel);
        const mtObj = mockStore.materi.find((m) => m.id === mid);
        const materiTeks = mid ? `${mpObj?.nama || '—'} › ${mtObj?.nama || '—'}` : '—';
        const catatanTeks =
          ev.realisasi?.catatanSiswa?.[s.id] || (batal && ev.pembatalan?.keterangan) || '—';

        return {
          id: ev.id,
          tanggal: ev.tanggal,
          tanggalFormatted: formatTanggalRingkas(ev.tanggal),
          nama: ev.nama,
          materi: materiTeks,
          statusKegiatan: ev.status,
          kehadiran: khT,
          catatan: catatanTeks,
        };
      });

      const kpi: SiswaKPI[] = [
        {
          label: 'KEGIATAN DIIKUTI',
          val: String(dihitungKeg.length),
          valFg: '#242424',
          brd: '#E1DFDD',
          bg: '#FFFFFF',
          lblFg: '#5C5A58',
          sub: s.bergabung ? `sejak ${formatTanggalRingkas(s.bergabung)}` : '—',
          subFg: '#5C5A58',
        },
        {
          label: 'KEHADIRAN',
          val: `${kehadiranPct}%`,
          valFg: '#2E7D32',
          brd: '#4CAF50',
          bg: '#E8F5E9',
          lblFg: '#2E7D32',
          sub: `${hit.hadir} hadir · ${hit.izin} izin · ${hit.alpa} alpa`,
          subFg: '#2E7D32',
        },
        {
          label: 'CAKUPAN MATERI',
          val: `${cakupanAvgPct}%`,
          valFg: '#242424',
          brd: '#E1DFDD',
          bg: '#FFFFFF',
          lblFg: '#5C5A58',
          sub: `rata-rata ${cakupan.length} mata pelajaran`,
          subFg: '#5C5A58',
        },
        {
          label: 'MATERI TERLEWAT',
          val: String(terlewat.length),
          valFg: terlewat.length ? '#8A5200' : '#242424',
          brd: terlewat.length ? '#F0A82E' : '#E1DFDD',
          bg: terlewat.length ? '#FFF3E0' : '#FFFFFF',
          lblFg: terlewat.length ? '#8A5200' : '#5C5A58',
          sub: 'karena izin atau kegiatan batal',
          subFg: terlewat.length ? '#8A5200' : '#5C5A58',
        },
      ];

      return {
        siswa: enriched,
        inisial,
        kelasTeks,
        kpi,
        riwayat: rows,
        opsiMapel: mapelDisentuh,
        cakupan,
        terlewat,
      };
    });
  }

  public async create(input: CreateSiswaInput): Promise<Siswa> {
    return mockRunner(
      () => {
        const newId = `S${mockStore.siswa.length + 1}`;
        const newSiswa: Siswa = {
          id: newId,
          nama: input.nama,
          jenjang: input.jenjang,
          aktif: input.aktif !== undefined ? input.aktif : true,
          lahir: input.lahir,
          kelamin: input.kelamin,
          asal: input.asal || '',
          waliNama: input.waliNama || '',
          waliWa: input.waliWa || '',
          bergabung: mockStore.today,
          catatan: input.catatan || '',
          daftarKelas: [],
        };

        mockStore.siswa.push(newSiswa);
        mockStore.persist();
        return newSiswa;
      },
      { isMutation: true }
    );
  }

  public async update(id: string, input: UpdateSiswaInput): Promise<Siswa> {
    return mockRunner(
      () => {
        const idx = mockStore.siswa.findIndex((item) => item.id === id);
        if (idx === -1) {
          throw new BandrekApiError('unknown', `Siswa dengan ID "${id}" tidak ditemukan.`, 404);
        }

        const existing = mockStore.siswa[idx];
        const updated: Siswa = {
          ...existing,
          nama: input.nama ?? existing.nama,
          jenjang: input.jenjang ?? existing.jenjang,
          aktif: input.aktif !== undefined ? input.aktif : existing.aktif,
          lahir: input.lahir ?? existing.lahir,
          kelamin: input.kelamin ?? existing.kelamin,
          asal: input.asal !== undefined ? input.asal : existing.asal,
          waliNama: input.waliNama !== undefined ? input.waliNama : existing.waliNama,
          waliWa: input.waliWa !== undefined ? input.waliWa : existing.waliWa,
          catatan: input.catatan !== undefined ? input.catatan : existing.catatan,
        };

        mockStore.siswa[idx] = updated;
        mockStore.persist();
        return {
          ...updated,
          daftarKelas: mockStore.kelas.filter((k) => k.anggota.includes(updated.id)).map((k) => k.id),
        };
      },
      { isMutation: true }
    );
  }

  public async delete(id: string): Promise<DeleteMasterResult> {
    return mockRunner(
      () => {
        const check = checkMasterUsage(
          'siswa',
          id,
          mockStore.kegiatan,
          mockStore.kelas,
          mockStore.ceklisManual,
          mockStore.ruangan,
          mockStore.materi
        );

        if (!check.bisaDihapus) {
          return check;
        }

        const idx = mockStore.siswa.findIndex((item) => item.id === id);
        if (idx >= 0) {
          mockStore.siswa.splice(idx, 1);
          mockStore.persist();
        }

        return check;
      },
      { isMutation: true }
    );
  }
}
