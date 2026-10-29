import { View } from 'react-native'
import {
  User,
  UserLock,
  UserCog,
  Users,
  GitPullRequestArrow,
  GitPullRequestClosed,
  GitPullRequest,
  UserSearch,
  GitPullRequestDraft,
  UserPlus,
  ReceiptText,
  Handshake,
  UserMinus,
  Trash2,
  type LucideIcon,
} from 'lucide-react-native'

import { ActivityAction } from '@/services/activity'
import { cn } from '@/lib/utils'

import { Text } from '@/components/ui/text'
import { IconTile } from '@/components/ui/icon-tile'

import type { AcitivityLog } from '@/services/activity'
import type { User as AuthUser } from '@/lib/auth'

// How each activity log reads: icon, sentence and filter kind. Shared by the
// Activity tab and the recent activity on Home.
export type Part = { text: string; muted?: boolean }
export type Kind = 'expense' | 'payment' | 'group' | 'account'
type Tone = 'default' | 'payment' | 'member' | 'danger'
export type LogConfig = { icon: LucideIcon; parts: Part[]; kind: Kind; tone: Tone }

const TONE_CLASSES: Record<Tone, { tile: string; icon: string }> = {
  default: { tile: '', icon: '' },
  payment: { tile: 'bg-owed/10', icon: 'text-owed' },
  member: { tile: 'bg-tint-2', icon: 'text-tint-2-foreground' },
  danger: { tile: 'bg-destructive/10', icon: 'text-destructive' },
}

// muted connective text vs. emphasized names
export const m = (text: string): Part => ({ text, muted: true })
export const b = (text?: string): Part => ({ text: text ?? '' })

