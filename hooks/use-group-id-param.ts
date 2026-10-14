import { useLocalSearchParams } from 'expo-router'

export function useGroupIdParam() {
  return useLocalSearchParams<{ groupId: string }>()
}
