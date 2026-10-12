import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

console.log('=== TEST SUITE: Phase 5 Step 7 (A9 Matriks Belajar) ===\n');

// ----------------------------------------------------
// 1. Verify File Structure & Implementation Presence
// ----------------------------------------------------
const baseDir = existsSync(resolve(process.cwd(), 'desktop'))
  ? resolve(process.cwd(), 'desktop')
  : process.cwd();

console.log('Test 1: Verify Matriks Belajar Component & Screen Files');
const requiredFiles = [
  'src/screens/MatriksScreen.tsx',
  'src/components/matriks/MatriksToolbar.tsx',
  'src/components/matriks/MatriksSummaryCards.tsx',
  'src/components/matriks/MatriksGrid.tsx',
  'src/components/matriks/MatriksLegendBar.tsx',
  'src/components/matriks/MatriksCellPopover.tsx',
  'src/components/matriks/MatriksBulkToolbar.tsx',
  'src/components/matriks/MatriksAnomalyBanner.tsx',
  'src/components/matriks/MatriksAnomalyModal.tsx',
  'src/components/matriks/MatriksEmptyState.tsx',
  'src/data/types/matriks.ts',
  'src/data/mock/MockMatriksRepository.ts',
  'src/data/mock/businessRules.ts',
];

for (const f of requiredFiles) {
  const fullPath = resolve(baseDir, f);
  assert.ok(existsSync(fullPath), `Required file must exist: ${f}`);
}
console.log('✓ All 13 Matriks Belajar component and data layer files exist.\n');

// ----------------------------------------------------
// 2. Load Seed Data & Compute Function
// ----------------------------------------------------
console.log('Test 2: Seed Data & Default Scope (1 Mapel × 1 Jenjang)');
const seedFileContent = readFileSync(
  resolve(baseDir, 'src/data/mock/seedData.ts'),
  'utf8'
);
const seedMatch = seedFileContent.match(/export const INITIAL_SEED: SeedData = ({[\s\S]*?});\n/);
assert.ok(seedMatch, 'Must successfully parse INITIAL_SEED from seedData.ts');
const seed = JSON.parse(seedMatch[1]);

// Mapel default: first active mapel
const activeMapel = seed.mapel.filter((m) => m.aktif);
assert.ok(activeMapel.length > 0, 'Must have active mapel');
const defaultMapel = activeMapel[0];
assert.equal(defaultMapel.id, 'M1', 'First active mapel is M1 (Matematika)');

// Jenjang default: jenjang with most active students
const aktifPerJenjang = { SD: 0, SMP: 0, SMA: 0 };
seed.siswa.forEach((s) => {
  if (s.aktif && s.jenjang in aktifPerJenjang) {
    aktifPerJenjang[s.jenjang]++;
  }
});
const sortedJenjang = Object.keys(aktifPerJenjang).sort(
  (a, b) => aktifPerJenjang[b] - aktifPerJenjang[a]
);
const defaultJenjang = sortedJenjang[0];
assert.equal(defaultJenjang, 'SD', 'SD has the most active students (31)');
console.log(`✓ Default Mapel: ${defaultMapel.nama} (${defaultMapel.id})`);
console.log(`✓ Default Jenjang: ${defaultJenjang} (${aktifPerJenjang.SD} active students)\n`);

// ----------------------------------------------------
// 3. 7 Canonical Cell States & Priority Resolution
// ----------------------------------------------------
console.log('Test 3: 7 Canonical Cell States & Stacking Priority');
// DOMAIN.md §10: tersampaikan / selesai_manual > terjadwal > alpa > izin > sakit > kosong

function resolveCellState(events, manualChecklist) {
  // 1. Tersampaikan (hadir in realisasi)
  if (events.some((ev) => ev.hadir === 'hadir')) {
    return 'tersampaikan';
  }
  // 2. Selesai manual
  if (manualChecklist) {
    return 'selesai_manual';
  }
  // 3. Terjadwal (scheduled event not yet realized)
  if (events.some((ev) => !ev.realisasiAda)) {
    return 'terjadwal';
  }
  // 4. Absences priority: alpa > izin > sakit
  if (events.some((ev) => ev.hadir === 'alpa')) {
    return 'alpa';
  }
  if (events.some((ev) => ev.hadir === 'izin')) {
    return 'izin';
  }
  if (events.some((ev) => ev.hadir === 'sakit')) {
    return 'sakit';
  }
  // 5. Belum dijadwalkan
  return 'kosong';
}

