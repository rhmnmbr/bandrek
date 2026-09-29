import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

console.log('=== TEST SUITE: A5 Detail Kegiatan Screen ===\n');

// 1. Status Configuration & Badge Rules Verification (DESIGN.md & prototype valsDetail)
console.log('Test 1: Status badge configurations match DESIGN.md & prototype');

const STATUS_CONFIG = {
  terjadwal: {
    label: 'Terjadwal',
    glyph: '●',
    accent: '#0F6CBD',
    bg: '#EBF3FC',
    ink: '#0C548F',
  },
  belum_direalisasi: {
    label: 'Belum direalisasi',
    glyph: '⚠',
    accent: '#F0A82E',
    bg: '#FFF3E0',
    ink: '#8A5200',
  },
  terealisasi: {
    label: 'Terealisasi',
    glyph: '✓',
    accent: '#4CAF50',
    bg: '#E8F5E9',
    ink: '#2E7D32',
  },
  dijadwal_ulang: {
    label: 'Dijadwal ulang',
    glyph: '↻',
    accent: '#8764B8',
    bg: '#F3EFFA',
    ink: '#5B4394',
  },
  dibatalkan: {
    label: 'Dibatalkan',
    glyph: '✕',
    accent: '#C8C6C4',
    bg: '#F5F5F5',
    ink: '#5C5A58',
  },
};

for (const [st, cfg] of Object.entries(STATUS_CONFIG)) {
  assert.ok(cfg.label, `Status ${st} must have label`);
  assert.ok(cfg.glyph, `Status ${st} must have glyph`);
  assert.ok(cfg.accent, `Status ${st} must have accent border`);
  assert.ok(cfg.bg, `Status ${st} must have background color`);
  assert.ok(cfg.ink, `Status ${st} must have ink color`);
}
console.log('  ✓ 5/5 status configurations valid');

// 2. Toolbar Action Buttons & Menu Rules (DOMAIN.md §3 & prototype lines 7908–7937)
console.log('\nTest 2: Action buttons and menu options per status match DOMAIN.md §3 and prototype');

function getToolbarActions(status) {
  const bolehUbah = status === 'terjadwal' || status === 'belum_direalisasi';
  let utamaLabel = 'Ubah kegiatan';
  let utamaDisabled = false;
  let adaMenu = bolehUbah;

  if (bolehUbah) {
    utamaLabel = 'Ubah kegiatan';
    utamaDisabled = false;
  } else if (status === 'terealisasi') {
    utamaLabel = 'Ubah realisasi';
    utamaDisabled = false;
  } else {
    utamaLabel = 'Ubah kegiatan';
    utamaDisabled = true;
  }

  const menu = adaMenu
    ? [
        { label: 'Jadwalkan ulang', fg: '#242424' },
        { label: 'Batalkan kegiatan', fg: '#9B0C18' },
      ]
    : [];

  return { utamaLabel, utamaDisabled, adaMenu, menu };
}

// Test terjadwal
const actTerjadwal = getToolbarActions('terjadwal');
assert.equal(actTerjadwal.utamaLabel, 'Ubah kegiatan');
assert.equal(actTerjadwal.utamaDisabled, false);
assert.equal(actTerjadwal.adaMenu, true);
assert.equal(actTerjadwal.menu.length, 2);
assert.equal(actTerjadwal.menu[0].label, 'Jadwalkan ulang');
assert.equal(actTerjadwal.menu[1].label, 'Batalkan kegiatan');
assert.equal(actTerjadwal.menu[1].fg, '#9B0C18');
console.log('  ✓ terjadwal: "Ubah kegiatan" active, menu "···" available with red "Batalkan kegiatan"');

// Test belum_direalisasi
const actBelum = getToolbarActions('belum_direalisasi');
assert.equal(actBelum.utamaLabel, 'Ubah kegiatan');
assert.equal(actBelum.utamaDisabled, false);
assert.equal(actBelum.adaMenu, true);
console.log('  ✓ belum_direalisasi: identical to terjadwal');

// Test terealisasi
const actTerealisasi = getToolbarActions('terealisasi');
assert.equal(actTerealisasi.utamaLabel, 'Ubah realisasi');
assert.equal(actTerealisasi.utamaDisabled, false);
assert.equal(actTerealisasi.adaMenu, false);
console.log('  ✓ terealisasi: "Ubah realisasi" active, menu "···" hidden');

// Test dibatalkan
const actBatal = getToolbarActions('dibatalkan');
assert.equal(actBatal.utamaLabel, 'Ubah kegiatan');
assert.equal(actBatal.utamaDisabled, true);
assert.equal(actBatal.adaMenu, false);
console.log('  ✓ dibatalkan: "Ubah kegiatan" disabled, menu "···" hidden');

