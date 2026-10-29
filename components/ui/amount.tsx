import { Text } from '@/components/ui/text'
import { cn, formatAmount } from '@/lib/utils'

// Balances within a cent of zero count as settled (float math leaves -0.00 behind)
export const SETTLED_EPSILON = 0.01

type AmountProps = Omit<React.ComponentProps<typeof Text>, 'children'> & {
  value: number
  currency: string
  /** 'balance' colors by sign: owed to you, you owe, or settled */
  tone?: 'plain' | 'balance'
  /** Prefix + / − instead of showing the absolute value */
  signed?: boolean
}

function Amount({
  value,
  currency,
  tone = 'plain',
  signed = false,
  className,
  ...props
}: AmountProps) {
  const toneClass =
    tone === 'balance' &&
    (value > SETTLED_EPSILON
      ? 'text-owed'
      : value < -SETTLED_EPSILON
        ? 'text-owe'
        : 'text-muted-foreground')

  return (
    <Text
      className={cn('fairshare:font-geist-mono font-mono tabular-nums', toneClass, className)}
      {...props}
    >
      {signed
        ? formatAmount(value, currency, 'exceptZero')
        : formatAmount(Math.abs(value), currency)}
    </Text>
  )
}

export { Amount }
