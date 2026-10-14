import type {
  StudentDto,
  StudentProfileData,
  SubjectDto,
  SubjectProfileData,
  ClassGroupDto,
  CourseDto,
  TopicDto,
  PlaceDto,
  RoomDto,
  ActivityTypeDto,
  DeleteResultDto,
} from '../../api/generated/models';
import type {
  Siswa,
  SiswaProfil,
  SiswaKPI,
  SiswaCakupanItem,
  SiswaTerlewatItem,
  SiswaKelasDetail,
  Subjek,
  SubjekProfil,
  SubjekKPI,
  SubjekBebanItem,
  KetersediaanRutinItem,
  PeranSubjek,
  Kelas,
  MataPelajaran,
  Materi,
  Tempat,
  Ruangan,
  JenisKegiatan,
  JenisKegiatanWarna,
  DeleteMasterResult,
} from '../../types/master';
import type { JenjangPendidikan, JenisKelamin } from '../../types/common';

// ==========================================
// SISWA MAPPERS
// ==========================================
export function mapStudentDtoToSiswa(dto: StudentDto): Siswa {
  const classDetails: SiswaKelasDetail[] = (dto.classGroupIds || []).map((id, idx) => ({
    id,
    nama: dto.classGroupNames?.[idx] || id,
  }));

  const activityCount = Number(dto.activityCount) || 0;
  const classCount = Number(dto.classCount) || 0;

  const usageParts = dto.usageDetails || [];
  let ringkasanPenggunaan = 'Belum pernah ikut kegiatan apa pun.';
  if (activityCount > 0) {
    ringkasanPenggunaan = `${activityCount} kegiatan diikuti · ${classCount} kelas`;
  }

  return {
    id: dto.id,
    nama: dto.fullName,
    jenjang: dto.educationalLevel as JenjangPendidikan,
    aktif: dto.isActive,
    lahir: dto.birthDate,
    kelamin: dto.gender as JenisKelamin,
    asal: dto.schoolOrigin ?? undefined,
    waliNama: dto.guardianName ?? undefined,
    waliWa: dto.guardianPhone ?? undefined,
    bergabung: dto.joinedDate ?? undefined,
    catatan: dto.notes ?? undefined,
    daftarKelas: dto.classGroupIds || [],
    daftarKelasDetail: classDetails,
    jumlahKegiatan: activityCount,
    jumlahKelas: classCount,
    dapatDihapus: dto.canDelete,
    alasanTidakBisaHapus: dto.cannotDeleteReason ?? undefined,
    rincianPenggunaan: usageParts,
    ringkasanPenggunaan,
  };
}

export function mapStudentProfileDataToSiswaProfil(data: StudentProfileData): SiswaProfil {
  const studentDto = data.student as StudentDto;
  const siswa = mapStudentDtoToSiswa(studentDto);
  const inisial = (siswa.nama || 'SI')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  const kelasTeks = (studentDto.classGroupNames || []).join(', ') || 'Tanpa kelas';

  const totalActivities = Number(data.totalActivities) || 0;
  const attendanceRate = Number(data.attendanceRate) || 0;
  const presentCount = Number(data.presentCount) || 0;
  const sickCount = Number(data.sickCount) || 0;
  const permittedCount = Number(data.permittedCount) || 0;
  const absentCount = Number(data.absentCount) || 0;

  const kpi: SiswaKPI[] = [
    {
      label: 'Total Kegiatan Diikuti',
      val: String(totalActivities),
      sub: `${presentCount} hadir tepat waktu/terpenuhi`,
      valFg: '#111827',
      subFg: '#4D5962',
      brd: '#E2E8F0',
      bg: '#FFFFFF',
      lblFg: '#64748B',
    },
    {
      label: 'Tingkat Kehadiran',
      val: `${attendanceRate}%`,
      sub: `dari total ${totalActivities} kegiatan`,
      valFg: attendanceRate >= 80 ? '#1B5E20' : attendanceRate >= 60 ? '#8A5200' : '#B71C1C',
      subFg: '#4D5962',
      brd: attendanceRate >= 80 ? '#C8E6C9' : '#FFE0B2',
      bg: attendanceRate >= 80 ? '#F1F8E9' : '#FFF8E1',
      lblFg: '#64748B',
    },
    {
      label: 'Sakit / Izin / Alpa',
      val: `${sickCount} / ${permittedCount} / ${absentCount}`,
      sub: 'rekap akumulasi ketidakhadiran',
      valFg: '#111827',
      subFg: '#4D5962',
      brd: '#E2E8F0',
      bg: '#FFFFFF',
      lblFg: '#64748B',
    },
  ];

  const cakupan: SiswaCakupanItem[] = (data.coverage || []).map((cov) => {
    const delivered = Number(cov.deliveredTopics) || 0;
    const total = Number(cov.totalTopics) || 0;
    const pctVal = Number(cov.percentage) || 0;
    const pct = pctVal / 100;
    return {
      mapelId: cov.courseId || '',
      nama: cov.courseName || '',
      tersampaikan: delivered,
      total,
      frac: `${delivered}/${total}`,
      pct,
      fracFg: pct < 0.6 ? '#8A5200' : '#424242',
      barW: `${pctVal}%`,
      barBg: pct < 0.6 ? '#F0A82E' : '#4CAF50',
    };
  });

  const terlewat: SiswaTerlewatItem[] = (data.missedTopics || []).map((m) => ({
    mapelId: m.courseId || '',
    materiId: m.topicId || '',
    judul: m.topicName || '',
    alasan: m.reason || '',
  }));

  return {
    siswa,
    inisial,
    kelasTeks,
    kpi,
    riwayat: [],
    opsiMapel: (data.coverage || []).map((c) => ({ id: c.courseId || '', nama: c.courseName || '' })),
    cakupan,
    terlewat,
  };
}

