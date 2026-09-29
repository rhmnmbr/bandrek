import { repositories } from '../src/data/repositories';
import { BandrekApiError } from '../src/data/types/simulasi';

async function runTests() {
  console.log('=== STARTING DATA LAYER TESTS ===\n');
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

  try {
    // 0. Set latency to 0ms for fast tests
    repositories.simulasi.updateConfig({ latencyMs: 0, errorType: 'none' });

    // 1. Siswa Repository (Default status = 'aktif' per DOMAIN.md B1)
    const activeSiswaDefault = await repositories.siswa.getAll();
    assert(activeSiswaDefault.length === 70, `Default getAll() returns active siswa (70), got ${activeSiswaDefault.length}`);
    const allSiswa = await repositories.siswa.getAll({ status: 'semua' });
    assert(allSiswa.length === 80, `Seed Siswa with status='semua' should be 80, got ${allSiswa.length}`);
    const nonaktifSiswa = await repositories.siswa.getAll({ status: 'nonaktif' });
    assert(nonaktifSiswa.length === 10, `Nonaktif siswa count should be 10, got ${nonaktifSiswa.length}`);

    // 2. Kegiatan Repository & Derived Status
    const kalenderKegiatan = await repositories.kegiatan.getKalender({
      rentangMulai: '2026-08-01',
      rentangSelesai: '2026-10-31',
      tampilkanDibatalkan: true,
    });
    assert(kalenderKegiatan.length === 133, `Kalender activities loaded: 133, got ${kalenderKegiatan.length}`);

    // Verify derived status computation
    const pastUnrealized = kalenderKegiatan.find(k => k.id === 'e04');
    assert(pastUnrealized?.status === 'belum_direalisasi', `e04 should have derived status 'belum_direalisasi', got '${pastUnrealized?.status}'`);
    assert(
      pastUnrealized?.aksiDiizinkan.includes('isi_realisasi') && pastUnrealized?.aksiDiizinkan.includes('edit'),
      `e04 allowed actions should include 'isi_realisasi' and 'edit'`
    );

    const pastRealized = kalenderKegiatan.find(k => k.id === 'e01');
    assert(pastRealized?.status === 'terealisasi', `e01 should have status 'terealisasi', got '${pastRealized?.status}'`);
    assert(
      pastRealized?.aksiDiizinkan.includes('ubah_realisasi') && !pastRealized?.aksiDiizinkan.includes('edit'),
      `e01 allowed actions should have 'ubah_realisasi' and hide 'edit'`
    );

    const cancelled = kalenderKegiatan.find(k => k.id === 'e03');
    assert(cancelled?.status === 'dibatalkan', `e03 should have status 'dibatalkan', got '${cancelled?.status}'`);
    assert(
      cancelled?.aksiDiizinkan.length === 1 && cancelled?.aksiDiizinkan[0] === 'lihat_detail',
      `Cancelled activity should only have 'lihat_detail' action`
    );

    // 3. Perlu Realisasi Count
    const perluCount = await repositories.realisasi.getPerluRealisasiCount();
    assert(perluCount > 0, `Perlu realisasi count should be > 0 (got ${perluCount})`);

    // 4. Deteksi Bentrok Jadwal
    // Activity e01 is on 2026-08-05, 15:00 - 16:30, Ruangan R1, Subjek U4 & U10, Siswa S2
    const bentrokRes = await repositories.kegiatan.cekBentrok({
      tanggal: '2026-08-05',
      mulai: '15:30',
      selesai: '17:00',
      ruangan: 'R1',
      subjek: ['U4'],
      siswa: ['S2'],
    });
    assert(bentrokRes.adaBentrok === true, `Schedule conflict should be detected for overlapping time, room, subject, and student`);
    assert(bentrokRes.daftarBentrok.some(b => b.tipe === 'ruangan'), `Room conflict should be reported`);
    assert(bentrokRes.daftarBentrok.some(b => b.tipe === 'subjek'), `Subject conflict should be reported`);
    assert(bentrokRes.daftarBentrok.some(b => b.tipe === 'siswa'), `Student conflict should be reported`);

    // 5. Matriks Belajar
    const matriksSD = await repositories.matriks.getMatriks('M1', 'SD');
    assert(matriksSD.kolom.length > 0, `Matriks SD should have topic columns (got ${matriksSD.kolom.length})`);
    assert(matriksSD.baris.length > 0, `Matriks SD should have student rows (got ${matriksSD.baris.length})`);
    assert(matriksSD.ambangTertinggal.minBelum >= 2, `Ambang batas siswa tertinggal should be >= 2`);
    assert(Object.keys(matriksSD.sel).length === matriksSD.baris.length, `Matrix grid has cells for every student`);

    // 6. Manual Checklist Mutation
    const cm = await repositories.matriks.tandaiManual({
      siswaId: 'S1',
      materiId: 'T1',
      tanggal: '2026-09-15',
      catatan: 'Test checklist manual',
      oleh: 'Operator Test',
    });
    assert(cm.id.length > 0, `Manual checklist should be saved with ID ${cm.id}`);
    const matriksUpdated = await repositories.matriks.getMatriks('M1', 'SD');
    assert(
      matriksUpdated.sel['S1']['T1'].keadaan === 'tersampaikan' || matriksUpdated.sel['S1']['T1'].keadaan === 'selesai_manual',
      `Cell S1-T1 should be finished or manual (got ${matriksUpdated.sel['S1']['T1'].keadaan})`
    );

    // 7. Master Data Delete Protection
    const deleteUsedSubjek = await repositories.subjek.delete('U4'); // U4 is heavily used
    assert(!deleteUsedSubjek.bisaDihapus, `Subjek U4 cannot be deleted because it is used in activities`);
    assert(deleteUsedSubjek.jumlahPenggunaan > 0, `Usage details returned: ${deleteUsedSubjek.alasanTidakBisa}`);

    // 8. Error Injection Simulation
    repositories.simulasi.updateConfig({ errorType: 'offline' });
    try {
      await repositories.siswa.getAll();
      assert(false, `Expected offline error to be thrown`);
    } catch (err) {
      assert(err instanceof BandrekApiError && err.code === 'offline', `Offline error caught properly: ${err.message}`);
    }

    repositories.simulasi.updateConfig({ errorType: 'unauthorized' });
    try {
      await repositories.siswa.getAll();
      assert(false, `Expected 401 unauthorized error to be thrown`);
    } catch (err) {
      assert(err instanceof BandrekApiError && err.code === 'unauthorized', `Unauthorized error caught properly (401)`);
    }

    repositories.simulasi.updateConfig({ errorType: 'concurrency_conflict' });
    try {
      await repositories.siswa.update('S1', { nama: 'Test Concurrency' });
      assert(false, `Expected 409 conflict error to be thrown`);
    } catch (err) {
      assert(err instanceof BandrekApiError && err.code === 'concurrency_conflict', `Concurrency conflict caught properly (409)`);
    }

    // Reset error injection
    repositories.simulasi.updateConfig({ errorType: 'none' });

    // 9. Reset seed data
    repositories.simulasi.resetToInitialSeed();
    const siswaAfterReset = await repositories.siswa.getAll({ status: 'semua' });
    assert(siswaAfterReset.length === 80, `Data successfully reset to initial seed (80 siswa)`);

  } catch (error) {
    console.error('Unexpected test error:', error);
    failed++;
  }

  console.log(`\n=== TEST RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
