import type { Kegiatan } from '../../data/types';
import { menit, JAM_AWAL, JAM_AKHIR, SLOT_PX } from '../../lib/dateUtils';

export interface LayoutEventItem {
  id: string;
  kegiatan?: Kegiatan;
  startMin?: number;
  endMin?: number;
  top: number;
  height: number;
  left: number; // in percent (0 - 100)
  width: number; // in percent (0 - 100)
  lebih: boolean;
  lebihN: number;
  iso: string;
  title: string;
  meta: string;
  jamLabel: string;
}

interface RawEvent {
  id: string;
  kegiatan: Kegiatan;
  s: number; // start in minutes
  e: number; // end in minutes
  tanggal: string;
  meta: string;
  jamLabel: string;
  track?: number;
}

/**
 * Algoritma peletakan blok kegiatan dan pengelompokan "+N lainnya"
 * Diadaptasi dari prototype (Bandrek Prototipe.dc.html lines 4351-4407)
 */
export function susunLayoutKegiatan(
  kegiatanList: Kegiatan[],
  isoTanggal: string,
  nHari: number = 7,
  jamAwal: number = JAM_AWAL,
  jamAkhir: number = JAM_AKHIR,
  totalGridWidthPx: number = 1251,
  subjekMap?: Map<string, string>
): LayoutEventItem[] {
  const min0 = jamAwal * 60;
  const min1 = jamAkhir * 60;

  // Lebar per kolom hari dalam pixel
  const kolomPx = Math.floor((totalGridWidthPx - 4) / Math.max(1, nHari));
  // Maksimum jalur (track) sebelum dipadatkan menjadi "+N lainnya" (minimal 84px per jalur)
  const maxJalur = Math.max(1, Math.floor(kolomPx / 84));

  // 1. Filter kegiatan pada tanggal dan rentang jam
  const rawList: RawEvent[] = kegiatanList
    .filter((k) => {
      const endTgl = k.tanggalSelesai || k.tanggal;
      return isoTanggal >= k.tanggal && isoTanggal <= endTgl;
    })
    .map((k) => {
      const endTgl = k.tanggalSelesai || k.tanggal;
      const isMultiDay = endTgl !== k.tanggal;

      let s = k.sepanjangHari ? min0 : menit(k.mulai);
      let e = k.sepanjangHari ? min1 : menit(k.selesai);
      let jamLabel = k.sepanjangHari ? 'Sepanjang hari' : `${k.mulai}–${k.selesai}`;

      if (isMultiDay && !k.sepanjangHari) {
        if (isoTanggal === k.tanggal) {
          s = menit(k.mulai);
          e = min1; // extends to end of calendar day
          jamLabel = `${k.mulai} → lintas hari`;
        } else if (isoTanggal === endTgl) {
          s = min0; // starts at calendar morning
          e = menit(k.selesai);
          jamLabel = `→ ${k.selesai}`;
        } else {
          s = min0;
          e = min1;
          jamLabel = 'Lintas hari';
        }
      }

      const metaParts: string[] = [];
      if (k.tempatCustom) metaParts.push(k.tempatCustom);
      else if (k.namaRuangan && k.namaRuangan !== 'Ruangan tidak diketahui' && k.namaRuangan !== 'Tanpa ruangan') metaParts.push(k.namaRuangan);
      else if (k.namaTempat && k.namaTempat !== 'Tempat tidak diketahui') metaParts.push(k.namaTempat);

      if (k.pengisiUtama) {
        metaParts.push(k.pengisiUtama.nama);
      } else if (k.subjek && k.subjek.length > 0) {
        const s0 = k.subjek[0];
        const s0Nama = (subjekMap && subjekMap.get(s0.id)) || s0.nama;
        if (s0Nama) {
          metaParts.push(k.subjek.length > 1 ? `${s0Nama} +${k.subjek.length - 1}` : s0Nama);
        }
      }

      if (k.jumlahSiswa > 0) metaParts.push(`${k.jumlahSiswa} siswa`);

      return {
        id: isMultiDay ? `${k.id}_${isoTanggal}` : k.id,
        kegiatan: k,
        s,
        e,
        tanggal: isoTanggal,
        meta: metaParts.join(' · '),
        jamLabel,
      };
    })
    .filter((x) => x.e > min0 && x.s < min1)
    .sort((a, b) => a.s - b.s || b.e - a.e);

  // 2. Kelompokkan ke dalam klaster waktu yang saling tumpang tindih
  const klaster: RawEvent[][] = [];
  let cur: RawEvent[] = [];
  let curEnd = -1;

  for (const ev of rawList) {
    if (cur.length && ev.s >= curEnd) {
      klaster.push(cur);
      cur = [];
      curEnd = -1;
    }
    cur.push(ev);
    curEnd = Math.max(curEnd, ev.e);
  }
  if (cur.length) {
    klaster.push(cur);
  }

  // 3. Hitung penempatan track (kolom) untuk setiap klaster
  interface IntermediateItem {
    id: string;
    kegiatan?: Kegiatan;
    s: number;
    e: number;
    left: number;
    width: number;
    lebih: boolean;
    lebihN: number;
    iso: string;
    title: string;
    meta: string;
    jamLabel: string;
  }

  const hasilTampil: IntermediateItem[] = [];

  for (const cl of klaster) {
    const tracks: number[] = []; // tracks[i] menyimpan waktu selesai terakhir pada track i

    for (const x of cl) {
      let i = 0;
      while (i < tracks.length && tracks[i] > x.s) {
        i++;
      }
      if (i === tracks.length) {
        tracks.push(0);
      }
      tracks[i] = x.e;
      x.track = i;
    }

    const n = tracks.length;

    // Jika muat di bawah batas maxJalur
    if (n <= maxJalur) {
      const lebar = Math.round((100 / n) * 10) / 10;
      for (const x of cl) {
        const trackIdx = x.track || 0;
        hasilTampil.push({
          id: x.id,
          kegiatan: x.kegiatan,
          s: x.s,
          e: x.e,
          left: Math.round((trackIdx * (100 / n)) * 10) / 10,
          width: lebar,
          lebih: false,
          lebihN: 0,
          iso: x.tanggal,
          title: `${x.kegiatan.nama} · ${x.jamLabel}`,
          meta: x.meta,
          jamLabel: x.jamLabel,
        });
      }
    } else {
      // Padatkan: jalur 0 s/d (maxJalur - 2) ditampilkan, sisanya masuk ke "+N lainnya"
      const sisaJalur = maxJalur - 1;
      const lebar = Math.round((100 / maxJalur) * 10) / 10;
      const sembunyi: RawEvent[] = [];

      for (const x of cl) {
        const trackIdx = x.track || 0;
        if (trackIdx < sisaJalur) {
          hasilTampil.push({
            id: x.id,
            kegiatan: x.kegiatan,
            s: x.s,
            e: x.e,
            left: Math.round((trackIdx * lebar) * 10) / 10,
            width: lebar,
            lebih: false,
            lebihN: 0,
            iso: x.tanggal,
            title: `${x.kegiatan.nama} · ${x.jamLabel}`,
            meta: x.meta,
            jamLabel: x.jamLabel,
          });
        } else {
          sembunyi.push(x);
        }
      }

      if (sembunyi.length > 0) {
        const s0 = Math.min(...sembunyi.map((x) => x.s));
        const e0 = Math.max(...sembunyi.map((x) => x.e));
        const contohNama = sembunyi
          .slice(0, 3)
          .map((x) => x.kegiatan.nama)
          .join(', ');

        hasilTampil.push({
          id: `lebih_${isoTanggal}_${s0}`,
          s: s0,
          e: e0,
          left: Math.round((sisaJalur * lebar) * 10) / 10,
          width: lebar,
          lebih: true,
          lebihN: sembunyi.length,
          iso: isoTanggal,
          title: `${sembunyi.length} kegiatan lain di jam yang sama: ${contohNama}${
            sembunyi.length > 3 ? ` dan ${sembunyi.length - 3} lagi` : ''
          }. Klik untuk buka tampilan Hari.`,
          meta: '',
          jamLabel: '',
        });
      }
    }
  }

  // 4. Konversi menit ke pixel top & height
  return hasilTampil.map((x) => {
    const s = Math.max(x.s, min0);
    const e = Math.min(x.e, min1);
    const h = Math.max(30, Math.round(((e - s) / 60) * SLOT_PX) - 2);
    const top = Math.round(((s - min0) / 60) * SLOT_PX);

    return {
      id: x.id,
      kegiatan: x.kegiatan,
      startMin: s,
      endMin: e,
      top,
      height: h,
      left: x.left,
      width: x.width,
      lebih: x.lebih,
      lebihN: x.lebihN,
      iso: x.iso,
      title: x.title,
      jamLabel: x.jamLabel,
      meta: x.lebih || h < 48 ? '' : x.meta,
    };
  });
}