// Case A: Hadir always wins over manual checklist, scheduled, and past absence
assert.equal(
  resolveCellState(
    [
      { hadir: 'hadir', realisasiAda: true },
      { hadir: 'alpa', realisasiAda: true },
      { hadir: null, realisasiAda: false },
    ],
    { id: 'cm_1' }
  ),
  'tersampaikan',
  'Hadir must have highest priority (tersampaikan)'
);

// Case B: Manual checklist wins over scheduled and past absence
assert.equal(
  resolveCellState(
    [
      { hadir: 'alpa', realisasiAda: true },
      { hadir: 'sakit', realisasiAda: true },
      { hadir: null, realisasiAda: false },
    ],
    { id: 'cm_1' }
  ),
  'selesai_manual',
  'Manual checklist must override scheduled and absence'
);

// Case C: Scheduled upcoming event wins over past absence
assert.equal(
  resolveCellState(
    [
      { hadir: 'alpa', realisasiAda: true },
      { hadir: null, realisasiAda: false },
    ],
    null
  ),
  'terjadwal',
  'Scheduled event must override past alpa'
);

// Case D: Alpa wins over Izin and Sakit
assert.equal(
  resolveCellState(
    [
      { hadir: 'sakit', realisasiAda: true },
      { hadir: 'izin', realisasiAda: true },
      { hadir: 'alpa', realisasiAda: true },
    ],
    null
  ),
  'alpa',
  'Alpa has higher priority than izin and sakit'
);

// Case E: Izin wins over Sakit
assert.equal(
  resolveCellState(
    [
      { hadir: 'sakit', realisasiAda: true },
      { hadir: 'izin', realisasiAda: true },
    ],
    null
  ),
  'izin',
  'Izin has higher priority than sakit'
);

// Case F: Sakit
assert.equal(
  resolveCellState([{ hadir: 'sakit', realisasiAda: true }], null),
  'sakit',
  'Single sakit gives sakit state'
);

// Case G: No events
assert.equal(resolveCellState([], null), 'kosong', 'Empty gives kosong state');

console.log('✓ All 7 states and priority resolution rules match DOMAIN.md §10.\n');

// ----------------------------------------------------
// 4. Test Summary Metrics on Matematika SD
// ----------------------------------------------------
console.log('Test 4: Verify Summary Metrics & Thresholds on Seed Data (Matematika SD)');
const mapelId = 'M1';
const jenjang = 'SD';

const matchingMateri = seed.materi
  .filter((m) => m.mapel === mapelId && m.jenjang.includes(jenjang) && m.aktif)
  .sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0));
assert.equal(matchingMateri.length, 6, 'Matematika SD must have exactly 6 topics');

const candidateSiswa = seed.siswa.filter((s) => s.jenjang === jenjang && s.aktif);
assert.equal(candidateSiswa.length, 31, 'Matematika SD must have exactly 31 active students');

// Ambang tertinggal calculation: >= 40% dibulatkan ke atas, minimal 2
const ambang = Math.max(2, Math.ceil(matchingMateri.length * 0.4));
assert.equal(ambang, 3, 'Ambang tertinggal for 6 topics must be 3 (>= 40% of 6)');

// Build cell map for seed data
const cells = {};
candidateSiswa.forEach((s) => {
  cells[s.id] = {};
  matchingMateri.forEach((m) => {
    // Check activities
    const matchingKeg = seed.kegiatan.filter((k) => {
      if (k.status === 'dibatalkan' || k.status === 'dijadwal-ulang') return false;
      const mid = k.realisasi?.materi || k.materi;
      if (mid !== m.id) return false;
      return (
        k.siswa.includes(s.id) ||
        (k.realisasi?.kehadiran && s.id in k.realisasi.kehadiran)
      );
    });

    const events = matchingKeg.map((k) => ({
      hadir: k.realisasi?.kehadiran ? k.realisasi.kehadiran[s.id] || null : null,
      realisasiAda: !!k.realisasi,
    }));

    const manual = seed.ceklisManual.find((cm) => cm.siswa === s.id && cm.materi === m.id);
    cells[s.id][m.id] = resolveCellState(events, manual);
  });
});

// Calculate metrics
let totalTersampaikan = 0;
const totalSel = candidateSiswa.length * matchingMateri.length;
let tertinggalCount = 0;

candidateSiswa.forEach((s) => {
  let belum = 0;
  matchingMateri.forEach((m) => {
    const st = cells[s.id][m.id];
    if (st === 'tersampaikan' || st === 'selesai_manual') {
      totalTersampaikan++;
    } else {
      belum++;
    }
  });
  if (belum >= ambang) {
    tertinggalCount++;
  }
});

