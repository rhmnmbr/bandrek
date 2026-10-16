import type {
  Kegiatan,
  StatusKegiatan,
  RawStatusKegiatan,
  AksiKegiatan,
  CekBentrokInput,
  HasilDeteksiBentrok,
  TipeBentrok,
  CreateKegiatanInput,
  UpdateKegiatanInput,
  BatalkanKegiatanInput,
  JadwalUlangKegiatanInput,
  KalenderFilterParams,
  DaftarKegiatanFilterParams,
} from '../../types/kegiatan';
import type { PeranSubjek, JenisKegiatanWarna } from '../../types/master';
import type {
  ActivityDto,
  CreateActivityRequest,
  UpdateActivityRequest,
  CancelActivityRequest,
  RescheduleActivityRequest,
  ConflictCheckRequest,
  ConflictCheckResponse,
  GetCalendarActivitiesParams,
  GetActivityListParams,
} from '../../api/generated/models';
import { mapRealizationDtoToRealisasi } from './realisasiMapper';

export function mapActivityDtoToKegiatan(dto: ActivityDto): Kegiatan {
  return {
    id: dto.id,
    nama: dto.name,
    jenis: dto.activityTypeId || '',
    mapel: dto.courseId,
    materi: dto.topicId,
    kelas: dto.classGroupId,
    tanggal: dto.date,
    tanggalSelesai: dto.endDate ?? undefined,
    mulai: dto.startTime,
    selesai: dto.endTime,
    sepanjangHari: dto.isAllDay,
    ruangan: dto.roomId,
    tempatCustom: dto.customPlace,
    subjek: (dto.subjects || []).map((s) => ({
      id: s.id,
      nama: s.name ?? undefined,
      peran: s.role ? (s.role as PeranSubjek) : '',
    })),
    siswa: dto.studentIds || [],
    catatan: dto.notes || '',

    // Lifecycle & Status
    status: (dto.status as StatusKegiatan) || 'terjadwal',
    statusRaw: (dto.rawStatus as RawStatusKegiatan) || 'terjadwal',
    realisasi: dto.realization ? mapRealizationDtoToRealisasi(dto.realization) : null,
    pembatalan: dto.cancellation
      ? {
          alasan: dto.cancellation.reason,
          keterangan: dto.cancellation.notes || '',
          pada: dto.cancellation.at,
          oleh: dto.cancellation.by ?? undefined,
        }
      : null,
    penjadwalanUlang: dto.reschedule
      ? {
          alasan: dto.reschedule.reason,
          keterangan: dto.reschedule.notes || '',
          pada: dto.reschedule.at,
          oleh: dto.reschedule.by ?? undefined,
        }
      : null,
    jadwalUlangDari: dto.rescheduledFromId,
    jadwalUlangKe: dto.rescheduledToId,

    // Recurring Series
    seriId: dto.seriesId,
    urutanSeri: dto.seriesIndex != null ? Number(dto.seriesIndex) : null,
    totalSeri: dto.totalSeries != null ? Number(dto.totalSeries) : null,

    // Server-computed fields
    aksiDiizinkan: (dto.allowedActions as AksiKegiatan[]) || [],
    tempat: dto.placeId,
    namaTempat: dto.placeName || '',
    namaRuangan: dto.roomName || '',
    namaJenis: dto.activityTypeName || '',
    warnaJenis: (dto.activityTypeColor as JenisKegiatanWarna) || 'lainnya',
    namaMapel: dto.courseName ?? undefined,
    namaMateri: dto.topicName ?? undefined,
    jumlahSiswa: Number(dto.studentCount) || 0,
    pengisiUtama: dto.primaryInstructor
      ? {
          id: dto.primaryInstructor.id,
          nama: dto.primaryInstructor.name,
        }
      : undefined,
    perluRealisasi: dto.needsRealization,
    telatHari: Number(dto.daysLate) || 0,
    labelStatus: dto.statusLabel || '',
  };
}

export function mapCreateKegiatanInputToRequest(
  input: CreateKegiatanInput
): CreateActivityRequest {
  return {
    id: null,
    name: input.nama,
    activityTypeId: input.jenis ? input.jenis : null,
    courseId: input.mapel ?? null,
    topicId: input.materi ?? null,
    classGroupId: input.kelas ?? null,
    date: input.tanggal,
    endDate: input.tanggalSelesai ?? null,
    startTime: input.mulai,
    endTime: input.selesai,
    isAllDay: input.sepanjangHari ?? false,
    roomId: input.ruangan || null,
    customPlace: input.tempatCustom ?? null,
    subjects: (input.subjek || []).map((s) => ({
      id: s.id,
      role: s.peran || null,
      name: null,
    })),
    studentIds: input.siswa || [],
    notes: input.catatan ?? '',
    recurring:
      input.pengulangan && input.pengulangan.aktif
        ? {
            isActive: true,
            frequency: input.pengulangan.frekuensi,
            endType: input.pengulangan.tipeBerakhir,
            totalMeetings: input.pengulangan.totalPertemuan ?? null,
            untilDate: input.pengulangan.sampaiTanggal ?? null,
          }
        : null,
  };
}

