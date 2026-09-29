import { INITIAL_SEED, type RawKegiatanSeed } from './seedData';
import type {
  Siswa,
  Subjek,
  Kelas,
  MataPelajaran,
  Materi,
  Tempat,
  Ruangan,
  JenisKegiatan,
} from '../types/master';
import type { CeklisManual } from '../types/matriks';
import type { User, AuthSession } from '../types/auth';

const STORAGE_STORE_KEY = 'bandrek_mock_data_store';

const DEFAULT_USERS: User[] = [
  {
    id: 'u_admin',
    username: 'admin',
    nama: 'Administrator Bandrek',
    peran: 'admin',
    aktif: true,
    dibuatPada: '2026-01-01 08:00',
  },
  {
    id: 'u_op1',
    username: 'operator',
    nama: 'Operator Utama',
    peran: 'operator',
    aktif: true,
    dibuatPada: '2026-01-10 09:00',
  },
];

export class MockDataStore {
  public today: string;
  public now: string;
  public siswa: Siswa[];
  public subjek: Subjek[];
  public kelas: Kelas[];
  public mapel: MataPelajaran[];
  public materi: Materi[];
  public tempat: Tempat[];
  public ruangan: Ruangan[];
  public jenis: JenisKegiatan[];
  public alasanBatal: string[];
  public alasanJadwalUlang: string[];
  public ceklisManual: CeklisManual[];
  public kegiatan: RawKegiatanSeed[];
  public users: User[];
  public session: AuthSession | null;

  constructor() {
    this.today = INITIAL_SEED.today;
    this.now = INITIAL_SEED.now;
    this.siswa = JSON.parse(JSON.stringify(INITIAL_SEED.siswa));
    this.subjek = JSON.parse(JSON.stringify(INITIAL_SEED.subjek));
    this.kelas = JSON.parse(JSON.stringify(INITIAL_SEED.kelas));
    this.mapel = JSON.parse(JSON.stringify(INITIAL_SEED.mapel));
    this.materi = JSON.parse(JSON.stringify(INITIAL_SEED.materi));
    this.tempat = JSON.parse(JSON.stringify(INITIAL_SEED.tempat));
    this.ruangan = JSON.parse(JSON.stringify(INITIAL_SEED.ruangan));
    this.jenis = JSON.parse(JSON.stringify(INITIAL_SEED.jenis));
    this.alasanBatal = [...INITIAL_SEED.alasanBatal];
    this.alasanJadwalUlang = [...INITIAL_SEED.alasanJadwalUlang];
    this.ceklisManual = JSON.parse(JSON.stringify(INITIAL_SEED.ceklisManual));
    this.kegiatan = JSON.parse(JSON.stringify(INITIAL_SEED.kegiatan));
    this.users = [...DEFAULT_USERS];
    this.session = {
      token: 'mock-jwt-token-dev-2026',
      user: DEFAULT_USERS[0],
      serverUrl: 'https://api.bandrek-bimbel.id',
      loginAt: '2026-09-16 08:00',
    };

    this.loadFromStorage();
  }

  public resetToInitial(): void {
    this.today = INITIAL_SEED.today;
    this.now = INITIAL_SEED.now;
    this.siswa = JSON.parse(JSON.stringify(INITIAL_SEED.siswa));
    this.subjek = JSON.parse(JSON.stringify(INITIAL_SEED.subjek));
    this.kelas = JSON.parse(JSON.stringify(INITIAL_SEED.kelas));
    this.mapel = JSON.parse(JSON.stringify(INITIAL_SEED.mapel));
    this.materi = JSON.parse(JSON.stringify(INITIAL_SEED.materi));
    this.tempat = JSON.parse(JSON.stringify(INITIAL_SEED.tempat));
    this.ruangan = JSON.parse(JSON.stringify(INITIAL_SEED.ruangan));
    this.jenis = JSON.parse(JSON.stringify(INITIAL_SEED.jenis));
    this.alasanBatal = [...INITIAL_SEED.alasanBatal];
    this.alasanJadwalUlang = [...INITIAL_SEED.alasanJadwalUlang];
    this.ceklisManual = JSON.parse(JSON.stringify(INITIAL_SEED.ceklisManual));
    this.kegiatan = JSON.parse(JSON.stringify(INITIAL_SEED.kegiatan));
    this.users = [...DEFAULT_USERS];

    try {
      localStorage.removeItem(STORAGE_STORE_KEY);
    } catch {
      // Ignore
    }
  }

  public persist(): void {
    try {
      const payload = {
        today: this.today,
        now: this.now,
        siswa: this.siswa,
        subjek: this.subjek,
        kelas: this.kelas,
        mapel: this.mapel,
        materi: this.materi,
        tempat: this.tempat,
        ruangan: this.ruangan,
        jenis: this.jenis,
        alasanBatal: this.alasanBatal,
        alasanJadwalUlang: this.alasanJadwalUlang,
        ceklisManual: this.ceklisManual,
        kegiatan: this.kegiatan,
        users: this.users,
      };
      localStorage.setItem(STORAGE_STORE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota or disabled errors
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_STORE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.siswa && parsed.kegiatan) {
          this.today = parsed.today || this.today;
          this.now = parsed.now || this.now;
          this.siswa = parsed.siswa;
          this.subjek = parsed.subjek;
          this.kelas = parsed.kelas;
          this.mapel = parsed.mapel;
          this.materi = parsed.materi;
          this.tempat = parsed.tempat;
          this.ruangan = parsed.ruangan;
          this.jenis = parsed.jenis;
          this.alasanBatal = parsed.alasanBatal || this.alasanBatal;
          this.alasanJadwalUlang = parsed.alasanJadwalUlang || this.alasanJadwalUlang;
          this.ceklisManual = parsed.ceklisManual;
          this.kegiatan = parsed.kegiatan;
          if (parsed.users) this.users = parsed.users;
        }
      }
    } catch {
      // Ignore
    }
  }
}

export const mockStore = new MockDataStore();
