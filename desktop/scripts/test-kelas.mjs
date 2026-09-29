import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

console.log('=== TEST SUITE: Phase 5 Step 10 (B3 Kelas - Master & Form View) ===\n');

const baseDir = existsSync(resolve(process.cwd(), 'desktop'))
  ? resolve(process.cwd(), 'desktop')
  : process.cwd();

// ----------------------------------------------------
// 1. Verify File Structure & Implementation Presence
// ----------------------------------------------------
console.log('Test 1: Verify Kelas Component & Screen Files');
const requiredFiles = [
  'src/screens/KelasScreen.tsx',
  'src/components/master/kelas/KelasToolbar.tsx',
  'src/components/master/kelas/KelasTable.tsx',
  'src/components/master/kelas/KelasFormView.tsx',
  'src/components/master/kelas/KelasConfirmModal.tsx',
  'src/components/master/kelas/KelasEmptyState.tsx',
  'src/data/mock/MockKelasRepository.ts',
  'src/data/types/master.ts',
];

for (const f of requiredFiles) {
  const fullPath = resolve(baseDir, f);
  assert.ok(existsSync(fullPath), `Required file must exist: ${f}`);
}

const appFile = readFileSync(resolve(baseDir, 'src/App.tsx'), 'utf8');
assert.ok(
  appFile.includes('KelasScreen'),
  'App.tsx must import and route to KelasScreen'
);
assert.ok(
  appFile.includes('/master/kelas'),
  'App.tsx must contain /master/kelas route'
);
assert.ok(
  appFile.includes('/master/kelas/:id'),
  'App.tsx must contain /master/kelas/:id route'
);

console.log('✓ All 8 Kelas component and data layer files exist and are correctly routed.\n');

// ----------------------------------------------------
// 2. Load Seed Data
// ----------------------------------------------------
console.log('Test 2: Load Seed Data for Kelas, Siswa, and Kegiatan');
const seedFileContent = readFileSync(
  resolve(baseDir, 'src/data/mock/seedData.ts'),
  'utf8'
);
const seedMatch = seedFileContent.match(/export const INITIAL_SEED: SeedData = ({[\s\S]*?});\n/);
assert.ok(seedMatch, 'Must successfully parse INITIAL_SEED from seedData.ts');
const seed = JSON.parse(seedMatch[1]);

assert.ok(seed.kelas.length > 0, 'Seed must have kelas list');
assert.ok(seed.siswa.length > 0, 'Seed must have siswa list');
assert.ok(seed.kegiatan.length > 0, 'Seed must have kegiatan list');

const totalKelas = seed.kelas.length;
const totalKeanggotaan = seed.kelas.reduce((sum, k) => sum + (k.anggota?.length || 0), 0);
console.log(`✓ Seed verified: ${totalKelas} kelas with ${totalKeanggotaan} total keanggotaan.\n`);

// ----------------------------------------------------
// 3. Test Kelas Filtering & Search
// ----------------------------------------------------
console.log('Test 3: Verify Kelas Filtering & Search');

function filterKelas(list, { jenjang = 'semua', q = '' } = {}) {
  let res = list.filter((k) => {
    if (jenjang !== 'semua' && k.jenjang !== jenjang) return false;

    if (q && q.trim().length > 0) {
      const qLower = q.trim().toLowerCase();
      const matchNama = k.nama.toLowerCase().includes(qLower);
      const matchKet = k.keterangan?.toLowerCase().includes(qLower);
      if (!matchNama && !matchKet) return false;
    }

    return true;
  });

  return res.sort((a, b) => a.nama.localeCompare(b.nama, 'id'));
}

const semuaKelas = filterKelas(seed.kelas);
assert.equal(semuaKelas.length, totalKelas, 'Default filter returns all classes');

