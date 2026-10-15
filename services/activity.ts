import { useInfiniteQuery } from '@tanstack/react-query'

import { api } from '@/lib/api' // your configured axios instance

import type { User } from '@/lib/auth'
import type { Group, Transaction } from '@/types/group'

export type AcitivityLog = {
  id: string
  action: ActivityAction
  createdAt: Date
  user: User
  userId: string
  targetUser: User | null
  targetUserId: string | null
  group: Group | null
  groupId: string | null
  transaction: Transaction | null
  transactionId: string | null
  snapshot: Snapshot | null
}

type Snapshot = {
  group?: Group
  transaction?: Transaction
}

export enum ActivityAction {
  USER_REGISTERED = 'USER_REGISTERED',
  USER_UPDATED_PROFILE = 'USER_UPDATED_PROFILE',
  USER_CHANGED_PASSWORD = 'USER_CHANGED_PASSWORD',
  FRIENDSHIP_REQUEST_SENT = 'FRIENDSHIP_REQUEST_SENT',
  FRIENDSHIP_REQUEST_ACCEPTED = 'FRIENDSHIP_REQUEST_ACCEPTED',
  FRIENDSHIP_REQUEST_REJECTED = 'FRIENDSHIP_REQUEST_REJECTED',
  FRIENDSHIP_REQUEST_CANCELLED = 'FRIENDSHIP_REQUEST_CANCELLED',
  FRIENDSHIP_REMOVED = 'FRIENDSHIP_REMOVED',
  GROUP_CREATED = 'GROUP_CREATED',
  GROUP_UPDATED = 'GROUP_UPDATED',
  GROUP_DELETED = 'GROUP_DELETED',
  GROUP_MEMBER_JOINED = 'GROUP_MEMBER_JOINED',
  GROUP_MEMBER_LEFT = 'GROUP_MEMBER_LEFT',
  GROUP_MEMBER_REMOVED = 'GROUP_MEMBER_REMOVED',
  GROUP_INVITATION_SENT = 'GROUP_INVITATION_SENT',
  GROUP_INVITATION_ACCEPTED = 'GROUP_INVITATION_ACCEPTED',
  GROUP_INVITATION_REJECTED = 'GROUP_INVITATION_REJECTED',
  TRANSACTION_CREATED = 'TRANSACTION_CREATED',
  TRANSACTION_UPDATED = 'TRANSACTION_UPDATED',
  TRANSACTION_DELETED = 'TRANSACTION_DELETED',
  TRANSACTION_SETTLED = 'TRANSACTION_SETTLED',
}

export interface ActivitiesResponse {
  data: AcitivityLog[]
  pagination: { page: number; totalPages: number }
}

export const getActivities = async (page: number) => {
  // adjust the path to match your backend route
  const { data } = await api.get<ActivitiesResponse>('/activity-logs', {
    params: { page },
  })
  return data
}

export const useActivities = () =>
  useInfiniteQuery({
    queryKey: ['activities'],
    queryFn: ({ pageParam }) => getActivities(pageParam),
    initialPageParam: 1,
    getNextPageParam: ({ pagination }) =>
      pagination.page < pagination.totalPages ? pagination.page + 1 : undefined,
  })
