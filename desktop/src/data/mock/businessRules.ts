/**
 * ============================================================================
 * DISPOSABLE MOCK BUSINESS LOGIC — DEV & PROTOTYPING ONLY
 * ----------------------------------------------------------------------------
 * PERINGATAN KERAS / HARD RULE:
 * Komponen UI DILARANG MENGHITUNG aturan bisnis: status turunan, aksi yang
 * diizinkan, deteksi bentrok jadwal, dan status sel matriks belajar.
 *
 * File ini berisi implementasi tiruan (mock) yang mensimulasikan perhitungan
 * server ASP.NET Core 10. Ketika backend resmi dibangun, seluruh file ini
 * AKAN DIBUANG / DIGANTIKAN oleh data resmi dari server via OpenAPI/Orval.
 * ============================================================================
 */

import type { JenjangPendidikan } from '../types/common';
import type {
  Kegiatan,
  RawStatusKegiatan,
  StatusKegiatan,
  AksiKegiatan,
  CekBentrokInput,
  HasilDeteksiBentrok,
  ItemBentrok,
} from '../types/kegiatan';
import type {
  MataPelajaran,
  Materi,
  Ruangan,
  Tempat,
  JenisKegiatan,
  Subjek,
  Siswa,
  Kelas,
  DeleteMasterResult,
} from '../types/master';
import type {
  MatriksBelajarResult,
  MatriksFilterParams,
  KolomMateri,
  BarisSiswa,
  SelMatriks,
  RingkasanKolomMateri,
  SiswaTertinggal,
  MateriPalingTertinggal,
  CatatanDiLuarJenjang,
  CeklisManual,
} from '../types/matriks';
import type { Realisasi } from '../types/realisasi';
import type { RawKegiatanSeed } from './seedData';

// ----------------------------------------------------------------------------
// 1. STATUS KEGIATAN & AKSI DIIZINKAN (DOMAIN.md §3)
// ----------------------------------------------------------------------------

export function computeStatusKegiatan(
  rawStatus: RawStatusKegiatan,
  realisasi: Realisasi | null | undefined,
  tanggal: string,
  selesai: string,
  simulatedToday: string,
  simulatedNow: string
): StatusKegiatan {
  if (rawStatus === 'dibatalkan') return 'dibatalkan';
  if (rawStatus === 'dijadwal-ulang') return 'dijadwal_ulang';
  if (rawStatus === 'terealisasi' || (realisasi && realisasi.mulai)) return 'terealisasi';

  // Belum direalisasi adalah status turunan: tanggal sudah lewat, tapi realisasi belum diisi
  const isPastDate = tanggal < simulatedToday;
  const isPastTimeToday = tanggal === simulatedToday && selesai <= simulatedNow;

  if (rawStatus === 'belum' || isPastDate || isPastTimeToday) {
    return 'belum_direalisasi';
  }

  return 'terjadwal';
}

export function computeAksiKegiatan(status: StatusKegiatan): AksiKegiatan[] {
  switch (status) {
    case 'terjadwal':
    case 'belum_direalisasi':
      return ['lihat_detail', 'edit', 'isi_realisasi', 'jadwal_ulang', 'batalkan'];
    case 'terealisasi':
      return ['lihat_detail', 'ubah_realisasi'];
    case 'dibatalkan':
    case 'dijadwal_ulang':
      return ['lihat_detail'];
    default:
      return ['lihat_detail'];
  }
}

// ----------------------------------------------------------------------------
// 2. ENRICH KEGIATAN (DENORMALISASI SERVER-COMPUTED)
// ----------------------------------------------------------------------------

