import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

// Small all-caps heading above a list or group of fields
function SectionLabel({ className, ...props }: React.ComponentProps<typeof Text>) {
  return (
    <Text
      role='heading'
      className={cn(
        'text-muted-foreground fairshare:font-geist-mono font-mono text-xs font-medium tracking-widest uppercase',
        className
      )}
      {...props}
    />
  )
}

export { SectionLabel }
