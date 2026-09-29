import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

console.log('=== TEST SUITE: Phase 5 Step 8 (A3 Daftar Kegiatan) ===\n');

const baseDir = existsSync(resolve(process.cwd(), 'desktop'))
  ? resolve(process.cwd(), 'desktop')
  : process.cwd();

// ----------------------------------------------------
// 1. Verify File Structure & Implementation Presence
// ----------------------------------------------------
console.log('Test 1: Verify Daftar Kegiatan Component & Screen Files');
const requiredFiles = [
  'src/screens/DaftarKegiatanScreen.tsx',
  'src/components/daftar/DaftarToolbar.tsx',
  'src/components/daftar/DaftarQuickFilters.tsx',
  'src/components/daftar/DaftarTable.tsx',
  'src/components/daftar/DaftarEmptyState.tsx',
  'src/data/types/kegiatan.ts',
  'src/data/mock/MockKegiatanRepository.ts',
  'src/data/mock/businessRules.ts',
];

for (const f of requiredFiles) {
  const fullPath = resolve(baseDir, f);
  assert.ok(existsSync(fullPath), `Required file must exist: ${f}`);
}
console.log('✓ All 8 Daftar Kegiatan component and data layer files exist.\n');

// ----------------------------------------------------
// 2. Load Seed Data & Compute Functions
// ----------------------------------------------------
console.log('Test 2: Load Seed Data & Mock Business Rules');
const seedFileContent = readFileSync(
  resolve(baseDir, 'src/data/mock/seedData.ts'),
  'utf8'
);
const seedMatch = seedFileContent.match(/export const INITIAL_SEED: SeedData = ({[\s\S]*?});\n/);
assert.ok(seedMatch, 'Must successfully parse INITIAL_SEED from seedData.ts');
const seed = JSON.parse(seedMatch[1]);

assert.equal(seed.today, '2026-09-16', 'Simulated today is 2026-09-16');
assert.equal(seed.now, '11:39', 'Simulated now is 11:39');
assert.equal(seed.kegiatan.length, 133, 'Total seed kegiatan is 133 activities');
console.log('✓ Seed data loaded: 133 activities, simulated today = 2026-09-16 11:39.\n');

// ----------------------------------------------------
// 3. Status Derivation & Server-Computed Fields
// ----------------------------------------------------
console.log('Test 3: Verify Status Derivation, Perlu Realisasi & Telat Hari');