export function enrichKegiatan(
  raw: RawKegiatanSeed,
  places: Tempat[],
  rooms: Ruangan[],
  types: JenisKegiatan[],
  subjects: Subjek[],
  courses: MataPelajaran[],
  topics: Materi[],
  today: string,
  now: string
): Kegiatan {
  const room = rooms.find((r) => r.id === raw.ruangan);
  const place = places.find((p) => p.id === (room ? room.tempat : ''));
  const kind = types.find((j) => j.id === raw.jenis);
  const course = courses.find((m) => m.id === raw.mapel);
  const topic = topics.find((t) => t.id === raw.materi);

  const status = computeStatusKegiatan(raw.status, raw.realisasi, raw.tanggal, raw.selesai, today, now);
  const aksiDiizinkan = computeAksiKegiatan(status);

  // Cari pengisi utama (subjek pertama dengan peran Pengisi)
  let pengisiUtama: { id: string; nama: string } | undefined;
  const pengisiId = raw.subjek.find((s) => s.peran === 'Pengisi')?.id;
  if (pengisiId) {
    const s = subjects.find((sub) => sub.id === pengisiId);
    if (s) {
      pengisiUtama = { id: s.id, nama: s.nama };
    }
  }

  const dToday = new Date(today);
  const dEv = new Date(raw.tanggal);
  const diffTime = dToday.getTime() - dEv.getTime();
  const diffDays = Math.round(diffTime / 86400000);
  const telatHari = diffDays > 0 ? diffDays : 0;
  const perluRealisasi = status === 'belum_direalisasi';

  let labelStatus = 'Terjadwal';
  if (status === 'belum_direalisasi') {
    labelStatus = telatHari > 0 ? `Belum · ${telatHari} hari` : 'Belum · hari ini';
  } else if (status === 'terealisasi') {
    labelStatus = 'Terealisasi';
  } else if (status === 'dibatalkan') {
    labelStatus = 'Dibatalkan';
  } else if (status === 'dijadwal_ulang') {
    labelStatus = 'Dijadwal ulang';
  }

  return {
    ...raw,
    status,
    statusRaw: raw.status,
    aksiDiizinkan,
    tempat: place ? place.id : '',
    namaTempat: place ? place.nama : 'Tempat tidak diketahui',
    namaRuangan: room ? room.nama : 'Ruangan tidak diketahui',
    namaJenis: kind ? kind.nama : 'Kegiatan',
    warnaJenis: kind ? kind.warna : 'lainnya',
    namaMapel: course ? course.nama : undefined,
    namaMateri: topic ? topic.nama : undefined,
    jumlahSiswa: raw.siswa.length,
    pengisiUtama,
    perluRealisasi,
    telatHari,
    labelStatus,
  };
}

// ----------------------------------------------------------------------------
// 3. DETEKSI BENTROK JADWAL (DOMAIN.md §5)
// ----------------------------------------------------------------------------

