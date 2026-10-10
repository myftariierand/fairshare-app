import { View, ScrollView } from 'react-native';

import { formatAmount, transactionCategories } from '@/lib/utils';

import type { Transaction, TransactionCategory } from '@/types/group';
import { TransactionType } from '@/types/group';

import { Text } from '@/components/ui/text';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { TrendingUpIcon } from 'lucide-react-native';

export default function BalanceTab({
  transactions = [],
  currency = 'USD',
}: {
  transactions: Transaction[];
  currency: string;
}) {
  const grouped = transactions
    .filter((t) => t.type === TransactionType.expense)
    .reduce<Partial<Record<TransactionCategory, typeof transactions>>>((acc, curr) => {
      const key = curr.category;

      if (!acc[key]) acc[key] = [];
      acc[key].push(curr);

      return acc;
    }, {});

  const entries = Object.entries(grouped) as Array<[TransactionCategory, typeof transactions]>;

  const totalExpenses = transactions.reduce(
    (acc, curr) => acc + (curr.type === TransactionType.expense ? curr.amount : 0),
    0
  );

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2">
        <Icon as={TrendingUpIcon} />
        <CardTitle>Spendings by category</CardTitle>
      </CardHeader>
      <CardContent className="gap-4">
        {entries.map(([key, transactions]) => {
          const total = transactions.reduce((acc, curr) => acc + curr.amount, 0);

          return (
            <View key={key} className="flex-row items-center gap-2">
              <View className="text-muted-foreground bg-secondary size-8 shrink-0 items-center justify-center rounded">
                <Text>{transactionCategories[key].emoji}</Text>
              </View>
              <View className="flex-1">
                <View className="flex-row justify-between">
                  <Text>{transactionCategories[key].label}</Text>
                  <Text>{formatAmount(total, currency)}</Text>
                </View>
                <View className="bg-muted-foreground/10 mt-1 h-1 overflow-hidden rounded-full">
                  <View
                    className="bg-primary h-full rounded-full"
                    style={{
                      width: `${(total / totalExpenses) * 100}%`,
                    }}
                  />
                </View>
              </View>
            </View>
          );
        })}
      </CardContent>
    </Card>
  );
}
