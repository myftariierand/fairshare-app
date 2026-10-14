// lib/token-storage.ts
import * as SecureStore from 'expo-secure-store'

const ACCESS = 'accessToken'
const REFRESH = 'refreshToken'

export const tokenStorage = {
  getAccess: () => SecureStore.getItemAsync(ACCESS),
  getRefresh: () => SecureStore.getItemAsync(REFRESH),
  async set({ accessToken, refreshToken }: { accessToken: string; refreshToken?: string }) {
    await SecureStore.setItemAsync(ACCESS, accessToken)
    if (refreshToken) await SecureStore.setItemAsync(REFRESH, refreshToken)
  },
  async clear() {
    await SecureStore.deleteItemAsync(ACCESS)
    await SecureStore.deleteItemAsync(REFRESH)
  },
}