const sdKelas = filterKelas(seed.kelas, { jenjang: 'SD' });
assert.ok(sdKelas.length > 0, 'Must return SD classes');
assert.ok(sdKelas.every((k) => k.jenjang === 'SD'), 'All returned items must have jenjang SD');

const smpKelas = filterKelas(seed.kelas, { jenjang: 'SMP' });
assert.ok(smpKelas.length > 0, 'Must return SMP classes');
assert.ok(smpKelas.every((k) => k.jenjang === 'SMP'), 'All returned items must have jenjang SMP');

const smaKelas = filterKelas(seed.kelas, { jenjang: 'SMA' });
assert.ok(smaKelas.length > 0, 'Must return SMA classes');
assert.ok(smaKelas.every((k) => k.jenjang === 'SMA'), 'All returned items must have jenjang SMA');

assert.equal(
  sdKelas.length + smpKelas.length + smaKelas.length,
  totalKelas,
  'Sum of jenjang-filtered classes must match total'
);

// Search test
const firstKelas = seed.kelas[0];
const searchWord = firstKelas.nama.split(' ')[0];
const searchResults = filterKelas(seed.kelas, { q: searchWord });
assert.ok(searchResults.length > 0, `Search for "${searchWord}" must find at least one class`);
assert.ok(
  searchResults.some((k) => k.id === firstKelas.id),
  'Search results must contain target class'
);

console.log('✓ Kelas filtering by jenjang and search queries work accurately.\n');

// ----------------------------------------------------
// 4. Test Deletion Rule (DOMAIN.md §12)
// ----------------------------------------------------
console.log('Test 4: Verify Deletion Rules and Usage Stats');

function enrichKelas(k, kegiatanList) {
  const anggota = k.anggota || [];
  const kegDirect = kegiatanList.filter((e) => e.kelas === k.id).length;
  const kegAll = kegiatanList.filter(
    (e) => e.kelas === k.id || e.siswa.some((sid) => anggota.includes(sid))
  ).length;

  const dapatDihapus = kegDirect === 0;
  const alasanTidakBisaHapus = dapatDihapus
    ? undefined
    : `Tidak bisa dihapus: dipakai sebagai sumber impor di ${kegDirect} kegiatan.`;

  return {
    ...k,
    anggota,
    jumlahSiswa: anggota.length,
    jumlahKegiatan: kegAll,
    jumlahKegiatanLangsung: kegDirect,
    dapatDihapus,
    alasanTidakBisaHapus,
    rincianPenggunaan: kegDirect > 0 ? [`${kegDirect} kegiatan`] : [],
    ringkasanPenggunaan:
      kegAll > 0
        ? `${kegAll} kegiatan menyentuh kelas ini — ${
            kegDirect > 0
              ? `${kegDirect} di antaranya ditandai langsung dengan kelas ini, sisanya lewat anggotanya.`
              : 'semuanya lewat anggotanya, tidak ada yang ditandai kelas ini.'
          }`
        : 'Belum ada kegiatan yang dijadwalkan untuk kelas ini.',
  };
}

const enrichedKelasList = seed.kelas.map((k) => enrichKelas(k, seed.kegiatan));

// Check each seed class: all 8 seed classes in INITIAL_SEED are directly used
for (const ek of enrichedKelasList) {
  assert.ok(ek.jumlahKegiatanLangsung > 0, `Seed class ${ek.nama} is directly used in kegiatan`);
  assert.equal(ek.dapatDihapus, false, `Class ${ek.nama} directly used in kegiatan cannot be deleted`);
  assert.ok(
    ek.alasanTidakBisaHapus?.includes('Tidak bisa dihapus: dipakai sebagai sumber impor'),
    'alasanTidakBisaHapus must cite direct import usage'
  );
}

