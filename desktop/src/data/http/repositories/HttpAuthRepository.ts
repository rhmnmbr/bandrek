import type { IAuthRepository } from '../../interfaces/IAuthRepository';
import type { AuthSessionResponse, UserDto } from '../../api/generated/models';
import type {
  User,
  AuthSession,
  LoginCredentials,
  CreateUserInput,
  UpdateUserInput,
  ChangePasswordInput,
} from '../../types/auth';
import {
  login,
  logout,
  getCurrentSession,
  getUsers,
  createUser,
  updateUser,
  changePassword,
} from '../../api/generated/endpoints';
import {
  getServerUrl,
  setServerUrl,
  getAuthToken,
  setAuthToken,
} from '../../api/client';
import {
  mapUserDtoToUser,
  mapAuthSessionResponseToAuthSession,
} from '../mappers/authMapper';

export class HttpAuthRepository implements IAuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    if (credentials.serverUrl) {
      setServerUrl(credentials.serverUrl);
    }

    const res = await login({
      username: credentials.username,
      password: credentials.password,
    });

    const data = res.data as AuthSessionResponse;
    if (!data?.token) {
      throw new Error('Gagal masuk ke server.');
    }

    setAuthToken(data.token);
    return mapAuthSessionResponseToAuthSession(data, getServerUrl());
  }

  async logout(): Promise<void> {
    try {
      await logout();
    } catch {
      // Ignore network/server errors during logout
    } finally {
      setAuthToken(null);
    }
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    const token = getAuthToken();
    if (!token) return null;

    try {
      const res = await getCurrentSession();
      if (!res.data) return null;
      const user = mapUserDtoToUser(res.data as UserDto);
      return {
        token,
        user,
        serverUrl: getServerUrl(),
        loginAt: new Date().toISOString(),
      };
    } catch {
      setAuthToken(null);
      return null;
    }
  }

  async getUsers(): Promise<User[]> {
    const res = await getUsers();
    return ((res.data as UserDto[]) || []).map(mapUserDtoToUser);
  }

  async createUser(input: CreateUserInput): Promise<User> {
    const res = await createUser({
      username: input.username,
      fullName: input.nama,
      password: input.password,
      role: input.peran,
    });
    return mapUserDtoToUser(res.data as UserDto);
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<User> {
    const res = await updateUser(id, {
      fullName: input.nama ?? null,
      password: input.password ?? null,
      role: input.peran ?? null,
      isActive: input.aktif ?? null,
    });
    return mapUserDtoToUser(res.data as UserDto);
  }

  async changePassword(input: ChangePasswordInput): Promise<void> {
    await changePassword({
      currentPassword: input.kataSandiLama,
      newPassword: input.kataSandiBaru,
    });
  }
}