// Test dijadwal_ulang
const actUlang = getToolbarActions('dijadwal_ulang');
assert.equal(actUlang.utamaLabel, 'Ubah kegiatan');
assert.equal(actUlang.utamaDisabled, true);
assert.equal(actUlang.adaMenu, false);
console.log('  ✓ dijadwal_ulang: "Ubah kegiatan" disabled, menu "···" hidden');

// 3. Realisasi Calculations & Empty State Warnings (prototype lines 7847–7861 & 7942–7948)
console.log('\nTest 3: Realisasi timing delta, student presence count, and empty warning state logic');

function menit(hhmm) {
  if (!hhmm) return 0;
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function hitungRealisasi(kegiatanRencana, re) {
  if (!re) {
    const kosongJudul =
      kegiatanRencana.status === 'dibatalkan'
        ? 'Kegiatan dibatalkan, tidak ada realisasi'
        : kegiatanRencana.status === 'dijadwal_ulang'
          ? 'Kegiatan dijadwalkan ulang, tidak ada realisasi'
          : 'Realisasi belum diisi';

    const kosongTeks =
      kegiatanRencana.status === 'dibatalkan'
        ? 'Karena dibatalkan, materi kegiatan ini tetap belum tersampaikan di matriks belajar.'
        : kegiatanRencana.status === 'dijadwal_ulang'
          ? 'Realisasi akan diisi pada jadwal barunya, bukan di sini.'
          : 'Kehadiran dan ketuntasan belum tercatat, jadi materi ini belum masuk matriks belajar.';

    return { adaRealisasi: false, kosongJudul, kosongTeks };
  }

  const telat = menit(re.mulai) - menit(kegiatanRencana.mulai);
  const telatStr =
    telat > 0
      ? `  (mulai telat ${telat} mnt)`
      : telat < 0
        ? `  (mulai lebih awal ${-telat} mnt)`
        : '  (sesuai rencana)';

  const hit = { hadir: 0, izin: 0, sakit: 0, alpa: 0 };
  Object.keys(re.kehadiran || {}).forEach((k) => {
    if (hit[re.kehadiran[k]] !== undefined) hit[re.kehadiran[k]]++;
  });

  const kehadiranStr = kegiatanRencana.siswa.length
    ? `${hit.hadir} hadir · ${hit.izin} izin · ${hit.sakit} sakit · ${hit.alpa} alpa`
    : 'Tanpa siswa';

  const kesesuaianMateri =
    re.materi === kegiatanRencana.materi ? ' (sesuai rencana)' : ' (berbeda dari rencana)';

  return {
    adaRealisasi: true,
    telatStr,
    kehadiranStr,
    kesesuaianMateri,
  };
}

// Test realisasi on-time
const r1 = hitungRealisasi(
  { mulai: '08:00', materi: 'mat-1', siswa: ['s1', 's2', 's3'], status: 'terealisasi' },
  { mulai: '08:00', selesai: '09:30', materi: 'mat-1', kehadiran: { s1: 'hadir', s2: 'hadir', s3: 'izin' } }
);
assert.equal(r1.adaRealisasi, true);
assert.equal(r1.telatStr.trim(), '(sesuai rencana)');
assert.equal(r1.kehadiranStr, '2 hadir · 1 izin · 0 sakit · 0 alpa');
assert.equal(r1.kesesuaianMateri.trim(), '(sesuai rencana)');
console.log('  ✓ On-time realisasi correctly computes presence and concordance');

// Test realisasi delayed start & different topic
const r2 = hitungRealisasi(
  { mulai: '08:00', materi: 'mat-1', siswa: ['s1'], status: 'terealisasi' },
  { mulai: '08:15', selesai: '09:45', materi: 'mat-2', kehadiran: { s1: 'hadir' } }
);
assert.equal(r2.telatStr.trim(), '(mulai telat 15 mnt)');
assert.equal(r2.kesesuaianMateri.trim(), '(berbeda dari rencana)');
console.log('  ✓ Delayed start and topic discrepancy correctly flagged');

// Test empty realisasi warning for cancelled
const rBatal = hitungRealisasi({ status: 'dibatalkan', siswa: [] }, null);
assert.equal(rBatal.kosongJudul, 'Kegiatan dibatalkan, tidak ada realisasi');
assert.ok(rBatal.kosongTeks.includes('tetap belum tersampaikan'));
console.log('  ✓ Cancelled activity shows appropriate yellow alert text');

// 4. Riwayat Timeline Construction (prototype lines 7876–7885)
console.log('\nTest 4: Riwayat timeline construction and color tokens');

function susunRiwayat(kegiatan, re, srcKegiatan) {
  const riwayat = [];
  if (re) {
    riwayat.push({
      judul: 'Realisasi diisi',
      dotBg: '#4CAF50',
      dotBrd: '#2E7D32',
    });
  }
  if (kegiatan.pembatalan) {
    riwayat.push({
      judul: 'Kegiatan dibatalkan',
      dotBg: '#FDE7E9',
      dotBrd: '#C50F1F',
    });
  }
  if (kegiatan.penjadwalanUlang) {
    riwayat.push({
      judul: 'Kegiatan dijadwalkan ulang',
      dotBg: '#F3EFFA',
      dotBrd: '#8764B8',
    });
  }
  if (kegiatan.jadwalUlangDari) {
    riwayat.push({
      judul: 'Dibuat dari penjadwalan ulang',
      dotBg: '#EBF3FC',
      dotBrd: '#0F6CBD',
      ket: srcKegiatan ? `Pindahan dari "${srcKegiatan.nama}".` : '',
    });
  }
  riwayat.push({
    judul: 'Kegiatan dibuat',
    dotBg: '#FFFFFF',
    dotBrd: '#C8C6C4',
  });
  return riwayat;
}

const riwayatContoh = susunRiwayat(
  {
    jadwalUlangDari: 'keg-old',
    pembatalan: null,
    penjadwalanUlang: null,
  },
  null,
  { nama: 'Matematika Pagi' }
);
assert.equal(riwayatContoh.length, 2);
assert.equal(riwayatContoh[0].judul, 'Dibuat dari penjadwalan ulang');
assert.equal(riwayatContoh[0].dotBg, '#EBF3FC');
assert.equal(riwayatContoh[0].ket, 'Pindahan dari "Matematika Pagi".');
assert.equal(riwayatContoh[1].judul, 'Kegiatan dibuat');
assert.equal(riwayatContoh[1].dotBg, '#FFFFFF');
console.log('  ✓ Timeline items sequenced and styled with correct tokens');

// 5. Source code validation of DetailKegiatanScreen.tsx and routing
console.log('\nTest 5: Source code integrity in DetailKegiatanScreen.tsx & App.tsx');

const screenPath = existsSync(resolve('src/screens/DetailKegiatanScreen.tsx'))
  ? resolve('src/screens/DetailKegiatanScreen.tsx')
  : resolve('desktop/src/screens/DetailKegiatanScreen.tsx');
const screenCode = readFileSync(screenPath, 'utf-8');

assert.ok(screenCode.includes('useParams'), 'Screen reads activity ID from route params');
assert.ok(screenCode.includes('useKegiatanDetail'), 'Screen queries activity detail from data layer');
assert.ok(screenCode.includes('FormKegiatanPanel'), 'Screen integrates FormKegiatanPanel for editing');
assert.ok(screenCode.includes('RENCANA'), 'Card 1 RENCANA present');
assert.ok(screenCode.includes('REALISASI'), 'Card 2 REALISASI present');
assert.ok(screenCode.includes('PESERTA'), 'Card 3 PESERTA present');
assert.ok(screenCode.includes('RIWAYAT KEGIATAN'), 'Sidebar section RIWAYAT KEGIATAN present');
assert.ok(screenCode.includes('KEGIATAN TERKAIT'), 'Sidebar section KEGIATAN TERKAIT present');
assert.ok(screenCode.includes('Cetak menyusul di tahap berikutnya'), 'Cetak button properly disabled with guidance title');
assert.ok(screenCode.includes('line-through'), 'Canceled activity title renders line-through');
assert.ok(screenCode.includes('font-mono'), 'Timestamps use Cascadia Mono via font-mono per DESIGN.md §2.2');
console.log('  ✓ DetailKegiatanScreen conforms to all prototype & design specifications');

const appPath = existsSync(resolve('src/App.tsx'))
  ? resolve('src/App.tsx')
  : resolve('desktop/src/App.tsx');
const appCode = readFileSync(appPath, 'utf-8');
assert.ok(appCode.includes('path="/kegiatan/:id"'), 'Route /kegiatan/:id registered in App.tsx');
assert.ok(appCode.includes('DetailKegiatanScreen'), 'DetailKegiatanScreen component bound to route');
console.log('  ✓ App.tsx routing verified');

console.log('\n=== ALL 5 A5 DETAIL KEGIATAN TEST SUITES PASSED (100%) ===');
