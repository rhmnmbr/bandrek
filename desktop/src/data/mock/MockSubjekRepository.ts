import type { ISubjekRepository } from '../interfaces/ISubjekRepository';
import type {
  Subjek,
  SubjekFilterParams,
  CreateSubjekInput,
  UpdateSubjekInput,
  DeleteMasterResult,
  SubjekProfil,
  KetersediaanRutinItem,
} from '../types/master';
import { BandrekApiError } from '../types/simulasi';
import { mockRunner } from './mockRunner';
import { mockStore } from './mockStore';
import { checkMasterUsage } from './businessRules';
import { toDate, NAMA_BULAN, NAMA_BULAN_PENDEK, formatTanggalPendek } from '@/lib/dateUtils';

function enrichSubjek(s: Subjek): Subjek {
  const kegs = mockStore.kegiatan.filter((k) => k.subjek.some((sub) => sub.id === s.id));
  const dapatDihapus = kegs.length === 0;
  const alasanTidakBisaHapus = dapatDihapus
    ? undefined
    : `Tidak bisa dihapus: dipakai di ${kegs.length} kegiatan. Pakai Nonaktifkan.`;
  const ringkasanPenggunaan =
    kegs.length > 0
      ? `${kegs.length} kegiatan tercatat memakai subjek ini.`
      : 'Belum pernah dipasang di kegiatan mana pun.';

  return {
    ...s,
    ketersediaan: s.ketersediaan || [],
    jumlahKegiatan: kegs.length,
    dapatDihapus,
    alasanTidakBisaHapus,
    rincianPenggunaan: kegs.length > 0 ? [`${kegs.length} kegiatan`] : [],
    ringkasanPenggunaan,
  };
}

export class MockSubjekRepository implements ISubjekRepository {
  public async getAll(filter: SubjekFilterParams = {}): Promise<Subjek[]> {
    return mockRunner(() => {
      const { status = 'aktif', aktifOnly = false, peran = 'semua', q } = filter;

      const effectiveStatus = aktifOnly ? 'aktif' : status;

      return mockStore.subjek
        .filter((s) => {
          if (effectiveStatus === 'aktif' && !s.aktif) return false;
          if (effectiveStatus === 'nonaktif' && s.aktif) return false;
          if (peran !== 'semua' && s.peran !== peran) return false;
          if (q && q.trim().length > 0) {
            const qLower = q.trim().toLowerCase();
            const matchNama = s.nama.toLowerCase().includes(qLower);
            const matchKontak = s.kontak?.toLowerCase().includes(qLower);
            if (!matchNama && !matchKontak) return false;
          }
          return true;
        })
        .map(enrichSubjek)
        .sort((a, b) => a.nama.localeCompare(b.nama, 'id'));
    });
  }

  public async getById(id: string): Promise<Subjek> {
    return mockRunner(() => {
      const s = mockStore.subjek.find((item) => item.id === id);
      if (!s) {
        throw new BandrekApiError('unknown', `Subjek dengan ID "${id}" tidak ditemukan.`, 404);
      }
      return enrichSubjek(s);
    });
  }

