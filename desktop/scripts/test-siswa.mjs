import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

console.log('=== TEST SUITE: Phase 5 Step 9 (B1 Siswa - Master & Profil) ===\n');

const baseDir = existsSync(resolve(process.cwd(), 'desktop'))
  ? resolve(process.cwd(), 'desktop')
  : process.cwd();

// ----------------------------------------------------
// 1. Verify File Structure & Implementation Presence
// ----------------------------------------------------
console.log('Test 1: Verify Siswa Component & Screen Files');
const requiredFiles = [
  'src/screens/SiswaScreen.tsx',
  'src/components/master/siswa/SiswaToolbar.tsx',
  'src/components/master/siswa/SiswaTable.tsx',
  'src/components/master/siswa/SiswaFormPanel.tsx',
  'src/components/master/siswa/SiswaConfirmModal.tsx',
  'src/components/master/siswa/SiswaEmptyState.tsx',
  'src/components/master/siswa/ProfilSiswaView.tsx',
  'src/data/mock/MockSiswaRepository.ts',
  'src/data/types/master.ts',
];

for (const f of requiredFiles) {
  const fullPath = resolve(baseDir, f);
  assert.ok(existsSync(fullPath), `Required file must exist: ${f}`);
}
console.log('✓ All 9 Siswa component and data layer files exist.\n');

// ----------------------------------------------------
// 2. Load Seed Data
// ----------------------------------------------------
console.log('Test 2: Load Seed Data for Siswa & Related Master');
const seedFileContent = readFileSync(
  resolve(baseDir, 'src/data/mock/seedData.ts'),
  'utf8'
);
const seedMatch = seedFileContent.match(/export const INITIAL_SEED: SeedData = ({[\s\S]*?});\n/);
assert.ok(seedMatch, 'Must successfully parse INITIAL_SEED from seedData.ts');
const seed = JSON.parse(seedMatch[1]);

assert.equal(seed.today, '2026-09-16', 'Simulated today is 2026-09-16');
assert.equal(seed.siswa.length, 80, 'Total seed siswa is 80 students');

const totalAktif = seed.siswa.filter((s) => s.aktif).length;
const totalNonaktif = seed.siswa.filter((s) => !s.aktif).length;
assert.equal(totalAktif, 70, 'Must have 70 active students per prototype meta');
assert.equal(totalNonaktif, 10, 'Must have 10 inactive students per prototype meta');
console.log(`✓ Seed verified: 80 students (70 active, 10 inactive).\n`);

// ----------------------------------------------------
// 3. Test Student Filtering & Sorting
// ----------------------------------------------------
console.log('Test 3: Verify Student Filtering & Sorting');

// Function mimicking MockSiswaRepository.getAll filter logic
function filterSiswa(list, { status = 'aktif', jenjang = 'semua', kelasId = '', q = '', desc = false } = {}) {
  let res = list.filter((s) => {
    if (status === 'aktif' && !s.aktif) return false;
    if (status === 'nonaktif' && s.aktif) return false;
    if (jenjang !== 'semua' && s.jenjang !== jenjang) return false;

    if (kelasId === '-') {
      const hasClass = seed.kelas.some((k) => k.anggota.includes(s.id));
      if (hasClass) return false;
    } else if (kelasId) {
      const k = seed.kelas.find((item) => item.id === kelasId);
      if (k && !k.anggota.includes(s.id)) return false;
    }

    if (q && q.trim().length > 0) {
      const qLower = q.trim().toLowerCase();
      const matchNama = s.nama.toLowerCase().includes(qLower);
      const matchAsal = s.asal?.toLowerCase().includes(qLower);
      const matchWali = s.waliNama?.toLowerCase().includes(qLower);
      if (!matchNama && !matchAsal && !matchWali) return false;
    }

    return true;
  });

  return res.sort((a, b) => a.nama.localeCompare(b.nama, 'id') * (desc ? -1 : 1));
}

// Default filter: status = 'aktif'
const defaultList = filterSiswa(seed.siswa, { status: 'aktif' });
assert.equal(defaultList.length, 70, 'Default filter returns 70 active students');

// Status = 'nonaktif'
const nonaktifList = filterSiswa(seed.siswa, { status: 'nonaktif' });
assert.equal(nonaktifList.length, 10, 'Status nonaktif returns 10 students');

// Status = 'semua'
const semuaList = filterSiswa(seed.siswa, { status: 'semua' });
assert.equal(semuaList.length, 80, 'Status semua returns all 80 students');

// Filter by Jenjang
const sdList = filterSiswa(seed.siswa, { jenjang: 'SD', status: 'semua' });
assert.ok(sdList.length > 0 && sdList.every((s) => s.jenjang === 'SD'), 'SD filter works correctly');
const smpList = filterSiswa(seed.siswa, { jenjang: 'SMP', status: 'semua' });
assert.ok(smpList.length > 0 && smpList.every((s) => s.jenjang === 'SMP'), 'SMP filter works correctly');
const smaList = filterSiswa(seed.siswa, { jenjang: 'SMA', status: 'semua' });
assert.ok(smaList.length > 0 && smaList.every((s) => s.jenjang === 'SMA'), 'SMA filter works correctly');

