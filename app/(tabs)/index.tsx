// app/(app)/index.tsx
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { format, formatDistance } from 'date-fns';

import { getGroups } from '@/lib/groups';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { EyeIcon, Plus, PlusIcon } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';

export default function GroupsScreen() {
  const { data, isPending, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['groups'],
    queryFn: getGroups,
  });

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

  const activeGroups = data.filter(
    (group) => group._count.transactions === 0 || group.remainingDebts > 0
  );

  return (
    <FlatList
      data={activeGroups}
      keyExtractor={(g) => g.id}
      contentContainerClassName="gap-3 p-4"
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      ListEmptyComponent={<Text className="text-muted-foreground text-center">No groups yet</Text>}
      renderItem={({ item }) => (
        <Card className="mb-4 gap-0 p-0">
          {!!item.cover && (
            <img
              src={`${process.env.EXPO_PUBLIC_IMG_URL}/${item.cover}`}
              alt="active group cover"
              className="relative h-36 w-full rounded-xl object-cover"
            />
          )}
          <CardHeader className="p-4">
            <CardTitle>{item.name}</CardTitle>
            <CardDescription>
              {format(item.createdAt, 'MMM dd, yyyy')} &bull; {item.remainingDebts} remaining debts
            </CardDescription>
          </CardHeader>
          <CardFooter className="gap-2 p-2 pt-0">
            <Link asChild href="/">
              <Button variant={'outline'} className="flex-1">
                <Icon as={PlusIcon} />
                <Text>Add Expense</Text>
              </Button>
            </Link>
            <Link asChild href="/">
              <Button variant={'outline'} className="flex-1">
                <Icon as={EyeIcon} />
                <Text>View Group</Text>
              </Button>
            </Link>
          </CardFooter>
        </Card>
      )}
    />
  );
}
