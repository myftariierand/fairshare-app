import { ScrollView, View } from 'react-native'
import { Link, Tabs as RouterTabs } from 'expo-router'

import { useAuth, useAuthUser } from '@/lib/auth-context'

import { CreditCardIcon, PencilIcon, UserCheckIcon, UsersIcon } from 'lucide-react-native'

import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs'

import ProfileHeader from '@/components/profile/header'
import BalanceTicket from '@/components/profile/balance-ticket'
import StatCard from '@/components/profile/stat-card'
import { useState } from 'react'
import { GroupsTab } from '@/components/profile/groups-tab'
import FriendsTab from '@/components/profile/friends-tabs'
import { useGetProfileQuery } from '@/services/profile'

export default function ProfileScreen() {
  const { signOut } = useAuth()
  const { data: user } = useGetProfileQuery()

  if (!user) {
    return null
  }

  const transactions = user.groups.flatMap(group => group.transactions)
  const involvedTransactions = transactions.filter(transactions =>
    transactions.splits.some(split => split.userId === user.id)
  ).length

  const [value, setValue] = useState('groups')

  return (
    <>
      <RouterTabs.Screen
        options={{
          headerRight: () => (
            <Link asChild href={'/profile/edit'}>
              <Button size={'sm'} variant={'secondary'}>
                <Icon as={PencilIcon} size={12} />
                <Text>Edit Profile</Text>
              </Button>
            </Link>
          ),
          headerRightContainerStyle: { paddingRight: 16 },
        }}
      />
      <ScrollView>
        <View className='gap-2 p-4'>
          <ProfileHeader user={user} />
          <BalanceTicket currentUserId={user.id} transactions={transactions} />
          <View className='flex-row gap-2'>
            <StatCard icon={UsersIcon} value={user.groups.length} label='Groups' />
            <StatCard icon={UserCheckIcon} value={user.friends.length} label='Friends' />
            <StatCard icon={CreditCardIcon} value={involvedTransactions} label='Transactions' />
          </View>
          <Tabs value={value} onValueChange={setValue}>
            <TabsList>
              {[
                ['groups', 'Groups'],
                ['friends', 'Friends'],
              ].map(([val, label]) => (
                <TabsTrigger key={val} value={val}>
                  <Text>{label}</Text>
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value='groups'>
              <GroupsTab groups={user.groups} />
            </TabsContent>
            <TabsContent value='friends'>
              <FriendsTab friends={user.friends} />
            </TabsContent>
          </Tabs>
          <Button onPress={signOut}>
            <Text>Sign Out</Text>
          </Button>
        </View>
      </ScrollView>
    </>
  )
}
