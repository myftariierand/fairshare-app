import { useState } from 'react';
import { View } from 'react-native';
import { useSelector } from '@tanstack/react-form';
import { toast } from 'sonner-native';

import { withForm, expenseFormOpts } from '@/lib/form';
import { formatAmount, fromMinorUnit, sanitizeNumberInput, toMinorUnit } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useGetGroupById } from '@/hooks/use-group-api';
import { Text } from '@/components/ui/text';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Group = NonNullable<ReturnType<typeof useGetGroupById>['data']>;
type Member = Group['members'][number];
type Split = { name: string; userId: string; amount: string };

// Equal split in minor units, remainder spread over the first N people
const distribute = (splits: Split[], amount: string, currency: string): Split[] => {
  if (splits.length === 0) return splits;
  const unitAmount = toMinorUnit(+amount, currency);
  const base = Math.floor(unitAmount / splits.length);
  const remainder = unitAmount % splits.length;
  return splits.map((split, i) => ({
    ...split,
    amount: fromMinorUnit(base + (i < remainder ? 1 : 0), currency),
  }));
};

export const ExpenseSplits = withForm({
  ...expenseFormOpts,
  props: { group: null as unknown as Group },
  render: ({ form, group }) => {
    const [splitType, setSplitType] = useState('equally');

    const amount = useSelector(form.store, (s) => s.values.amount);
    const splits = useSelector(form.store, (s) => s.values.splits);

    const handleTabChange = (value: string) => {
      setSplitType(value);
      const all = group.members.map((m) => ({ name: m.name, userId: m.id, amount: '' }));
      form.setFieldValue('splits', distribute(all, amount, group.currency));
    };

    const handleCheckboxChange = (checked: boolean, member: Member) => {
      let next: Split[];

      if (!checked) {
        if (splits.length === 1) {
          toast.error('You must have at least one member selected');
          return;
        }
        next = splits.filter((s) => s.userId !== member.id);
      } else {
        next = [...splits, { userId: member.id, name: member.name, amount: '' }];
      }

      form.setFieldValue('splits', distribute(next, amount, group.currency));
    };

    const membersIds = splits.map((s) => s.userId);
    const splitsAmount = splits.reduce((acc, curr) => acc + +curr.amount, 0);
    const remainingAmount = +amount - splitsAmount;
    const amountError = splitsAmount > +amount;

    return (
      <Tabs value={splitType} onValueChange={handleTabChange}>
        <TabsList className="w-full flex-row">
          <TabsTrigger value="equally" className="flex-1">
            <Text>Equally</Text>
          </TabsTrigger>
          <TabsTrigger value="amount" className="flex-1">
            <Text>By Amount</Text>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="equally">
          <Card className="rounded-lg shadow-none">
            <CardHeader>
              <CardTitle>
                {formatAmount(+amount / (splits.length || 1), group.currency)} / person
              </CardTitle>
              <CardDescription>{splits.length} people</CardDescription>
            </CardHeader>
            <CardContent className="gap-2">
              {group.members.map((member) => (
                <View key={member.id} className="h-9 flex-row items-center justify-between">
                  <Label className="text-base">{member.name}</Label>
                  <Checkbox
                    checked={membersIds.includes(member.id)}
                    onCheckedChange={(checked) => handleCheckboxChange(checked, member)}
                  />
                </View>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="amount">
          <Card className="rounded-lg shadow-none">
            <CardHeader>
              <CardTitle className={cn(amountError && 'text-destructive')}>
                {formatAmount(splitsAmount, group.currency)} of{' '}
                {formatAmount(+amount, group.currency)}
              </CardTitle>
              <CardDescription className={cn(amountError && 'text-destructive')}>
                {formatAmount(remainingAmount, group.currency)} remaining
              </CardDescription>
            </CardHeader>
            <CardContent className="gap-2">
              {splits.map((split, index) => (
                <form.AppField key={split.userId} name={`splits[${index}].amount`}>
                  {(field) => (
                    <View className="gap-1">
                      <View className="flex-row items-center justify-between">
                        <Label className="text-base">{split.name}</Label>
                        <Text className="mr-2 ml-auto text-sm font-medium">{group.currency}</Text>
                        <field.Input
                          inputMode="decimal"
                          className="w-24 text-right"
                          placeholder={formatAmount(300, group.currency)}
                          value={field.state.value}
                          onChangeText={(v) => field.handleChange(sanitizeNumberInput(v))}
                        />
                      </View>
                      {field.state.meta.errors.length > 0 && (
                        <Text className="text-destructive text-sm">
                          {field.state.meta.errors.map((e) => e?.message).join(', ')}
                        </Text>
                      )}
                    </View>
                  )}
                </form.AppField>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    );
  },
});
