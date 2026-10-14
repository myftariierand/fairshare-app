import { View } from 'react-native';

import { useAuthUser } from '@/lib/auth-context';
import { useSettleUp } from '@/hooks/use-group-api';

import { formatAmount, getErrorMessage } from '@/lib/utils';

import type { Debt } from '@/types/group';

import { HandCoinsIcon, MoveRightIcon } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner-native';
import { Spinner } from '@/components/spinner';

export default function SettleUpTab({
  debts,
  currency,
  groupId,
}: {
  debts: Debt[];
  currency: string;
  groupId: string;
}) {
  const user = useAuthUser();
  const settleUp = useSettleUp();

  const handleSettleUp = async (debt: Debt) => {
    try {
      await settleUp.mutateAsync({
        groupId,
        amount: debt.amount,
        description: `${debt.to.name.split(' ')[0]} and ${debt.from.name.split(' ')[0]} have settled up!`,
        paidBy: debt.from.id,
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <View className="gap-2">
      {debts.map((debt) => (
        <Card key={debt.from.id + debt.to.id} className="p-0">
          <CardContent className="flex-row items-center justify-between p-2 pl-4">
            <View>
              <View className="flex-row gap-3">
                <Text className="text-sm">{debt.from.name.split(' ')[0]}</Text>
                <Icon as={MoveRightIcon} />
                <Text className="text-sm">{debt.to.name.split(' ')[0]}</Text>
              </View>
              <View className="flex-row gap-1">
                <Text className="text-xs">{debt.from.name.split(' ')[0]}</Text>
                <Text className="text-muted-foreground text-xs">owes</Text>
                <Text className="text-xs">{formatAmount(debt.amount, currency)}</Text>
                <Text className="text-muted-foreground text-xs">to</Text>
                <Text className="text-xs">{debt.to.name.split(' ')[0]}</Text>
              </View>
            </View>
            {user.id === debt.to.id && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size={'icon'} variant={'secondary'} className="size-12">
                    <Icon as={HandCoinsIcon} />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will settle the debt between you and {debt.from.name}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      <Text>Cancel</Text>
                    </AlertDialogCancel>
                    <AlertDialogAction
                      disabled={settleUp.isPending}
                      onPress={() => handleSettleUp(debt)}>
                      {settleUp.isPending ? <Spinner /> : <Text>Settle Up</Text>}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardContent>
        </Card>
      ))}
    </View>
  );
}
