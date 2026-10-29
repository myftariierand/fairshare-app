import { useState } from 'react'
import { ActivityIndicator, FlatList, View } from 'react-native'
import { Stack, router } from 'expo-router'
import { useDebounceValue } from 'usehooks-ts'
import { useCSSVariable } from 'uniwind'
import { toast } from 'sonner-native'

import { useSearchUserQuery, type SearchResult } from '@/services/users'
import { useGetGroupById, useInviteToGroupMutation } from '@/services/group'
import { useGroupIdParam } from '@/hooks/use-group-id-param'
import { getErrorMessage } from '@/lib/utils'
import { useFullSheetTopInset } from '@/hooks/use-full-sheet-top-inset'

import { SearchIcon, SendIcon, UserPlusIcon, UsersIcon, XIcon } from 'lucide-react-native'

import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Empty } from '@/components/ui/empty'
import { InitialsAvatar } from '@/components/ui/initials-avatar'
import { SectionLabel } from '@/components/ui/section-label'
import { Spinner } from '@/components/spinner'

function inviteLabel(status: unknown) {
  switch (String(status).toUpperCase()) {
    case 'ACCEPTED':
      return 'Member'
    case 'REJECTED':
      return 'Declined'
    default:
      return 'Invited'
  }
}

export default function InviteMemberScreen() {
  const { groupId } = useGroupIdParam()
  const { data: group } = useGetGroupById(groupId)
  const card = useCSSVariable('--color-card') as string
  const topInset = useFullSheetTopInset()
  const [input, setInput] = useState('')
  const [query] = useDebounceValue(input.trim(), 400)

  const { data = [], isFetching } = useSearchUserQuery(query, groupId)
  const searching = !!input.trim() && (isFetching || query !== input.trim())

  return (
    <>
      <Stack.Screen
        options={{
          presentation: 'formSheet',
          sheetGrabberVisible: true,
          // Full height, like Add friend: iOS stretches a shorter custom detent when the keyboard opens
          sheetAllowedDetents: [1],
          contentStyle: { backgroundColor: card },
        }}
      />
      <FlatList
        className='bg-card flex-1'
        data={query ? data : []}
        keyExtractor={u => u.id}
        keyboardShouldPersistTaps='handled'
        keyboardDismissMode='on-drag'
        contentContainerClassName='grow px-5 pb-10'
        contentContainerStyle={{ paddingTop: topInset + 24 }}
        ItemSeparatorComponent={() => <View className='bg-border h-px' />}
        ListHeaderComponent={
          <View className='gap-5 pb-2'>
            <View className='flex-row items-start gap-3'>
              <View className='flex-1'>
                <Text role='heading' className='text-2xl font-bold tracking-tight'>
                  Invite to {group?.name ?? 'group'}
                </Text>
                <Text className='text-muted-foreground mt-1'>
                  Search by name or email. They'll get an invite to join.
                </Text>
              </View>
              <Button
                size='icon'
                variant='outline'
                accessibilityLabel='Close'
                onPress={() => router.back()}
              >
                <Icon as={XIcon} className='size-5' />
              </Button>
            </View>

            <View>
              <Input
                value={input}
                onChangeText={setInput}
                placeholder='Name or email'
                accessibilityLabel='Search people to invite'
                autoFocus
                autoCapitalize='none'
                autoCorrect={false}
                returnKeyType='search'
                clearButtonMode='while-editing'
                className='bg-secondary h-12 pl-11'
              />
              <View
                pointerEvents='none'
                className='absolute inset-y-0 left-0 w-11 items-center justify-center'
              >
                {searching ? (
                  <ActivityIndicator size='small' />
                ) : (
                  <Icon as={SearchIcon} className='text-muted-foreground size-5' />
                )}
              </View>
            </View>

            {!!query && data.length > 0 && (
              <SectionLabel>
                {data.length} result{data.length === 1 ? '' : 's'}
              </SectionLabel>
            )}
          </View>
        }
        renderItem={({ item }) => <PersonRow person={item} groupId={groupId} />}
        ListEmptyComponent={
          searching ? undefined : query ? (
            <Empty
              icon={UsersIcon}
              title='No one found'
              description={`Nobody matches “${query}”. Check the spelling or try their email.`}
              containerClassName='grow justify-center'
            />
          ) : (
            <Empty
              icon={UserPlusIcon}
              title='Invite someone'
              description='Type a name or email to find people on FairShare.'
              containerClassName='grow justify-center'
            />
          )
        }
      />
    </>
  )
}

function PersonRow({ person, groupId }: { person: SearchResult; groupId: string }) {
  const inviteToGroup = useInviteToGroupMutation()
  const existing = person.invitationReceiver[0]

  const handleInvite = async () => {
    try {
      await inviteToGroup.mutateAsync({ groupId, userId: person.id })
      toast.success(`Invite sent to ${person.name.split(' ')[0]}`)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <View className='min-h-16 flex-row items-center gap-3 py-2'>
      <InitialsAvatar name={person.name} className='size-11' />
      <View className='flex-1'>
        <Text className='font-semibold' numberOfLines={1}>
          {person.name}
        </Text>
        <Text className='text-muted-foreground text-sm' numberOfLines={1}>
          {person.email}
        </Text>
      </View>
      {existing ? (
        <View className='bg-secondary rounded-full px-3 py-1.5'>
          <Text className='text-muted-foreground text-xs font-semibold'>
            {inviteLabel(existing.status)}
          </Text>
        </View>
      ) : (
        <Button
          size='sm'
          className='rounded-full px-4'
          disabled={inviteToGroup.isPending}
          accessibilityLabel={`Invite ${person.name} to the group`}
          onPress={handleInvite}
        >
          {inviteToGroup.isPending ? (
            <Spinner />
          ) : (
            <>
              <Icon as={SendIcon} className='size-4' />
              <Text className='text-sm'>Invite</Text>
            </>
          )}
        </Button>
      )}
    </View>
  )
}