  public async getProfil(id: string): Promise<SubjekProfil> {
    return mockRunner(() => {
      const rawSb = mockStore.subjek.find((item) => item.id === id);
      if (!rawSb) {
        throw new BandrekApiError('unknown', `Subjek dengan ID "${id}" tidak ditemukan.`, 404);
      }
      const sb = enrichSubjek(rawSb);

      const today = mockStore.today;
      const bulan = today.slice(0, 7);
      const semua = mockStore.kegiatan.filter((ev) => ev.subjek.some((x) => x.id === sb.id));
      const aktifSemua = semua.filter(
        (ev) =>
          ev.status !== 'dibatalkan' &&
          ev.status !== 'dijadwal-ulang' &&
          (ev.status as string) !== 'dijadwal_ulang'
      );
      const bulanIni = aktifSemua.filter((ev) => ev.tanggal.slice(0, 7) === bulan);

      const jamEv = (ev: { mulai: string; selesai: string }) => {
        const [h1, m1] = ev.mulai.split(':').map(Number);
        const [h2, m2] = ev.selesai.split(':').map(Number);
        return (h2 * 60 + m2 - (h1 * 60 + m1)) / 60;
      };

      const totalJamBulan = bulanIni.reduce((a, ev) => a + jamEv(ev), 0);
      const pengisiN = bulanIni.filter(
        (ev) => (ev.subjek.find((x) => x.id === sb.id) || {}).peran === 'Pengisi'
      ).length;
      const lainnyaN = bulanIni.length - pengisiN;

      const tertunda = aktifSemua
        .filter(
          (ev) =>
            (ev.status === 'terjadwal' ||
              ev.status === 'belum' ||
              (ev.status as string) === 'belum_direalisasi') &&
            ev.tanggal < today
        )
        .sort((a, b) => a.tanggal.localeCompare(b.tanggal));

      const hariLewat = (iso: string) =>
        Math.max(0, Math.round((toDate(today).getTime() - toDate(iso).getTime()) / 86400000));

      const realisasiBulan = bulanIni.filter(
        (ev) => ev.status === 'terealisasi' && Boolean(ev.realisasi)
      );
      const tepat = realisasiBulan.filter(
        (ev) => ev.realisasi && ev.realisasi.mulai <= ev.mulai
      ).length;
      const ketepatanPct = realisasiBulan.length
        ? Math.round((tepat / realisasiBulan.length) * 100)
        : null;

      // Beban mingguan
      const BATAS = 10;
      const ty = Number(bulan.slice(0, 4));
      const tm = Number(bulan.slice(5, 7));
      const daysInMonth = new Date(ty, tm, 0).getDate();
      const buckets: [number, number][] = [];
      let day = 1;
      while (day <= daysInMonth) {
        const dow = new Date(ty, tm - 1, day).getDay(); // 0 is Sunday
        const end = Math.min(day + (dow === 0 ? 0 : 7 - dow), daysInMonth);
        buckets.push([day, end]);
        day = end + 1;
      }

      const beban = buckets.map(([a, b]) => {
        const list = bulanIni.filter((ev) => {
          const dd = Number(ev.tanggal.slice(8, 10));
          return dd >= a && dd <= b;
        });
        const jam = list.reduce((s2, ev) => s2 + jamEv(ev), 0);
        const warn = jam > BATAS;
        return {
          label: `${a} – ${b} ${NAMA_BULAN_PENDEK[tm - 1]}`,
          jam: jam.toFixed(1).replace('.', ','),
          n: list.length,
          barW: Math.min(100, Math.round((jam / (BATAS * 1.5)) * 100)) + '%',
          barBg: warn ? '#F0A82E' : '#0F6CBD',
          warn,
          warnTeks: warn
            ? `Melewati batas nyaman ${(jam - BATAS).toFixed(1).replace('.', ',')} jam. Pertimbangkan alihkan satu kegiatan ke subjek lain.`
            : undefined,
        };
      });

      // Kegiatan terdekat
      const terdekatSrc = aktifSemua
        .filter(
          (ev) =>
            ev.status === 'terjadwal' ||
            ev.status === 'belum' ||
            (ev.status as string) === 'belum_direalisasi'
        )
        .sort((a, b) => (a.tanggal + a.mulai).localeCompare(b.tanggal + b.mulai))
        .slice(0, 6);

      const terdekat = terdekatSrc.map((ev) => {
        const lewat = ev.tanggal < today;
        const n = hariLewat(ev.tanggal);
        const peran = (ev.subjek.find((x) => x.id === sb.id) || {}).peran || '—';
        return {
          id: ev.id,
          waktu: `${formatTanggalPendek(ev.tanggal)} ${ev.mulai}`,
          nama: ev.nama,
          peran,
          stLabel: lewat ? (n > 0 ? `⚠ Belum · ${n} hari` : '⚠ Belum direalisasi') : '● Terjadwal',
          stBrd: lewat ? '#F0A82E' : '#0F6CBD',
          stBg: lewat ? '#FFF3E0' : '#EBF3FC',
          stInk: lewat ? '#8A5200' : '#0C548F',
          lewat,
        };
      });

      const mapelTeks =
        (sb.mapel || [])
          .map((mId) => mockStore.mapel.find((m) => m.id === mId)?.nama)
          .filter(Boolean)
          .join(', ');

      const inisial =
        sb.nama
          .split(/\s+/)
          .slice(0, 2)
          .map((w) => w[0])
          .join('')
          .toUpperCase() || '?';

      const tertundaCount = tertunda.length;
      const tertundaId = tertunda[0]?.id;

      return {
        subjek: sb,
        inisial,
        mapelTeks,
        kpi: [
          {
            label: 'KEGIATAN BULAN INI',
            val: String(bulanIni.length),
            valFg: '#242424',
            brd: '#E1DFDD',
            bg: '#FFFFFF',
            lblFg: '#5C5A58',
            subPlain: true,
            sub: `${pengisiN} sebagai pengisi · ${lainnyaN} lainnya`,
            subFg: '#5C5A58',
          },
          {
            label: 'JAM MENGAJAR',
            val: `${totalJamBulan.toFixed(1).replace('.', ',')} jam`,
            valFg: '#242424',
            brd: '#E1DFDD',
            bg: '#FFFFFF',
            lblFg: '#5C5A58',
            subPlain: true,
            sub: `rata-rata ${(totalJamBulan / 4).toFixed(1).replace('.', ',')} jam/minggu`,
            subFg: '#5C5A58',
          },
          {
            label: 'REALISASI TERTUNDA',
            val: String(tertunda.length),
            valFg: tertunda.length ? '#8A5200' : '#242424',
            brd: tertunda.length ? '#F0A82E' : '#E1DFDD',
            bg: tertunda.length ? '#FFF3E0' : '#FFFFFF',
            lblFg: tertunda.length ? '#8A5200' : '#5C5A58',
            subLink: tertunda.length > 0,
            subPlain: tertunda.length === 0,
            sub: tertunda.length ? `tertua tertunda ${hariLewat(tertunda[0].tanggal)} hari` : 'tidak ada',
            subFg: '#8A5200',
            subKlikAction: 'realisasi',
            subKlikParam: tertundaId,
            subKlikTitle: 'Isi realisasi kegiatan tertua yang tertunda',
          },
          {
            label: 'KETEPATAN JADWAL',
            val: ketepatanPct == null ? '—' : `${ketepatanPct}%`,
            valFg: '#242424',
            brd: '#E1DFDD',
            bg: '#FFFFFF',
            lblFg: '#5C5A58',
            subPlain: true,
            sub: realisasiBulan.length
              ? `${tepat} dari ${realisasiBulan.length} mulai tepat waktu`
              : 'belum ada realisasi bulan ini',
            subFg: '#5C5A58',
          },
        ],
        bebanJudul: `BEBAN PER MINGGU · ${NAMA_BULAN[tm - 1].toUpperCase()} ${ty}`,
        batasNyaman: BATAS,
        beban,
        terdekat,
        tertundaId,
        tertundaCount,
        tertundaJudul: `${tertundaCount} realisasi menunggu diisi`,
        tertundaTeks: 'Matriks belajar untuk kegiatan terkait belum final sampai semuanya diisi.',
      };
    });
  }

