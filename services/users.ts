import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'

import type { User } from '@/lib/auth'
import type { FriendRequestStatus } from '@/services/friends'
import type { GroupInviteStatus } from '@/types/common'

export type SearchResult = User & {
  friendshipsReceiver: { status: FriendRequestStatus }[]
  invitationReceiver: { status: GroupInviteStatus }[]
}

export async function searchUser(query: string, groupId?: string) {
  const { data } = await api.get<SearchResult[]>(`/users/search`, { params: { query, groupId } })
  return data
}

export const useSearchUserQuery = (query: string, groupId?: string) => {
  return useQuery({
    queryKey: ['users', query, groupId],
    queryFn: () => searchUser(query, groupId),
    enabled: !!query,
  })
}
