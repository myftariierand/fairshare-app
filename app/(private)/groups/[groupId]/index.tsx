import { useState } from 'react'
import { View, ActivityIndicator, ScrollView } from 'react-native'
import { Link, Stack, router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

import { useGetTasks } from '@/services/tasks'
import { useGetGroupById } from '@/services/group'
import { useGroupIdParam } from '@/hooks/use-group-id-param'

import { PlusIcon } from 'lucide-react-native'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

import GroupHeader from '@/components/group/group-header'
import GroupSummary from '@/components/group/group-summary'
import ExpenseList from '@/components/group/expense-list'
import SettleUpTab from '@/components/group/settle-up-tab'
import BalanceTab from '@/components/group/balance-tab'
import NotesList from '@/components/group/notes-list'

export default function GroupScreen() {
  // Home's Settle up opens the group on its debts tab
  const { tab } = useLocalSearchParams<{ tab?: string }>()
  const [tabValue, setTabValue] = useState(tab ?? 'expenses')

  const insets = useSafeAreaInsets()

  const { groupId } = useGroupIdParam()
  const { data, isPending, isError, error, refetch } = useGetGroupById(groupId)
  const { data: tasks } = useGetTasks(groupId)
  const pendingTasks = tasks?.filter(task => !task.done) ?? []

  if (isPending) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View className='flex-1 items-center justify-center'>
          <ActivityIndicator />
        </View>
      </>
    )
  }

  if (isError) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View className='flex-1 items-center justify-center gap-4 p-6'>
          <Text className='text-destructive'>{error.message}</Text>
          <Button onPress={() => refetch()}>
            <Text>Try again</Text>
          </Button>
          <Button variant={'link'} onPress={() => router.back()}>
            <Text>Go back</Text>
          </Button>
        </View>
      </>
    )
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => (
            <GroupHeader
              id={data.id}
              title={data.name}
              createdAt={data.createdAt}
              members={data.members.length}
              cover={data.cover}
            />
          ),
        }}
      />
      <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
        <View className='flex-1 gap-4 px-4 pt-2'>
          <GroupSummary
            transactions={data.transactions}
            members={data.members}
            currency={data.currency}
          />
          <Tabs value={tabValue} onValueChange={setTabValue} className='flex-1 gap-3'>
            <TabsList className='w-full'>
              <TabsTrigger value='expenses'>
                <Text>Expenses</Text>
              </TabsTrigger>
              <TabsTrigger value='debts'>
                <Text>Settle up</Text>
              </TabsTrigger>
              <TabsTrigger value='balances'>
                <Text>Balances</Text>
              </TabsTrigger>
              <TabsTrigger value='notes'>
                <Text>Notes{pendingTasks.length ? ` · ${pendingTasks.length}` : ''}</Text>
              </TabsTrigger>
            </TabsList>
            <TabsContent value='expenses' className='flex-1'>
              <ExpenseList transactions={data.transactions} currency={data.currency} />
              <Link asChild href={`/groups/${groupId}/add-expense`}>
                <Button
                  size='lg'
                  className='absolute right-0 bottom-2 rounded-2xl shadow-lg shadow-black/40'
                >
                  <Icon as={PlusIcon} />
                  <Text>Add expense</Text>
                </Button>
              </Link>
            </TabsContent>
            <TabsContent value='debts' className='flex-1'>
              <ScrollView showsVerticalScrollIndicator={false}>
                <SettleUpTab
                  debts={data.settlements}
                  transactions={data.transactions}
                  members={data.members}
                  currency={data.currency}
                  groupId={data.id}
                />
              </ScrollView>
            </TabsContent>
            <TabsContent value='balances' className='flex-1'>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom }}
              >
                <BalanceTab
                  transactions={data.transactions}
                  members={data.members}
                  currency={data.currency}
                />
              </ScrollView>
            </TabsContent>
            <TabsContent value='notes' className='flex-1'>
              <NotesList />
            </TabsContent>
          </Tabs>
        </View>
      </SafeAreaView>
    </>
  )
}
