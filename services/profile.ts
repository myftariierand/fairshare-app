import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api'

import type { Profile } from '@/types/common'

async function getProfile() {
  const { data } = await api.get<Profile>('/auth/profile')
  return data
}

export const profileKeys = {
  all: ['profile'] as const,
}

export const profileQueryOptions = queryOptions({
  queryKey: profileKeys.all,
  queryFn: getProfile,
})

// 1. Reactive hook: use this in components
export const useGetProfileQuery = () => useQuery(profileQueryOptions)

// 2. Imperative helper: use this in event handlers
export const useRefetchProfile = () => {
  const queryClient = useQueryClient()

  return () =>
    queryClient.query({
      ...profileQueryOptions,
      staleTime: 0, // always hit the network
    })
}

const updateProfile = async (input: { name: string }) => {
  const { data } = await api.post('/auth/update-profile', input)
  return data
}

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProfile,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

const updatePassword = async (input: {
  password: string
  newPassword: string
  confirmPassword: string
}) => {
  const { data } = await api.post('/auth/change-password', input)
  return data
}

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: updatePassword,
  })
}
