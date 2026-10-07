import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import axios from 'axios';

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

export async function signInWithGoogle() {
  try {
    await GoogleSignin.hasPlayServices();
    const res = await GoogleSignin.signIn();
    const idToken = res.data?.idToken;
    if (!idToken) throw new Error('No ID token');

    const { data } = await api.post<{ accessToken: string; refreshToken: string }>(
      `/auth/google/mobile`,
      { idToken }
    );

    return data;
  } catch (e: any) {
    if (e.code === statusCodes.SIGN_IN_CANCELLED) return null;
    if (axios.isAxiosError(e)) {
      throw new Error(e.response?.data?.message ?? 'Backend rejected Google login');
    }
    throw e;
  }
}