export function detectScheduleConflicts(
  input: CekBentrokInput,
  allKegiatan: RawKegiatanSeed[],
  rooms: Ruangan[],
  subjects: Subjek[],
  students: Siswa[]
): HasilDeteksiBentrok {
  const { tanggal, mulai, selesai, ruangan, subjek: subjekInput, siswa: siswaInput, excludeKegiatanId } = input;
  const conflicts: ItemBentrok[] = [];

  const candidateKegiatan = allKegiatan.filter((k) => {
    if (excludeKegiatanId && k.id === excludeKegiatanId) return false;
    if (k.tanggal !== tanggal) return false;
    // Kegiatan dibatalkan atau dijadwal-ulang tidak memicu bentrok
    if (k.status === 'dibatalkan' || k.status === 'dijadwal-ulang') return false;

    // Overlap time interval: startA < endB && endA > startB
    return k.mulai < selesai && k.selesai > mulai;
  });

  const roomObj = rooms.find((r) => r.id === ruangan);
  const roomName = roomObj ? roomObj.nama : 'Ruangan';

  for (const k of candidateKegiatan) {
    // 1. Bentrok Ruangan
    if (k.ruangan === ruangan) {
      conflicts.push({
        tipe: 'ruangan',
        entitasId: ruangan,
        entitasNama: roomName,
        kegiatanBentrokId: k.id,
        kegiatanBentrokNama: k.nama,
        mulai: k.mulai,
        selesai: k.selesai,
        keterangan: `Ruangan "${roomName}" sudah dipakai oleh "${k.nama}" (${k.mulai} - ${k.selesai})`,
      });
    }

    // 2. Bentrok Subjek
    for (const subjekId of subjekInput) {
      if (k.subjek.some((s) => s.id === subjekId)) {
        const subjekObj = subjects.find((s) => s.id === subjekId);
        const subjekNama = subjekObj ? subjekObj.nama : 'Subjek';
        conflicts.push({
          tipe: 'subjek',
          entitasId: subjekId,
          entitasNama: subjekNama,
          kegiatanBentrokId: k.id,
          kegiatanBentrokNama: k.nama,
          mulai: k.mulai,
          selesai: k.selesai,
          keterangan: `${subjekNama} sudah terjadwal di "${k.nama}" (${k.mulai} - ${k.selesai})`,
        });
      }
    }

    // 3. Bentrok Siswa
    for (const siswaId of siswaInput) {
      if (k.siswa.includes(siswaId)) {
        const siswaObj = students.find((s) => s.id === siswaId);
        const siswaNama = siswaObj ? siswaObj.nama : 'Siswa';
        conflicts.push({
          tipe: 'siswa',
          entitasId: siswaId,
          entitasNama: siswaNama,
          kegiatanBentrokId: k.id,
          kegiatanBentrokNama: k.nama,
          mulai: k.mulai,
          selesai: k.selesai,
          keterangan: `${siswaNama} sudah dijadwalkan di "${k.nama}" (${k.mulai} - ${k.selesai})`,
        });
      }
    }
  }

  const adaBentrok = conflicts.length > 0;
  let ringkasan = 'Tidak ada bentrok jadwal.';
  if (adaBentrok) {
    const ruanganCount = conflicts.filter((c) => c.tipe === 'ruangan').length;
    const subjekCount = conflicts.filter((c) => c.tipe === 'subjek').length;
    const siswaCount = conflicts.filter((c) => c.tipe === 'siswa').length;
    const parts: string[] = [];
    if (ruanganCount > 0) parts.push(`${ruanganCount} bentrok ruangan`);
    if (subjekCount > 0) parts.push(`${subjekCount} bentrok pengisi/subjek`);
    if (siswaCount > 0) parts.push(`${siswaCount} bentrok siswa`);
    ringkasan = `Ditemukan bentrok jadwal: ${parts.join(', ')}.`;
  }

  return {
    adaBentrok,
    daftarBentrok: conflicts,
    ringkasan,
  };
}

// ----------------------------------------------------------------------------
// 4. MATRIKS BELAJAR (DOMAIN.md §10)
// ----------------------------------------------------------------------------

