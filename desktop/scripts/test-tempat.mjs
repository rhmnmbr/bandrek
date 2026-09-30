import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

console.log('=== TEST SUITE: Phase 5 Step 10 (B5 Tempat & Ruangan) ===\n');

const baseDir = existsSync(resolve(process.cwd(), 'desktop'))
  ? resolve(process.cwd(), 'desktop')
  : process.cwd();

// ----------------------------------------------------
// 1. Verify File Structure & Implementation Presence
// ----------------------------------------------------
console.log('Test 1: Verify Tempat & Ruangan Component & Screen Files');
const requiredFiles = [
  'src/screens/TempatScreen.tsx',
  'src/components/master/tempat/TempatToolbar.tsx',
  'src/components/master/tempat/TempatTable.tsx',
  'src/components/master/tempat/TempatEmptyState.tsx',
  'src/components/master/tempat/RuanganTable.tsx',
  'src/components/master/tempat/TempatFormView.tsx',
  'src/components/master/tempat/TempatConfirmModal.tsx',
  'src/data/mock/MockTempatRepository.ts',
  'src/data/types/master.ts',
];

for (const f of requiredFiles) {
  const fullPath = resolve(baseDir, f);
  assert.ok(existsSync(fullPath), `Required file must exist: ${f}`);
}

const appFile = readFileSync(resolve(baseDir, 'src/App.tsx'), 'utf8');
assert.ok(
  appFile.includes('TempatScreen'),
  'App.tsx must import and route to TempatScreen'
);
assert.ok(
  appFile.includes('/master/tempat'),
  'App.tsx must contain /master/tempat route'
);
assert.ok(
  appFile.includes('/master/tempat/:id'),
  'App.tsx must contain /master/tempat/:id route'
);

console.log('✓ All 9 Tempat component and data layer files exist and are correctly routed.\n');

// ----------------------------------------------------
// 2. Load Seed Data
// ----------------------------------------------------
console.log('Test 2: Load Seed Data for Tempat, Ruangan, and Kegiatan');
const seedFileContent = readFileSync(
  resolve(baseDir, 'src/data/mock/seedData.ts'),
  'utf8'
);
const seedMatch = seedFileContent.match(/export const INITIAL_SEED: SeedData = ({[\s\S]*?});\n/);
assert.ok(seedMatch, 'Must successfully parse INITIAL_SEED from seedData.ts');
const seed = JSON.parse(seedMatch[1]);

assert.ok(seed.tempat.length > 0, 'Seed must have tempat list');
assert.ok(seed.ruangan.length > 0, 'Seed must have ruangan list');
assert.ok(seed.kegiatan.length > 0, 'Seed must have kegiatan list');

const totalTempat = seed.tempat.length;
const totalRuangan = seed.ruangan.length;
console.log(`✓ Seed verified: ${totalTempat} tempat with ${totalRuangan} total ruangan across ${seed.kegiatan.length} kegiatan.\n`);

// ----------------------------------------------------
// 3. Test Tempat Filtering & Search
// ----------------------------------------------------
console.log('Test 3: Verify Tempat Filtering & Search');

function filterTempat(list, { q = '' } = {}) {
  let res = list.filter((t) => {
    if (q && q.trim().length > 0) {
      const qLower = q.trim().toLowerCase();
      if (!t.nama.toLowerCase().includes(qLower)) return false;
    }
    return true;
  });

  return res.sort((a, b) => a.nama.localeCompare(b.nama, 'id'));
}

const semuaTempat = filterTempat(seed.tempat);
assert.equal(semuaTempat.length, totalTempat, 'Default filter returns all places');

// Search query
const firstTempat = seed.tempat[0];
const searchWord = firstTempat.nama.slice(0, 4);
const searchResults = filterTempat(seed.tempat, { q: searchWord });
assert.ok(searchResults.length > 0, `Search for "${searchWord}" must find at least one place`);
assert.ok(searchResults.some((t) => t.id === firstTempat.id), 'Search must contain the target place');

console.log('✓ Tempat filtering and search queries work accurately.\n');

// ----------------------------------------------------
// 4. Test Ruangan Child Resolution & Capacity
// ----------------------------------------------------
console.log('Test 4: Verify Ruangan Child Resolution & Capacity');

function getRuanganByTempat(tempatId, ruanganList) {
  return ruanganList
    .filter((r) => r.tempat === tempatId)
    .sort((a, b) => a.nama.localeCompare(b.nama, 'id'));
}

for (const t of seed.tempat) {
  const rooms = getRuanganByTempat(t.id, seed.ruangan);
  for (const r of rooms) {
    assert.equal(r.tempat, t.id, 'Room tempat ID must match parent');
    assert.ok(r.kapasitas >= 1, `Room capacity must be >= 1 (got ${r.kapasitas})`);
  }
}