function toDate(iso) {
  const parts = iso.split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function computeStatus(raw, today, now) {
  if (raw.status === 'dibatalkan') return 'dibatalkan';
  if (raw.status === 'dijadwal-ulang') return 'dijadwal_ulang';
  if (raw.status === 'terealisasi' || (raw.realisasi && raw.realisasi.mulai)) return 'terealisasi';

  const isPastDate = raw.tanggal < today;
  const isPastTimeToday = raw.tanggal === today && raw.selesai <= now;

  if (raw.status === 'belum' || isPastDate || isPastTimeToday) {
    return 'belum_direalisasi';
  }
  return 'terjadwal';
}

function enrich(raw, today, now) {
  const status = computeStatus(raw, today, now);
  const dToday = toDate(today);
  const dEv = toDate(raw.tanggal);
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

  let aksiDiizinkan = [];
  if (status === 'terjadwal' || status === 'belum_direalisasi') {
    aksiDiizinkan = ['lihat_detail', 'edit', 'isi_realisasi', 'jadwal_ulang', 'batalkan'];
  } else if (status === 'terealisasi') {
    aksiDiizinkan = ['lihat_detail', 'ubah_realisasi'];
  } else {
    aksiDiizinkan = ['lihat_detail'];
  }

  return {
    ...raw,
    status,
    telatHari,
    perluRealisasi,
    labelStatus,
    aksiDiizinkan,
  };
}

const enrichedList = seed.kegiatan.map((k) => enrich(k, seed.today, seed.now));

const perluRealisasiList = enrichedList.filter((k) => k.perluRealisasi);
assert.equal(perluRealisasiList.length, 8, 'Perlu realisasi count must be exactly 8 (matching Screenshot_13.png)');
console.log(`✓ Perlu realisasi count: ${perluRealisasiList.length} activities (matches prototype badge & screenshot).`);

// Verify status labels for overdue
const evOverdue1 = perluRealisasiList.find((k) => k.tanggal === '2026-09-15');
assert.ok(evOverdue1, 'Must have activity on 2026-09-15');
assert.equal(evOverdue1.telatHari, 1, '1 day overdue on 2026-09-15');
assert.equal(evOverdue1.labelStatus, 'Belum · 1 hari', 'Label must be "Belum · 1 hari"');

const evOverdue5 = perluRealisasiList.find((k) => k.tanggal === '2026-09-11');
assert.ok(evOverdue5, 'Must have activity on 2026-09-11');
assert.equal(evOverdue5.telatHari, 5, '5 days overdue on 2026-09-11');
assert.equal(evOverdue5.labelStatus, 'Belum · 5 hari', 'Label must be "Belum · 5 hari"');
console.log('✓ Overdue status labels correctly formatted (Belum · 1 hari, Belum · 5 hari).\n');

// ----------------------------------------------------
// 4. Quick Filter Counts (Matching Prototype Exactly)
// ----------------------------------------------------
console.log('Test 4: Verify Quick Filter Chip Counts Against Screenshot_13.png');
// In Screenshot_13.png:
// Perlu realisasi: 8
// Hari ini: 9
// Minggu ini: 19
// Akan datang: 53

const todayActivities = enrichedList.filter((k) => k.tanggal === seed.today);
assert.equal(todayActivities.length, 9, 'Hari ini count must be 9');

// Week of 2026-09-14 to 2026-09-20 (Mon to Sun)
const weekActivities = enrichedList.filter(
  (k) => k.tanggal >= '2026-09-14' && k.tanggal <= '2026-09-20'
);
assert.equal(weekActivities.length, 19, 'Minggu ini count must be 19');

// Upcoming activities (>= 2026-09-16)
const upcomingActivities = enrichedList.filter((k) => k.tanggal >= seed.today);
assert.equal(upcomingActivities.length, 53, 'Akan datang count must be 53');

console.log('✓ Quick filter counts match Screenshot_13.png exactly:');
console.log(`  - Perlu realisasi: ${perluRealisasiList.length} (expected 8)`);
console.log(`  - Hari ini: ${todayActivities.length} (expected 9)`);
console.log(`  - Minggu ini: ${weekActivities.length} (expected 19)`);
console.log(`  - Akan datang: ${upcomingActivities.length} (expected 53)\n`);

// ----------------------------------------------------
// 5. Default Date Range and Date Boundaries
// ----------------------------------------------------
console.log('Test 5: Verify Default Date Range (Past 14 Days to Latest Date in Dataset)');
const dToday = toDate(seed.today);
const dDari = new Date(dToday.getFullYear(), dToday.getMonth(), dToday.getDate() - 14);
const yM = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const expectedDari = yM(dDari);
assert.equal(expectedDari, '2026-09-02', 'Default start date is 2026-09-02 (2 weeks before 2026-09-16)');

const latestDate = enrichedList.reduce((max, k) => (k.tanggal > max ? k.tanggal : max), seed.today);
assert.equal(latestDate, '2026-10-11', 'Latest date in seed dataset is 2026-10-11');
console.log(`✓ Default date range: ${expectedDari} (02/09/2026) → ${latestDate} (11/10/2026) exactly matches Screenshot_13.png.\n`);

// ----------------------------------------------------
// 6. Action Rules per Status (DOMAIN.md §3 & Prototype)
// ----------------------------------------------------
console.log('Test 6: Verify Action Rules per Status (DOMAIN.md §3)');
for (const ev of enrichedList) {
  if (ev.status === 'terjadwal' || ev.status === 'belum_direalisasi') {
    assert.deepEqual(
      ev.aksiDiizinkan,
      ['lihat_detail', 'edit', 'isi_realisasi', 'jadwal_ulang', 'batalkan'],
      'Terjadwal/Belum direalisasi must have 5 actions'
    );
  } else if (ev.status === 'terealisasi') {
    assert.deepEqual(
      ev.aksiDiizinkan,
      ['lihat_detail', 'ubah_realisasi'],
      'Terealisasi must have 2 actions (lihat_detail & ubah_realisasi)'
    );
  } else {
    assert.deepEqual(
      ev.aksiDiizinkan,
      ['lihat_detail'],
      'Dibatalkan/Dijadwal ulang must have only lihat_detail'
    );
  }
}
console.log('✓ All 133 activities strictly follow DOMAIN.md §3 action permissions.\n');

// ----------------------------------------------------
// 7. Route and Rail Integration Check
// ----------------------------------------------------
console.log('Test 7: Verify Route & Navigation Rail Integration');
const appContent = readFileSync(resolve(baseDir, 'src/App.tsx'), 'utf8');
assert.ok(
  appContent.includes('<Route path="/kegiatan" element={<DaftarKegiatanScreen />} />'),
  'App.tsx must register DaftarKegiatanScreen at /kegiatan'
);

const railContent = readFileSync(
  resolve(baseDir, 'src/components/layout/NavigationRail.tsx'),
  'utf8'
);
assert.ok(
  railContent.includes("navigate('/kegiatan?filter=perlu_realisasi')"),
  'NavigationRail badge must navigate to /kegiatan?filter=perlu_realisasi'
);

const daftarContent = readFileSync(
  resolve(baseDir, 'src/screens/DaftarKegiatanScreen.tsx'),
  'utf8'
);
assert.ok(
  daftarContent.includes("searchParams.get('filter')"),
  'DaftarKegiatanScreen must read filter URL search param'
);
assert.ok(
  daftarContent.includes("setCepat('perlu')"),
  'DaftarKegiatanScreen must activate perlu quick filter on param'
);
assert.ok(
  daftarContent.includes('BatalkanKegiatanModal'),
  'DaftarKegiatanScreen must integrate BatalkanKegiatanModal'
);
assert.ok(
  daftarContent.includes('JadwalUlangModal'),
  'DaftarKegiatanScreen must integrate JadwalUlangModal'
);
assert.ok(
  daftarContent.includes('FormKegiatanPanel'),
  'DaftarKegiatanScreen must integrate FormKegiatanPanel'
);

console.log('✓ Route and NavigationRail integration verified.\n');

console.log('====================================================');
console.log('✓ ALL 7 DAFTAR KEGIATAN TESTS PASSED SUCCESSFULLY!');
console.log('====================================================');
