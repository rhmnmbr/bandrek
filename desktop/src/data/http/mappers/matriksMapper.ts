import type {
  MatriksBelajarResult,
  MatriksFilterParams,
  CeklisManual,
  TandaiManualInput,
  SelMatriks,
  RingkasanKolomMateri,
  KeadaanSelMatriks,
} from '../../types/matriks';
import type { JenjangPendidikan } from '../../types/common';
import type { StatusKehadiran, KetuntasanMateri } from '../../types/realisasi';
import type {
  LearningMatrixResult,
  GetLearningMatrixParams,
  MarkManualChecklistRequest,
  ManualChecklistDto,
} from '../../api/generated/models';

export function mapLearningMatrixResultToMatriksBelajarResult(
  dto: LearningMatrixResult
): MatriksBelajarResult {
  const kolom = (dto.columns || []).map((c) => ({
    id: c.id || '',
    mapelId: c.courseId || '',
    nama: c.name || '',
    jenjang: (c.educationalLevels as JenjangPendidikan[]) || [],
    urutan: Number(c.orderIndex) || 0,
    terakhirDijadwalkan: c.latestScheduledDate ?? null,
  }));

  const baris = (dto.rows || []).map((r) => ({
    id: r.id || '',
    nama: r.fullName || '',
    jenjang: (r.educationalLevel as JenjangPendidikan) || 'SD',
    aktif: r.isActive ?? true,
    daftarKelasIds: r.classGroupIds || [],
    daftarKelasNama: r.classGroupNames || [],
  }));

  const sel: Record<string, Record<string, SelMatriks>> = {};
  if (dto.cells) {
    for (const [siswaId, studentCells] of Object.entries(dto.cells)) {
      sel[siswaId] = {};
      for (const [materiId, cell] of Object.entries(studentCells)) {
        sel[siswaId][materiId] = {
          siswaId: cell.studentId || siswaId,
          materiId: cell.topicId || materiId,
          keadaan: (cell.state as KeadaanSelMatriks) || 'kosong',
          kegiatanId: cell.activityId ?? undefined,
          tanggal: cell.date ?? null,
          ketuntasan: (cell.completionStatus as KetuntasanMateri) ?? null,
          ceklisManualId: cell.manualChecklistId ?? undefined,
          catatanManual: cell.manualNotes ?? undefined,
          olehManual: cell.manualRecordedBy ?? undefined,
          dicatatManual: cell.manualRecordedAt ?? undefined,
          riwayat: (cell.history || []).map((h) => ({
            kegiatanId: h.activityId || '',
            namaKegiatan: h.activityName || '',
            tanggal: h.date || '',
            kehadiran: (h.attendanceStatus as StatusKehadiran) ?? null,
            ketuntasan: (h.completionStatus as KetuntasanMateri) ?? null,
            realisasiAda: h.hasRealization ?? false,
          })),
        };
      }
    }
  }

  const ringkasanKolom: Record<string, RingkasanKolomMateri> = {};
  if (dto.columnSummaries) {
    for (const [materiId, summary] of Object.entries(dto.columnSummaries)) {
      ringkasanKolom[materiId] = {
        materiId: summary.topicId || materiId,
        menerimaCount: Number(summary.deliveredCount) || 0,
        totalSiswa: Number(summary.totalStudents) || 0,
        persentase: Number(summary.percentage) || 0,
      };
    }
  }

  const totalMateri = kolom.length;
  const minBelum =
    Number(dto.laggingThresholdCount) ||
    (totalMateri > 0 ? Math.max(2, Math.ceil(totalMateri * 0.4)) : 2);

  return {
    mapelId: dto.courseId || '',
    namaMapel: dto.courseName || '',
    kolom,
    baris,
    sel,
    ringkasanKolom,
    siswaTertinggal: (dto.laggingStudents || []).map((s) => ({
      siswaId: s.studentId || '',
      nama: s.fullName || '',
      materiBelumDiterima: Number(s.missingTopicsCount) || 0,
      totalMateri: Number(s.totalTopicsCount) || 0,
      persentaseBelumDiterima: Number(s.missingPercentage) || 0,
    })),
    ambangTertinggal: {
      minBelum,
      totalMateri,
      persen: 40,
    },
    materiPalingTertinggal: dto.mostLaggingTopic
      ? {
          materiId: dto.mostLaggingTopic.topicId || '',
          nama: dto.mostLaggingTopic.name || '',
          belumMenerimaCount: Number(dto.mostLaggingTopic.missingCount) || 0,
          terakhirDijadwalkan: dto.mostLaggingTopic.latestScheduledDate ?? null,
          alasan: dto.mostLaggingTopic.reason || '',
        }
      : null,
    catatanDiLuarJenjang: [],
    menungguRealisasiCount: Number(dto.pendingRealizationCount) || 0,
  };
}

export function mapTandaiManualInputToRequest(
  input: TandaiManualInput
): MarkManualChecklistRequest {
  return {
    studentId: input.siswaId,
    topicId: input.materiId,
    date: input.tanggal ?? null,
    notes: input.catatan ?? null,
    recordedBy: input.oleh || 'Operator',
  };
}

export function mapManualChecklistDtoToCeklisManual(
  dto: ManualChecklistDto
): CeklisManual {
  return {
    id: dto.id,
    siswa: dto.studentId,
    materi: dto.topicId,
    tanggal: dto.date,
    catatan: dto.notes ?? '',
    oleh: dto.recordedBy,
    dicatat: dto.recordedAt,
    sumber: 'manual',
  };
}

export function mapMatriksFilterParamsToGetLearningMatrixParams(
  filter?: MatriksFilterParams
): GetLearningMatrixParams {
  return {
    classGroupId:
      filter?.kelasId && filter.kelasId !== '-' ? filter.kelasId : undefined,
    q: filter?.q?.trim() || undefined,
    showInactive: filter?.tampilkanNonaktif ?? false,
  };
}
