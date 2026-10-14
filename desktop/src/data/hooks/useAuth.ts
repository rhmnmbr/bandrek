import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { repositories } from '../repositories';
import { setAuthToken } from '../api/client';
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
    onMutate: async () => {
      // Cancel active session queries and clear token & session immediately
      await queryClient.cancelQueries({ queryKey: authKeys.session });
      setAuthToken(null);
      queryClient.setQueryData(authKeys.session, null);
    },
    mutationFn: async () => {
      setAuthToken(null);
      queryClient.setQueryData(authKeys.session, null);
      await repositories.auth.logout();
    },
    onSettled: () => {
      setAuthToken(null);
      queryClient.clear();
      queryClient.setQueryData(authKeys.session, null);
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

export function useChangePassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { kataSandiLama: string; kataSandiBaru: string }) =>
      repositories.auth.changePassword(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.session });
    },
  });
}

