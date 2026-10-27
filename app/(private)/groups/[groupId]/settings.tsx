import { View } from 'react-native'
import { Stack } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'

import { useGetGroupById } from '@/services/group'
import { useGroupIdParam } from '@/hooks/use-group-id-param'
import { useAuthUser } from '@/lib/auth-context'

import { Text } from '@/components/ui/text'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { RemoveMemberDialog } from '@/components/group/remove-member-dialog'
import { EditGroupForm } from '@/components/group/edit-group-form'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import DeleteGroup from '@/components/group/delete-group'

const SettingsScreen = () => {
  const { groupId } = useGroupIdParam()
  const { data } = useGetGroupById(groupId)
  const user = useAuthUser()

  if (!data) return null

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Settings',
        }}
      />
      <SafeAreaView edges={['bottom']}>
        <KeyboardAwareScrollView>
          <View className='p-4 pt-0'>
            <Text className='mb-4' variant={'large'}>
              Members
            </Text>
            <View className='gap-4'>
              {data?.members.map(member => (
                <View key={member.id} className='flex-row items-center gap-2'>
                  <Avatar alt={member.name}>
                    <AvatarFallback className='border-border border'>
                      <Text variant={'muted'} className='text-xs'>
                        {member.name.slice(0, 2)}
                      </Text>
                    </AvatarFallback>
                  </Avatar>
                  <View className='flex-1'>
                    <View className='flex-row items-center gap-1'>
                      <Text>{member.name}</Text>
                      {data.createdById === member.id && (
                        <Badge variant={'secondary'}>
                          <Text>Admin</Text>
                        </Badge>
                      )}
                    </View>
                    <Text variant={'muted'}>{member.email}</Text>
                  </View>
                  {data.createdById !== member.id && data.createdById === user.id && (
                    <RemoveMemberDialog member={member} />
                  )}
                </View>
              ))}
            </View>
            <Separator className='my-4' />
            <Text className='mb-4' variant={'large'}>
              Edit
            </Text>
            <EditGroupForm data={data} />
            <Separator className='my-4' />
            <DeleteGroup />
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </>
  )
}

export default SettingsScreen
