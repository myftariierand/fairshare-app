import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import axios from 'axios';

import { api } from '@/lib/api';

export type LoginInput = { email: string; password: string };

export type User = {
  name: string;
  id: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
  provider: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export async function login(input: LoginInput) {
  const { data } = await api.post<AuthResponse>('/auth/login', input);
  return data;
}

export async function signInWithGoogle() {
  try {
    await GoogleSignin.hasPlayServices();
    await GoogleSignin.signOut();
    const res = await GoogleSignin.signIn();
    const idToken = res.data?.idToken;
    if (!idToken) throw new Error('No ID token');

    const { data } = await api.post<AuthResponse>(`/auth/google/mobile`, { idToken });

    return data;
  } catch (e: any) {
    if (e.code === statusCodes.SIGN_IN_CANCELLED) return null;
    if (axios.isAxiosError(e)) {
      throw new Error(e.response?.data?.message ?? 'Backend rejected Google login');
    }
    throw e;
  }
}

export type SignUpInput = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export async function signUp(input: SignUpInput) {
  const { data } = await api.post<AuthResponse>(`/auth/register`, input);
  return data;
}

export async function getProfile() {
  const { data } = await api.get<User>('/auth/profile');
  return data;
}

export async function verifyOtp(input: { otp: string; email: string }) {
  const { data } = await api.post<{ verified: boolean }>(`/auth/verify-email/verify`, input);
  return data;
}

export async function resendOtp(input: { email: string }) {
  const { data } = await api.post(`/auth/verify-email/send`, input);
  return data;
}

export async function forgotPassword(input: { email: string }) {
  const { data } = await api.post(`/auth/forgot-password`, input);
  return data;
}
