import type { IAuthRepository } from '../interfaces/IAuthRepository';
import type {
  User,
  AuthSession,
  LoginCredentials,
  CreateUserInput,
  UpdateUserInput,
  ChangePasswordInput,
} from '../types/auth';
import { BandrekApiError } from '../types/simulasi';
import { mockRunner } from './mockRunner';
import { mockStore } from './mockStore';

export class MockAuthRepository implements IAuthRepository {
  public async login(credentials: LoginCredentials): Promise<AuthSession> {
    return mockRunner(
      () => {
        const { username, password, serverUrl } = credentials;
        const user = mockStore.users.find(
          (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.aktif
        );

        if (!user || password.length === 0) {
          throw new BandrekApiError('unknown', 'Nama pengguna atau kata sandi tidak valid.', 401);
        }

        const expectedPassword = user.password || 'password';
        if (password !== expectedPassword && password !== 'password') {
          throw new BandrekApiError('unknown', 'Nama pengguna atau kata sandi tidak valid.', 401);
        }

        const session: AuthSession = {
          token: `jwt_token_${user.id}_${Date.now()}`,
          user,
          serverUrl: serverUrl || 'https://api.bandrek-bimbel.id',
          loginAt: `${mockStore.today} ${mockStore.now}`,
        };

        mockStore.session = session;
        return session;
      },
      { isMutation: true }
    );
  }

  public async logout(): Promise<void> {
    mockStore.session = null;
    return mockRunner(
      () => {
        mockStore.session = null;
      },
      { isMutation: true }
    );
  }

  public async getCurrentSession(): Promise<AuthSession | null> {
    return mockRunner(() => mockStore.session);
  }

  public async getUsers(): Promise<User[]> {
    return mockRunner(() => [...mockStore.users]);
  }

  public async createUser(input: CreateUserInput): Promise<User> {
    return mockRunner(
      () => {
        const existing = mockStore.users.find(
          (u) => u.username.toLowerCase() === input.username.trim().toLowerCase()
        );
        if (existing) {
          throw new BandrekApiError('unknown', `Nama pengguna "${input.username}" sudah digunakan.`, 409);
        }

        const newUser: User = {
          id: `u_${Date.now()}`,
          username: input.username.trim().toLowerCase(),
          nama: input.nama,
          peran: input.peran,
          aktif: true,
          dibuatPada: `${mockStore.today} ${mockStore.now}`,
          password: input.password,
        };

        mockStore.users.push(newUser);
        return newUser;
      },
      { isMutation: true }
    );
  }

  public async updateUser(id: string, input: UpdateUserInput): Promise<User> {
    return mockRunner(
      () => {
        const idx = mockStore.users.findIndex((u) => u.id === id);
        if (idx === -1) {
          throw new BandrekApiError('unknown', `Pengguna dengan ID "${id}" tidak ditemukan.`, 404);
        }

        const existing = mockStore.users[idx];
        const updated: User = {
          ...existing,
          nama: input.nama ?? existing.nama,
          peran: input.peran ?? existing.peran,
          aktif: input.aktif !== undefined ? input.aktif : existing.aktif,
          password: input.password ?? existing.password,
        };

        mockStore.users[idx] = updated;
        return updated;
      },
      { isMutation: true }
    );
  }

  public async changePassword(input: ChangePasswordInput): Promise<void> {
    return mockRunner(
      () => {
        const session = mockStore.session;
        if (!session || !session.user) {
          throw new BandrekApiError('unknown', 'Sesi tidak valid. Silakan masuk kembali.', 401);
        }

        const user = mockStore.users.find((u) => u.id === session.user.id);
        if (!user) {
          throw new BandrekApiError('unknown', 'Pengguna tidak ditemukan.', 404);
        }

        const currentExpected = user.password || 'password';
        if (
          input.kataSandiLama !== currentExpected &&
          input.kataSandiLama !== 'password'
        ) {
          throw new BandrekApiError('unknown', 'Kata sandi saat ini tidak sesuai.', 400);
        }

        if (!input.kataSandiBaru || input.kataSandiBaru.length < 4) {
          throw new BandrekApiError('unknown', 'Kata sandi baru minimal 4 karakter.', 400);
        }

        user.password = input.kataSandiBaru;
      },
      { isMutation: true }
    );
  }
}
