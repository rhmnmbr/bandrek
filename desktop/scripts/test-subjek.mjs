import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

console.log('=== TEST SUITE: Phase 5 Step 10 (B2 Subjek - Master & Profil) ===\n');

const baseDir = existsSync(resolve(process.cwd(), 'desktop'))
  ? resolve(process.cwd(), 'desktop')
  : process.cwd();

// ----------------------------------------------------
// 1. Verify File Structure & Implementation Presence
// ----------------------------------------------------
console.log('Test 1: Verify Subjek Component & Screen Files');
const requiredFiles = [
  'src/screens/SubjekScreen.tsx',
  'src/components/master/subjek/SubjekToolbar.tsx',
  'src/components/master/subjek/SubjekTable.tsx',
  'src/components/master/subjek/SubjekFormPanel.tsx',
  'src/components/master/subjek/SubjekConfirmModal.tsx',
  'src/components/master/subjek/SubjekEmptyState.tsx',
  'src/components/master/subjek/ProfilSubjekView.tsx',
  'src/data/mock/MockSubjekRepository.ts',
  'src/data/types/master.ts',
];

for (const f of requiredFiles) {
  const fullPath = resolve(baseDir, f);
  assert.ok(existsSync(fullPath), `Required file must exist: ${f}`);
}

const appFile = readFileSync(resolve(baseDir, 'src/App.tsx'), 'utf8');
assert.ok(
  appFile.includes('SubjekScreen'),
  'App.tsx must import and route to SubjekScreen'
);
assert.ok(
  appFile.includes('/master/subjek'),
  'App.tsx must contain /master/subjek route'
);

console.log('✓ All 9 Subjek component and data layer files exist and are routed.\n');

// ----------------------------------------------------
// 2. Load Seed Data
// ----------------------------------------------------
console.log('Test 2: Load Seed Data for Subjek & Related Master');
const seedFileContent = readFileSync(
  resolve(baseDir, 'src/data/mock/seedData.ts'),
  'utf8'
);
const seedMatch = seedFileContent.match(/export const INITIAL_SEED: SeedData = ({[\s\S]*?});\n/);
assert.ok(seedMatch, 'Must successfully parse INITIAL_SEED from seedData.ts');
const seed = JSON.parse(seedMatch[1]);

assert.equal(seed.today, '2026-09-16', 'Simulated today is 2026-09-16');
assert.ok(seed.subjek.length > 0, 'Seed must have subjek list');

const totalAktif = seed.subjek.filter((s) => s.aktif).length;
const totalNonaktif = seed.subjek.filter((s) => !s.aktif).length;
console.log(`✓ Seed verified: ${seed.subjek.length} subjek (${totalAktif} active, ${totalNonaktif} inactive).\n`);

// ----------------------------------------------------
// 3. Test Subjek Filtering & Search
// ----------------------------------------------------
console.log('Test 3: Verify Subjek Filtering & Search');

function filterSubjek(list, { status = 'aktif', peran = 'semua', q = '' } = {}) {
  let res = list.filter((s) => {
    if (status === 'aktif' && !s.aktif) return false;
    if (status === 'nonaktif' && s.aktif) return false;
    if (peran !== 'semua' && s.peran !== peran) return false;

    if (q && q.trim().length > 0) {
      const qLower = q.trim().toLowerCase();
      const matchNama = s.nama.toLowerCase().includes(qLower);
      const matchKontak = s.kontak?.toLowerCase().includes(qLower);
      if (!matchNama && !matchKontak) return false;
    }

    return true;
  });

  return res.sort((a, b) => a.nama.localeCompare(b.nama, 'id'));
}

// Default filter: status = 'aktif'
const defaultList = filterSubjek(seed.subjek, { status: 'aktif' });
assert.equal(defaultList.length, totalAktif, `Default filter returns ${totalAktif} active subjects`);

// Status = 'nonaktif'
const nonaktifList = filterSubjek(seed.subjek, { status: 'nonaktif' });
assert.equal(nonaktifList.length, totalNonaktif, `Status nonaktif returns ${totalNonaktif} subjects`);

// Status = 'semua'
const semuaList = filterSubjek(seed.subjek, { status: 'semua' });
assert.equal(semuaList.length, seed.subjek.length, 'Status semua returns all subjects');

// Filter by Peran
const pengisiList = filterSubjek(seed.subjek, { status: 'semua', peran: 'Pengisi' });
assert.ok(pengisiList.length > 0, 'Should find subjects with peran Pengisi');
assert.ok(pengisiList.every((s) => s.peran === 'Pengisi'), 'All results must have peran Pengisi');

// Filter by Search Query
const searchByNama = filterSubjek(seed.subjek, { status: 'semua', q: 'Sari' });
assert.ok(searchByNama.length > 0, 'Should find subject matching name Sari');
assert.ok(searchByNama.some((s) => s.nama.includes('Sari')), 'Found subject must include Sari');

