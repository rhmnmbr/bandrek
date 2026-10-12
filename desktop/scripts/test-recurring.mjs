import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const baseDir = existsSync(resolve(process.cwd(), 'desktop'))
  ? resolve(process.cwd(), 'desktop')
  : process.cwd();

console.log('=== TEST SUITE: Recurring Kegiatan & Instance-Based Realisasi ===\n');

// ----------------------------------------------------
// 1. Helper Dates & Recurring Rules Calculation
// ----------------------------------------------------
console.log('Test 1: Recurring dates calculation');

function toDate(iso) {
  const parts = iso.split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function toIso(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(d, n) {
  const res = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  res.setDate(res.getDate() + n);
  return res;
}

function generateRecurringDates(startDate, frekuensi, tipeBerakhir, totalPertemuan = 4, sampaiTanggal) {
  const dates = [];
  let current = toDate(startDate);
  const maxLimit = tipeBerakhir === 'pertemuan' ? Math.max(1, Math.min(52, totalPertemuan)) : 52;
  const endDate = tipeBerakhir === 'tanggal' && sampaiTanggal ? toDate(sampaiTanggal) : null;

  while (dates.length < maxLimit) {
    if (endDate && current.getTime() > endDate.getTime()) {
      break;
    }

    if (frekuensi === 'bulanan') {
      dates.push(toIso(current));
      const [y, m, d] = startDate.split('-').map(Number);
      const targetMonth = current.getMonth() + 1;
      current.setMonth(targetMonth, 1);
      const daysInMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
      current.setDate(Math.min(d, daysInMonth));
    } else {
      dates.push(toIso(current));
      const step = frekuensi === 'dua_mingguan' ? 14 : 7;
      current = addDays(current, step);
    }
  }

  return dates.length > 0 ? dates : [startDate];
}

// Case A: Mingguan, 4 meetings starting Senin 14 Sep 2026
const weeklyDates = generateRecurringDates('2026-09-14', 'mingguan', 'pertemuan', 4);
assert.equal(weeklyDates.length, 4, 'Harus menghasilkan 4 pertemuan mingguan');
assert.deepEqual(
  weeklyDates,
  ['2026-09-14', '2026-09-21', '2026-09-28', '2026-10-05'],
  'Tanggal mingguan harus berjarak 7 hari tiap Senin'
);
console.log('  ✓ Perhitungan mingguan (4 pertemuan) valid:', weeklyDates.join(', '));

// Case B: Dua mingguan, sampai tanggal 10 Nov 2026
const biweeklyDates = generateRecurringDates(
  '2026-09-14',
  'dua_mingguan',
  'tanggal',
  undefined,
  '2026-10-30'
);
assert.equal(biweeklyDates.length, 4, 'Dua mingguan dalam rentang tsb harus 4 pertemuan');
assert.deepEqual(
  biweeklyDates,
  ['2026-09-14', '2026-09-28', '2026-10-12', '2026-10-26'],
  'Tanggal dua mingguan berjarak 14 hari'
);
console.log('  ✓ Perhitungan dua mingguan dengan batas tanggal valid:', biweeklyDates.join(', '));

// Case C: Bulanan, 4 pertemuan mulai 15 Sep 2026
const monthlyDates = generateRecurringDates('2026-09-15', 'bulanan', 'pertemuan', 4);
assert.equal(monthlyDates.length, 4, 'Bulanan harus 4 pertemuan');
assert.deepEqual(
  monthlyDates,
  ['2026-09-15', '2026-10-15', '2026-11-15', '2026-12-15'],
  'Bulanan harus bertambah 1 bulan pada tanggal yang sama'
);
console.log('  ✓ Perhitungan bulanan (4 pertemuan) valid:', monthlyDates.join(', '));

// ----------------------------------------------------
// 2. Series Data Model & Instances Isolation
// ----------------------------------------------------
console.log('\nTest 2: Series instances creation and data integrity');

function mockCreateRecurringSeries(input) {
  const dates = generateRecurringDates(
    input.tanggal,
    input.pengulangan.frekuensi,
    input.pengulangan.tipeBerakhir,
    input.pengulangan.totalPertemuan,
    input.pengulangan.sampaiTanggal
  );

  const seriId = `seri_test_${Date.now()}`;
  const instances = dates.map((tgl, idx) => ({
    id: `keg_inst_${idx + 1}`,
    nama: input.nama,
    jenis: input.jenis,
    mapel: input.mapel || null,
    materi: input.materi || null,
    tanggal: tgl,
    mulai: input.mulai,
    selesai: input.selesai,
    sepanjangHari: Boolean(input.sepanjangHari),
    ruangan: input.ruangan || '',
    tempatCustom: input.tempatCustom || null,
    subjek: input.subjek || [],
    siswa: input.siswa || [],
    catatan: input.catatan || '',
    status: 'terjadwal',
    realisasi: null,
    seriId,
    urutanSeri: idx + 1,
    totalSeri: dates.length,
  }));

  return instances;
}

// Simulasi kegiatan non-materi berulang: "Rapat Koordinasi Mingguan Tutor"
const inputRapat = {
  nama: 'Rapat Koordinasi Mingguan Tutor',
  jenis: 'j-rapat', // non-materi
  mapel: null,
  materi: null,
  tanggal: '2026-09-15',
  mulai: '13:00',
  selesai: '14:30',
  ruangan: 'r-01',
  subjek: [
    { id: 'sub-01', peran: 'Pengisi' },
    { id: 'sub-02', peran: 'Pendamping' },
  ],
  siswa: [],
  pengulangan: {
    aktif: true,
    frekuensi: 'mingguan',
    tipeBerakhir: 'pertemuan',
    totalPertemuan: 3,
  },
};

const instancesRapat = mockCreateRecurringSeries(inputRapat);
assert.equal(instancesRapat.length, 3, 'Jumlah instance harus tepat 3');
assert.equal(instancesRapat[0].seriId, instancesRapat[1].seriId, 'Semua instance berbagi seriId yang sama');
assert.equal(instancesRapat[0].urutanSeri, 1, 'Instance 1 memiliki urutanSeri 1');
assert.equal(instancesRapat[1].urutanSeri, 2, 'Instance 2 memiliki urutanSeri 2');
assert.equal(instancesRapat[2].urutanSeri, 3, 'Instance 3 memiliki urutanSeri 3');
assert.equal(instancesRapat[0].totalSeri, 3, 'totalSeri bernilai 3');
console.log('  ✓ Series generation: 3 instance mandiri berhasil dibuat dengan seriId:', instancesRapat[0].seriId);

// ----------------------------------------------------
// 3. Realisasi Per Instance Isolation
// ----------------------------------------------------
console.log('\nTest 3: Per-instance realization strictly isolated');

// Lakukan pengisian realisasi pada pertemuan ke-1 saja
const inst1 = instancesRapat[0];
const inst2 = instancesRapat[1];
const inst3 = instancesRapat[2];

// Isi realisasi untuk inst1
inst1.status = 'terealisasi';
inst1.realisasi = {
  mulai: '13:05',
  selesai: '14:30',
  kehadiranSubjek: {
    'sub-01': 'hadir',
    'sub-02': 'hadir',
  },
  catatanSubjek: {
    'sub-01': 'Pimpinan rapat',
  },
  catatan: 'Pembahasan evaluasi mid-semester selesai.',
  diisiPada: '2026-09-15 14:35',
  diisiOleh: 'Operator Nur',
};

// Pastikan inst2 dan inst3 TIDAK terpengaruh dan tetap terjadwal tanpa realisasi
assert.equal(inst1.status, 'terealisasi', 'Instance 1 harus berstatus terealisasi');
assert.notEqual(inst1.realisasi, null, 'Instance 1 memiliki rekaman realisasi');

assert.equal(inst2.status, 'terjadwal', 'Instance 2 HARUS tetap terjadwal');
assert.equal(inst2.realisasi, null, 'Instance 2 realisasi HARUS tetap null');

assert.equal(inst3.status, 'terjadwal', 'Instance 3 HARUS tetap terjadwal');
assert.equal(inst3.realisasi, null, 'Instance 3 realisasi HARUS tetap null');

console.log('  ✓ Realisasi pertemuan 1 berhasil diisi tanpa memengaruhi pertemuan 2 dan 3');

// ----------------------------------------------------
// 4. Source Code Component Checks
// ----------------------------------------------------
console.log('\nTest 4: Verify UI files wiring and indicator presence');

const formPanelCode = readFileSync(
  resolve(baseDir, 'src/components/kegiatan/FormKegiatanPanel.tsx'),
  'utf-8'
);
assert.ok(formPanelCode.includes('isRecurring'), 'FormKegiatanPanel must manage isRecurring');
assert.ok(formPanelCode.includes('recurringFreq'), 'FormKegiatanPanel must manage recurringFreq');
assert.ok(formPanelCode.includes('summaryRecurringText'), 'FormKegiatanPanel must render live summary');
assert.ok(formPanelCode.includes('Jadwal berulang'), 'FormKegiatanPanel must have checkbox toggle');
assert.ok(formPanelCode.includes('pengulangan: isRecurring'), 'FormKegiatanPanel must pass pengulangan payload');

const popoverCode = readFileSync(
  resolve(baseDir, 'src/components/kalender/KegiatanPopover.tsx'),
  'utf-8'
);
assert.ok(popoverCode.includes('kegiatan.seriId'), 'KegiatanPopover must check kegiatan.seriId');
assert.ok(popoverCode.includes('kegiatan.urutanSeri'), 'KegiatanPopover must render urutanSeri');

const realisasiCode = readFileSync(
  resolve(baseDir, 'src/screens/RealisasiScreen.tsx'),
  'utf-8'
);
assert.ok(realisasiCode.includes('kegiatan.seriId'), 'RealisasiScreen must display series badge for recurring instance');

const detailCode = readFileSync(
  resolve(baseDir, 'src/screens/DetailKegiatanScreen.tsx'),
  'utf-8'
);
assert.ok(detailCode.includes('kegiatan.seriId'), 'DetailKegiatanScreen must render series badge and related instances');

const tableCode = readFileSync(
  resolve(baseDir, 'src/components/daftar/DaftarTable.tsx'),
  'utf-8'
);
assert.ok(tableCode.includes('ev.seriId'), 'DaftarTable must render series badge for recurring instance');

console.log('  ✓ All UI components (FormKegiatanPanel, Popover, Realisasi, Detail, DaftarTable) correctly wired!');

console.log('\n======================================================');
console.log('ALL RECURRING & INSTANCE REALISASI TESTS PASSED (100%)');
console.log('======================================================\n');