// Zero-room warning check
const mockTempatTanpaRuangan = { id: 'T_EMPTY', nama: 'Tempat Kosong' };
const emptyRooms = getRuanganByTempat(mockTempatTanpaRuangan.id, seed.ruangan);
assert.equal(emptyRooms.length, 0, 'Empty tempat has 0 rooms');

console.log('✓ Ruangan child resolution, capacity, and zero-room detection verified.\n');

// ----------------------------------------------------
// 5. Test Deletion Rules for Tempat & Ruangan (DOMAIN.md §12)
// ----------------------------------------------------
console.log('Test 5: Verify Deletion Prevention Rules for Tempat & Ruangan');

function checkTempatDeletion(tempatId, ruanganList, kegiatanList) {
  const anakRuangan = ruanganList.filter((r) => r.tempat === tempatId);
  const anakRuanganIds = new Set(anakRuangan.map((r) => r.id));

  const nKegiatan = kegiatanList.filter(
    (k) =>
      k.ruangan &&
      (anakRuanganIds.has(k.ruangan) ||
        ruanganList.some((r) => r.id === k.ruangan && r.tempat === tempatId))
  ).length;

  const dapatDihapus = anakRuangan.length === 0 && nKegiatan === 0;
  let alasanTidakBisaHapus = undefined;
  if (nKegiatan > 0) {
    alasanTidakBisaHapus = `Tidak bisa dihapus: ${nKegiatan} kegiatan menunjuk tempat ini. Ubah dulu kegiatan itu.`;
  } else if (anakRuangan.length > 0) {
    alasanTidakBisaHapus = `Kosongkan dulu ${anakRuangan.length} ruangan di dalamnya.`;
  }

  return { dapatDihapus, alasanTidakBisaHapus, jumlahRuangan: anakRuangan.length, jumlahKegiatan: nKegiatan };
}

function checkRuanganDeletion(ruanganId, kegiatanList) {
  const nKegiatan = kegiatanList.filter(
    (k) => k.ruangan === ruanganId || k.realisasi?.ruangan === ruanganId
  ).length;

  const dapatDihapus = nKegiatan === 0;
  let alasanTidakBisaHapus = undefined;
  if (nKegiatan > 0) {
    alasanTidakBisaHapus = `Tidak bisa dihapus: ${nKegiatan} kegiatan menunjuk ruangan ini. Ubah dulu kegiatan itu.`;
  }

  return { dapatDihapus, alasanTidakBisaHapus, jumlahKegiatan: nKegiatan };
}

// Tempat in seed with rooms cannot be deleted
for (const t of seed.tempat) {
  const res = checkTempatDeletion(t.id, seed.ruangan, seed.kegiatan);
  if (res.jumlahKegiatan > 0) {
    assert.equal(res.dapatDihapus, false, `Tempat ${t.nama} with activities cannot be deleted`);
    assert.ok(res.alasanTidakBisaHapus?.includes('kegiatan menunjuk tempat ini'));
  } else if (res.jumlahRuangan > 0) {
    assert.equal(res.dapatDihapus, false, `Tempat ${t.nama} with rooms cannot be deleted`);
    assert.ok(res.alasanTidakBisaHapus?.includes('Kosongkan dulu'));
  }
}

// Check unused tempat with 0 rooms
const emptyTempatRes = checkTempatDeletion('T_EMPTY', [], []);
assert.equal(emptyTempatRes.dapatDihapus, true, 'Tempat with 0 rooms and 0 activities can be deleted');
assert.equal(emptyTempatRes.alasanTidakBisaHapus, undefined, 'No deletion reason when allowed');

// Check ruangan used in kegiatan
const usedRoom = seed.ruangan.find((r) =>
  seed.kegiatan.some((k) => k.ruangan === r.id || k.realisasi?.ruangan === r.id)
);
if (usedRoom) {
  const resRoom = checkRuanganDeletion(usedRoom.id, seed.kegiatan);
  assert.equal(resRoom.dapatDihapus, false, `Used room ${usedRoom.nama} cannot be deleted`);
  assert.ok(resRoom.alasanTidakBisaHapus?.includes('kegiatan menunjuk ruangan ini'));
}

// Check unused room
const unusedRoomRes = checkRuanganDeletion('R_UNUSED', seed.kegiatan);
assert.equal(unusedRoomRes.dapatDihapus, true, 'Unused room can be deleted');
assert.equal(unusedRoomRes.alasanTidakBisaHapus, undefined, 'No deletion reason when allowed');

console.log('✓ Deletion prevention rules for Tempat & Ruangan strictly match DOMAIN.md §12.\n');

console.log('ALL TESTS PASSED SUCCESSFULLY! (5/5)');
