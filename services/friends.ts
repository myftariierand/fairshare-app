import { api } from '@/lib/api'
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import type { GroupInviteStatus } from '@/types/common'
import type { User } from '@/lib/auth'
import type { SearchResult } from '@/services/users'

export type Friend = {
  id: string
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
  requestId: string
  invitations: [
    {
      status: GroupInviteStatus
      groupId: string
      groupName: string
    },
  ]
}

export async function getFriends() {
  const { data } = await api.get<Friend[]>(`/friends`)
  return data
}

export const useGetFriendsQuery = () => {
  return useQuery({
    queryKey: ['friends'],
    queryFn: getFriends,
  })
}

export async function removeFriend(id: string) {
  const { data } = await api.delete<Friend[]>(`/friends/requests/${id}/unfriend`)
  return data
}

export const useRemoveFriendMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: removeFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
    },
  })
}

export async function sendRequest(id: string) {
  const { data } = await api.post<SearchResult[]>(`/friends/requests/${id}`)
  return data
}

export const useSendFriendRequestMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export enum FriendRequestStatus {
  PENDING,
  ACCEPTED,
  REJECTED,
}

type FriendRequest = {
  id: string
  status: FriendRequestStatus
  createdAt: string
  updatedAt: string
  senderId: string
  receiverId: string
  receiver: User
  sender: User
}

export async function getFriendRequest() {
  const { data } = await api.get<FriendRequest[]>(`/friends/requests`)
  return data
}

export const useGetFriendRequestsQuery = () => {
  return useQuery({
    queryKey: ['requests'],
    queryFn: getFriendRequest,
  })
}

export async function acceptFriendRequest(id: string) {
  const { data } = await api.patch<FriendRequest[]>(`/friends/requests/${id}/accept`)
  return data
}

export const useAcceptFriendRequestMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
      queryClient.invalidateQueries({ queryKey: ['requests'] })
    },
  })
}

export async function rejectFriendRequest(id: string) {
  const { data } = await api.patch<FriendRequest[]>(`/friends/requests/${id}/reject`)
  return data
}

export const useRejectFriendRequestMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: rejectFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
    },
  })
}

export async function cancelFriendRequest(id: string) {
  const { data } = await api.delete<FriendRequest[]>(`/friends/requests/${id}/cancel`)
  return data
}

export const useCancelFriendRequestMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
    },
  })
}