// ==========================================
// SUBJEK MAPPERS
// ==========================================
export function mapSubjectDtoToSubjek(dto: SubjectDto): Subjek {
  const ketersediaan: KetersediaanRutinItem[] = (dto.weeklyAvailabilities || []).map((w) => ({
    hari: w.day,
    dari: w.from,
    sampai: w.to,
  }));

  const activityCount = Number(dto.activityCount) || 0;

  let ringkasanPenggunaan = 'Belum pernah bertugas pada kegiatan apa pun.';
  if (activityCount > 0) {
    ringkasanPenggunaan = `${activityCount} kegiatan ditugaskan · ${dto.courseIds?.length || 0} mata pelajaran diampu`;
  }

  return {
    id: dto.id,
    nama: dto.fullName,
    kelamin: dto.gender as JenisKelamin,
    peran: dto.role as PeranSubjek,
    aktif: dto.isActive,
    kontak: dto.contact ?? undefined,
    mapel: dto.courseIds || [],
    ketersediaan,
    jumlahKegiatan: activityCount,
    dapatDihapus: dto.canDelete,
    alasanTidakBisaHapus: dto.cannotDeleteReason ?? undefined,
    rincianPenggunaan: dto.usageDetails || [],
    ringkasanPenggunaan,
  };
}

