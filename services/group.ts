import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'

import { api } from '@/lib/api'

import { GroupInviteStatus } from '@/types/common'
import { Group } from '@/types/group'
import { User } from '@/lib/auth'

// '/groups/invites'

export type GroupInvite = {
  id: string
  status: GroupInviteStatus
  groupId: string
  senderId: string
  receiverId: string
  group: Group
  sender: User
  createdAt: Date
  updatedAt: Date
}

export async function getGroupInvites({ status }: { status: GroupInviteStatus }) {
  const { data } = await api.get<GroupInvite[]>('/groups/invites', { params: { status } })
  return data
}

export const useGetGroupInvitesQuery = ({ status }: { status: GroupInviteStatus }) => {
  return useQuery({
    queryKey: ['group-invites', status],
    queryFn: () => getGroupInvites({ status }),
  })
}

export async function acceptGroupInvite({
  groupId,
  inviteId,
}: {
  groupId: string
  inviteId: string
}) {
  const { data } = await api.post<GroupInvite>(`/groups/${groupId}/invite/${inviteId}/accept`)
  return data
}

export const useAcceptGroupInviteMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: acceptGroupInvite,
    onSuccess: ({ status }) => {
      queryClient.invalidateQueries({ queryKey: ['group-invites', status] })
    },
  })
}

export async function rejectGroupInvite({ inviteId }: { inviteId: string }) {
  const { data } = await api.post<GroupInvite>(`/groups/invite/${inviteId}/reject`)
  return data
}

export const useRejectGroupInviteMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: rejectGroupInvite,
    onSuccess: ({ status }) => {
      queryClient.invalidateQueries({ queryKey: ['group-invites', status] })
    },
  })
}