export function mapUpdateKegiatanInputToRequest(
  input: UpdateKegiatanInput
): UpdateActivityRequest {
  return {
    name: input.nama ?? null,
    activityTypeId: input.jenis !== undefined ? (input.jenis || null) : null,
    courseId: input.mapel !== undefined ? input.mapel : null,
    topicId: input.materi !== undefined ? input.materi : null,
    classGroupId: input.kelas !== undefined ? input.kelas : null,
    date: input.tanggal ?? null,
    endDate: input.tanggalSelesai !== undefined ? (input.tanggalSelesai || null) : null,
    startTime: input.mulai ?? null,
    endTime: input.selesai ?? null,
    isAllDay: input.sepanjangHari !== undefined ? input.sepanjangHari : null,
    roomId: input.ruangan ?? null,
    customPlace: input.tempatCustom !== undefined ? input.tempatCustom : null,
    subjects: input.subjek
      ? input.subjek.map((s) => ({
          id: s.id,
          role: s.peran || null,
          name: null,
        }))
      : null,
    studentIds: input.siswa ?? null,
    notes: input.catatan !== undefined ? input.catatan : null,
    concurrencyToken: null,
  };
}

export function mapBatalkanKegiatanInputToRequest(
  input: BatalkanKegiatanInput
): CancelActivityRequest {
  return {
    reason: input.alasan,
    notes: input.keterangan ?? null,
    rescheduleAlso: input.sekalianJadwalUlang ?? null,
  };
}

export function mapJadwalUlangKegiatanInputToRequest(
  input: JadwalUlangKegiatanInput
): RescheduleActivityRequest {
  return {
    reason: input.alasan,
    notes: input.keterangan ?? null,
    newDate: input.tanggalBaru,
    newStartTime: input.mulaiBaru,
    newEndTime: input.selesaiBaru,
    newRoomId: input.ruanganBaru ?? null,
    newName: input.namaBaru ?? null,
    newSubjects: input.subjekBaru
      ? input.subjekBaru.map((s) => ({
          id: s.id,
          role: s.peran || null,
          name: null,
        }))
      : null,
    newStudentIds: input.siswaBaru ?? null,
    newNotes: input.catatanBaru ?? null,
  };
}

export function mapCekBentrokInputToRequest(
  input: CekBentrokInput
): ConflictCheckRequest {
  return {
    date: input.tanggal,
    endDate: input.tanggalSelesai ?? null,
    startTime: input.mulai,
    endTime: input.selesai,
    roomId: input.ruangan,
    subjectIds: input.subjek || [],
    studentIds: input.siswa || [],
    excludeActivityId: input.excludeKegiatanId ?? null,
  };
}

export function mapConflictCheckResponseToHasilDeteksiBentrok(
  res: ConflictCheckResponse
): HasilDeteksiBentrok {
  return {
    adaBentrok: res.hasConflict,
    ringkasan: res.summary,
    daftarBentrok: (res.conflicts || []).map((c) => ({
      tipe: (c.type as TipeBentrok) || 'ruangan',
      entitasId: c.entityId,
      entitasNama: c.entityName,
      kegiatanBentrokId: c.conflictingActivityId,
      kegiatanBentrokNama: c.conflictingActivityName,
      mulai: c.startTime,
      selesai: c.endTime,
      keterangan: c.description,
    })),
  };
}

export function mapKalenderFilterParamsToGetCalendarActivitiesParams(
  params: KalenderFilterParams
): GetCalendarActivitiesParams {
  return {
    startDate: params.rentangMulai,
    endDate: params.rentangSelesai,
    activityTypeId:
      params.jenisId && params.jenisId !== 'semua' ? params.jenisId : undefined,
    subjectId:
      params.subjekId && params.subjekId !== 'semua' ? params.subjekId : undefined,
    classGroupId:
      params.kelasId && params.kelasId !== 'semua' ? params.kelasId : undefined,
    roomId:
      params.ruanganId && params.ruanganId !== 'semua'
        ? params.ruanganId
        : undefined,
    status:
      params.status && params.status !== 'semua' ? params.status : undefined,
    showCancelled: params.tampilkanDibatalkan,
  };
}

export function mapDaftarKegiatanFilterParamsToGetActivityListParams(
  params: DaftarKegiatanFilterParams
): GetActivityListParams {
  return {
    startDate: params.tanggalMulai,
    endDate: params.tanggalSelesai,
    activityTypeId:
      params.jenisId && params.jenisId !== 'semua' ? params.jenisId : undefined,
    subjectId:
      params.subjekId && params.subjekId !== 'semua' ? params.subjekId : undefined,
    classGroupId:
      params.kelasId && params.kelasId !== 'semua' ? params.kelasId : undefined,
    status:
      params.status && params.status !== 'semua' ? params.status : undefined,
    onlyPendingRealization: params.hanyaPerluRealisasi,
    quickFilter: params.cepat ?? undefined,
    q: params.q,
    sortDesc: params.sortDesc,
  };
}
