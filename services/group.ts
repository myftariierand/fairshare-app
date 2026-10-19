import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'

import { api } from '@/lib/api'

import { GroupInviteStatus } from '@/types/common'
import type { Group, SingleGroup, SingleTransaction } from '@/types/group'
import type { User } from '@/lib/auth'

export async function getGroups() {
  const { data } = await api.get<Group[]>('/groups')
  return data
}

export async function getGroupById(id: string) {
  const { data } = await api.get<SingleGroup>(`/groups/${id}`)
  return data
}

export const useGetGroupById = (groupId: string) => {
  return useQuery({
    queryKey: ['groups', groupId],
    queryFn: () => getGroupById(groupId),
  })
}

export type CreateGroupInput = {
  name: string
  currency: string
  cover: {
    uri: string
    fileName?: string | null
    mimeType?: string | null
    file?: File // present on web
  } | null
}

export async function createGroup({ name, currency, cover }: CreateGroupInput) {
  const formData = new FormData()
  formData.append('name', name)
  formData.append('currency', currency)

  if (cover) {
    const ext = cover.uri.split('.').pop()?.toLowerCase() ?? 'jpg'
    formData.append('cover', {
      uri: cover.uri,
      name: cover.fileName ?? `cover.${ext}`,
      type: cover.mimeType ?? (ext === 'png' ? 'image/png' : 'image/jpeg'),
    } as any)
  }

  const { data } = await api.post<Group>('/groups', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const useCreateGroup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

export async function updateGroup({
  id,
  name,
  currency,
  cover,
}: { id: string } & CreateGroupInput) {
  const formData = new FormData()
  formData.append('name', name)
  formData.append('currency', currency)

  if (cover) {
    const ext = cover.uri.split('.').pop()?.toLowerCase() ?? 'jpg'
    formData.append('cover', {
      uri: cover.uri,
      name: cover.fileName ?? `cover.${ext}`,
      type: cover.mimeType ?? (ext === 'png' ? 'image/png' : 'image/jpeg'),
    } as any)
  }

  const { data } = await api.patch<Group>(`/groups/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const useUpdateGroup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateGroup,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['groups', id] })
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

export async function deleteGroup(id: string) {
  const { data } = await api.delete(`/groups/${id}`)
  return data
}

export const useDeleteGroup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteGroup,
    onSuccess: async (_, id) => {
      queryClient.removeQueries({ queryKey: ['groups', id] })
      await queryClient.invalidateQueries({ queryKey: ['groups'], exact: true })
    },
  })
}

type SettleUpInput = {
  groupId: string
  amount: number
  description: string
  paidBy: string
}

export async function settleUp(input: SettleUpInput) {
  const { data } = await api.post('/transactions/settle', input)
  return data
}

export const useSettleUp = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: settleUp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

type RemoveMemberInput = {
  groupId: string
  memberId: string
}

export async function removeMember({ groupId, memberId }: RemoveMemberInput) {
  const { data } = await api.delete(`/groups/${groupId}/remove/${memberId}`)
  return data
}

export const useRemoveMember = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: removeMember,
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] })
    },
  })
}

export async function getExpenseById(id: string) {
  const { data } = await api.get<SingleTransaction>(`/transactions/single/${id}`)
  return data
}

export const useGetExpenseById = (id: string) => {
  return useQuery({
    queryKey: ['expenses', id],
    queryFn: () => getExpenseById(id),
  })
}

type CreateExpenseInput = {
  groupId: string
  amount: number
  description: string
  paidBy: string
  splits: { userId: string; amount: number }[]
}

export async function createExpense(input: CreateExpenseInput) {
  const { data } = await api.post('/transactions', input)
  return data
}

export const useCreateExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createExpense,
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] })
    },
  })
}

type UpdateExpenseInput = { id: string } & CreateExpenseInput

export async function updateExpense({ id, ...rest }: UpdateExpenseInput) {
  const { data } = await api.patch(`/transactions/${id}`, rest)
  return data
}

export const useUpdateExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateExpense,
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] })
    },
  })
}

export async function deleteExpense(id: string) {
  const { data } = await api.delete(`/transactions/${id}`)
  return data
}

export const useDeleteExpense = () => {
  return useMutation({
    mutationFn: deleteExpense,
  })
}

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

export async function inviteToGroup({ groupId, userId }: { groupId: string; userId: string }) {
  const { data } = await api.post(`/groups/${groupId}/invite/${userId}`)
  return data
}

export const useInviteToGroupMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: inviteToGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
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