  public async create(input: CreateSubjekInput): Promise<Subjek> {
    return mockRunner(
      () => {
        let n = mockStore.subjek.length + 1;
        while (mockStore.subjek.some((x) => x.id === `U${n}`)) {
          n++;
        }
        const newId = `U${n}`;
        const newSubjek: Subjek = {
          id: newId,
          nama: input.nama.trim(),
          kelamin: input.kelamin,
          peran: input.peran,
          aktif: input.aktif !== undefined ? input.aktif : true,
          mapel: input.mapel || [],
          kontak: input.kontak ? input.kontak.trim() : '',
          ketersediaan: input.ketersediaan || [],
          jumlahKegiatan: 0,
        };

        mockStore.subjek.push(newSubjek);
        mockStore.persist();
        return enrichSubjek(newSubjek);
      },
      { isMutation: true }
    );
  }

  public async update(id: string, input: UpdateSubjekInput): Promise<Subjek> {
    return mockRunner(
      () => {
        const idx = mockStore.subjek.findIndex((item) => item.id === id);
        if (idx === -1) {
          throw new BandrekApiError('unknown', `Subjek dengan ID "${id}" tidak ditemukan.`, 404);
        }

        const existing = mockStore.subjek[idx];
        const updated: Subjek = {
          ...existing,
          nama: input.nama !== undefined ? input.nama.trim() : existing.nama,
          kelamin: input.kelamin ?? existing.kelamin,
          peran: input.peran ?? existing.peran,
          aktif: input.aktif !== undefined ? input.aktif : existing.aktif,
          mapel: input.mapel !== undefined ? input.mapel : existing.mapel,
          kontak: input.kontak !== undefined ? input.kontak.trim() : existing.kontak,
          ketersediaan:
            input.ketersediaan !== undefined ? input.ketersediaan : existing.ketersediaan || [],
        };

        mockStore.subjek[idx] = updated;
        mockStore.persist();
        return enrichSubjek(updated);
      },
      { isMutation: true }
    );
  }

