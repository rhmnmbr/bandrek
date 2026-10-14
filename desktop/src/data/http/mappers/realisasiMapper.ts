import type {
  Realisasi,
  SimpanRealisasiInput,
  StatusKehadiran,
  KetuntasanMateri,
} from '../../types/realisasi';
import type {
  RealizationDto,
  SaveRealizationRequest,
} from '../../api/generated/models';

export function mapRealizationDtoToRealisasi(dto: RealizationDto): Realisasi {
  return {
    mulai: dto.startTime,
    selesai: dto.endTime,
    materi: dto.actualTopicId ?? null,
    ketuntasan: (dto.completionStatus as KetuntasanMateri) ?? null,
    catatan: dto.notes ?? '',
    kehadiran: (dto.studentAttendances as Record<string, StatusKehadiran>) || {},
    catatanSiswa: dto.studentNotes || {},
    kehadiranSubjek: (dto.subjectAttendances as Record<string, StatusKehadiran>) || {},
    catatanSubjek: dto.subjectNotes || {},
    diisiOleh: dto.recordedBy,
    diisiPada: dto.recordedAt,
  };
}

export function mapSimpanRealisasiInputToRequest(
  input: SimpanRealisasiInput
): SaveRealizationRequest {
  return {
    startTime: input.mulai,
    endTime: input.selesai,
    actualTopicId: input.materi ?? null,
    completionStatus: input.ketuntasan ?? null,
    notes: input.catatan ?? null,
    studentAttendances: input.kehadiranSiswa || {},
    studentNotes: input.catatanSiswa || {},
    subjectAttendances: input.kehadiranSubjek || {},
    subjectNotes: input.catatanSubjek || {},
    recordedBy: input.diisiOleh || 'Operator',
  };
}
