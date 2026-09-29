import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { repositories } from '../repositories';
import type { LoginCredentials, CreateUserInput, UpdateUserInput } from '../types/auth';

export const authKeys = {
  session: ['auth', 'session'] as const,
  users: ['auth', 'users'] as const,
};

export function useAuthSession() {
  return useQuery({
    queryKey: authKeys.session,
    queryFn: () => repositories.auth.getCurrentSession(),
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => repositories.auth.login(credentials),
    onSuccess: (session) => {
      queryClient.setQueryData(authKeys.session, session);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => repositories.auth.logout(),
    onSuccess: () => {
      queryClient.setQueryData(authKeys.session, null);
      queryClient.clear();
    },
  });
}

export function useUsersList() {
  return useQuery({
    queryKey: authKeys.users,
    queryFn: () => repositories.auth.getUsers(),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) => repositories.auth.createUser(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.users });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      repositories.auth.updateUser(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.users });
    },
  });
}
