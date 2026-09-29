// ==========================================
// AUTH & PENGGUNA (DOMAIN.md §13, ARCHITECTURE.md D8)
// ==========================================

export type PeranUser = 'admin' | 'operator';

export interface User {
  id: string;
  username: string;
  nama: string;
  peran: PeranUser;
  aktif: boolean;
  dibuatPada?: string;
}

export interface AuthSession {
  token: string;
  user: User;
  serverUrl: string;
  loginAt: string;
}

export interface LoginCredentials {
  serverUrl: string;
  username: string;
  password: string;
}

export interface CreateUserInput {
  username: string;
  nama: string;
  password: string;
  peran: PeranUser;
}

export interface UpdateUserInput {
  nama?: string;
  password?: string;
  peran?: PeranUser;
  aktif?: boolean;
}
