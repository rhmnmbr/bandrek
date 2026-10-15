import type {
  IKegiatanRepository,
  IRealisasiRepository,
  IMatriksRepository,
  ISiswaRepository,
  ISubjekRepository,
  IKelasRepository,
  IMapelRepository,
  ITempatRepository,
  IJenisKegiatanRepository,
  IJenjangRepository,
  IAuthRepository,
  IAuditRepository,
  ISimulasiRepository,
} from './interfaces/index.ts';

import {
  MockKegiatanRepository,
  MockRealisasiRepository,
  MockMatriksRepository,
  MockSiswaRepository,
  MockSubjekRepository,
  MockKelasRepository,
  MockMapelRepository,
  MockTempatRepository,
  MockJenisKegiatanRepository,
  MockJenjangRepository,
  MockAuthRepository,
  MockAuditRepository,
  MockSimulasiRepository,
} from './mock';

import {
  HttpAuthRepository,
  HttpSiswaRepository,
  HttpSubjekRepository,
  HttpKelasRepository,
  HttpMapelRepository,
  HttpTempatRepository,
  HttpJenisKegiatanRepository,
  HttpJenjangRepository,
  HttpKegiatanRepository,
  HttpRealisasiRepository,
  HttpMatriksRepository,
  HttpAuditRepository,
} from './http';

export interface RepositoryContainer {
  kegiatan: IKegiatanRepository;
  realisasi: IRealisasiRepository;
  matriks: IMatriksRepository;
  siswa: ISiswaRepository;
  subjek: ISubjekRepository;
  kelas: IKelasRepository;
  mapel: IMapelRepository;
  tempat: ITempatRepository;
  jenisKegiatan: IJenisKegiatanRepository;
  jenjang: IJenjangRepository;
  auth: IAuthRepository;
  audit: IAuditRepository;
  simulasi: ISimulasiRepository;
}

const DATA_SOURCE_KEY = 'bandrek:data-source';

export function getDataSource(): 'http' | 'mock' {
  if (typeof window === 'undefined') return 'http';
  return (localStorage.getItem(DATA_SOURCE_KEY) as 'http' | 'mock') || 'http';
}

export function setDataSource(source: 'http' | 'mock'): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(DATA_SOURCE_KEY, source);
    window.location.reload();
  }
}

export function createRepositories(
  source: 'http' | 'mock' = getDataSource()
): RepositoryContainer {
  if (source === 'mock') {
    return {
      kegiatan: new MockKegiatanRepository(),
      realisasi: new MockRealisasiRepository(),
      matriks: new MockMatriksRepository(),
      siswa: new MockSiswaRepository(),
      subjek: new MockSubjekRepository(),
      kelas: new MockKelasRepository(),
      mapel: new MockMapelRepository(),
      tempat: new MockTempatRepository(),
      jenisKegiatan: new MockJenisKegiatanRepository(),
      jenjang: new MockJenjangRepository(),
      auth: new MockAuthRepository(),
      audit: new MockAuditRepository(),
      simulasi: new MockSimulasiRepository(),
    };
  }

  return {
    kegiatan: new HttpKegiatanRepository(),
    realisasi: new HttpRealisasiRepository(),
    matriks: new HttpMatriksRepository(),
    siswa: new HttpSiswaRepository(),
    subjek: new HttpSubjekRepository(),
    kelas: new HttpKelasRepository(),
    mapel: new HttpMapelRepository(),
    tempat: new HttpTempatRepository(),
    jenisKegiatan: new HttpJenisKegiatanRepository(),
    jenjang: new HttpJenjangRepository(),
    auth: new HttpAuthRepository(),
    audit: new HttpAuditRepository(),
    simulasi: new MockSimulasiRepository(),
  };
}

// Repositories container instance (defaults to HTTP)
export const repositories: RepositoryContainer = createRepositories();
