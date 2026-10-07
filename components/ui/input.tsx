import { cn } from '@/lib/utils';
import { TextInput } from 'react-native';
import { useUniwind } from 'uniwind';

function Input({
  className,
  ...props
}: React.ComponentProps<typeof TextInput> & React.RefAttributes<TextInput>) {
  const { theme } = useUniwind();
  return (
    <TextInput
      className={cn(
        'dark:bg-input/30 border-input bg-background text-foreground flex h-10 w-full min-w-0 flex-row items-center rounded-md border px-3 py-1 text-base leading-5 shadow-sm shadow-black/5 sm:h-9',
        props.editable === false && cn('opacity-50'),
        className
      )}
      placeholderTextColor={theme === 'dark' ? '#a1a1a1' : '#a1a1aa'}
      {...props}
    />
  );
}

export { Input };