export function mapSubjectProfileDataToSubjekProfil(data: SubjectProfileData): SubjekProfil {
  const subjectDto = data.subject as SubjectDto;
  const subjek = mapSubjectDtoToSubjek(subjectDto);
  const inisial = (subjek.nama || 'SB')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  const totalActivities = Number(data.totalActivities) || 0;
  const teachingHours = Number(data.teachingHoursThisWeek) || 0;
  const pendingCount = Number(data.pendingRealizationsCount) || 0;

  const kpi: SubjekKPI[] = [
    {
      label: 'Total Kegiatan Diikuti/Ditugaskan',
      val: String(totalActivities),
      valFg: '#111827',
      brd: '#E2E8F0',
      bg: '#FFFFFF',
      lblFg: '#64748B',
      sub: `${totalActivities} sesi tercatat`,
      subFg: '#4D5962',
    },
    {
      label: 'Beban Mengajar Minggu Ini',
      val: `${teachingHours} jam`,
      valFg: '#111827',
      brd: '#E2E8F0',
      bg: '#FFFFFF',
      lblFg: '#64748B',
      sub: 'dari batas nyaman 24 jam/minggu',
      subFg: '#4D5962',
    },
    {
      label: 'Realisasi Tertunda',
      val: String(pendingCount),
      valFg: pendingCount > 0 ? '#C2410C' : '#166534',
      brd: pendingCount > 0 ? '#FFEDD5' : '#DCFCE7',
      bg: pendingCount > 0 ? '#FFF7ED' : '#F0FDF4',
      lblFg: '#64748B',
      sub: pendingCount > 0 ? 'Perlu segera diisi' : 'Semua realisasi beres',
      subFg: pendingCount > 0 ? '#C2410C' : '#166534',
    },
  ];

  const beban: SubjekBebanItem[] = (data.weeklyWorkload || []).map((w) => {
    const n = Number(w.activitiesCount) || 0;
    return {
      label: w.dayName || '',
      jam: w.hours || '0 jam',
      n,
      barW: `${Math.min(100, (n / 6) * 100)}%`,
      barBg: w.exceedsComfortLimit ? '#EA580C' : '#0284C7',
      warn: Boolean(w.exceedsComfortLimit),
      warnTeks: w.exceedsComfortLimit ? 'Melebihi batas harian' : undefined,
    };
  });

  return {
    subjek,
    inisial,
    mapelTeks: (subjek.mapel || []).join(', ') || 'Belum ada mapel diampu',
    kpi,
    bebanJudul: 'Distribusi Beban Mengajar Mingguan',
    batasNyaman: 24,
    beban,
    terdekat: [],
    tertundaCount: pendingCount,
    tertundaJudul: 'Realisasi Tertunda',
    tertundaTeks: `${pendingCount} kegiatan belum diisi realisasinya`,
  };
}

// ==========================================
// KELAS MAPPERS
// ==========================================
export function mapClassGroupDtoToKelas(dto: ClassGroupDto): Kelas {
  const studentCount = typeof dto.studentCount === 'number' ? dto.studentCount : parseInt(dto.studentCount as string, 10) || 0;
  const activityCount = typeof dto.activityCount === 'number' ? dto.activityCount : parseInt(dto.activityCount as string, 10) || 0;

  let ringkasanPenggunaan = 'Belum pernah dipakai pada kegiatan apa pun.';
  if (activityCount > 0) {
    ringkasanPenggunaan = `${activityCount} kegiatan mengikutsertakan kelas ini · ${studentCount} siswa anggota`;
  }

  return {
    id: dto.id,
    nama: dto.name,
    jenjang: (dto.educationalLevel as JenjangPendidikan) ?? undefined,
    keterangan: dto.description ?? undefined,
    anggota: dto.studentIds || [],
    jumlahSiswa: studentCount,
    jumlahKegiatan: activityCount,
    dapatDihapus: dto.canDelete,
    alasanTidakBisaHapus: dto.cannotDeleteReason ?? undefined,
    rincianPenggunaan: dto.usageDetails || [],
    ringkasanPenggunaan,
  };
}

// ==========================================
// MAPEL & MATERI MAPPERS
// ==========================================
export function mapCourseDtoToMataPelajaran(dto: CourseDto): MataPelajaran {
  const topicCount = typeof dto.topicCount === 'number' ? dto.topicCount : parseInt(dto.topicCount as string, 10) || 0;
  const activityCount = typeof dto.activityCount === 'number' ? dto.activityCount : parseInt(dto.activityCount as string, 10) || 0;

  let ringkasanPenggunaan = 'Belum pernah dipakai pada kegiatan apa pun.';
  if (activityCount > 0 || topicCount > 0) {
    ringkasanPenggunaan = `${topicCount} materi kurikulum · ${activityCount} kegiatan terkait`;
  }

  const materiList: Materi[] = (dto.topics || []).map(mapTopicDtoToMateri);

  return {
    id: dto.id,
    nama: dto.name,
    aktif: dto.isActive,
    jumlahMateri: topicCount,
    jumlahKegiatan: activityCount,
    dapatDihapus: dto.canDelete,
    alasanTidakBisaHapus: dto.cannotDeleteReason ?? undefined,
    rincianPenggunaan: dto.usageDetails || [],
    ringkasanPenggunaan,
    materi: materiList,
  };
}

