import fs from 'node:fs';
import path from 'node:path';
import { repositories } from '../src/data/repositories.ts';
import {
  getMonday,
  toIso,
  toDate,
  addDays,
  formatRentangMinggu,
  formatTanggalHari,
  formatBulanTahun,
  menit,
  JAM_AWAL,
  JAM_AKHIR,
  SLOT_PX,
} from '../src/lib/dateUtils.ts';
import { susunLayoutKegiatan } from '../src/components/kalender/kalenderLayout.ts';

async function runKalenderTests() {
  console.log('=== STARTING A2 KALENDER VERIFICATION TESTS ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  const baseDir = process.cwd().endsWith('desktop') ? process.cwd() : path.resolve(process.cwd(), 'desktop');

  // 1. Verify existence of all Kalender components
  const requiredFiles = [
    'src/screens/KalenderScreen.tsx',
    'src/components/kalender/KalenderSidebar.tsx',
    'src/components/kalender/KalenderToolbar.tsx',
    'src/components/kalender/KalenderGrid.tsx',
    'src/components/kalender/KalenderMonthView.tsx',
    'src/components/kalender/KalenderEmptyState.tsx',
    'src/components/kalender/kalenderLayout.ts',
    'src/components/kalender/useKalenderState.ts',
    'src/lib/dateUtils.ts',
  ];

  for (const relPath of requiredFiles) {
    const fullPath = path.resolve(baseDir, relPath);
    assert(fs.existsSync(fullPath), `Required component exists: ${relPath}`);
  }

  // 2. Verify Date Utilities
  const rabu16Sep = toDate('2026-09-16');
  const senin14Sep = getMonday(rabu16Sep);
  assert(toIso(senin14Sep) === '2026-09-14', `Monday of 2026-09-16 is 2026-09-14 (got ${toIso(senin14Sep)})`);
  assert(formatRentangMinggu(senin14Sep) === '14 – 20 Sep 2026', `Week range formatted: "14 – 20 Sep 2026" (got "${formatRentangMinggu(senin14Sep)}")`);
  assert(formatTanggalHari(rabu16Sep) === 'Rabu, 16 September 2026', `Day formatted: "Rabu, 16 September 2026" (got "${formatTanggalHari(rabu16Sep)}")`);
  assert(formatBulanTahun(rabu16Sep) === 'September 2026', `Month formatted: "September 2026" (got "${formatBulanTahun(rabu16Sep)}")`);
  assert(menit('07:00') === 420, '07:00 converts to 420 minutes');
  assert(menit('11:30') === 690, '11:30 converts to 690 minutes');

  // 3. Verify Real Seed Data Integration for Calendar
  repositories.simulasi.updateConfig({ latencyMs: 0, errorType: 'none' });

  const weekEvents = await repositories.kegiatan.getKalender({
    rentangMulai: '2026-09-14',
    rentangSelesai: '2026-09-20',
    tampilkanDibatalkan: true,
  });

  assert(weekEvents.length > 0, `Calendar events returned for week 14-20 Sep 2026: ${weekEvents.length} events`);

  // Verify that events have server-computed fields
  const sampleEvent = weekEvents[0];
  assert(sampleEvent.status !== undefined, `Event has computed status: ${sampleEvent.status}`);
  assert(sampleEvent.namaRuangan !== undefined, `Event has computed namaRuangan: ${sampleEvent.namaRuangan}`);
  assert(sampleEvent.namaJenis !== undefined, `Event has computed namaJenis: ${sampleEvent.namaJenis}`);

  // 4. Test Event Layout Positioning Algorithm (susunLayoutKegiatan)
  // Create mock overlapping events for test
  const mockOverlapping = [
    {
      id: 'test_1',
      nama: 'KBM Matematika',
      jenis: 'J1',
      tanggal: '2026-09-16',
      mulai: '08:00',
      selesai: '09:30',
      ruangan: 'R1',
      subjek: [],
      siswa: ['S1', 'S2'],
      catatan: '',
      status: 'terjadwal',
      statusRaw: 'terjadwal',
      aksiDiizinkan: ['lihat_detail'],
      tempat: 'T1',
      namaTempat: 'Gedung A',
      namaRuangan: 'Ruang 101',
      namaJenis: 'KBM Reguler',
      warnaJenis: 'pembelajaran',
      jumlahSiswa: 2,
    },
    {
      id: 'test_2',
      nama: 'KBM Bahasa Inggris',
      jenis: 'J1',
      tanggal: '2026-09-16',
      mulai: '08:30',
      selesai: '10:00',
      ruangan: 'R2',
      subjek: [],
      siswa: ['S3'],
      catatan: '',
      status: 'terjadwal',
      statusRaw: 'terjadwal',
      aksiDiizinkan: ['lihat_detail'],
      tempat: 'T1',
      namaTempat: 'Gedung A',
      namaRuangan: 'Ruang 102',
      namaJenis: 'KBM Reguler',
      warnaJenis: 'pembelajaran',
      jumlahSiswa: 1,
    },
  ];

  const layoutResult = susunLayoutKegiatan(mockOverlapping, '2026-09-16', 7, JAM_AWAL, JAM_AKHIR);
  assert(layoutResult.length === 2, `2 overlapping events laid out`);
  assert(layoutResult[0].width === 50 && layoutResult[1].width === 50, `Overlapping events split width 50%/50%`);
  assert(layoutResult[0].left === 0 && layoutResult[1].left === 50, `Overlapping events positioned left 0% and 50%`);
  // Top for 08:00 is (8 - 7) * 36 = 36px
  assert(layoutResult[0].top === 36, `08:00 start top position is 36px (got ${layoutResult[0].top}px)`);

  // 5. Test Dense Overflow / "+N lainnya"
  // Create 4 overlapping events in a column track that can only fit 2 tracks
  const mockDense = [
    { ...mockOverlapping[0], id: 'd1', mulai: '09:00', selesai: '11:00' },
    { ...mockOverlapping[1], id: 'd2', mulai: '09:00', selesai: '11:00' },
    { ...mockOverlapping[0], id: 'd3', mulai: '09:00', selesai: '11:00' },
    { ...mockOverlapping[1], id: 'd4', mulai: '09:00', selesai: '11:00' },
  ];

  // In 7-column week view with narrow column (e.g. 150px), maxJalur = 1 or 2
  const denseResult = susunLayoutKegiatan(mockDense, '2026-09-16', 7, JAM_AWAL, JAM_AKHIR, 1200);
  const hasMoreGroup = denseResult.some((x) => x.lebih === true);
  assert(hasMoreGroup, `Dense overlapping events produce "+N lainnya" group button`);
  const moreItem = denseResult.find((x) => x.lebih === true);
  assert(moreItem?.lebihN > 0, `"+N lainnya" displays overflow count: +${moreItem?.lebihN}`);

  // 6. Verify App.tsx Routes
  const appContent = fs.readFileSync(path.resolve(baseDir, 'src/App.tsx'), 'utf-8');
  assert(appContent.includes('<Route path="/kalender" element={<KalenderScreen />} />'), 'App.tsx mounts KalenderScreen on /kalender');

  console.log(`\n=== KALENDER TEST RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runKalenderTests();
