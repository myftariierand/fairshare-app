import { useState } from 'react'
import { ActivityIndicator, FlatList, View } from 'react-native'
import { Stack, router } from 'expo-router'
import { useDebounceValue } from 'usehooks-ts'
import { useCSSVariable } from 'uniwind'
import { toast } from 'sonner-native'

import { useSearchUserQuery, type SearchResult } from '@/services/users'
import { useSendFriendRequestMutation } from '@/services/friends'
import { getErrorMessage } from '@/lib/utils'

import { SearchIcon, UserPlusIcon, UsersIcon, XIcon } from 'lucide-react-native'

import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Empty } from '@/components/ui/empty'
import { InitialsAvatar } from '@/components/ui/initials-avatar'
import { SectionLabel } from '@/components/ui/section-label'
import { Spinner } from '@/components/spinner'

// The API sends the status as a string ('PENDING'); older payloads used the enum index
function requestLabel(status: unknown) {
  switch (String(status).toUpperCase()) {
    case 'ACCEPTED':
    case '1':
      return 'Friends'
    case 'REJECTED':
    case '2':
      return 'Declined'
    default:
      return 'Request sent'
  }
}

export default function AddFriendScreen() {
  const card = useCSSVariable('--color-card') as string
  const [input, setInput] = useState('')
  const [query] = useDebounceValue(input.trim(), 400)

  const { data = [], isFetching } = useSearchUserQuery(query)
  const searching = !!input.trim() && (isFetching || query !== input.trim())

  return (
    <>
      <Stack.Screen
        options={{
          presentation: 'formSheet',
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.9],
          // Same card-colored sheet as group invites
          contentStyle: { backgroundColor: card },
        }}
      />
      <FlatList
        className='bg-card flex-1'
        data={query ? data : []}
        keyExtractor={u => u.id}
        keyboardShouldPersistTaps='handled'
        keyboardDismissMode='on-drag'
        contentContainerClassName='grow px-5 pt-6 pb-10'
        ItemSeparatorComponent={() => <View className='bg-border h-px' />}
        ListHeaderComponent={
          <View className='gap-5 pb-2'>
            <View className='flex-row items-start gap-3'>
              <View className='flex-1'>
                <Text role='heading' className='text-2xl font-bold tracking-tight'>
                  Add a friend
                </Text>
                <Text className='text-muted-foreground mt-1'>
                  Search by name or email, then send a request.
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
                accessibilityLabel='Search people'
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
        renderItem={({ item }) => <PersonRow person={item} />}
        ListEmptyComponent={
          searching ? null : query ? (
            <Empty
              icon={UsersIcon}
              title='No one found'
              description={`Nobody matches “${query}”. Check the spelling or try their email.`}
              containerClassName='grow justify-center'
            />
          ) : (
            <Empty
              icon={UserPlusIcon}
              title='Find your friends'
              description='Type a name or email to see who is on FairShare.'
              containerClassName='grow justify-center'
            />
          )
        }
      />
    </>
  )
}

function PersonRow({ person }: { person: SearchResult }) {
  const sendFriendRequest = useSendFriendRequestMutation()
  const existing = person.friendshipsReceiver[0]

  const handleSend = async () => {
    try {
      await sendFriendRequest.mutateAsync(person.id)
      toast.success(`Request sent to ${person.name.split(' ')[0]}`)
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
            {requestLabel(existing.status)}
          </Text>
        </View>
      ) : (
        <Button
          size='sm'
          className='rounded-full px-4'
          disabled={sendFriendRequest.isPending}
          accessibilityLabel={`Send a friend request to ${person.name}`}
          onPress={handleSend}
        >
          {sendFriendRequest.isPending ? (
            <Spinner />
          ) : (
            <>
              <Icon as={UserPlusIcon} className='size-4' />
              <Text className='text-sm'>Add</Text>
            </>
          )}
        </Button>
      )}
    </View>
  )
}
