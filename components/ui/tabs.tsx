import { TextClassContext } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import * as TabsPrimitive from '@rn-primitives/tabs'
import { Platform } from 'react-native'

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root className={cn('flex flex-col gap-2', className)} {...props} />
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        // Tabs stretch to the track so the 4px inset is the same on every side
        'bg-card border-border flex h-12 flex-row items-stretch justify-center rounded-md border p-1',
        Platform.select({ web: 'inline-flex w-fit', native: 'mr-auto' }),
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const { value } = TabsPrimitive.useRootContext()
  return (
    <TextClassContext.Provider
      value={cn(
        'text-muted-foreground text-sm font-medium',
        value === props.value && 'text-foreground font-semibold'
      )}
    >
      <TabsPrimitive.Trigger
        className={cn(
          'flex flex-1 flex-row items-center justify-center gap-1.5 rounded-[10px] border border-transparent px-2 shadow-none',
          Platform.select({
            web: 'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring web:h-[calc(100%-1px)] inline-flex cursor-default whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0',
          }),
          props.disabled && 'opacity-50',
          props.value === value && 'bg-accent',
          className
        )}
        {...props}
      />
    </TextClassContext.Provider>
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn(Platform.select({ web: 'flex-1 outline-none' }), className)}
      {...props}
    />
  )
}

export { Tabs, TabsContent, TabsList, TabsTrigger }