export const getLogConfig = (activity: AcitivityLog, currentUserId?: string): LogConfig | null => {
  const group = activity.snapshot?.group
  const transaction = activity.snapshot?.transaction
  const who = (u?: AuthUser | null) => (u?.id === currentUserId ? 'You' : u?.name)

  switch (activity.action) {
    case ActivityAction.USER_REGISTERED:
      return {
        icon: User,
        kind: 'account',
        tone: 'default',
        parts: [b('You registered to FairShare')],
      }
    case ActivityAction.USER_CHANGED_PASSWORD:
      return {
        icon: UserLock,
        kind: 'account',
        tone: 'default',
        parts: [b('You changed your password')],
      }
    case ActivityAction.USER_UPDATED_PROFILE:
      return {
        icon: UserCog,
        kind: 'account',
        tone: 'default',
        parts: [b('You updated your profile')],
      }
    case ActivityAction.GROUP_CREATED:
      return {
        icon: Users,
        kind: 'group',
        tone: 'member',
        parts: [m('You created '), b(group?.name)],
      }
    case ActivityAction.FRIENDSHIP_REQUEST_SENT:
      return currentUserId === activity.user.id
        ? {
            icon: GitPullRequestArrow,
            kind: 'group',
            tone: 'member',
            parts: [m('You sent a friend request to '), b(activity.targetUser?.name)],
          }
        : {
            icon: GitPullRequestArrow,
            kind: 'group',
            tone: 'member',
            parts: [m('You received a friend request from '), b(activity.user?.name)],
          }
    case ActivityAction.FRIENDSHIP_REQUEST_CANCELLED:
      return {
        icon: GitPullRequestClosed,
        kind: 'group',
        tone: 'default',
        parts: [m('You cancelled friend request to '), b(activity.user?.name)],
      }
    case ActivityAction.FRIENDSHIP_REQUEST_REJECTED:
      return {
        icon: GitPullRequestDraft,
        kind: 'group',
        tone: 'default',
        parts: [m('You rejected friend request from '), b(activity.targetUser?.name)],
      }
    case ActivityAction.FRIENDSHIP_REQUEST_ACCEPTED:
      return {
        icon: GitPullRequest,
        kind: 'group',
        tone: 'member',
        parts: [b(activity.targetUser?.name), m(' accepted your friend request')],
      }
    case ActivityAction.FRIENDSHIP_REMOVED:
      return {
        icon: GitPullRequest,
        kind: 'group',
        tone: 'default',
        parts: [m('You removed '), b(activity.user?.name), m(' from your friends')],
      }
    case ActivityAction.GROUP_INVITATION_SENT:
      return {
        icon: UserSearch,
        kind: 'group',
        tone: 'member',
        parts: [
          b(who(activity.user)),
          m(' invited '),
          b(who(activity.targetUser)),
          m(' to join '),
          b(group?.name),
        ],
      }
    case ActivityAction.GROUP_INVITATION_REJECTED:
      return {
        icon: UserSearch,
        kind: 'group',
        tone: 'default',
        parts: [b(who(activity.user)), m(' declined the invitation to '), b(group?.name)],
      }
    case ActivityAction.GROUP_INVITATION_ACCEPTED:
      return {
        icon: UserPlus,
        kind: 'group',
        tone: 'member',
        parts: [b(who(activity.user)), m(' accepted the invitation to '), b(group?.name)],
      }
    case ActivityAction.GROUP_UPDATED:
      return {
        icon: Users,
        kind: 'group',
        tone: 'default',
        parts: [b(who(activity.user)), m(' updated '), b(group?.name)],
      }
    case ActivityAction.GROUP_MEMBER_REMOVED:
      return {
        icon: UserMinus,
        kind: 'group',
        tone: 'danger',
        parts: [b(who(activity.targetUser)), m(' removed from '), b(group?.name)],
      }
    case ActivityAction.GROUP_MEMBER_JOINED:
      return {
        icon: UserPlus,
        kind: 'group',
        tone: 'member',
        parts: [b(who(activity.user)), m(' joined '), b(group?.name)],
      }
    case ActivityAction.GROUP_MEMBER_LEFT:
      return {
        icon: UserMinus,
        kind: 'group',
        tone: 'default',
        parts: [b(who(activity.user)), m(' left '), b(group?.name)],
      }
    case ActivityAction.GROUP_DELETED:
      return {
        icon: Trash2,
        kind: 'group',
        tone: 'danger',
        parts: [b(group?.name), m(' was deleted')],
      }
    case ActivityAction.TRANSACTION_CREATED:
      return {
        icon: ReceiptText,
        kind: 'expense',
        tone: 'default',
        parts: [
          b(who(activity.user)),
          m(' added '),
          b(transaction?.description),
          m(' to '),
          b(group?.name),
        ],
      }
    case ActivityAction.TRANSACTION_UPDATED:
      return {
        icon: ReceiptText,
        kind: 'expense',
        tone: 'default',
        parts: [
          b(who(activity.user)),
          m(' updated '),
          b(transaction?.description),
          m(' in '),
          b(group?.name),
        ],
      }
    case ActivityAction.TRANSACTION_DELETED:
      return {
        icon: Trash2,
        kind: 'expense',
        tone: 'danger',
        parts: [
          b(who(activity.user)),
          m(' deleted '),
          b(transaction?.description),
          m(' from '),
          b(group?.name),
        ],
      }
    case ActivityAction.TRANSACTION_SETTLED:
      return {
        icon: Handshake,
        kind: 'payment',
        tone: 'payment',
        parts: [
          b('You '),
          m('and '),
          b(activity.targetUser?.name),
          m(' settled up in '),
          b(group?.name),
        ],
      }
    default:
      return null
  }
}

// One entry: tinted icon tile, the sentence, and a line of detail under it
export function ActivityLine({
  config,
  parts = config.parts,
  meta,
}: {
  config: LogConfig
  parts?: Part[]
  meta: string
}) {
  const tone = TONE_CLASSES[config.tone]

  return (
    <View className='flex-row gap-3 py-2'>
      <IconTile
        as={config.icon}
        className={cn('size-10 rounded-sm', tone.tile)}
        iconClassName={cn('size-5', tone.icon)}
      />
      <View className='flex-1'>
        <Text className='leading-5'>
          {parts.map((part, i) => (
            <Text key={i} className={part.muted ? 'text-muted-foreground' : 'font-semibold'}>
              {part.text}
            </Text>
          ))}
        </Text>
        <Text className='text-muted-foreground mt-0.5 text-sm' numberOfLines={1}>
          {meta}
        </Text>
      </View>
    </View>
  )
}