export function computeMatriksBelajar(
  mapelId: string,
  jenjang: JenjangPendidikan,
  filter: MatriksFilterParams = {},
  allMateri: Materi[],
  allSiswa: Siswa[],
  allKelas: Kelas[],
  allMapel: MataPelajaran[],
  allKegiatan: RawKegiatanSeed[],
  allCeklisManual: CeklisManual[],
  _today: string,
  _now: string
): MatriksBelajarResult {
  const mapel = allMapel.find((m) => m.id === mapelId);
  const namaMapel = mapel ? mapel.nama : 'Mata Pelajaran';

  // 1. Kolom = materi dari mapel itu yang jenjangnya cocok, berurutan
  const matchingMateri = allMateri
    .filter((m) => m.mapel === mapelId && m.jenjang.includes(jenjang) && m.aktif)
    .sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0));

  const kolom: KolomMateri[] = matchingMateri.map((m, idx) => ({
    id: m.id,
    mapelId: m.mapel,
    nama: m.nama,
    jenjang: m.jenjang,
    urutan: idx + 1,
  }));

  const materiIdsSet = new Set(kolom.map((k) => k.id));

  // 2. Baris = siswa dengan jenjang cocok
  let candidateSiswa = allSiswa.filter((s) => s.jenjang === jenjang);

  if (!filter.tampilkanNonaktif) {
    candidateSiswa = candidateSiswa.filter((s) => s.aktif);
  }

  if (filter.kelasId) {
    const targetKelas = allKelas.find((k) => k.id === filter.kelasId);
    if (targetKelas) {
      const memberSet = new Set(targetKelas.anggota);
      candidateSiswa = candidateSiswa.filter((s) => memberSet.has(s.id));
    }
  }

  if (filter.q && filter.q.trim().length > 0) {
    const qLower = filter.q.trim().toLowerCase();
    candidateSiswa = candidateSiswa.filter((s) => s.nama.toLowerCase().includes(qLower));
  }

  // Sort siswa alphabetically
  candidateSiswa.sort((a, b) => a.nama.localeCompare(b.nama, 'id'));

  const baris: BarisSiswa[] = candidateSiswa.map((s) => {
    const classes = allKelas.filter((k) => k.anggota.includes(s.id)).map((k) => k.nama);
    return {
      id: s.id,
      nama: s.nama,
      jenjang: s.jenjang,
      aktif: s.aktif,
      daftarKelasNama: classes,
    };
  });

  const siswaIdsSet = new Set(baris.map((b) => b.id));

  // 3. Sel Matriks [siswaId][materiId]
  const sel: Record<string, Record<string, SelMatriks>> = {};
  for (const s of baris) {
    sel[s.id] = {};
    for (const m of kolom) {
      sel[s.id][m.id] = {
        siswaId: s.id,
        materiId: m.id,
        keadaan: 'kosong',
        riwayat: [],
      };
    }
  }

  // 4. Isi sel dari Realisasi kegiatan & Riwayat
  // DOMAIN.md §10: Sumber materi dibaca dari realisasi.materi, fallback rencana. Dibatalkan/dijadwal-ulang dilewati.
  for (const k of allKegiatan) {
    if (k.status === 'dibatalkan' || k.status === 'dijadwal-ulang') continue;
    const effectiveMateriId = k.realisasi?.materi || k.materi;
    if (!effectiveMateriId) continue;

    // Check if this materi is in the column set
    const isColumnMateri = materiIdsSet.has(effectiveMateriId);

    // Kegiatan yang terealisasi
    if (k.realisasi && k.status === 'terealisasi') {
      const pesertaSet = new Set([...(k.siswa || []), ...Object.keys(k.realisasi.kehadiran || {})]);
      for (const siswaId of pesertaSet) {
        if (!siswaIdsSet.has(siswaId)) continue;
        const kehadiranStatus = k.realisasi.kehadiran?.[siswaId] || null;

        if (isColumnMateri) {
          const targetCell = sel[siswaId][effectiveMateriId];
          targetCell.riwayat.push({
            kegiatanId: k.id,
            namaKegiatan: k.nama,
            tanggal: k.tanggal,
            kehadiran: kehadiranStatus,
            ketuntasan: k.realisasi.ketuntasan,
            realisasiAda: true,
          });

          // Update cell state using priorities
          // Prioritas: tersampaikan / selesai_manual > terjadwal > alpa > izin > sakit > kosong
          if (kehadiranStatus === 'hadir') {
            targetCell.keadaan = 'tersampaikan';
            targetCell.kegiatanId = k.id;
            targetCell.tanggal = k.tanggal;
            targetCell.ketuntasan = k.realisasi.ketuntasan;
          } else if (targetCell.keadaan !== 'tersampaikan' && targetCell.keadaan !== 'selesai_manual') {
            if (kehadiranStatus === 'alpa' && targetCell.keadaan !== 'terjadwal') {
              targetCell.keadaan = 'alpa';
              targetCell.kegiatanId = k.id;
              targetCell.tanggal = k.tanggal;
              targetCell.ketuntasan = k.realisasi.ketuntasan;
            } else if (kehadiranStatus === 'izin' && targetCell.keadaan !== 'terjadwal' && targetCell.keadaan !== 'alpa') {
              targetCell.keadaan = 'izin';
              targetCell.kegiatanId = k.id;
              targetCell.tanggal = k.tanggal;
              targetCell.ketuntasan = k.realisasi.ketuntasan;
            } else if (
              kehadiranStatus === 'sakit' &&
              targetCell.keadaan !== 'terjadwal' &&
              targetCell.keadaan !== 'alpa' &&
              targetCell.keadaan !== 'izin'
            ) {
              targetCell.keadaan = 'sakit';
              targetCell.kegiatanId = k.id;
              targetCell.tanggal = k.tanggal;
              targetCell.ketuntasan = k.realisasi.ketuntasan;
            }
          }
        }
      }
    } else {
      // Kegiatan Terjadwal / Belum direalisasi
      if (isColumnMateri) {
        for (const siswaId of k.siswa) {
          if (!siswaIdsSet.has(siswaId)) continue;
          const targetCell = sel[siswaId][effectiveMateriId];
          targetCell.riwayat.push({
            kegiatanId: k.id,
            namaKegiatan: k.nama,
            tanggal: k.tanggal,
            kehadiran: null,
            ketuntasan: null,
            realisasiAda: false,
          });

          // Terjadwal hanya menimpa alpa/izin/sakit/kosong; TIDAK menimpa tersampaikan/selesai_manual
          if (targetCell.keadaan !== 'tersampaikan' && targetCell.keadaan !== 'selesai_manual') {
            targetCell.keadaan = 'terjadwal';
            targetCell.kegiatanId = k.id;
            targetCell.tanggal = k.tanggal;
          }
        }
      }
    }
  }

  // Sort riwayat per cell descending by date
  for (const s of baris) {
    for (const m of kolom) {
      sel[s.id][m.id].riwayat.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
    }
  }

  // 5. Isi sel dari Ceklis Manual
  // DOMAIN.md §10: selesai_manual prioritas sejajar dengan tersampaikan, tapi jika sudah tersampaikan lewat kehadiran, tidak ditimpa
  for (const cm of allCeklisManual) {
    if (siswaIdsSet.has(cm.siswa) && materiIdsSet.has(cm.materi)) {
      const targetCell = sel[cm.siswa][cm.materi];
      if (targetCell.keadaan !== 'tersampaikan') {
        targetCell.keadaan = 'selesai_manual';
        targetCell.tanggal = cm.tanggal;
        targetCell.ceklisManualId = cm.id;
        targetCell.catatanManual = cm.catatan;
        targetCell.olehManual = cm.oleh;
        targetCell.dicatatManual = cm.dicatat;
      }
    }
  }

  // 6. Ringkasan Kolom Materi ("Menerima")
  const ringkasanKolom: Record<string, RingkasanKolomMateri> = {};
  const totalSiswaTampil = baris.length;

  for (const m of kolom) {
    let menerima = 0;
    for (const s of baris) {
      const cellState = sel[s.id][m.id].keadaan;
      if (cellState === 'tersampaikan' || cellState === 'selesai_manual') {
        menerima += 1;
      }
    }
    ringkasanKolom[m.id] = {
      materiId: m.id,
      menerimaCount: menerima,
      totalSiswa: totalSiswaTampil,
      persentase: totalSiswaTampil > 0 ? Math.round((menerima / totalSiswaTampil) * 100) : 0,
    };
  }

  // 7. Siswa Tertinggal
  // DOMAIN.md §10: belum menerima >= 40% kolom yang tampil (dibulatkan ke atas, minimal 2)
  const totalKolom = kolom.length;
  const minBelum = Math.max(2, Math.ceil(0.4 * totalKolom));
  const ambangTertinggal = {
    minBelum,
    totalMateri: totalKolom,
    persen: totalKolom > 0 ? Math.round((minBelum / totalKolom) * 100) : 40,
  };

  const siswaTertinggal: SiswaTertinggal[] = [];
  for (const s of baris) {
    let belumDiterima = 0;
    for (const m of kolom) {
      const cellState = sel[s.id][m.id].keadaan;
      if (cellState !== 'tersampaikan' && cellState !== 'selesai_manual') {
        belumDiterima += 1;
      }
    }
    if (belumDiterima >= minBelum) {
      siswaTertinggal.push({
        siswaId: s.id,
        nama: s.nama,
        materiBelumDiterima: belumDiterima,
        totalMateri: totalKolom,
        persentaseBelumDiterima: totalKolom > 0 ? Math.round((belumDiterima / totalKolom) * 100) : 0,
      });
    }
  }
  // Sort siswa tertinggal desc by belum menerima
  siswaTertinggal.sort((a, b) => b.materiBelumDiterima - a.materiBelumDiterima);

  // 8. Materi Paling Tertinggal
  // DOMAIN.md §10: Pemutus seri: paling banyak belum -> paling lama tidak dijadwalkan -> urutan materi
  let materiPalingTertinggal: MateriPalingTertinggal | null = null;
  if (kolom.length > 0 && totalSiswaTampil > 0) {
    const list = kolom.map((m) => {
      const stat = ringkasanKolom[m.id];
      const belumCount = totalSiswaTampil - stat.menerimaCount;

      // Cari kegiatan terakhir dijadwalkan untuk materi ini
      const matchingKegiatan = allKegiatan
        .filter(
          (k) =>
            (k.materi === m.id || k.realisasi?.materi === m.id) &&
            k.status !== 'dibatalkan' &&
            k.status !== 'dijadwal-ulang'
        )
        .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
      const latestDate = matchingKegiatan.length > 0 ? matchingKegiatan[0].tanggal : null;

      return {
        materiId: m.id,
        nama: m.nama,
        urutan: m.urutan,
        belumCount,
        latestDate,
      };
    });

    const merata = list.every((item) => item.belumCount === list[0].belumCount);

    list.sort((a, b) => {
      if (b.belumCount !== a.belumCount) return b.belumCount - a.belumCount;
      if (a.latestDate !== b.latestDate) {
        if (!a.latestDate) return -1;
        if (!b.latestDate) return 1;
        return a.latestDate.localeCompare(b.latestDate);
      }
      return a.urutan - b.urutan;
    });

    const top = list[0];
    if (top) {
      if (merata && top.belumCount === 0) {
        materiPalingTertinggal = {
          materiId: '',
          nama: 'Semua tuntas',
          belumMenerimaCount: 0,
          terakhirDijadwalkan: null,
          alasan: 'Semua materi telah tersampaikan ke seluruh siswa',
        };
      } else if (merata) {
        materiPalingTertinggal = {
          materiId: '',
          nama: 'Semua merata',
          belumMenerimaCount: top.belumCount,
          terakhirDijadwalkan: null,
          alasan: `tiap materi belum diterima ${top.belumCount} siswa`,
        };
      } else if (top.belumCount > 0) {
        materiPalingTertinggal = {
          materiId: top.materiId,
          nama: top.nama,
          belumMenerimaCount: top.belumCount,
          terakhirDijadwalkan: top.latestDate,
          alasan: `belum diterima ${top.belumCount} dari ${totalSiswaTampil} siswa`,
        };
      }
    }
  }

  // 9. Catatan di Luar Jenjang (DOMAIN.md §10)
  // Kalau ada siswa yang tampil punya kehadiran atau ceklis di materi yang jenjangnya tidak cocok
  const catatanDiLuarJenjang: CatatanDiLuarJenjang[] = [];
  const materiLuar = allMateri.filter((t) => t.mapel === mapelId && !t.jenjang.includes(jenjang));

  for (const sw of candidateSiswa) {
    for (const t of materiLuar) {
      // 1. Cek kehadiran di kegiatan terealisasi
      const hadirKeg = allKegiatan.find(
        (k) =>
          k.status !== 'dibatalkan' &&
          k.status !== 'dijadwal-ulang' &&
          (k.realisasi?.materi === t.id || (!k.realisasi?.materi && k.materi === t.id)) &&
          k.realisasi?.kehadiran?.[sw.id] === 'hadir'
      );

      // 2. Cek ceklis manual
      const manualCheck = allCeklisManual.find(
        (cm) => cm.siswa === sw.id && cm.materi === t.id
      );

      if (hadirKeg) {
        catatanDiLuarJenjang.push({
          siswaId: sw.id,
          siswaNama: sw.nama,
          siswaJenjang: sw.jenjang,
          materiId: t.id,
          materiNama: t.nama,
          materiJenjang: t.jenjang,
          tipe: 'realisasi',
          sumber: `Hadir di “${hadirKeg.nama}” · ${hadirKeg.tanggal}`,
          kegiatanId: hadirKeg.id,
          tanggal: hadirKeg.tanggal,
        });
      } else if (manualCheck) {
        catatanDiLuarJenjang.push({
          siswaId: sw.id,
          siswaNama: sw.nama,
          siswaJenjang: sw.jenjang,
          materiId: t.id,
          materiNama: t.nama,
          materiJenjang: t.jenjang,
          tipe: 'ceklis_manual',
          sumber: `Ceklis manual oleh ${manualCheck.oleh} · ${manualCheck.dicatat}`,
          kegiatanId: null,
          tanggal: manualCheck.tanggal,
        });
      }
    }
  }

  // 10. Menunggu Realisasi (kegiatan dengan status 'belum')
  const menungguRealisasiCount = allKegiatan.filter((k) => k.status === 'belum').length;

  return {
    mapelId,
    namaMapel,
    jenjang,
    kolom,
    baris,
    sel,
    ringkasanKolom,
    siswaTertinggal,
    ambangTertinggal,
    materiPalingTertinggal,
    catatanDiLuarJenjang,
    menungguRealisasiCount,
  };
}