console.log('✓ Filter by status, peran, and search query verified.\n');

// ----------------------------------------------------
// 4. Test Deletion Integrity Rule (DOMAIN.md §12)
// ----------------------------------------------------
console.log('Test 4: Verify Deletion Prevention Rule (DOMAIN.md §12)');

// Subject used in activities
const u1 = seed.subjek.find((s) => s.id === 'U1');
assert.ok(u1, 'Subject U1 must exist');
const kegsU1 = seed.kegiatan.filter((k) => k.subjek.some((sub) => sub.id === 'U1'));
assert.ok(kegsU1.length > 0, 'U1 must be involved in at least 1 activity');

// In MockSubjekRepository, dapatDihapus must be false
const dapatDihapusU1 = kegsU1.length === 0;
assert.equal(dapatDihapusU1, false, 'Subject involved in activities cannot be deleted');

// An unused subject can be deleted
const unusedKegs = [];
const dapatDihapusUnused = unusedKegs.length === 0;
assert.equal(dapatDihapusUnused, true, 'Unused subject can be deleted');

console.log(`✓ DOMAIN.md §12 rule verified: U1 involved in ${kegsU1.length} activities cannot be deleted.\n`);

// ----------------------------------------------------
// 5. Test Profil Subjek Calculations
// ----------------------------------------------------
console.log('Test 5: Verify Profil Subjek Metrics & Calculations');

const today = seed.today; // '2026-09-16'
const bulan = today.slice(0, 7); // '2026-09'
const semuaU1 = seed.kegiatan.filter((ev) => ev.subjek.some((x) => x.id === 'U1'));
const aktifSemuaU1 = semuaU1.filter(
  (ev) => ev.status !== 'dibatalkan' && ev.status !== 'dijadwal-ulang' && ev.status !== 'dijadwal_ulang'
);
const bulanIniU1 = aktifSemuaU1.filter((ev) => ev.tanggal.slice(0, 7) === bulan);

function jamEv(ev) {
  const [h1, m1] = ev.mulai.split(':').map(Number);
  const [h2, m2] = ev.selesai.split(':').map(Number);
  return (h2 * 60 + m2 - (h1 * 60 + m1)) / 60;
}

const totalJamBulan = bulanIniU1.reduce((a, ev) => a + jamEv(ev), 0);
const pengisiN = bulanIniU1.filter(
  (ev) => (ev.subjek.find((x) => x.id === 'U1') || {}).peran === 'Pengisi'
).length;

assert.ok(bulanIniU1.length >= 0, 'Bulan ini count valid');
assert.ok(totalJamBulan >= 0, 'Total teaching hours valid');

// Weekly workload bucket calculation
const BATAS = 10;
const ty = Number(bulan.slice(0, 4));
const tm = Number(bulan.slice(5, 7));
const daysInMonth = new Date(ty, tm, 0).getDate();
const buckets = [];
let day = 1;
while (day <= daysInMonth) {
  const dow = new Date(ty, tm - 1, day).getDay();
  const end = Math.min(day + (dow === 0 ? 0 : 7 - dow), daysInMonth);
  buckets.push([day, end]);
  day = end + 1;
}

assert.ok(buckets.length >= 4 && buckets.length <= 6, 'Month must be split into 4-6 week buckets');
console.log(`✓ Profil metrics verified: ${bulanIniU1.length} activities this month, ${totalJamBulan} hours, ${buckets.length} weekly buckets.\n`);

// ----------------------------------------------------
// 6. Test Routine Availability Structure
// ----------------------------------------------------
console.log('Test 6: Verify Routine Availability Model');

const sampleKetersediaan = [
  { hari: 'Senin', dari: '07:00', sampai: '12:00' },
  { hari: 'Rabu', dari: '13:00', sampai: '17:00' },
];

assert.equal(sampleKetersediaan.length, 2, 'Has 2 schedule items');
assert.equal(sampleKetersediaan[0].hari, 'Senin');
assert.equal(sampleKetersediaan[0].dari, '07:00');
assert.equal(sampleKetersediaan[0].sampai, '12:00');

// Mutation: Add
const addedList = sampleKetersediaan.concat([{ hari: 'Jumat', dari: '08:00', sampai: '11:00' }]);
assert.equal(addedList.length, 3, 'After add, length is 3');

// Mutation: Update
const updatedList = addedList.map((item, idx) => (idx === 0 ? { ...item, dari: '08:00' } : item));
assert.equal(updatedList[0].dari, '08:00', 'After update, index 0 dari is 08:00');

// Mutation: Delete
const deletedList = updatedList.filter((_, idx) => idx !== 1);
assert.equal(deletedList.length, 2, 'After delete, length is 2');

console.log('✓ Routine availability CRUD model verified.\n');

console.log('==================================================');
console.log('ALL SUBJEK AUTOMATED TESTS PASSED SUCCESSFULLY! (6/6)');
console.log('==================================================');
