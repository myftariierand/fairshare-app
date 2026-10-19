import { View, FlatList } from 'react-native'
import { Stack } from 'expo-router'
import { useDebounceValue } from 'usehooks-ts'

import { useSearchUserQuery } from '@/services/users'
import { useInviteToGroupMutation } from '@/services/group'

import { useGroupIdParam } from '@/hooks/use-group-id-param'

import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { SendHorizontalIcon } from 'lucide-react-native'

export default function AddFriendScreen() {
  const { groupId } = useGroupIdParam()
  const [debouncedValue, setValue] = useDebounceValue('', 500)

  const { data } = useSearchUserQuery(debouncedValue, groupId)
  const inviteToGroup = useInviteToGroupMutation()

  return (
    <>
      <Stack.Screen
        options={{
          presentation: 'formSheet',
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.9],
        }}
      />
      <View className='p-4'>
        <Text variant={'large'}>INVITE A MEMBER</Text>
        <Text variant={'muted'} className='mb-4'>
          You can search by name or email.
        </Text>
        <Input
          placeholder='Search...'
          autoCapitalize='none'
          autoCorrect={false}
          returnKeyType='search'
          clearButtonMode='while-editing'
          className='mb-5'
          onChangeText={setValue}
        />
        <FlatList
          data={data}
          keyExtractor={u => u.id}
          keyboardShouldPersistTaps='handled'
          keyboardDismissMode='on-drag'
          renderItem={({ item }) => {
            return (
              <View className='flex-row items-center'>
                <Avatar alt={item.name}>
                  <AvatarFallback className='border-border border'>
                    <Text>{item.name.slice(0, 2)}</Text>
                  </AvatarFallback>
                </Avatar>
                <View className='ml-3 flex-1'>
                  <Text className='flex items-center gap-1 font-semibold'>{item.name}</Text>
                  <Text className='text-muted-foreground text-xs'>{item.email}</Text>
                </View>
                {item.invitationReceiver.length ? (
                  <Badge variant='outline'>
                    <Text>{item.invitationReceiver[0].status}</Text>
                  </Badge>
                ) : (
                  <Button
                    size={'icon'}
                    disabled={inviteToGroup.isPending}
                    onPress={() => inviteToGroup.mutate({ groupId, userId: item.id })}
                  >
                    <Icon as={SendHorizontalIcon} />
                  </Button>
                )}
              </View>
            )
          }}
        />
      </View>
    </>
  )
}