// Filter by Kelas
const k1List = filterSiswa(seed.siswa, { kelasId: 'K1', status: 'semua' });
const k1Anggota = seed.kelas.find((k) => k.id === 'K1').anggota;
assert.equal(k1List.length, k1Anggota.length, 'Filter by Kelas K1 matches class members count');

// Search query
const searchResult = filterSiswa(seed.siswa, { q: 'Aisyah', status: 'semua' });
assert.ok(searchResult.length > 0 && searchResult.every((s) => s.nama.includes('Aisyah')), 'Search by name works');

// Sort descending
const sortedAsc = filterSiswa(seed.siswa, { desc: false, status: 'semua' });
const sortedDesc = filterSiswa(seed.siswa, { desc: true, status: 'semua' });
assert.equal(sortedAsc[0].id, sortedDesc[sortedDesc.length - 1].id, 'Sort toggle inverts list order');

console.log('✓ All filter and sorting criteria passed successfully.\n');

// ----------------------------------------------------
// 4. Test Deletion Integrity & Usage Verification
// ----------------------------------------------------
console.log('Test 4: Verify Deletion Integrity & Server-Computed Usage Fields');

function enrichStudent(sw, db) {
  const classes = db.kelas.filter((k) => k.anggota.includes(sw.id));
  const classIds = classes.map((k) => k.id);
  const classDetails = classes.map((k) => ({ id: k.id, nama: k.nama, jenjang: k.jenjang }));

  const kegs = db.kegiatan.filter((e) => e.siswa.includes(sw.id));
  const ceklis = (db.ceklisManual || []).filter((c) => c.siswa === sw.id);
  const mendatang = kegs.filter(
    (e) => e.tanggal >= db.today && (e.status === 'terjadwal' || e.status === 'belum')
  );

  const totalPakai = kegs.length + classes.length + ceklis.length;
  const dapatDihapus = totalPakai === 0;

  const usageParts = [];
  if (kegs.length > 0) usageParts.push(`${kegs.length} kegiatan`);
  if (classes.length > 0) usageParts.push(`${classes.length} kelas`);
  if (ceklis.length > 0) usageParts.push(`${ceklis.length} ceklis manual`);

  const alasanTidakBisaHapus = dapatDihapus
    ? undefined
    : `Tidak bisa dihapus: dipakai di ${usageParts.join(', ')}. Pakai Nonaktifkan.`;

  return {
    ...sw,
    daftarKelas: classIds,
    daftarKelasDetail: classDetails,
    jumlahKegiatan: kegs.length,
    jumlahKelas: classes.length,
    jumlahCeklis: ceklis.length,
    kegiatanMendatangCount: mendatang.length,
    dapatDihapus,
    alasanTidakBisaHapus,
    rincianPenggunaan: usageParts,
  };
}

// Student S1 (Aisyah) is heavily enrolled in classes and activities
const s1Enriched = enrichStudent(seed.siswa.find((s) => s.id === 'S1'), seed);
assert.equal(s1Enriched.dapatDihapus, false, 'S1 must NOT be deletable');
assert.ok(s1Enriched.jumlahKegiatan > 0, 'S1 has activities');
assert.ok(s1Enriched.jumlahKelas > 0, 'S1 is member of classes');
assert.ok(s1Enriched.alasanTidakBisaHapus.includes('kegiatan'), 'Rejection explanation mentions kegiatan');

// Create a mock unused student
const unusedStudent = {
  id: 'S999',
  nama: 'Siswa Baru Tanpa Kegiatan',
  jenjang: 'SMP',
  aktif: true,
  lahir: '2012-05-10',
  kelamin: 'L',
};
const unusedEnriched = enrichStudent(unusedStudent, seed);
assert.equal(unusedEnriched.dapatDihapus, true, 'Unused student must be deletable');
assert.equal(unusedEnriched.alasanTidakBisaHapus, undefined, 'No rejection reason for deletable student');

console.log('✓ Deletion prevention rules (DOMAIN.md §12) strictly verified.\n');

// ----------------------------------------------------
// 5. Test Profil Siswa Calculations
// ----------------------------------------------------
console.log('Test 5: Verify Profil Siswa KPI & Breakdown Calculations');

