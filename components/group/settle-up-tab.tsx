import { View } from 'react-native'
import { format } from 'date-fns'

import { useAuthUser } from '@/lib/auth-context'
import { useSettleUp } from '@/services/group'

import { formatAmount, getErrorMessage } from '@/lib/utils'

import { TransactionType } from '@/types/group'
import type { Debt, Member, Transaction } from '@/types/group'

import { ArrowRightIcon, CheckIcon } from 'lucide-react-native'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { Amount } from '@/components/ui/amount'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { InitialsAvatar } from '@/components/ui/initials-avatar'
import { SectionLabel } from '@/components/ui/section-label'
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
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner-native'
import { Spinner } from '@/components/spinner'

export default function SettleUpTab({
  debts,
  transactions,
  members,
  currency,
  groupId,
}: {
  debts: Debt[]
  transactions: Transaction[]
  members: Member[]
  currency: string
  groupId: string
}) {
  const user = useAuthUser()
  const settleUp = useSettleUp()

  const firstName = (person: { id: string; name: string }) =>
    person.id === user.id ? 'You' : person.name.split(' ')[0]

  const payments = transactions
    .filter(t => t.type === TransactionType.settlement)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const handleSettleUp = async (debt: Debt) => {
    try {
      await settleUp.mutateAsync({
        groupId,
        amount: debt.amount,
        description: `${debt.to.name.split(' ')[0]} and ${debt.from.name.split(' ')[0]} have settled up!`,
        paidBy: debt.from.id,
      })
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <View className='gap-5 pb-6'>
      {!debts.length ? (
        <Card className='items-center gap-2 px-6 py-7'>
          <View className='flex-row'>
            {members.slice(0, 5).map((member, i) => (
              <InitialsAvatar
                key={member.id}
                name={member.name}
                className={
                  i > 0 ? 'border-card -ml-2 size-9 border-2' : 'border-card size-9 border-2'
                }
                textClassName='text-xs'
              />
            ))}
          </View>
          <Text className='mt-2 text-lg font-bold'>Everyone's square</Text>
          <Text className='text-muted-foreground text-center'>
            No debts left in this group. New expenses will show suggested payments here.
          </Text>
        </Card>
      ) : (
        <View className='gap-2'>
          <SectionLabel>Suggested payments</SectionLabel>
          {debts.map(debt => {
            const youReceive = user.id === debt.to.id
            const youPay = user.id === debt.from.id
            return (
              <Card key={debt.from.id + debt.to.id} className='gap-3 p-4'>
                <View className='flex-row items-center gap-2'>
                  <InitialsAvatar
                    name={debt.from.name}
                    className='size-9'
                    textClassName='text-xs'
                  />
                  <Icon as={ArrowRightIcon} className='text-muted-foreground size-4' />
                  <InitialsAvatar name={debt.to.name} className='size-9' textClassName='text-xs' />
                  <View className='ml-1 flex-1'>
                    <Text className='font-semibold' numberOfLines={1}>
                      {firstName(debt.from)} {youPay ? 'pay' : 'pays'} {firstName(debt.to)}
                    </Text>
                  </View>
                  <Amount
                    value={youPay ? -debt.amount : debt.amount}
                    currency={currency}
                    tone={youPay || youReceive ? 'balance' : 'plain'}
                    className='font-semibold'
                  />
                </View>
                {youReceive ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant='outline' size='sm'>
                        <Icon as={CheckIcon} className='size-4' />
                        <Text>Mark as paid</Text>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Did {debt.from.name.split(' ')[0]} pay you?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This records a payment of {formatAmount(debt.amount, currency)} from{' '}
                          {debt.from.name} to you and settles the debt.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          <Text>Cancel</Text>
                        </AlertDialogCancel>
                        <AlertDialogAction
                          disabled={settleUp.isPending}
                          onPress={() => handleSettleUp(debt)}
                        >
                          {settleUp.isPending ? <Spinner /> : <Text>Mark as paid</Text>}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : youPay ? (
                  <Text className='text-muted-foreground text-sm'>
                    Once you've paid, {debt.to.name.split(' ')[0]} marks it as paid.
                  </Text>
                ) : null}
              </Card>
            )
          })}
        </View>
      )}

      {payments.length > 0 && (
        <View className='gap-1'>
          <SectionLabel>Payment history</SectionLabel>
          {payments.map(payment => {
            // A settlement is paid by one person; the split names who received it
            const receiverId =
              payment.splits.find(s => s.userId !== payment.paidBy.id)?.userId ??
              payment.splits[0]?.userId
            const receiver = members.find(m => m.id === receiverId)

            return (
              <View key={payment.id} className='flex-row items-center gap-3 py-2.5'>
                <View className='bg-owed/10 size-8 items-center justify-center rounded-[10px]'>
                  <Icon as={CheckIcon} className='text-owed size-4' />
                </View>
                <Text className='flex-1' numberOfLines={1}>
                  <Text className='font-semibold'>{firstName(payment.paidBy)}</Text>
                  <Text className='text-muted-foreground'> paid </Text>
                  <Text className='font-semibold'>
                    {receiver ? firstName(receiver).replace(/^You$/, 'you') : 'someone'}
                  </Text>
                </Text>
                <Text className='text-muted-foreground text-sm'>
                  {format(payment.createdAt, 'd MMM')}
                </Text>
              </View>
            )
          })}
        </View>
      )}
    </View>
  )
}
