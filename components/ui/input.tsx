import { cn } from '@/lib/utils'
import { TextInput, type TextInputInstance } from 'react-native'

function Input({
  className,
  ...props
}: React.ComponentProps<typeof TextInput> & React.RefAttributes<TextInputInstance>) {
  return (
    <TextInput
      className={cn(
        'border-input bg-card text-foreground h-control flex w-full min-w-0 flex-row items-center rounded-md border px-4 py-1 font-sans text-base leading-5',
        props.editable === false && cn('opacity-50'),
        className
      )}
      placeholderTextColorClassName='accent-muted-foreground'
      {...props}
    />
  )
}

export { Input }
