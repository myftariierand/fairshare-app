import { View } from 'react-native'
import { Link, Stack, router } from 'expo-router'
import { ArrowLeftIcon } from 'lucide-react-native'
import { useCSSVariable } from 'uniwind'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'

import { useGetGroupById } from '@/services/group'
import { useGroupIdParam } from '@/hooks/use-group-id-param'
import { useAuthUser } from '@/lib/auth-context'

import { Text } from '@/components/ui/text'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { InitialsAvatar } from '@/components/ui/initials-avatar'
import { SectionLabel } from '@/components/ui/section-label'
import { Separator } from '@/components/ui/separator'
import { RemoveMemberDialog } from '@/components/group/remove-member-dialog'
import { EditGroupForm } from '@/components/group/edit-group-form'
import DeleteGroup from '@/components/group/delete-group'
import { HeaderButton, headerLeftOptions } from '@/components/header-button'

const SettingsScreen = () => {
  const { groupId } = useGroupIdParam()
  const { data } = useGetGroupById(groupId)
  const user = useAuthUser()
  const background = useCSSVariable('--color-background') as string

  if (!data) return null

  const isAdmin = data.createdById === user.id

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Group settings',
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: background },
          headerTitleStyle: { fontFamily: 'Geist', fontWeight: '600' },
          ...headerLeftOptions(
            <HeaderButton icon={ArrowLeftIcon} label='Back' onPress={() => router.back()} />
          ),
        }}
      />
      <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
        <KeyboardAwareScrollView keyboardShouldPersistTaps='handled' bottomOffset={24}>
          <View className='gap-8 p-5'>
            <EditGroupForm data={data} />

            <View className='gap-3'>
              <View className='flex-row items-center justify-between'>
                <SectionLabel>Members · {data.members.length}</SectionLabel>
                <Link asChild href={`/groups/${groupId}/invite-member`}>
                  <Button variant='ghost' size='sm'>
                    <Text className='text-primary'>Invite</Text>
                  </Button>
                </Link>
              </View>
              <Card className='gap-0 px-4 py-0'>
                {data.members.map((member, index) => (
                  <View key={member.id}>
                    {index > 0 && <Separator />}
                    <View className='min-h-16 flex-row items-center gap-3 py-2'>
                      <InitialsAvatar name={member.name} className='size-10' />
                      <View className='flex-1'>
                        <View className='flex-row items-center gap-2'>
                          <Text className='shrink font-semibold' numberOfLines={1}>
                            {member.id === user.id ? `${member.name} (you)` : member.name}
                          </Text>
                          {data.createdById === member.id && (
                            <View className='bg-secondary rounded-full px-2 py-0.5'>
                              <Text className='text-xs font-semibold'>Admin</Text>
                            </View>
                          )}
                        </View>
                        <Text className='text-muted-foreground text-sm' numberOfLines={1}>
                          {member.email}
                        </Text>
                      </View>
                      {isAdmin && data.createdById !== member.id && (
                        <RemoveMemberDialog member={member} />
                      )}
                    </View>
                  </View>
                ))}
              </Card>
            </View>

            <DeleteGroup />
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </>
  )
}

export default SettingsScreen
