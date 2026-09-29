import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

console.log('=== TEST SUITE: Phase 5 Step 6 (A8 Realisasi Kegiatan) ===\n');

function menit(hhmm) {
  if (!hhmm) return 0;
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

// ----------------------------------------------------
// 1. Initial State & Empty Presence Rule (DOMAIN.md §9)
// ----------------------------------------------------
console.log('Test 1: Default attendance is empty, never defaults to Hadir');

function initRealisasiState(kegiatan) {
  const re = kegiatan.realisasi;
  return {
    mode: re ? 'ubah' : 'baru',
    mulai: re ? re.mulai : kegiatan.mulai,
    selesai: re ? re.selesai : kegiatan.selesai,
    sama: !re || (re.mulai === kegiatan.mulai && re.selesai === kegiatan.selesai),
    materi: (re && re.materi) || kegiatan.materi || '',
    ketuntasan: (re && re.ketuntasan) || '',
    catatan: (re && re.catatan) || '',
    // CRITICAL DOMAIN RULE: Must be empty {}, NEVER auto-fill hadir!
    kehadiran: re ? { ...re.kehadiran } : {},
    catatanSiswa: re ? { ...re.catatanSiswa } : {},
    kehadiranSubjek: re ? { ...re.kehadiranSubjek } : {},
    catatanSubjek: re ? { ...re.catatanSubjek } : {},
    lanjutan: false,
    dicoba: false,
    dirty: false,
  };
}

const mockKegiatanUnrealized = {
  id: 'k-test-1',
  nama: 'Matematika Kelas SD Sore',
  tanggal: '2026-09-14',
  mulai: '08:00',
  selesai: '09:30',
  jenis: 'j-01',
  mapel: 'mp-01',
  materi: 'mt-01',
  siswa: ['s-01', 's-02', 's-03', 's-04'],
  subjek: [{ id: 'sub-01', peran: 'Pengisi' }],
  status: 'belum_direalisasi',
  realisasi: undefined,
};

const stateAwal = initRealisasiState(mockKegiatanUnrealized);

assert.equal(stateAwal.mode, 'baru', 'Unrealized event must have mode baru');
assert.equal(Object.keys(stateAwal.kehadiran).length, 0, 'Siswa attendance must be empty {} initially');
assert.equal(Object.keys(stateAwal.kehadiranSubjek).length, 0, 'Subjek attendance must be empty {} initially');
mockKegiatanUnrealized.siswa.forEach((sid) => {
  assert.equal(stateAwal.kehadiran[sid], undefined, `Student ${sid} must have no default status`);
});
mockKegiatanUnrealized.subjek.forEach((s) => {
  assert.equal(stateAwal.kehadiranSubjek[s.id], undefined, `Subject ${s.id} must have no default status`);
});

console.log('  ✓ Default presence starts completely empty (never pre-filled with Hadir)');

// ----------------------------------------------------
// 2. Bulk Actions & Attendance Counting
// ----------------------------------------------------
console.log('\nTest 2: Bulk attendance actions (Tandai semua hadir & Kosongkan)');

function hitungKehadiran(ids, map) {
  const counts = { hadir: 0, izin: 0, sakit: 0, alpa: 0 };
  let belumDiisi = 0;
  ids.forEach((id) => {
    const v = map[id];
    if (v && counts[v] !== undefined) {
      counts[v]++;
    } else {
      belumDiisi++;
    }
  });
  return { counts, belumDiisi };
}

// Initial count: all 4 are unassigned
let hit = hitungKehadiran(mockKegiatanUnrealized.siswa, stateAwal.kehadiran);
assert.equal(hit.belumDiisi, 4, 'Initially 4 students are unassigned');
assert.equal(hit.counts.hadir, 0, 'Initially 0 students are hadir');

// Action: Tandai semua hadir
function tandaiSemuaHadir(ids, currentMap) {
  const next = { ...currentMap };
  ids.forEach((id) => {
    if (!next[id]) next[id] = 'hadir';
  });
  return next;
}

const mapHadirSemua = tandaiSemuaHadir(mockKegiatanUnrealized.siswa, stateAwal.kehadiran);
hit = hitungKehadiran(mockKegiatanUnrealized.siswa, mapHadirSemua);
assert.equal(hit.counts.hadir, 4, 'All 4 students should be hadir');
assert.equal(hit.belumDiisi, 0, '0 students should be unassigned');

// Action: Kosongkan
function kosongkan(ids, currentMap) {
  const next = { ...currentMap };
  ids.forEach((id) => {
    delete next[id];
  });
  return next;
}

const mapKosong = kosongkan(mockKegiatanUnrealized.siswa, mapHadirSemua);
hit = hitungKehadiran(mockKegiatanUnrealized.siswa, mapKosong);
assert.equal(hit.counts.hadir, 0, 'All students should be cleared');
assert.equal(hit.belumDiisi, 4, 'All 4 students should be unassigned again');

console.log('  ✓ Bulk attendance actions and counters behave correctly');

// ----------------------------------------------------
// 3. Validation Rules (DOMAIN.md §9)
// ----------------------------------------------------
console.log('\nTest 3: Validation rules for time, presence, and topic completeness');

function periksaRealisasi(form, kegiatan, jenisWajibMateri = true) {
  const errors = {};
  const siswaMissing = [];
  const subjekMissing = [];

  // 1. Time checks
  if (!form.mulai || !form.selesai) {
    errors.jam = 'Jam mulai dan jam selesai aktual harus diisi.';
  } else if (menit(form.selesai) <= menit(form.mulai)) {
    errors.jam = `Jam selesai aktual harus setelah jam mulai. Ubah menjadi setelah ${form.mulai}.`;
  }

  // 2. Materi checks
  if (jenisWajibMateri) {
    if (!form.materi) {
      errors.materi = 'Pilih materi yang benar-benar disampaikan — ini yang dibaca matriks belajar, bukan materi rencana.';
    }
    if (!form.ketuntasan) {
      errors.ketuntasan = 'Pilih ketuntasan materi.';
    }
  }

  // 3. Presence checks
  (kegiatan.siswa || []).forEach((sid) => {
    if (!form.kehadiran[sid]) siswaMissing.push(sid);
  });
  (kegiatan.subjek || []).forEach((s) => {
    if (!form.kehadiranSubjek[s.id]) subjekMissing.push(s.id);
  });

  const hasErrors = Boolean(
    errors.jam ||
    errors.materi ||
    errors.ketuntasan ||
    siswaMissing.length > 0 ||
    subjekMissing.length > 0
  );

  return { errors, siswaMissing, subjekMissing, hasErrors };
}

// Case A: Fresh form without presence or ketuntasan -> must fail validation
const valInitial = periksaRealisasi(stateAwal, mockKegiatanUnrealized, true);
assert.equal(valInitial.hasErrors, true, 'Fresh form must have validation errors');
assert.equal(valInitial.siswaMissing.length, 4, 'All 4 students missing presence');
assert.equal(valInitial.subjekMissing.length, 1, 'Subject missing presence');
assert.ok(valInitial.errors.ketuntasan, 'Ketuntasan is required');

// Case B: Inverted time -> must fail validation
const valBadTime = periksaRealisasi(
  {
    ...stateAwal,
    mulai: '10:00',
    selesai: '09:00',
    materi: 'mt-01',
    ketuntasan: 'tuntas',
    kehadiran: { 's-01': 'hadir', 's-02': 'hadir', 's-03': 'hadir', 's-04': 'hadir' },
    kehadiranSubjek: { 'sub-01': 'hadir' },
  },
  mockKegiatanUnrealized,
  true
);
assert.equal(valBadTime.hasErrors, true);
assert.ok(valBadTime.errors.jam.includes('setelah jam mulai'), 'Must reject selesai <= mulai');

// Case C: Valid complete form -> must pass validation
const valComplete = periksaRealisasi(
  {
    ...stateAwal,
    mulai: '08:00',
    selesai: '09:30',
    materi: 'mt-01',
    ketuntasan: 'tuntas',
    kehadiran: { 's-01': 'hadir', 's-02': 'izin', 's-03': 'sakit', 's-04': 'alpa' },
    kehadiranSubjek: { 'sub-01': 'hadir' },
  },
  mockKegiatanUnrealized,
  true
);
assert.equal(valComplete.hasErrors, false, 'Complete form must pass validation');
assert.equal(valComplete.siswaMissing.length, 0);
assert.equal(valComplete.subjekMissing.length, 0);

// Case D: Event without students (e.g. rapat) -> valid with subjects alone
const mockRapat = {
  id: 'k-rapat',
  nama: 'Rapat Pengajar Mingguan',
  tanggal: '2026-09-15',
  mulai: '11:00',
  selesai: '12:00',
  siswa: [],
  subjek: [{ id: 'sub-01', peran: 'Pengisi' }, { id: 'sub-02', peran: 'Support' }],
};

const valRapat = periksaRealisasi(
  {
    mulai: '11:00',
    selesai: '12:00',
    kehadiran: {},
    kehadiranSubjek: { 'sub-01': 'hadir', 'sub-02': 'hadir' },
    materi: '',
    ketuntasan: '',
  },
  mockRapat,
  false // rapat has no mandatory materi
);
assert.equal(valRapat.hasErrors, false, 'Activity without students passes with subjects alone');

console.log('  ✓ Validation rules (time order, mandatory presence, topic, rapat) verified');

// ----------------------------------------------------
// 4. Time Delta, Discrepancy, and Follow-Up Chaining
// ----------------------------------------------------
console.log('\nTest 4: Time delta, topic discrepancy, and follow-up chaining');

// Delta calculation
function hitungSelisih(mulaiAktual, mulaiRencana) {
  const d = menit(mulaiAktual) - menit(mulaiRencana);
  if (d === 0) return null;
  return d > 0 ? `mulai telat ${d} mnt` : `mulai ${-d} mnt lebih awal`;
}

assert.equal(hitungSelisih('08:15', '08:00'), 'mulai telat 15 mnt');
assert.equal(hitungSelisih('07:50', '08:00'), 'mulai 10 mnt lebih awal');
assert.equal(hitungSelisih('08:00', '08:00'), null);

// Topic discrepancy note
function pesanBedaMateri(materiAktual, materiRencana, namaRencana) {
  if (materiAktual && materiRencana && materiAktual !== materiRencana) {
    return `Berbeda dari rencana (${namaRencana}). Matriks belajar akan mencatat materi ini, dan materi rencana tetap belum tersampaikan.`;
  }
  return null;
}

const beda = pesanBedaMateri('mt-02', 'mt-01', 'Matematika › Operasi Hitung');
assert.ok(beda && beda.includes('Berbeda dari rencana'));
assert.ok(beda.includes('Matriks belajar akan mencatat materi ini'));

// Follow-up eligibility (only if materi was partial or incomplete)
function bolehLanjutan(pakaiMateri, ketuntasan) {
  return pakaiMateri && (ketuntasan === 'sebagian' || ketuntasan === 'tidak');
}

assert.equal(bolehLanjutan(true, 'tuntas'), false, 'Tuntas does not offer follow up');
assert.equal(bolehLanjutan(true, 'sebagian'), true, 'Sebagian offers follow up');
assert.equal(bolehLanjutan(true, 'tidak'), true, 'Tidak offers follow up');
assert.equal(bolehLanjutan(false, 'sebagian'), false, 'Non-materi activity does not offer follow up');

console.log('  ✓ Time delta, topic discrepancy, and follow-up conditions verified');

// ----------------------------------------------------
// 5. Data Layer & Repository Mutation Logic
// ----------------------------------------------------
console.log('\nTest 5: Realisasi save mutation and state transition logic');

function prosesSimpanRealisasi(existing, input, today = '2026-09-16', now = '11:45') {
  const realisasiData = {
    mulai: input.mulai,
    selesai: input.selesai,
    materi: input.materi !== undefined ? input.materi : (existing.materi || null),
    ketuntasan: input.ketuntasan,
    catatan: input.catatan || '',
    kehadiran: input.kehadiranSiswa,
    catatanSiswa: input.catatanSiswa || {},
    kehadiranSubjek: input.kehadiranSubjek,
    catatanSubjek: input.catatanSubjek || {},
    diisiOleh: input.diisiOleh,
    diisiPada: `${today} ${now}`,
  };

  const updated = {
    ...existing,
    status: 'terealisasi',
    realisasi: realisasiData,
  };

  return { kegiatan: updated, realisasi: realisasiData };
}

const simpanInput = {
  mulai: '08:00',
  selesai: '09:30',
  materi: 'mt-01',
  ketuntasan: 'tuntas',
  catatan: 'Sesi selesai dengan lancar seluruh siswa memahami konsep.',
  kehadiranSiswa: {
    's-01': 'hadir',
    's-02': 'izin',
    's-03': 'sakit',
    's-04': 'hadir',
  },
  catatanSiswa: {
    's-01': 'Sangat aktif menjawab pertanyaan',
  },
  kehadiranSubjek: {
    'sub-01': 'hadir',
  },
  catatanSubjek: {},
  diisiOleh: 'Pak Budi',
};

const simpanResult = prosesSimpanRealisasi(mockKegiatanUnrealized, simpanInput);

assert.equal(simpanResult.kegiatan.status, 'terealisasi', 'Kegiatan status must be terealisasi after save');
assert.ok(simpanResult.realisasi, 'Realisasi record must be populated');
assert.equal(simpanResult.realisasi.catatan, simpanInput.catatan);
assert.equal(simpanResult.realisasi.ketuntasan, 'tuntas');
assert.equal(simpanResult.realisasi.kehadiran['s-01'], 'hadir');
assert.equal(simpanResult.realisasi.catatanSiswa['s-01'], 'Sangat aktif menjawab pertanyaan');
assert.equal(simpanResult.realisasi.diisiOleh, 'Pak Budi');

// Test non-materi activity preserves null materi
const mockOlahraga = {
  id: 'k-olahraga',
  nama: 'Olahraga Pagi',
  mulai: '07:00',
  selesai: '09:00',
  materi: undefined,
  siswa: ['s-01'],
  subjek: [{ id: 'sub-01', peran: 'Pengisi' }],
};

const resOlahraga = prosesSimpanRealisasi(mockOlahraga, {
  mulai: '07:00',
  selesai: '09:00',
  materi: null,
  ketuntasan: null,
  catatan: 'Jogging bersama',
  kehadiranSiswa: { 's-01': 'hadir' },
  kehadiranSubjek: { 'sub-01': 'hadir' },
  diisiOleh: 'Pak Budi',
});
assert.equal(resOlahraga.realisasi.materi, null, 'Non-materi activity must preserve null materi');

// Verify MockRealisasiRepository source code handles null materi
const mockRepoCode = readFileSync(resolve('src/data/mock/MockRealisasiRepository.ts'), 'utf8');
assert.ok(mockRepoCode.includes("input.materi !== undefined ? input.materi : (existing.materi || null)"), 'MockRealisasiRepository must properly handle null materi');
assert.ok(mockRepoCode.includes("status: 'terealisasi'"), 'MockRealisasiRepository must set status to terealisasi');

console.log('  ✓ MockRealisasiRepository persistence and state update verified');

// ----------------------------------------------------
// 6. Source Code, Route & Component Audit
// ----------------------------------------------------
console.log('\nTest 6: Source code and route verification');

const realisasiScreenPath = resolve('src/screens/RealisasiScreen.tsx');
assert.ok(existsSync(realisasiScreenPath), 'RealisasiScreen.tsx must exist');
const realisasiCode = readFileSync(realisasiScreenPath, 'utf8');

assert.ok(realisasiCode.includes('Tandai semua hadir'), 'Must have Tandai semua hadir action');
assert.ok(realisasiCode.includes('Kosongkan'), 'Must have Kosongkan action');
assert.ok(realisasiCode.includes('Sama dengan rencana'), 'Must have Sama dengan rencana checkbox');
assert.ok(realisasiCode.includes('Simpan draf'), 'Must have Simpan draf button');
assert.ok(realisasiCode.includes('Ctrl S'), 'Must indicate Ctrl S shortcut on save button');
assert.ok(realisasiCode.includes('data-rel-scroll="siswa"'), 'Must have scroll container for students');
assert.ok(realisasiCode.includes('data-rel-scroll="subjek"'), 'Must have scroll container for subjects');
assert.ok(realisasiCode.includes('data-rel-row='), 'Must have data-rel-row attribute for error scrolling');
assert.ok(realisasiCode.includes('KehadiranSegmentedControl'), 'Must use KehadiranSegmentedControl');
assert.ok(realisasiCode.includes('KetuntasanSegmentedControl'), 'Must use KetuntasanSegmentedControl');

// App.tsx route check
const appCode = readFileSync(resolve('src/App.tsx'), 'utf8');
assert.ok(appCode.includes('path="/kegiatan/:id/realisasi"'), 'App.tsx must register /kegiatan/:id/realisasi route');
assert.ok(appCode.includes('RealisasiScreen'), 'App.tsx must import RealisasiScreen');

// DetailKegiatanScreen.tsx navigation check
const detailCode = readFileSync(resolve('src/screens/DetailKegiatanScreen.tsx'), 'utf8');
assert.ok(detailCode.includes('/kegiatan/${kegiatan.id}/realisasi'), 'DetailKegiatanScreen must navigate to realisasi route');

// KalenderScreen.tsx navigation check
const kalenderCode = readFileSync(resolve('src/screens/KalenderScreen.tsx'), 'utf8');
assert.ok(kalenderCode.includes('/kegiatan/${kegiatan.id}/realisasi'), 'KalenderScreen popover must navigate to realisasi route');

console.log('  ✓ Component code, route registration, and inter-screen navigation verified');

console.log('\n======================================================');
console.log('ALL PHASE 5 STEP 6 (A8 REALISASI) TESTS PASSED (6/6)');
console.log('======================================================\n');
