import { api } from '@/lib/api';

export type LoginInput = { email: string; password: string };

export type LoginResponse = {
  accessToken: string;
  refreshToken?: string; // adjust to what your backend returns for x-client: mobile
};

export async function login(input: LoginInput) {
  const { data } = await api.post<LoginResponse>('/auth/login', input);
  return data;
}
