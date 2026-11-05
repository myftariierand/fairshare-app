import { useEffect, useRef } from 'react'
import { ActivityIndicator, Button, View } from 'react-native'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'

import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'

import type { Group } from '@/types/group'

import { Text } from '@/components/ui/text'

export default function JoinGroupScreen() {
  const { token } = useLocalSearchParams<{ token: string }>()
  const { isLoggedIn: isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const qc = useQueryClient()
  const attempted = useRef(false)

  const join = useMutation({
    mutationFn: () => api.post<Group>(`/groups/join/${token}`),
    onSuccess: ({ data: group }) => {
      qc.invalidateQueries({ queryKey: ['groups'] })
      router.replace(`/groups/${group.id}`)
    },
  })

  // Not logged in: remember the invite, then go to login
  useEffect(() => {
    if (!isLoading && !isAuthenticated && token) {
      SecureStore.setItemAsync('pendingJoinToken', token).then(() => router.replace('/login'))
    }
  }, [isLoading, isAuthenticated, token])

  // Logged in: join once automatically
  useEffect(() => {
    if (isAuthenticated && token && !attempted.current) {
      attempted.current = true
      join.mutate()
    }
  }, [isAuthenticated, token])

  if (join.isError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 16 }}>
        <Text style={{ fontSize: 20 }}>Couldn't join the group</Text>
        <Text>The invite link may be invalid, or something went wrong.</Text>
        <Button title='Try again' onPress={() => join.mutate()} />
        <Button title='Go home' onPress={() => router.replace('/')} />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
      <ActivityIndicator />
      <Text>Joining group…</Text>
    </View>
  )
}
