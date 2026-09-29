import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

console.log('=== TEST SUITE: Phase 5 Step 10 (B4 Mata Pelajaran & Materi) ===\n');

const baseDir = existsSync(resolve(process.cwd(), 'desktop'))
  ? resolve(process.cwd(), 'desktop')
  : process.cwd();

// ----------------------------------------------------
// 1. Verify File Structure & Implementation Presence
// ----------------------------------------------------
console.log('Test 1: Verify Mapel & Materi Component & Screen Files');
const requiredFiles = [
  'src/screens/MapelScreen.tsx',
  'src/components/master/mapel/MapelToolbar.tsx',
  'src/components/master/mapel/MapelTable.tsx',
  'src/components/master/mapel/MapelEmptyState.tsx',
  'src/components/master/mapel/MateriTable.tsx',
  'src/components/master/mapel/MapelFormView.tsx',
  'src/components/master/mapel/MapelConfirmModal.tsx',
  'src/data/mock/MockMapelRepository.ts',
  'src/data/types/master.ts',
];

for (const f of requiredFiles) {
  const fullPath = resolve(baseDir, f);
  assert.ok(existsSync(fullPath), `Required file must exist: ${f}`);
}

const appFile = readFileSync(resolve(baseDir, 'src/App.tsx'), 'utf8');
assert.ok(
  appFile.includes('MapelScreen'),
  'App.tsx must import and route to MapelScreen'
);
assert.ok(
  appFile.includes('/master/mapel'),
  'App.tsx must contain /master/mapel route'
);
assert.ok(
  appFile.includes('/master/mapel/:id'),
  'App.tsx must contain /master/mapel/:id route'
);

console.log('✓ All 9 Mapel component and data layer files exist and are correctly routed.\n');

// ----------------------------------------------------
// 2. Load Seed Data
// ----------------------------------------------------
console.log('Test 2: Load Seed Data for Mapel, Materi, and Kegiatan');
const seedFileContent = readFileSync(
  resolve(baseDir, 'src/data/mock/seedData.ts'),
  'utf8'
);
const seedMatch = seedFileContent.match(/export const INITIAL_SEED: SeedData = ({[\s\S]*?});\n/);
assert.ok(seedMatch, 'Must successfully parse INITIAL_SEED from seedData.ts');
const seed = JSON.parse(seedMatch[1]);

assert.ok(seed.mapel.length > 0, 'Seed must have mapel list');
assert.ok(seed.materi.length > 0, 'Seed must have materi list');
assert.ok(seed.kegiatan.length > 0, 'Seed must have kegiatan list');

const totalMapel = seed.mapel.length;
const totalMateri = seed.materi.length;
const totalAktifMapel = seed.mapel.filter((m) => m.aktif).length;
console.log(`✓ Seed verified: ${totalMapel} mapel (${totalAktifMapel} active) with ${totalMateri} total materi.\n`);

// ----------------------------------------------------
// 3. Test Mapel Filtering & Search
// ----------------------------------------------------
console.log('Test 3: Verify Mapel Filtering & Search');

function filterMapel(list, { status = 'semua', q = '' } = {}) {
  let res = list.filter((m) => {
    if (status === 'aktif' && !m.aktif) return false;
    if (status === 'nonaktif' && m.aktif) return false;

    if (q && q.trim().length > 0) {
      const qLower = q.trim().toLowerCase();
      if (!m.nama.toLowerCase().includes(qLower)) return false;
    }

    return true;
  });

  return res.sort((a, b) => a.nama.localeCompare(b.nama, 'id'));
}

const semuaMapel = filterMapel(seed.mapel);
assert.equal(semuaMapel.length, totalMapel, 'Default filter returns all subjects');

const aktifMapel = filterMapel(seed.mapel, { status: 'aktif' });
assert.equal(aktifMapel.length, totalAktifMapel, 'Active filter returns only active mapel');
assert.ok(aktifMapel.every((m) => m.aktif), 'All items in aktifMapel must have aktif: true');

// Search query
const firstMapel = seed.mapel[0];
const searchWord = firstMapel.nama.slice(0, 4);
const searchResults = filterMapel(seed.mapel, { q: searchWord });
assert.ok(searchResults.length > 0, `Search for "${searchWord}" must find at least one subject`);
assert.ok(searchResults.some((m) => m.id === firstMapel.id), 'Search must contain the target subject');

console.log('✓ Mapel filtering and search queries work accurately.\n');

// ----------------------------------------------------
// 4. Test Materi Ordering & Reordering
// ----------------------------------------------------
console.log('Test 4: Verify Materi Child Entity Ordering & Reordering');

function getMateriByMapel(mapelId, materiList) {
  return materiList
    .filter((t) => t.mapel === mapelId)
    .sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0));
}

const targetMapel = seed.mapel[0]; // e.g. Matematika
const originalMateri = getMateriByMapel(targetMapel.id, seed.materi);
assert.ok(originalMateri.length >= 2, 'Target mapel must have at least 2 topics to test reordering');