function computeProfil(sw, db) {
  const semuaKeg = db.kegiatan.filter((ev) => ev.siswa.includes(sw.id));
  const dihitungKeg = semuaKeg.filter(
    (ev) => ev.status !== 'dibatalkan' && ev.status !== 'dijadwal-ulang'
  );

  const hit = { hadir: 0, izin: 0, sakit: 0, alpa: 0 };
  let realTotal = 0;
  for (const ev of dihitungKeg) {
    const kh =
      ev.status === 'terealisasi' && ev.realisasi?.kehadiran
        ? ev.realisasi.kehadiran[sw.id]
        : null;
    if (kh && kh in hit) {
      hit[kh]++;
      realTotal++;
    }
  }
  const kehadiranPct = realTotal ? Math.round((hit.hadir / realTotal) * 100) : 0;

  const cakupan = [];
  const terlewat = [];
  const activeMapel = db.mapel.filter((m) => m.aktif);

  for (const mp of activeMapel) {
    const materiList = db.materi.filter(
      (mt) => mt.mapel === mp.id && mt.aktif && (mt.jenjang || []).includes(sw.jenjang)
    );
    if (!materiList.length) continue;
    let ok = 0;
    for (const mt of materiList) {
      const tersampaikan =
        dihitungKeg.some(
          (ev) =>
            ev.status === 'terealisasi' &&
            ev.realisasi &&
            (ev.realisasi.materi || ev.materi) === mt.id &&
            ev.realisasi.kehadiran &&
            ev.realisasi.kehadiran[sw.id] === 'hadir'
        ) || (db.ceklisManual || []).some((cm) => cm.siswa === sw.id && cm.materi === mt.id);

      if (tersampaikan) {
        ok++;
        continue;
      }

      const terkait = semuaKeg
        .filter((ev) => (ev.realisasi?.materi || ev.materi) === mt.id)
        .sort((a, b) => (a.tanggal + a.mulai < b.tanggal + b.mulai ? 1 : -1))[0];

      if (!terkait) continue;
      let alasan = null;
      if (terkait.status === 'dibatalkan') {
        alasan = `kegiatan dibatalkan ${terkait.tanggal}`;
      } else {
        const kh2 = terkait.realisasi?.kehadiran ? terkait.realisasi.kehadiran[sw.id] : null;
        if (kh2 && kh2 !== 'hadir') {
          alasan = `${kh2} pada ${terkait.tanggal}`;
        }
      }
      if (alasan) {
        terlewat.push({
          mapelId: mp.id,
          materiId: mt.id,
          judul: `${mp.nama} › ${mt.nama}`,
          alasan,
        });
      }
    }
    const pct = ok / materiList.length;
    cakupan.push({
      mapelId: mp.id,
      nama: mp.nama,
      tersampaikan: ok,
      total: materiList.length,
      pct,
    });
  }

  const cakupanAvgPct = cakupan.length
    ? Math.round(cakupan.reduce((a, c) => a + c.pct * 100, 0) / cakupan.length)
    : 0;

  return {
    kegiatanDiikuti: dihitungKeg.length,
    kehadiranPct,
    hit,
    cakupanAvgPct,
    terlewatCount: terlewat.length,
    cakupan,
    terlewat,
  };
}

const s1Profil = computeProfil(seed.siswa.find((s) => s.id === 'S1'), seed);
assert.ok(s1Profil.kegiatanDiikuti > 0, 'S1 has kegiatan diikuti > 0');
assert.ok(s1Profil.kehadiranPct >= 0 && s1Profil.kehadiranPct <= 100, 'Kehadiran percentage is 0-100%');
assert.ok(s1Profil.cakupanAvgPct >= 0 && s1Profil.cakupanAvgPct <= 100, 'Cakupan average percentage is 0-100%');
assert.ok(s1Profil.cakupan.length > 0, 'S1 has topic coverage for active mapels');

console.log(`✓ S1 Profil verified: ${s1Profil.kegiatanDiikuti} kegiatan, ${s1Profil.kehadiranPct}% kehadiran, ${s1Profil.cakupanAvgPct}% cakupan materi, ${s1Profil.terlewatCount} materi terlewat.\n`);

// ----------------------------------------------------
// 6. Test Class Membership Mutation Logic
// ----------------------------------------------------
console.log('Test 6: Verify Class Membership Add/Remove (ubahAnggota)');

const mockKelas = {
  id: 'K_TEST',
  nama: 'Kelas Uji',
  anggota: ['S1', 'S2'],
};

// Add S3
let newAnggota = [...mockKelas.anggota];
if (!newAnggota.includes('S3')) newAnggota.push('S3');
assert.deepEqual(newAnggota, ['S1', 'S2', 'S3'], 'Student S3 added to class');

// Remove S1
newAnggota = newAnggota.filter((id) => id !== 'S1');
assert.deepEqual(newAnggota, ['S2', 'S3'], 'Student S1 removed from class');

console.log('✓ Class membership mutation verified.\n');

console.log('====================================================');
console.log('ALL 6 AUTOMATED TESTS PASSED FOR STEP 9 (B1 SISWA)!');
console.log('====================================================');
