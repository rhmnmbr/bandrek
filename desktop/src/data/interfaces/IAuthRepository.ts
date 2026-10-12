import type {
  User,
  AuthSession,
  LoginCredentials,
  CreateUserInput,
  UpdateUserInput,
  ChangePasswordInput,
} from '../types/auth';

export interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<AuthSession>;
  logout(): Promise<void>;
  getCurrentSession(): Promise<AuthSession | null>;
  getUsers(): Promise<User[]>;
  createUser(input: CreateUserInput): Promise<User>;
  updateUser(id: string, input: UpdateUserInput): Promise<User>;
  changePassword(input: ChangePasswordInput): Promise<void>;
}