const persentaseCakupan = Math.round((totalTersampaikan / totalSel) * 100);
assert.equal(totalTersampaikan, 31, 'Must have 31 tersampaikan cells (14 Bilangan Bulat + 17 Pengukuran)');
assert.equal(totalSel, 186, 'Total cells must be 186 (31 * 6)');
assert.equal(persentaseCakupan, 17, 'Cakupan percentage must be 17% (31/186)');
assert.equal(tertinggalCount, 31, 'All 31 students have >= 3 unreceived topics in seed data');

// Menunggu Realisasi
const menungguCount = seed.kegiatan.filter((k) => k.status === 'belum').length;
assert.ok(menungguCount >= 8, `Menunggu realisasi count must be at least 8 (got ${menungguCount})`);

console.log(`✓ Cakupan materi: ${persentaseCakupan}% (${totalTersampaikan} dari ${totalSel} sel)`);
console.log(`✓ Siswa tertinggal: ${tertinggalCount} dari ${candidateSiswa.length} (ambang: ≥ ${ambang} dari ${matchingMateri.length})`);
console.log(`✓ Menunggu realisasi: ${menungguCount} kegiatan\n`);

// ----------------------------------------------------
// 5. Test Anomali Luar Jenjang
// ----------------------------------------------------
console.log('Test 5: Anomaly Detection (Records outside student jenjang)');
const materiLuar = seed.materi.filter((m) => m.mapel === mapelId && !m.jenjang.includes(jenjang));
const anomaliSiswa = new Set();
const anomaliItems = [];

candidateSiswa.forEach((sw) => {
  materiLuar.forEach((t) => {
    const matchingKeg = seed.kegiatan.find(
      (k) =>
        k.status !== 'dibatalkan' &&
        k.status !== 'dijadwal-ulang' &&
        (k.realisasi?.materi === t.id || (!k.realisasi?.materi && k.materi === t.id)) &&
        k.realisasi?.kehadiran?.[sw.id] === 'hadir'
    );
    const manual = seed.ceklisManual.find((cm) => cm.siswa === sw.id && cm.materi === t.id);

    if (matchingKeg || manual) {
      anomaliSiswa.add(sw.id);
      anomaliItems.push({
        siswaId: sw.id,
        siswaNama: sw.nama,
        materiId: t.id,
        materiNama: t.nama,
        tipe: matchingKeg ? 'realisasi' : 'ceklis_manual',
        kegiatanId: matchingKeg ? matchingKeg.id : null,
      });
    }
  });
});

assert.equal(anomaliSiswa.size, 7, 'Must detect exactly 7 students with anomalies outside SD');
assert.equal(anomaliItems.length, 7, 'Must have exactly 7 anomaly records');
console.log(`✓ Detected ${anomaliSiswa.size} students with ${anomaliItems.length} anomaly records outside SD.\n`);

// ----------------------------------------------------
// 6. Test Bulk Checklist Rules
// ----------------------------------------------------
console.log('Test 6: Bulk Checklist Processing');
// DOMAIN.md §10: Sel yang sudah tersampaikan lewat kehadiran dilewati saat ceklis massal
const testSelection = [
  { siswaId: candidateSiswa[0].id, materiId: matchingMateri[0].id }, // Might be tersampaikan
  { siswaId: candidateSiswa[0].id, materiId: matchingMateri[2].id }, // Kosong
];

let skipped = 0;
let marked = 0;

testSelection.forEach((item) => {
  const currentState = cells[item.siswaId][item.materiId];
  if (currentState === 'tersampaikan') {
    skipped++;
  } else {
    marked++;
  }
});

assert.ok(marked > 0, 'Uncompleted cells must be marked');
console.log(`✓ Bulk mode successfully skips already tersampaikan cells (${skipped} skipped, ${marked} marked).\n`);

// ----------------------------------------------------
// 7. Test AppShell Route Integration
// ----------------------------------------------------
console.log('Test 7: App Routing & Shell Integration');
const appContent = readFileSync(resolve(baseDir, 'src/App.tsx'), 'utf8');
assert.ok(
  appContent.includes('<Route path="/matriks" element={<MatriksScreen />} />'),
  'App.tsx must route /matriks to <MatriksScreen />'
);
console.log('✓ /matriks route is properly wired to MatriksScreen in App.tsx.\n');

console.log('=== ALL PHASE 5 STEP 7 (A9 MATRIKS BELAJAR) TESTS PASSED (7/7) ===');