export function mapTopicDtoToMateri(dto: TopicDto): Materi {
  const activityCount = typeof dto.activityCount === 'number' ? dto.activityCount : parseInt(dto.activityCount as string, 10) || 0;
  const orderIndex = typeof dto.orderIndex === 'number' ? dto.orderIndex : parseInt(dto.orderIndex as string, 10) || 0;

  return {
    id: dto.id,
    mapel: dto.courseId,
    nama: dto.name,
    jenjang: (dto.educationalLevels as JenjangPendidikan[]) || [],
    aktif: dto.isActive,
    urutan: orderIndex,
    jumlahKegiatan: activityCount,
    dapatDihapus: dto.canDelete,
    alasanTidakBisaHapus: dto.cannotDeleteReason ?? undefined,
    ringkasanPenggunaan: activityCount > 0 ? `${activityCount} kegiatan telah menjadwalkan materi ini` : 'Belum pernah dijadwalkan',
  };
}

// ==========================================
// TEMPAT & RUANGAN MAPPERS
// ==========================================
export function mapPlaceDtoToTempat(dto: PlaceDto): Tempat {
  const roomsCount = typeof dto.roomCount === 'number' ? dto.roomCount : parseInt(dto.roomCount as string, 10) || 0;
  const activityCount = (dto.rooms || []).reduce(
    (acc, r) => acc + (typeof r.activityCount === 'number' ? r.activityCount : parseInt(r.activityCount as string, 10) || 0),
    0
  );

  const ruanganList: Ruangan[] = (dto.rooms || []).map(mapRoomDtoToRuangan);

  return {
    id: dto.id,
    nama: dto.name,
    jumlahRuangan: roomsCount,
    jumlahKegiatan: activityCount,
    dapatDihapus: dto.canDelete,
    alasanTidakBisaHapus: dto.cannotDeleteReason ?? undefined,
    rincianPenggunaan: dto.usageDetails || [],
    ringkasanPenggunaan: activityCount > 0 ? `${roomsCount} ruangan · ${activityCount} kegiatan berlangsung` : `${roomsCount} ruangan`,
    ruangan: ruanganList,
  };
}

export function mapRoomDtoToRuangan(dto: RoomDto): Ruangan {
  const activityCount = typeof dto.activityCount === 'number' ? dto.activityCount : parseInt(dto.activityCount as string, 10) || 0;
  const capacity = typeof dto.capacity === 'number' ? dto.capacity : dto.capacity ? parseInt(dto.capacity as string, 10) : undefined;

  return {
    id: dto.id,
    tempat: dto.placeId,
    nama: dto.name,
    kapasitas: capacity,
    jumlahKegiatan: activityCount,
    dapatDihapus: dto.canDelete,
    alasanTidakBisaHapus: dto.cannotDeleteReason ?? undefined,
    ringkasanPenggunaan: activityCount > 0 ? `${activityCount} kegiatan memakai ruangan ini` : 'Belum pernah dipakai',
  };
}

// ==========================================
// JENIS KEGIATAN MAPPERS
// ==========================================
export function mapActivityTypeDtoToJenisKegiatan(dto: ActivityTypeDto): JenisKegiatan {
  const activityCount = typeof dto.activityCount === 'number' ? dto.activityCount : parseInt(dto.activityCount as string, 10) || 0;

  return {
    id: dto.id,
    nama: dto.name,
    warna: (dto.color as JenisKegiatanWarna) || 'pembelajaran',
    materiWajib: dto.requiresTopic,
    siswaWajib: dto.requiresStudents,
    jumlahKegiatan: activityCount,
    dapatDihapus: dto.canDelete,
    alasanTidakBisaHapus: dto.cannotDeleteReason ?? undefined,
    rincianPenggunaan: dto.usageDetails || [],
    ringkasanPenggunaan: activityCount > 0 ? `${activityCount} kegiatan memakai jenis ini` : 'Belum pernah dipakai',
  };
}

// ==========================================
// DELETE RESULT MAPPER
// ==========================================
export function mapDeleteResultDto(dto: DeleteResultDto): DeleteMasterResult {
  const usageCount = typeof dto.usageCount === 'number' ? dto.usageCount : parseInt(dto.usageCount as string, 10) || 0;
  return {
    bisaDihapus: dto.success,
    alasanTidakBisa: dto.message ?? undefined,
    jumlahPenggunaan: usageCount,
    rincianPenggunaan: dto.usageDetails || [],
  };
}
