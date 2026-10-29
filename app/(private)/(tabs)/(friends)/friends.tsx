import { useMemo, useState } from 'react'
import { View, FlatList, RefreshControl } from 'react-native'
import { Link, Stack } from 'expo-router'

import { useAuthUser } from '@/lib/auth-context'
import { useGetFriendRequestsQuery, useGetFriendsQuery, type Friend } from '@/services/friends'

import {
  ChevronRightIcon,
  ContactIcon,
  EllipsisIcon,
  SearchIcon,
  UserMinusIcon,
  UserPlusIcon,
} from 'lucide-react-native'

import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Empty } from '@/components/ui/empty'
import { InitialsAvatar } from '@/components/ui/initials-avatar'
import { ListRow } from '@/components/ui/list-row'
import { SectionLabel } from '@/components/ui/section-label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { HeaderIconButton } from '@/components/header-icon-button'
import { headerRightOptions } from '@/components/header-button'
import RemoveFriendDialog from '@/components/friend/remove-friend-dialog'

export default function FriendsScreen() {
  const user = useAuthUser()
  const { data, isRefetching, refetch } = useGetFriendsQuery()
  const { data: requests } = useGetFriendRequestsQuery()
  const [query, setQuery] = useState('')
  const [removing, setRemoving] = useState<Friend | null>(null)

  const incomingCount = requests?.filter(r => r.receiverId === user.id).length ?? 0

  const friends = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return data ?? []
    return (data ?? []).filter(
      f => f.name.toLowerCase().includes(q) || f.email.toLowerCase().includes(q)
    )
  }, [data, query])

  return (
    <>
      <Stack.Screen
        options={headerRightOptions(
          <HeaderIconButton href='/friends/add' icon={UserPlusIcon} label='Add friend' />
        )}
      />
      <FlatList
        // Lets iOS collapse the large title and keep content clear of the tab bar
        contentInsetAdjustmentBehavior='automatic'
        className='flex-1'
        data={friends}
        keyExtractor={f => f.id}
        contentContainerClassName='px-4 pb-8'
        keyboardShouldPersistTaps='handled'
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />
        }
        ListHeaderComponent={
          <View className='gap-4 pt-2 pb-2'>
            <View>
              <Input
                value={query}
                onChangeText={setQuery}
                placeholder='Search by name or email'
                accessibilityLabel='Search friends'
                autoCapitalize='none'
                autoCorrect={false}
                clearButtonMode='while-editing'
                className='h-12 pl-11'
              />
              {/* Drawn after the input so it sits on top of the field's background */}
              <View
                pointerEvents='none'
                className='absolute inset-y-0 left-0 w-11 items-center justify-center'
              >
                <Icon as={SearchIcon} className='text-muted-foreground size-5' />
              </View>
            </View>
            <Link asChild href='/friends/requests'>
              <ListRow
                className='bg-primary/10 border-primary/30 rounded-xl border px-3.5'
                title='Friend requests'
                subtitle={
                  incomingCount ? `${incomingCount} waiting for you` : 'Review who wants to connect'
                }
                accessibilityLabel={`Friend requests${incomingCount ? `, ${incomingCount} waiting` : ''}`}
                leading={
                  <View className='bg-primary size-9 items-center justify-center rounded-[10px]'>
                    <Icon as={UserPlusIcon} className='text-primary-foreground size-5' />
                  </View>
                }
                trailing={
                  <View className='flex-row items-center gap-2'>
                    {incomingCount > 0 && (
                      <View className='bg-primary h-6 min-w-6 items-center justify-center rounded-full px-1.5'>
                        <Text className='text-primary-foreground text-xs font-semibold'>
                          {incomingCount > 9 ? '9+' : incomingCount}
                        </Text>
                      </View>
                    )}
                    <Icon as={ChevronRightIcon} className='text-muted-foreground size-5' />
                  </View>
                }
              />
            </Link>
            {!!data?.length && (
              <SectionLabel>
                {query ? `${friends.length} of ${data.length}` : `${data.length}`} friend
                {data.length === 1 ? '' : 's'}
              </SectionLabel>
            )}
          </View>
        }
        ListEmptyComponent={
          query ? (
            <Text className='text-muted-foreground py-8 text-center'>
              No friends match “{query}”
            </Text>
          ) : (
            <Empty
              title='No friends yet'
              icon={ContactIcon}
              description='Find people by name or email and send them a request.'
            />
          )
        }
        renderItem={({ item }) => (
          <ListRow
            title={item.name}
            subtitle={item.email}
            leading={<InitialsAvatar name={item.name} className='size-11' />}
            trailing={
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size='icon'
                    variant='ghost'
                    accessibilityLabel={`More options for ${item.name}`}
                  >
                    <Icon as={EllipsisIcon} className='text-muted-foreground' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem variant='destructive' onPress={() => setRemoving(item)}>
                    <Icon as={UserMinusIcon} className='text-destructive size-4' />
                    <Text>Remove friend</Text>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            }
          />
        )}
        ItemSeparatorComponent={() => <View className='bg-border h-px' />}
      />
      {removing && (
        <RemoveFriendDialog
          friend={removing}
          open
          onOpenChange={open => {
            if (!open) setRemoving(null)
          }}
        />
      )}
    </>
  )
}
