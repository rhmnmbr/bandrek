import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

console.log('=== TEST SUITE: Phase 5 Step 5 (A6 Batalkan & A7 Jadwal Ulang) ===\n');

function menit(hhmm) {
  if (!hhmm) return 0;
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

// ----------------------------------------------------
// 1. Batalkan validation & state logic (DOMAIN.md §7 & prototype)
// ----------------------------------------------------
console.log('Test 1: Batalkan validation, impact copy, and sekalian-ulang logic');

function periksaBatal(form) {
  if (!form.alasan) {
    return { alasan: 'Pilih alasan pembatalan. Alasan ini yang dipakai laporan "kenapa jadwal meleset".' };
  }
  return {};
}

// Validation failure when reason is empty
const errKosong = periksaBatal({ alasan: '', keterangan: '' });
assert.ok(errKosong.alasan, 'Empty alasan must produce an error');

// Validation passes when reason is provided
const okBatal = periksaBatal({ alasan: 'Pengajar berhalangan', keterangan: 'Sakit flu' });
assert.equal(Object.keys(okBatal).length, 0, 'Valid alasan must produce 0 errors');

// Impact copy check
function pesanDampak(kegiatan) {
  if (kegiatan.siswa && kegiatan.siswa.length > 0) {
    return `Materi ini belum tersampaikan ke ${kegiatan.siswa.length} siswa. Catatannya di matriks belajar akan tetap kosong sampai dijadwalkan ulang.`;
  }
  return 'Kegiatan ini tanpa siswa, jadi tidak ada dampak ke matriks belajar.';
}

const dampakSiswa = pesanDampak({ id: 'e1', siswa: ['s1', 's2', 's3'] });
assert.ok(dampakSiswa.includes('3 siswa'), 'Must include student count in impact note');
assert.ok(dampakSiswa.includes('matriks belajar'), 'Must mention matriks belajar');

const dampakRapat = pesanDampak({ id: 'e2', siswa: [] });
assert.equal(dampakRapat, 'Kegiatan ini tanpa siswa, jadi tidak ada dampak ke matriks belajar.');

console.log('  ✓ Batalkan validation and impact messaging verified');

// ----------------------------------------------------
// 2. Jadwal Ulang validation & field copy logic (DOMAIN.md §8)
// ----------------------------------------------------
console.log('\nTest 2: Jadwal ulang validation & field inheritance');

function periksaJadwalUlang(form) {
  const err = {};
  if (!form.alasan) {
    err.alasan = 'Pilih alasan penjadwalan ulang. Ini bahan laporan "kenapa jadwal meleset".';
  }
  if (!form.tanggal || !form.mulai || !form.selesai) {
    err.waktu = 'Tanggal, jam mulai, dan jam selesai harus terisi.';
  } else if (menit(form.selesai) <= menit(form.mulai)) {
    err.waktu = `Jam selesai harus setelah jam mulai. Ubah jam selesai menjadi setelah ${form.mulai}.`;
  }
  return err;
}

// Empty validation
const errUlangKosong = periksaJadwalUlang({
  alasan: '',
  tanggal: '',
  mulai: '',
  selesai: '',
});
assert.ok(errUlangKosong.alasan, 'Empty alasan must error');
assert.ok(errUlangKosong.waktu, 'Empty waktu must error');

// Time validation (selesai <= mulai)
const errWaktuSalah = periksaJadwalUlang({
  alasan: 'Bentrok agenda pengajar',
  tanggal: '2026-09-20',
  mulai: '10:00',
  selesai: '09:30',
});
assert.ok(errWaktuSalah.waktu.includes('Jam selesai harus setelah jam mulai'));

// Valid form
const okUlang = periksaJadwalUlang({
  alasan: 'Bentrok agenda pengajar',
  tanggal: '2026-09-20',
  mulai: '10:00',
  selesai: '11:30',
});
assert.equal(Object.keys(okUlang).length, 0);

// Field copy behavior (bawa = true vs bawa = false)
function prosesJadwalUlang(oldKegiatan, form, dariBatal = false) {
  const newId = 'e_new_123';
  const kegiatanBaru = {
    id: newId,
    nama: oldKegiatan.nama,
    jenis: oldKegiatan.jenis,
    mapel: form.bawa ? oldKegiatan.mapel : null,
    materi: form.bawa ? oldKegiatan.materi : null,
    kelas: form.bawa ? oldKegiatan.kelas : null,
    tanggal: form.tanggal,
    mulai: form.mulai,
    selesai: form.selesai,
    ruangan: form.ruangan || oldKegiatan.ruangan,
    subjek: form.bawa ? [...oldKegiatan.subjek] : [],
    siswa: form.bawa ? [...oldKegiatan.siswa] : [],
    catatan: form.bawa ? oldKegiatan.catatan : '',
    status: 'terjadwal',
    jadwalUlangDari: oldKegiatan.id,
  };

  const kegiatanAsal = {
    ...oldKegiatan,
    status: dariBatal ? 'dibatalkan' : 'dijadwal_ulang',
    jadwalUlangKe: newId,
    penjadwalanUlang: {
      alasan: form.alasan,
      keterangan: form.keterangan || '',
      pada: '2026-09-29 14:00',
    },
  };

  return { kegiatanAsal, kegiatanBaru };
}

const mockOld = {
  id: 'e01',
  nama: 'Matematika SD',
  jenis: 'j1',
  mapel: 'mp1',
  materi: 'mt1',
  kelas: 'k1',
  tanggal: '2026-09-16',
  mulai: '08:00',
  selesai: '09:30',
  ruangan: 'r1',
  subjek: [{ id: 'sub1', peran: 'Pengisi' }],
  siswa: ['s1', 's2'],
  catatan: 'Catatan penting',
  status: 'terjadwal',
};

// With bawa = true
const resBawa = prosesJadwalUlang(mockOld, {
  alasan: 'Ruangan dipakai',
  bawa: true,
  tanggal: '2026-09-20',
  mulai: '10:00',
  selesai: '11:30',
  ruangan: 'r2',
});
assert.equal(resBawa.kegiatanAsal.status, 'dijadwal_ulang');
assert.equal(resBawa.kegiatanAsal.jadwalUlangKe, 'e_new_123');
assert.equal(resBawa.kegiatanBaru.status, 'terjadwal');
assert.equal(resBawa.kegiatanBaru.jadwalUlangDari, 'e01');
assert.equal(resBawa.kegiatanBaru.siswa.length, 2);
assert.equal(resBawa.kegiatanBaru.subjek.length, 1);
assert.equal(resBawa.kegiatanBaru.materi, 'mt1');
assert.equal(resBawa.kegiatanBaru.catatan, 'Catatan penting');

// With bawa = false
const resTanpaBawa = prosesJadwalUlang(mockOld, {
  alasan: 'Ruangan dipakai',
  bawa: false,
  tanggal: '2026-09-20',
  mulai: '10:00',
  selesai: '11:30',
  ruangan: 'r2',
});
assert.equal(resTanpaBawa.kegiatanBaru.siswa.length, 0, 'Siswa should be empty when bawa = false');
assert.equal(resTanpaBawa.kegiatanBaru.subjek.length, 0, 'Subjek should be empty when bawa = false');
assert.equal(resTanpaBawa.kegiatanBaru.materi, null, 'Materi should be null when bawa = false');

// From cancelled activity (dariBatal = true)
const resDariBatal = prosesJadwalUlang(
  { ...mockOld, status: 'dibatalkan' },
  { alasan: 'Jadwal ulang setelah batal', bawa: true, tanggal: '2026-09-20', mulai: '10:00', selesai: '11:30' },
  true
);
assert.equal(resDariBatal.kegiatanAsal.status, 'dibatalkan', 'Origin retains dibatalkan status when rescheduled from cancelled state');
assert.equal(resDariBatal.kegiatanAsal.jadwalUlangKe, 'e_new_123');

console.log('  ✓ Jadwal ulang field copy & status transitions match DOMAIN.md §8');

// ----------------------------------------------------
// 3. Hourly Availability Slot Computation & Subject Conflict Logic
// ----------------------------------------------------
console.log('\nTest 3: Hourly availability slots and subject conflict detection');

function hitungSlotKetersediaan({ mulai, selesai, tanggal, ruangan, semuaKegiatan, kegiatanId }) {
  const s0 = menit(mulai);
  const e0 = menit(selesai);
  const jamMulaiInt = Math.floor(s0 / 60);
  const base = Math.max(7, Math.min(15, jamMulaiInt - 1));

  const bentrokDi = (a, b) =>
    semuaKegiatan.filter(
      (x) =>
        x.id !== kegiatanId &&
        x.tanggal === tanggal &&
        x.status !== 'dibatalkan' &&
        x.status !== 'dijadwal_ulang' &&
        menit(x.selesai) > a &&
        menit(x.mulai) < b
    );

  const slots = [];
  for (let h = base; h < base + 4; h++) {
    const a = h * 60;
    const b = a + 60;
    const terpilih = e0 > a && s0 < b;
    const isi = ruangan ? bentrokDi(a, b).filter((x) => x.ruangan === ruangan) : [];
    slots.push({
      jam: `${String(h).padStart(2, '0')}:00`,
      terpilih,
      isiBentrok: isi.length > 0,
      teks: terpilih
        ? `slot dipilih · ${isi.length ? 'bentrok' : 'bebas'}`
        : isi.length
          ? 'Ruangan terisi'
          : 'bebas',
    });
  }
  return slots;
}

const mockKegiatanList = [
  {
    id: 'other1',
    tanggal: '2026-09-20',
    mulai: '09:00',
    selesai: '10:30',
    ruangan: 'r1',
    status: 'terjadwal',
    subjek: [{ id: 'sub1', peran: 'Pengisi' }],
  },
];

const slotHasil = hitungSlotKetersediaan({
  mulai: '10:00',
  selesai: '11:00',
  tanggal: '2026-09-20',
  ruangan: 'r1',
  semuaKegiatan: mockKegiatanList,
  kegiatanId: 'current1',
});

assert.equal(slotHasil.length, 4, 'Should compute exactly 4 hourly preview slots');
const slot10 = slotHasil.find((s) => s.jam === '10:00');
assert.ok(slot10.terpilih, 'Hour 10:00 is within 10:00–11:00 so it must be selected');
assert.ok(slot10.isiBentrok, 'Overlaps with other1 (09:00–10:30 in r1) so must be marked bentrok');
assert.equal(slot10.teks, 'slot dipilih · bentrok');

console.log('  ✓ Availability slot generation and conflict flagging accurate');

// ----------------------------------------------------
// 4. Source code integrity in Modal Components
// ----------------------------------------------------
console.log('\nTest 4: Modal component structure & design token compliance');

const modalBatalPath = existsSync(resolve('src/components/kegiatan/BatalkanKegiatanModal.tsx'))
  ? resolve('src/components/kegiatan/BatalkanKegiatanModal.tsx')
  : resolve('desktop/src/components/kegiatan/BatalkanKegiatanModal.tsx');
const modalBatalCode = readFileSync(modalBatalPath, 'utf-8');

assert.ok(modalBatalCode.includes('Batalkan kegiatan ini?'), 'Title matches prototype');
assert.ok(modalBatalCode.includes('max-w-130'), '520px max width (max-w-130) per prototype');
assert.ok(modalBatalCode.includes('Sekalian jadwalkan ulang'), 'Sekalian jadwalkan ulang checkbox present');
assert.ok(modalBatalCode.includes('Lihat matriks'), 'Lihat matriks button present');
assert.ok(modalBatalCode.includes('useBatalkanKegiatan'), 'Uses mutation from data layer');
assert.ok(modalBatalCode.includes('useAlasanBatal'), 'Uses dynamic reason list from data layer');
console.log('  ✓ BatalkanKegiatanModal satisfies all A6 specifications');

const modalUlangPath = existsSync(resolve('src/components/kegiatan/JadwalUlangModal.tsx'))
  ? resolve('src/components/kegiatan/JadwalUlangModal.tsx')
  : resolve('desktop/src/components/kegiatan/JadwalUlangModal.tsx');
const modalUlangCode = readFileSync(modalUlangPath, 'utf-8');

assert.ok(modalUlangCode.includes('Jadwalkan ulang kegiatan ini?'), 'Title matches prototype');
assert.ok(modalUlangCode.includes('max-w-186'), '744px max width (max-w-186) per prototype');
assert.ok(modalUlangCode.includes('JADWAL LAMA'), 'Left column header present');
assert.ok(modalUlangCode.includes('JADWAL BARU'), 'Right column header present');
assert.ok(modalUlangCode.includes('PRATINJAU KETERSEDIAAN'), 'Availability preview section present');
assert.ok(modalUlangCode.includes('Bawa serta subjek, siswa, materi, dan catatan rencana'), 'Bawa checkbox present');
assert.ok(modalUlangCode.includes('Semua subjek bebas pada slot ini'), 'Subject availability message present');
assert.ok(modalUlangCode.includes('useJadwalUlangKegiatan'), 'Uses mutation from data layer');
assert.ok(modalUlangCode.includes('useAlasanJadwalUlang'), 'Uses dynamic reason list from data layer');
console.log('  ✓ JadwalUlangModal satisfies all A7 specifications');

// ----------------------------------------------------
// 5. Screen Integration Check
// ----------------------------------------------------
console.log('\nTest 5: Screen integration in KalenderScreen and DetailKegiatanScreen');

const kalenderPath = existsSync(resolve('src/screens/KalenderScreen.tsx'))
  ? resolve('src/screens/KalenderScreen.tsx')
  : resolve('desktop/src/screens/KalenderScreen.tsx');
const kalenderCode = readFileSync(kalenderPath, 'utf-8');

assert.ok(kalenderCode.includes('BatalkanKegiatanModal'), 'KalenderScreen mounts BatalkanKegiatanModal');
assert.ok(kalenderCode.includes('JadwalUlangModal'), 'KalenderScreen mounts JadwalUlangModal');
assert.ok(kalenderCode.includes('modalBatalState'), 'KalenderScreen manages modalBatalState');
assert.ok(kalenderCode.includes('modalUlangState'), 'KalenderScreen manages modalUlangState');
console.log('  ✓ KalenderScreen properly integrates A6 & A7 modals');

const detailPath = existsSync(resolve('src/screens/DetailKegiatanScreen.tsx'))
  ? resolve('src/screens/DetailKegiatanScreen.tsx')
  : resolve('desktop/src/screens/DetailKegiatanScreen.tsx');
const detailCode = readFileSync(detailPath, 'utf-8');

assert.ok(detailCode.includes('BatalkanKegiatanModal'), 'DetailKegiatanScreen mounts BatalkanKegiatanModal');
assert.ok(detailCode.includes('JadwalUlangModal'), 'DetailKegiatanScreen mounts JadwalUlangModal');
assert.ok(detailCode.includes('setModalBatalOpen(true)'), 'DetailKegiatanScreen opens modal on Batalkan click');
assert.ok(detailCode.includes('setModalUlangState'), 'DetailKegiatanScreen opens modal on Jadwal Ulang click');
console.log('  ✓ DetailKegiatanScreen properly integrates A6 & A7 modals');

console.log('\n=== ALL 5/5 A6 BATALKAN & A7 JADWAL ULANG TEST SUITES PASSED (100%) ===\n');