// ----------------------------------------------------------------------------
// 5. MASTER DATA INTEGRITY & USAGE CHECK (DOMAIN.md §12)
// ----------------------------------------------------------------------------

export function checkMasterUsage(
  type: 'siswa' | 'subjek' | 'kelas' | 'mapel' | 'materi' | 'tempat' | 'ruangan' | 'jenis',
  id: string,
  kegiatanList: RawKegiatanSeed[],
  classList: Kelas[],
  manualChecklists: CeklisManual[],
  rooms: Ruangan[],
  topics: Materi[]
): DeleteMasterResult {
  const details: string[] = [];

  switch (type) {
    case 'siswa': {
      const kegiatanCount = kegiatanList.filter((k) => k.siswa.includes(id)).length;
      if (kegiatanCount > 0) details.push(`Terdaftar di ${kegiatanCount} kegiatan`);
      const kelasCount = classList.filter((c) => c.anggota.includes(id)).length;
      if (kelasCount > 0) details.push(`Terdaftar sebagai anggota di ${kelasCount} kelas`);
      const cmCount = manualChecklists.filter((cm) => cm.siswa === id).length;
      if (cmCount > 0) details.push(`Memiliki ${cmCount} rekaman ceklis manual matriks`);
      break;
    }
    case 'subjek': {
      const count = kegiatanList.filter((k) => k.subjek.some((s) => s.id === id)).length;
      if (count > 0) details.push(`Terlibat dalam ${count} kegiatan`);
      break;
    }
    case 'kelas': {
      const count = kegiatanList.filter((k) => k.kelas === id).length;
      if (count > 0) details.push(`Dipakai sebagai sumber impor di ${count} kegiatan`);
      break;
    }
    case 'mapel': {
      const topicCount = topics.filter((t) => t.mapel === id).length;
      if (topicCount > 0) details.push(`Memiliki ${topicCount} materi pembelajaran`);
      const kegiatanCount = kegiatanList.filter((k) => k.mapel === id).length;
      if (kegiatanCount > 0) details.push(`Dipakai di ${kegiatanCount} kegiatan`);
      break;
    }
    case 'materi': {
      const kegiatanCount = kegiatanList.filter((k) => k.materi === id || k.realisasi?.materi === id).length;
      if (kegiatanCount > 0) details.push(`Tercatat di ${kegiatanCount} kegiatan`);
      const cmCount = manualChecklists.filter((cm) => cm.materi === id).length;
      if (cmCount > 0) details.push(`Tercatat di ${cmCount} ceklis manual matriks`);
      break;
    }
    case 'tempat': {
      const roomCount = rooms.filter((r) => r.tempat === id).length;
      if (roomCount > 0) details.push(`Memiliki ${roomCount} ruangan`);
      break;
    }
    case 'ruangan': {
      const count = kegiatanList.filter((k) => k.ruangan === id).length;
      if (count > 0) details.push(`Dipakai di ${count} kegiatan`);
      break;
    }
    case 'jenis': {
      const count = kegiatanList.filter((k) => k.jenis === id).length;
      if (count > 0) details.push(`Dipakai di ${count} kegiatan`);
      break;
    }
  }

  const bisaDihapus = details.length === 0;
  return {
    bisaDihapus,
    alasanTidakBisa: bisaDihapus
      ? undefined
      : `Data ini tidak dapat dihapus karena masih digunakan: ${details.join('; ')}.`,
    jumlahPenggunaan: details.length,
    rincianPenggunaan: details,
  };
}
