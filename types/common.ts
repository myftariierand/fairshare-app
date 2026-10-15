export enum GroupInviteStatus {
  pending = 'PENDING',
  accepted = 'ACCEPTED',
  rejected = 'REJECTED',
}

import type { Group as RootGroup, Transaction, Member } from '@/types/group'
import type { User } from '@/lib/auth'
import type { Friend } from '@/services/friends'

export interface Group extends RootGroup {
  transactions: (Transaction & {
    paidById: string
    group: { currency: string }
  })[]
  members: Member[]
}

export interface Profile extends User {
  groups: Group[]
  friends: Friend[]
}