  public async delete(id: string): Promise<DeleteMasterResult> {
    return mockRunner(
      () => {
        const check = checkMasterUsage(
          'subjek',
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

        const idx = mockStore.subjek.findIndex((item) => item.id === id);
        if (idx >= 0) {
          mockStore.subjek.splice(idx, 1);
          mockStore.persist();
        }

        return check;
      },
      { isMutation: true }
    );
  }

  public async tambahKetersediaan(id: string, item: KetersediaanRutinItem): Promise<Subjek> {
    return mockRunner(
      () => {
        const idx = mockStore.subjek.findIndex((x) => x.id === id);
        if (idx === -1) {
          throw new BandrekApiError('unknown', `Subjek dengan ID "${id}" tidak ditemukan.`, 404);
        }
        const existing = mockStore.subjek[idx];
        const ketersediaan = (existing.ketersediaan || []).concat([item]);
        existing.ketersediaan = ketersediaan;
        mockStore.persist();
        return enrichSubjek(existing);
      },
      { isMutation: true }
    );
  }

  public async ubahKetersediaan(
    id: string,
    index: number,
    patch: Partial<KetersediaanRutinItem>
  ): Promise<Subjek> {
    return mockRunner(
      () => {
        const idx = mockStore.subjek.findIndex((x) => x.id === id);
        if (idx === -1) {
          throw new BandrekApiError('unknown', `Subjek dengan ID "${id}" tidak ditemukan.`, 404);
        }
        const existing = mockStore.subjek[idx];
        const list = (existing.ketersediaan || []).map((k, i) =>
          i === index ? { ...k, ...patch } : k
        );
        existing.ketersediaan = list;
        mockStore.persist();
        return enrichSubjek(existing);
      },
      { isMutation: true }
    );
  }

  public async hapusKetersediaan(id: string, index: number): Promise<Subjek> {
    return mockRunner(
      () => {
        const idx = mockStore.subjek.findIndex((x) => x.id === id);
        if (idx === -1) {
          throw new BandrekApiError('unknown', `Subjek dengan ID "${id}" tidak ditemukan.`, 404);
        }
        const existing = mockStore.subjek[idx];
        const list = (existing.ketersediaan || []).filter((_, i) => i !== index);
        existing.ketersediaan = list;
        mockStore.persist();
        return enrichSubjek(existing);
      },
      { isMutation: true }
    );
  }
}
