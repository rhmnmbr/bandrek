import type { UserDto, AuthSessionResponse } from '../../api/generated/models';
import type { User, AuthSession, PeranUser } from '../../types/auth';

export function mapUserDtoToUser(dto: UserDto): User {
  return {
    id: dto.id,
    username: dto.username,
    nama: dto.fullName,
    peran: (dto.role?.toLowerCase() === 'admin' ? 'admin' : 'operator') as PeranUser,
    aktif: dto.isActive,
    dibuatPada: dto.createdAt,
  };
}

export function mapAuthSessionResponseToAuthSession(
  res: AuthSessionResponse,
  serverUrl: string
): AuthSession {
  return {
    token: res.token,
    user: mapUserDtoToUser(res.user),
    serverUrl,
    loginAt: new Date().toISOString(),
  };
}