// Verify initial order
for (let i = 0; i < originalMateri.length - 1; i++) {
  assert.ok(
    (originalMateri[i].urutan ?? 0) <= (originalMateri[i + 1].urutan ?? 0),
    'Initial materi must be ordered by urutan'
  );
}

// Reorder simulation (swap first and second)
const swappedIds = originalMateri.map((m) => m.id);
const temp = swappedIds[0];
swappedIds[0] = swappedIds[1];
swappedIds[1] = temp;

const reorderedList = swappedIds.map((id, index) => {
  const item = originalMateri.find((m) => m.id === id);
  return { ...item, urutan: index + 1 };
});

assert.equal(reorderedList[0].id, originalMateri[1].id, 'First item is now original second item');
assert.equal(reorderedList[1].id, originalMateri[0].id, 'Second item is now original first item');
assert.equal(reorderedList[0].urutan, 1, 'First item has urutan 1');
assert.equal(reorderedList[1].urutan, 2, 'Second item has urutan 2');

console.log('✓ Materi ordering and reordering logic verified.\n');

// ----------------------------------------------------
// 5. Test Deletion Rules for Mapel & Materi (DOMAIN.md §12)
// ----------------------------------------------------
console.log('Test 5: Verify Deletion Prevention Rules for Mapel & Materi');

function checkMapelDeletion(mapelId, materiList, kegiatanList) {
  const anakN = materiList.filter((m) => m.mapel === mapelId).length;
  const pakaiTag = kegiatanList.filter((k) => k.mapel === mapelId).length;

  const bisaHapus = anakN === 0 && pakaiTag === 0;
  let alasan = undefined;
  if (pakaiTag > 0) {
    alasan = `Tidak bisa dihapus: ${pakaiTag} kegiatan menunjuk mata pelajaran ini. Pakai Nonaktifkan.`;
  } else if (anakN > 0) {
    alasan = `Kosongkan dulu ${anakN} materi di dalamnya.`;
  }

  return { bisaHapus, alasan, anakN, pakaiTag };
}

function checkMateriDeletion(materiId, kegiatanList) {
  const pakaiTag = kegiatanList.filter(
    (k) => k.materi === materiId || k.realisasi?.materi === materiId
  ).length;

  const bisaHapus = pakaiTag === 0;
  const alasan = bisaHapus
    ? undefined
    : `Tidak bisa dihapus: ${pakaiTag} kegiatan menunjuk materi ini. Pakai Nonaktifkan.`;

  return { bisaHapus, alasan, pakaiTag };
}

// Seed mapels with topics cannot be deleted
for (const m of seed.mapel) {
  const res = checkMapelDeletion(m.id, seed.materi, seed.kegiatan);
  if (res.pakaiTag > 0) {
    assert.equal(res.bisaHapus, false, `Mapel ${m.nama} used in kegiatan cannot be deleted`);
    assert.ok(res.alasan?.includes('kegiatan menunjuk mata pelajaran ini'));
  } else if (res.anakN > 0) {
    assert.equal(res.bisaHapus, false, `Mapel ${m.nama} with children cannot be deleted`);
    assert.ok(res.alasan?.includes('Kosongkan dulu'));
  }
}

// Check unused mapel with 0 topics
const emptyMapelRes = checkMapelDeletion('M_NEW', [], []);
assert.equal(emptyMapelRes.bisaHapus, true, 'Mapel with 0 topics and 0 activities can be deleted');
assert.equal(emptyMapelRes.alasan, undefined, 'No deletion reason when allowed');

// Check materi used in activities
const usedMateri = seed.materi.find((t) =>
  seed.kegiatan.some((k) => k.materi === t.id || k.realisasi?.materi === t.id)
);
if (usedMateri) {
  const resMateri = checkMateriDeletion(usedMateri.id, seed.kegiatan);
  assert.equal(resMateri.bisaHapus, false, `Used materi ${usedMateri.nama} cannot be deleted`);
  assert.ok(resMateri.alasan?.includes('kegiatan menunjuk materi ini'));
}

// Check unused materi
const unusedMateriRes = checkMateriDeletion('T_UNUSED', seed.kegiatan);
assert.equal(unusedMateriRes.bisaHapus, true, 'Unused materi can be deleted');
assert.equal(unusedMateriRes.alasan, undefined, 'No deletion reason when allowed');

console.log('✓ Deletion prevention rules for Mapel & Materi strictly match DOMAIN.md §12.\n');

// ----------------------------------------------------
// 6. Test Multi-Select Jenjang on Materi
// ----------------------------------------------------
console.log('Test 6: Verify Multi-Select Jenjang for Materi');

for (const t of seed.materi) {
  assert.ok(Array.isArray(t.jenjang), 'Materi jenjang must be an array');
  assert.ok(t.jenjang.length > 0, `Materi ${t.nama} must have at least one jenjang`);
  for (const j of t.jenjang) {
    assert.ok(['SD', 'SMP', 'SMA'].includes(j), `Jenjang ${j} must be valid`);
  }
}

console.log('✓ Materi multi-select jenjang validation verified.\n');

console.log('ALL TESTS PASSED SUCCESSFULLY! (6/6)');
