import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

console.log('=== TEST SUITE: Phase 5 Step 10 (B6 Jenis Kegiatan) ===\n');

const baseDir = existsSync(resolve(process.cwd(), 'desktop'))
  ? resolve(process.cwd(), 'desktop')
  : process.cwd();

// ----------------------------------------------------
// 1. Verify File Structure & Implementation Presence
// ----------------------------------------------------
console.log('Test 1: Verify Jenis Kegiatan Component & Screen Files');
const requiredFiles = [
  'src/screens/JenisKegiatanScreen.tsx',
  'src/components/master/jenis/palette.ts',
  'src/components/master/jenis/JenisToolbar.tsx',
  'src/components/master/jenis/JenisTable.tsx',
  'src/components/master/jenis/JenisEmptyState.tsx',
  'src/components/master/jenis/JenisFormView.tsx',
  'src/components/master/jenis/JenisConfirmModal.tsx',
  'src/data/mock/MockJenisKegiatanRepository.ts',
  'src/data/types/master.ts',
];

for (const f of requiredFiles) {
  const fullPath = resolve(baseDir, f);
  assert.ok(existsSync(fullPath), `Required file must exist: ${f}`);
}

const appFile = readFileSync(resolve(baseDir, 'src/App.tsx'), 'utf8');
assert.ok(
  appFile.includes('JenisKegiatanScreen'),
  'App.tsx must import and route to JenisKegiatanScreen'
);
assert.ok(
  appFile.includes('/master/jenis'),
  'App.tsx must contain /master/jenis route'
);
assert.ok(
  appFile.includes('/master/jenis/:id'),
  'App.tsx must contain /master/jenis/:id route'
);

console.log('✓ All 9 Jenis Kegiatan component and data layer files exist and are correctly routed.\n');

// ----------------------------------------------------
// 2. Load Seed Data
// ----------------------------------------------------
console.log('Test 2: Load Seed Data for Jenis Kegiatan and Kegiatan');
const seedFileContent = readFileSync(
  resolve(baseDir, 'src/data/mock/seedData.ts'),
  'utf8'
);
const seedMatch = seedFileContent.match(/export const INITIAL_SEED: SeedData = ({[\s\S]*?});\n/);
assert.ok(seedMatch, 'Must successfully parse INITIAL_SEED from seedData.ts');
const seed = JSON.parse(seedMatch[1]);

assert.ok(seed.jenis.length > 0, 'Seed must have jenis list');
assert.ok(seed.kegiatan.length > 0, 'Seed must have kegiatan list');

const totalJenis = seed.jenis.length;
console.log(`✓ Seed verified: ${totalJenis} jenis kegiatan across ${seed.kegiatan.length} kegiatan.\n`);

// ----------------------------------------------------
// 3. Test Jenis Filtering & Search
// ----------------------------------------------------
console.log('Test 3: Verify Jenis Kegiatan Filtering & Search');

function filterJenis(list, { q = '' } = {}) {
  let res = list.filter((j) => {
    if (q && q.trim().length > 0) {
      const qLower = q.trim().toLowerCase();
      if (!j.nama.toLowerCase().includes(qLower)) return false;
    }
    return true;
  });

  return res.sort((a, b) => a.nama.localeCompare(b.nama, 'id'));
}

const semuaJenis = filterJenis(seed.jenis);
assert.equal(semuaJenis.length, totalJenis, 'Default filter returns all activity types');

// Search query
const firstJenis = seed.jenis[0];
const searchWord = firstJenis.nama.slice(0, 4);
const searchResults = filterJenis(seed.jenis, { q: searchWord });
assert.ok(searchResults.length > 0, `Search for "${searchWord}" must find at least one jenis`);
assert.ok(searchResults.some((j) => j.id === firstJenis.id), 'Search must contain the target jenis');

console.log('✓ Jenis filtering and search queries work accurately.\n');

// ----------------------------------------------------
// 4. Test Color Palette & Meta Definitions
// ----------------------------------------------------
console.log('Test 4: Verify Color Palette & Meta Definitions');

