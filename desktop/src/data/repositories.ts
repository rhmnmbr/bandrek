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
  IAuditRepository,
  ISimulasiRepository,
} from './interfaces/index.ts';

import {
  MockSimulasiRepository,
} from './mock';
import { HttpAuthRepository } from './http/repositories/HttpAuthRepository';
import { HttpSiswaRepository } from './http/repositories/HttpSiswaRepository';
import { HttpSubjekRepository } from './http/repositories/HttpSubjekRepository';
import { HttpKelasRepository } from './http/repositories/HttpKelasRepository';
import { HttpMapelRepository } from './http/repositories/HttpMapelRepository';
import { HttpTempatRepository } from './http/repositories/HttpTempatRepository';
import { HttpJenisKegiatanRepository } from './http/repositories/HttpJenisKegiatanRepository';
import { HttpKegiatanRepository } from './http/repositories/HttpKegiatanRepository';
import { HttpRealisasiRepository } from './http/repositories/HttpRealisasiRepository';
import { HttpMatriksRepository } from './http/repositories/HttpMatriksRepository';
import { HttpAuditRepository } from './http/repositories/HttpAuditRepository';

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
  audit: IAuditRepository;
  simulasi: ISimulasiRepository;
}

// Repositories container
export const repositories: RepositoryContainer = {
  kegiatan: new HttpKegiatanRepository(),
  realisasi: new HttpRealisasiRepository(),
  matriks: new HttpMatriksRepository(),
  siswa: new HttpSiswaRepository(),
  subjek: new HttpSubjekRepository(),
  kelas: new HttpKelasRepository(),
  mapel: new HttpMapelRepository(),
  tempat: new HttpTempatRepository(),
  jenisKegiatan: new HttpJenisKegiatanRepository(),
  auth: new HttpAuthRepository(),
  audit: new HttpAuditRepository(),
  simulasi: new MockSimulasiRepository(),
};
