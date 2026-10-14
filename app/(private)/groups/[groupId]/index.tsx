import { useState } from 'react';
import { View, ActivityIndicator, ScrollView } from 'react-native';
import { Link, Stack, router } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useGetTasks } from '@/services/tasks';
import { useGetGroupById } from '@/hooks/use-group-api';
import { useGroupIdParam } from '@/hooks/use-group-id-param';

import { ReceiptText } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

import GroupHeader from '@/components/group/group-header';
import BalancesHeader from '@/components/group/balances-header';
import ExpenseList from '@/components/group/expense-list';
import SettleUpTab from '@/components/group/settle-up-tab';
import BalanceTab from '@/components/group/balance-tab';
import NotesList from '@/components/group/notes-list';

export default function GroupScreen() {
  const [tabValue, setTabValue] = useState('expenses');

  const insets = useSafeAreaInsets();

  const { groupId } = useGroupIdParam();
  const { data, isPending, isError, error, refetch } = useGetGroupById(groupId);
  const { data: tasks } = useGetTasks(groupId);
  const pendingTasks = tasks?.filter((task) => !task.done) ?? [];

  if (isPending) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 items-center justify-center gap-4 p-6">
          <Text className="text-destructive">{error.message}</Text>
          <Button onPress={() => refetch()}>
            <Text>Try again</Text>
          </Button>
          <Button variant={'link'} onPress={() => router.back()}>
            <Text>Go Back</Text>
          </Button>
        </View>
      </>
    );
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
        <View className="flex-1 gap-2 px-2">
          <BalancesHeader
            transactions={data.transactions}
            members={data.members}
            currency={data.currency}
          />
          <Tabs value={tabValue} onValueChange={setTabValue} className="flex-1">
            <TabsList className="w-full">
              <TabsTrigger value="expenses">
                <Text>Expenses</Text>
              </TabsTrigger>
              <TabsTrigger value="debts">
                <Text>Settle Up</Text>
              </TabsTrigger>
              <TabsTrigger value="balances">
                <Text>Balances</Text>
              </TabsTrigger>
              <TabsTrigger value="notes">
                <Text>Notes</Text>
                {!!pendingTasks.length && (
                  <Badge
                    variant={'outline'}
                    className="ml-2 grid h-5 place-content-center px-2 py-0 text-xs">
                    <Text>{pendingTasks.length}</Text>
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="expenses" className="flex-1">
              <ExpenseList transactions={data.transactions} currency={data.currency} />
              <Link asChild href={`/groups/${groupId}/add-expense`}>
                <Button className="absolute right-0 bottom-0">
                  <Icon as={ReceiptText} />
                  <Text>Add Expense</Text>
                </Button>
              </Link>
            </TabsContent>
            <TabsContent value="debts">
              <SettleUpTab debts={data.settlements} currency={data.currency} groupId={data.id} />
            </TabsContent>
            <TabsContent value="balances" className="flex-1">
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ paddingBottom: insets.bottom }}>
                <BalanceTab transactions={data.transactions} currency={data.currency} />
              </ScrollView>
            </TabsContent>
            <TabsContent value="notes">
              <NotesList />
            </TabsContent>
          </Tabs>
        </View>
      </SafeAreaView>
    </>
  );
}