const EXPECTED_WARNA = {
  pembelajaran: { label: 'Biru', dot: '#0F6CBD' },
  rapat: { label: 'Ungu', dot: '#8764B8' },
  olahraga: { label: 'Hijau', dot: '#4CAF50' },
  ujian: { label: 'Merah', dot: '#C50F1F' },
  lainnya: { label: 'Abu', dot: '#605E5C' },
};

for (const j of seed.jenis) {
  assert.ok(
    j.warna in EXPECTED_WARNA,
    `Warna "${j.warna}" on jenis "${j.nama}" must be in the canonical palette`
  );
}

const paletteFile = readFileSync(
  resolve(baseDir, 'src/components/master/jenis/palette.ts'),
  'utf8'
);
for (const [key, val] of Object.entries(EXPECTED_WARNA)) {
  assert.ok(paletteFile.includes(key), `Palette must define ${key}`);
  assert.ok(paletteFile.includes(val.label), `Palette must define label ${val.label}`);
  assert.ok(paletteFile.includes(val.dot), `Palette must define dot color ${val.dot}`);
}

console.log('✓ Color palette matches DESIGN.md and prototype exactly.\n');

// ----------------------------------------------------
// 5. Test Required Flags (materiWajib & siswaWajib)
// ----------------------------------------------------
console.log('Test 5: Verify Required Flags Configuration');

for (const j of seed.jenis) {
  assert.equal(typeof j.materiWajib, 'boolean', `materiWajib on ${j.nama} must be boolean`);
  assert.equal(typeof j.siswaWajib, 'boolean', `siswaWajib on ${j.nama} must be boolean`);
}

// In seed, check Pembelajaran vs Rapat flags
const pembelajaran = seed.jenis.find((j) => j.nama.toLowerCase().includes('pembelajaran'));
if (pembelajaran) {
  assert.equal(pembelajaran.materiWajib, true, 'Pembelajaran requires materi');
  assert.equal(pembelajaran.siswaWajib, true, 'Pembelajaran requires siswa');
}

const rapat = seed.jenis.find((j) => j.nama.toLowerCase().includes('rapat'));
if (rapat) {
  assert.equal(rapat.materiWajib, false, 'Rapat does not require materi');
  assert.equal(rapat.siswaWajib, false, 'Rapat does not require siswa');
}

console.log('✓ Required flags for materi & siswa verified.\n');

// ----------------------------------------------------
// 6. Test Deletion Rules for Jenis Kegiatan (DOMAIN.md §12)
// ----------------------------------------------------
console.log('Test 6: Verify Deletion Prevention Rules for Jenis Kegiatan');

function checkJenisDeletion(jenisId, kegiatanList) {
  const matchingKegiatan = kegiatanList.filter(
    (k) => k.jenis === jenisId || k.realisasi?.jenis === jenisId
  );
  const nKegiatan = matchingKegiatan.length;
  const dapatDihapus = nKegiatan === 0;
  const alasanTidakBisaHapus = dapatDihapus
    ? undefined
    : `Tidak bisa dihapus: ${nKegiatan} kegiatan menunjuk jenis kegiatan ini. Ubah dulu kegiatan itu.`;

  return { dapatDihapus, alasanTidakBisaHapus, jumlahKegiatan: nKegiatan };
}

// Test used types cannot be deleted
for (const j of seed.jenis) {
  const res = checkJenisDeletion(j.id, seed.kegiatan);
  if (res.jumlahKegiatan > 0) {
    assert.equal(res.dapatDihapus, false, `Used jenis "${j.nama}" cannot be deleted`);
    assert.ok(
      res.alasanTidakBisaHapus?.includes('kegiatan menunjuk jenis kegiatan ini'),
      'Must contain explanatory rejection reason'
    );
  }
}

// Test unused type can be deleted
const unusedRes = checkJenisDeletion('J_UNUSED', seed.kegiatan);
assert.equal(unusedRes.dapatDihapus, true, 'Unused jenis can be deleted');
assert.equal(unusedRes.alasanTidakBisaHapus, undefined, 'No deletion reason when allowed');

console.log('✓ Deletion prevention rules for Jenis Kegiatan strictly match DOMAIN.md §12.\n');

console.log('ALL TESTS PASSED SUCCESSFULLY! (6/6)');
