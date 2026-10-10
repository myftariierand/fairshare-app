import { useState } from 'react';
import { View, ActivityIndicator, FlatList, ScrollView } from 'react-native';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useGetGroupById } from '@/hooks/use-get-group-by-id';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import GroupHeader from '@/components/group/group-header';
import BalancesHeader from '@/components/group/balances-header';
import TransactionList from '@/components/group/transaction-list';
import SettleUpTab from '@/components/group/settle-up-tab';
import BalanceTab from '@/components/group/balance-tab';

export default function GroupScreen() {
  const [tabValue, setTabValue] = useState('expenses');

  const insets = useSafeAreaInsets();

  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isPending, isError, error, refetch } = useGetGroupById(id);

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center gap-4 p-6">
        <Text className="text-destructive">{error.message}</Text>
        <Button onPress={() => refetch()}>
          <Text>Try again</Text>
        </Button>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
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

                {/* {!!pendingTasks.length && (
                <Badge
                  variant={'outline'}
                  className="ml-2 grid h-5 place-content-center px-2 py-0 text-xs">
                  {pendingTasks.length}
                </Badge>
              )} */}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="expenses" className="flex-1">
              <TransactionList transactions={data.transactions} currency={data.currency} />
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
            <TabsContent value="notes">{/* <Notes /> */}</TabsContent>
          </Tabs>
        </View>
      </SafeAreaView>
    </>
  );
}