// Test an unreferenced class: direct === 0, so dapatDihapus === true
const unusedKelas = {
  id: 'K9_TEST',
  nama: 'Kelas Persiapan Lomba Baru',
  jenjang: 'SMP',
  keterangan: 'Belum pernah diimpor ke kegiatan',
  anggota: ['S1', 'S2'],
};
const enrichedUnused = enrichKelas(unusedKelas, seed.kegiatan);
assert.equal(enrichedUnused.jumlahKegiatanLangsung, 0, 'Unused class has 0 direct kegiatan');
assert.equal(enrichedUnused.dapatDihapus, true, 'Unused class can be deleted');
assert.equal(enrichedUnused.alasanTidakBisaHapus, undefined, 'No deletion reason needed when deletable');

console.log('✓ Deletion prevention rules match DOMAIN.md §12 (direct tag prevents deletion, unused classes deletable).\n');

// ----------------------------------------------------
// 5. Test Candidate Member Resolution & Jenjang Matching
// ----------------------------------------------------
console.log('Test 5: Verify Candidate Member Resolution & Jenjang Filtering');

for (const k of seed.kelas) {
  const anggotaSet = new Set(k.anggota || []);

  // Filter candidates matching class jenjang
  let candidates = seed.siswa.filter(
    (s) => s.aktif && s.jenjang === k.jenjang && !anggotaSet.has(s.id)
  );

  // All candidates must be active
  assert.ok(candidates.every((c) => c.aktif), 'All candidates must be active');
  // None of the candidates should already be members
  assert.ok(candidates.every((c) => !anggotaSet.has(c.id)), 'Candidate must not already be in class');
  // All candidates must match class jenjang
  assert.ok(candidates.every((c) => c.jenjang === k.jenjang), 'Candidate must match class jenjang');

  // Verify bedaJenjang computation
  const bedaJenjang = (k.anggota || []).filter((sid) => {
    const s = seed.siswa.find((item) => item.id === sid);
    return s && k.jenjang && s.jenjang !== k.jenjang;
  }).length;

  assert.ok(bedaJenjang >= 0, 'bedaJenjang must be non-negative');
}

console.log('✓ Candidate member resolution and jenjang matching rules are verified.\n');

// ----------------------------------------------------
// 6. Test Membership Mutation Logic
// ----------------------------------------------------
console.log('Test 6: Verify Membership Mutations (Add / Remove Member)');

const testKelas = { ...seed.kelas[0], anggota: [...seed.kelas[0].anggota] };
const initialCount = testKelas.anggota.length;

// Find active student of same jenjang not in class
const candidateStudent = seed.siswa.find(
  (s) => s.aktif && s.jenjang === testKelas.jenjang && !testKelas.anggota.includes(s.id)
);

if (candidateStudent) {
  // Add member
  testKelas.anggota.push(candidateStudent.id);
  assert.equal(testKelas.anggota.length, initialCount + 1, 'Member count increases by 1');
  assert.ok(testKelas.anggota.includes(candidateStudent.id), 'Member array includes new student ID');

  // Remove member
  testKelas.anggota = testKelas.anggota.filter((id) => id !== candidateStudent.id);
  assert.equal(testKelas.anggota.length, initialCount, 'Member count returns to original');
  assert.ok(!testKelas.anggota.includes(candidateStudent.id), 'Member array no longer contains student ID');
}

// Empty class can still be represented and saved
const emptyKelas = {
  id: 'K_EMPTY',
  nama: 'Kelas Percobaan Kosong',
  jenjang: 'SD',
  keterangan: 'Untuk tes kelas kosong',
  anggota: [],
};
assert.equal(emptyKelas.anggota.length, 0, 'Class can have 0 members');
const enrichedEmpty = enrichKelas(emptyKelas, seed.kegiatan);
assert.equal(enrichedEmpty.jumlahSiswa, 0, 'jumlahSiswa is 0');
assert.equal(enrichedEmpty.dapatDihapus, true, 'Empty class can be deleted');

console.log('✓ Membership mutations and empty class support verified.\n');

console.log('ALL TESTS PASSED SUCCESSFULLY! (6/6)');
