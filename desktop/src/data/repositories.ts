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
  IAuthRepository,
  ISimulasiRepository,
} from './interfaces';

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
  MockAuthRepository,
  MockSimulasiRepository,
} from './mock';

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
  auth: IAuthRepository;
  simulasi: ISimulasiRepository;
}

// Development & Prototyping: Mock Repositories
export const repositories: RepositoryContainer = {
  kegiatan: new MockKegiatanRepository(),
  realisasi: new MockRealisasiRepository(),
  matriks: new MockMatriksRepository(),
  siswa: new MockSiswaRepository(),
  subjek: new MockSubjekRepository(),
  kelas: new MockKelasRepository(),
  mapel: new MockMapelRepository(),
  tempat: new MockTempatRepository(),
  jenisKegiatan: new MockJenisKegiatanRepository(),
  auth: new MockAuthRepository(),
  simulasi: new MockSimulasiRepository(),
};
